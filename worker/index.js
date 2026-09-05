/**
 * BRG Digital Solutions - API Worker
 *
 * One worker handling all /api/* routes, same pattern as your other projects
 * (oneway-bhaarat): static frontend on GitHub Pages + this Worker for anything
 * that needs a secret (API keys) or server-side logic.
 *
 * Routes:
 *   POST /api/chat            -> AI chat widget (Anthropic)
 *   POST /api/contact         -> Contact page form (also used by the "Request a call" widget)
 *   POST /api/careers-apply   -> Careers page application form
 *   POST /api/chat-lead       -> Chat widget "get a callback" capture
 *   POST /api/audit-lead      -> Website audit checklist email-gate (see handleAuditLead below)
 *   GET  /api/geo             -> Visitor's country (from Cloudflare's request.cf.country, no external API)
 *
 * Setup:
 *   wrangler kv:namespace create RATE_LIMIT_KV        (then paste the id into wrangler.toml)
 *   wrangler secret put ANTHROPIC_API_KEY
 *   wrangler secret put RESEND_API_KEY
 *   wrangler secret put RECAPTCHA_SECRET_KEY   (optional, see verifyRecaptcha below)
 *   wrangler deploy
 *
 * DNS: brgdigitalsolutions.in must stay Proxied (orange cloud) in Cloudflare,
 * and this worker's route must match /api/* exactly — this is the #1 thing that
 * broke silently on One-Way Bhaarat, so double check it here too.
 */

const ALLOWED_ORIGIN = "https://brgdigitalsolutions.in";
const NOTIFY_EMAIL = "brgdigitalsolutions@gmail.com";
const FROM_EMAIL = "BRG Digital Solutions <notifications@brgdigitalsolutions.in>"; // must be a verified Resend sender/domain — can't be the gmail.com address above, see README

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

// Fixed-window rate limiter backed by KV. Fails OPEN (allows the request) if
// RATE_LIMIT_KV isn't bound yet, so nothing breaks before you've set it up —
// see the setup note above once you're ready to enforce this for real.
async function checkRateLimit(env, key, limit, windowSeconds) {
  if (!env.RATE_LIMIT_KV) return { allowed: true };
  const bucketKey = `${key}:${Math.floor(Date.now() / 1000 / windowSeconds)}`;
  const current = parseInt((await env.RATE_LIMIT_KV.get(bucketKey)) || "0", 10);
  if (current >= limit) return { allowed: false };
  await env.RATE_LIMIT_KV.put(bucketKey, String(current + 1), { expirationTtl: windowSeconds + 5 });
  return { allowed: true };
}

function clientIp(request) {
  return request.headers.get("CF-Connecting-IP") || "unknown";
}

// Verifies a reCAPTCHA v3 token server-side. Returns true if verification is
// skipped (no secret configured yet) so forms keep working before you've set
// this up — tighten this once RECAPTCHA_SECRET_KEY is live.
async function verifyRecaptcha(token, env) {
  if (!env.RECAPTCHA_SECRET_KEY) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });
    const data = await res.json();
    return data.success && (data.score === undefined || data.score >= 0.5);
  } catch (e) {
    return false;
  }
}

async function sendEmail(env, subject, html) {
  if (!env.RESEND_API_KEY) return; // no-op until the secret is configured
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [NOTIFY_EMAIL], subject, html }),
  });
}

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const CHAT_SYSTEM_PROMPT = `You are the website assistant for BRG Digital Solutions, a digital agency in New Delhi, India (brgdigitalsolutions.in, +91 98114 19910, brgdigitalsolutions@gmail.com, B-158/159 Sainik Nagar, New Delhi – 110059).
Services: Website Development (corporate, business, landing pages, travel portals, hotel, school, hospital, restaurant, gym, real estate, ecommerce, custom web apps), Mobile App Development (Android, iOS, Flutter, cross-platform), SEO (technical, on-page, local), Digital Marketing (Google/Facebook/Instagram Ads, social media), AI Solutions (chatbots, WhatsApp automation), CRM Development & Integration (custom CRM builds, Zoho/HubSpot/Salesforce integration, sales pipeline automation, lead tracking), WhatsApp Marketing & Messaging APIs (WhatsApp marketing campaigns, WhatsApp Business API, SMS API, voice/IVR APIs, multi-channel messaging), Cloud Solutions, Maintenance & AMC.
Typical business website starts around ₹6,000, ecommerce around ₹15,000, web apps around ₹25,000, mobile apps around ₹40,000 (ballpark starting estimates, refined after a discovery call). Typical timeline is 3–6 weeks.
Most clients are outside India — we actively serve businesses across the USA, Australia, Europe, UAE, UK, Canada and Singapore, working remotely with time-zone overlap for calls and reviews. Quotes can be given in USD, GBP, EUR, AUD, AED, CAD or SGD on request.
Be concise, friendly and helpful. For anything you're unsure of, or an exact quote, direct them to the Contact page or WhatsApp at +91 98114 19910. Keep replies under 80 words.`;

const MAX_CHAT_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 1000;

async function handleChat(request, env) {
  const ip = clientIp(request);
  const rate = await checkRateLimit(env, `chat:${ip}`, 15, 3600); // 15/hour/IP — this hits a paid API
  if (!rate.allowed) return json({ error: "Too many requests — please try again later." }, 429);

  const { messages } = await request.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: "messages array required" }, 400);
  }
  if (messages.length > MAX_CHAT_MESSAGES) {
    return json({ error: "Conversation too long — please refresh the chat." }, 400);
  }
  for (const m of messages) {
    if (typeof m.content !== "string" || m.content.length > MAX_MESSAGE_LENGTH) {
      return json({ error: "Message too long." }, 400);
    }
  }

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: CHAT_SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  const data = await anthropicRes.json();
  const reply = data?.content?.find((c) => c.type === "text")?.text
    || "Sorry, I couldn't process that — please try again or reach us on WhatsApp.";
  return json({ reply });
}

async function handleContact(request, env) {
  const ip = clientIp(request);
  const rate = await checkRateLimit(env, `contact:${ip}`, 5, 3600); // 5/hour/IP
  if (!rate.allowed) return json({ error: "Too many requests — please try again later." }, 429);

  const body = await request.json();

  // Honeypot: a real visitor never fills this hidden field. Bots often do.
  // Return a fake-success response so the bot doesn't learn to avoid it.
  if (body.company_website) return json({ ok: true });

  if (!body.name || !body.email || !body.message) {
    return json({ error: "name, email and message are required" }, 400);
  }
  if (!body.consent) {
    return json({ error: "consent is required" }, 400);
  }
  if (body.name.length > 200 || body.email.length > 200 || body.message.length > 5000) {
    return json({ error: "One or more fields is too long" }, 400);
  }

  const human = await verifyRecaptcha(body.recaptchaToken, env);
  if (!human) return json({ error: "Verification failed, please try again" }, 400);

  await sendEmail(
    env,
    `New contact form submission — ${escapeHtml(body.service || "General")}`,
    `<h2>New contact form submission</h2>
     <p><strong>Name:</strong> ${escapeHtml(body.name)}</p>
     <p><strong>Email:</strong> ${escapeHtml(body.email)}</p>
     <p><strong>Phone:</strong> ${escapeHtml(body.phone || "—")}</p>
     <p><strong>Service:</strong> ${escapeHtml(body.service || "—")}</p>
     <p><strong>Message:</strong><br/>${escapeHtml(body.message)}</p>
     <p><strong>Newsletter opt-in:</strong> ${body.newsletter ? "Yes" : "No"}</p>`
  );

  return json({ ok: true });
}

async function handleCareersApply(request, env) {
  const ip = clientIp(request);
  const rate = await checkRateLimit(env, `careers:${ip}`, 5, 3600); // 5/hour/IP
  if (!rate.allowed) return json({ error: "Too many requests — please try again later." }, 429);

  const body = await request.json();

  if (body.company_website) return json({ ok: true }); // honeypot

  if (!body.name || !body.email) {
    return json({ error: "name and email are required" }, 400);
  }
  if (!body.consent) {
    return json({ error: "consent is required" }, 400);
  }
  if (body.name.length > 200 || body.email.length > 200 || (body.note || "").length > 5000) {
    return json({ error: "One or more fields is too long" }, 400);
  }

  const human = await verifyRecaptcha(body.recaptchaToken, env);
  if (!human) return json({ error: "Verification failed, please try again" }, 400);

  await sendEmail(
    env,
    `New job application — ${escapeHtml(body.role || "Unspecified role")}`,
    `<h2>New job application</h2>
     <p><strong>Role:</strong> ${escapeHtml(body.role || "—")}</p>
     <p><strong>Name:</strong> ${escapeHtml(body.name)}</p>
     <p><strong>Email:</strong> ${escapeHtml(body.email)}</p>
     <p><strong>Phone:</strong> ${escapeHtml(body.phone || "—")}</p>
     <p><strong>Note / resume link:</strong><br/>${escapeHtml(body.note || "—")}</p>`
  );

  return json({ ok: true });
}

async function handleChatLead(request, env) {
  const ip = clientIp(request);
  const rate = await checkRateLimit(env, `chatlead:${ip}`, 5, 3600); // 5/hour/IP
  if (!rate.allowed) return json({ error: "Too many requests — please try again later." }, 429);

  const body = await request.json();
  if (!body.name || !body.contact) {
    return json({ error: "name and contact are required" }, 400);
  }
  if (body.name.length > 200 || body.contact.length > 200 || (body.transcript || "").length > 8000) {
    return json({ error: "One or more fields is too long" }, 400);
  }

  await sendEmail(
    env,
    `New chatbot callback request — ${escapeHtml(body.name)}`,
    `<h2>Chatbot callback request</h2>
     <p><strong>Name:</strong> ${escapeHtml(body.name)}</p>
     <p><strong>Contact:</strong> ${escapeHtml(body.contact)}</p>
     <p><strong>Conversation transcript:</strong></p>
     <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(body.transcript || "")}</pre>`
  );

  return json({ ok: true });
}

async function handleAuditLead(request, env) {
  const ip = clientIp(request);
  const rate = await checkRateLimit(env, `auditlead:${ip}`, 5, 3600); // 5/hour/IP

  const body = await request.json();
  if (!body.email) return json({ error: "email is required" }, 400);
  if (body.email.length > 200) return json({ error: "Email too long" }, 400);

  // Rate limit hit: still let the download through (it's a static public asset
  // either way — see handleAuditLead's route comment) but skip the email log.
  if (rate.allowed) {
    await sendEmail(
      env,
      `Website audit checklist download — ${escapeHtml(body.email)}`,
      `<h2>New checklist download</h2><p><strong>Email:</strong> ${escapeHtml(body.email)}</p>`
    );
  }

  return json({ ok: true });
}

// Cloudflare populates request.cf.country automatically from the edge
// location that received the request — no external geolocation API needed.
// Returns a 2-letter ISO country code (e.g. "US", "AU", "IN"), or null if
// Cloudflare couldn't determine it (rare, but happens for some traffic types).
async function handleGeo(request, env) {
  const ip = clientIp(request);
  const rate = await checkRateLimit(env, `geo:${ip}`, 30, 3600); // 30/hour/IP — generous, this is cheap and read-only
  if (!rate.allowed) return json({ error: "Too many requests" }, 429);
  const country = request.cf?.country || null;
  return json({ country });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

    const { pathname } = new URL(request.url);

    if (request.method === "GET") {
      if (pathname === "/api/geo") return await handleGeo(request, env);
      return json({ error: "Not found" }, 404);
    }

    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

    try {
      if (pathname === "/api/chat") return await handleChat(request, env);
      if (pathname === "/api/contact") return await handleContact(request, env);
      if (pathname === "/api/careers-apply") return await handleCareersApply(request, env);
      if (pathname === "/api/chat-lead") return await handleChatLead(request, env);
      if (pathname === "/api/audit-lead") return await handleAuditLead(request, env);
      return json({ error: "Not found" }, 404);
    } catch (err) {
      return json({ error: "Something went wrong" }, 500);
    }
  },
};
