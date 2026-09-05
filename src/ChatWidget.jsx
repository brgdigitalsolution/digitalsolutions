import { useState, useEffect, useRef } from "react";
import { Bot, X, Send, Check } from "lucide-react";
import { C, bodyFont, track } from "./theme.js";

/* ============================= AI CHATBOT ============================= */
const CHAT_SYSTEM_PROMPT = `You are the website assistant for BRG Digital Solutions, a digital agency in New Delhi, India (brgdigitalsolutions.in, +91 98114 19910, brgdigitalsolutions@gmail.com, B-158/159 Sainik Nagar, New Delhi – 110059).
Services: Website Development (corporate, business, landing pages, travel portals, hotel, school, hospital, restaurant, gym, real estate, ecommerce, custom web apps), Mobile App Development (Android, iOS, Flutter, cross-platform), SEO (technical, on-page, local), Digital Marketing (Google/Facebook/Instagram Ads, social media), AI Solutions (chatbots, WhatsApp automation), CRM Development & Integration (custom CRM builds, Zoho/HubSpot/Salesforce integration, sales pipeline automation, lead tracking), WhatsApp Marketing & Messaging APIs (WhatsApp marketing campaigns, WhatsApp Business API, SMS API, voice/IVR APIs, multi-channel messaging), Cloud Solutions, Maintenance & AMC.
Typical business website starts around ₹6,000, ecommerce around ₹15,000, web apps around ₹25,000, mobile apps around ₹40,000 (these are ballpark starting estimates, refined after a discovery call). Typical timeline is 3–6 weeks.
Most clients are outside India — we actively serve businesses across the USA, Australia, Europe, UAE, UK, Canada and Singapore, working remotely with time-zone overlap for calls and reviews. Quotes can be given in USD, GBP, EUR, AUD, AED, CAD or SGD on request.
Be concise, friendly and helpful. Answer questions about services, pricing ballparks, timelines and process. For anything you're unsure of, or to get an exact quote, direct them to the Contact page or WhatsApp at +91 98114 19910. Keep replies under 80 words.`;

export default function ChatWidget({ open, setOpen }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm the BRG Digital Solutions assistant. Ask me about our services, pricing or timelines." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadDismissed, setLeadDismissed] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [lead, setLead] = useState({ name: "", contact: "" });
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, showLeadForm]);

  // After a couple of real exchanges, offer a human follow-up instead of waiting
  // for the visitor to think to ask for one.
  const userTurns = messages.filter((m) => m.role === "user").length;
  const offerLead = userTurns >= 2 && !leadDismissed && !leadSent;

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    track("chat_message_sent");
    const next = [...messages, { role: "user", text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      // Production calls our Cloudflare Worker (worker/index.js -> /api/chat),
      // which holds the Anthropic API key server-side.
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.text })) }),
      });
      const data = await res.json();
      const reply = res.status === 429 ? "I'm getting a lot of questions right now — please try again in a bit, or message us on WhatsApp." : (data?.reply || "Sorry, I couldn't process that — please try again or reach us on WhatsApp.");
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: "Something went wrong. Please try again, or message us on WhatsApp at +91 98114 19910." }]);
    }
    setLoading(false);
  };

  const submitLead = async (e) => {
    e.preventDefault();
    if (!lead.name || !lead.contact) return;
    setLeadSubmitting(true);
    try {
      const transcript = messages.map((m) => `${m.role === "user" ? "Visitor" : "Assistant"}: ${m.text}`).join("\n");
      await fetch("/api/chat-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: lead.name, contact: lead.contact, transcript }),
      });
      track("chat_lead_submit");
      setLeadSent(true);
      setShowLeadForm(false);
    } catch (err) {
      // Non-blocking — the chat itself still works even if this fails.
    }
    setLeadSubmitting(false);
  };

  if (!open) return null;
  return (
    <div className="fixed bottom-24 right-6 z-50 w-[92vw] max-w-[360px] h-[480px] rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ backgroundColor: C.white }}>
      <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: C.navy }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: C.blueBg }}><Bot size={16} color="#fff" /></div>
          <div>
            <div className="text-sm font-semibold" style={{ ...bodyFont, color: "#fff" }}>BRG Assistant</div>
            <div className="text-[11px]" style={{ ...bodyFont, color: "rgba(255,255,255,0.5)" }}>Usually replies instantly</div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close chat">
          <X size={18} color="#fff" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ backgroundColor: C.gray }}>
        {messages.map((m, i) => (
          <div key={i} className="max-w-[85%] px-4 py-2.5 rounded-xl text-sm leading-relaxed"
            style={{ ...bodyFont, alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              backgroundColor: m.role === "user" ? C.blueBg : C.white, color: m.role === "user" ? "#fff" : C.heading }}>
            {m.text}
          </div>
        ))}
        {loading && <div className="text-xs px-2" style={{ ...bodyFont, color: C.inkSoft }}>Typing…</div>}

        {offerLead && !showLeadForm && (
          <div className="self-start max-w-[90%] rounded-xl p-3" style={{ backgroundColor: C.blueSoft }}>
            <div className="text-xs leading-relaxed" style={{ ...bodyFont, color: C.heading }}>Want a real person to follow up? Leave your details and we'll reach out.</div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setShowLeadForm(true)} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ ...bodyFont, backgroundColor: C.blueBg, color: "#fff" }}>Get a callback</button>
              <button onClick={() => setLeadDismissed(true)} className="text-xs font-medium px-3 py-1.5" style={{ ...bodyFont, color: C.inkSoft }}>No thanks</button>
            </div>
          </div>
        )}

        {showLeadForm && (
          <form onSubmit={submitLead} className="self-start max-w-[95%] w-full rounded-xl p-3 flex flex-col gap-2" style={{ backgroundColor: C.blueSoft }}>
            <div className="text-xs font-semibold" style={{ ...bodyFont, color: C.heading }}>We'll reach out shortly</div>
            <input required placeholder="Your name" aria-label="Your name" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} className="w-full px-3 py-2 rounded-lg text-xs border" style={{ ...bodyFont, borderColor: C.grayLine }} />
            <input required placeholder="Phone or email" aria-label="Phone or email" value={lead.contact} onChange={(e) => setLead({ ...lead, contact: e.target.value })} className="w-full px-3 py-2 rounded-lg text-xs border" style={{ ...bodyFont, borderColor: C.grayLine }} />
            <div className="flex gap-2">
              <button type="submit" disabled={leadSubmitting} className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-1" style={{ ...bodyFont, backgroundColor: C.blueBg, color: "#fff", opacity: leadSubmitting ? 0.6 : 1 }}>{leadSubmitting ? "Sending…" : "Send"}</button>
              <button type="button" onClick={() => setShowLeadForm(false)} className="text-xs font-medium px-3 py-1.5" style={{ ...bodyFont, color: C.inkSoft }}>Cancel</button>
            </div>
          </form>
        )}

        {leadSent && (
          <div className="self-start max-w-[90%] rounded-xl p-3 flex items-center gap-2" style={{ backgroundColor: C.blueSoft }}>
            <Check size={14} style={{ color: C.emeraldDeep }} />
            <span className="text-xs" style={{ ...bodyFont, color: C.heading }}>Thanks — we'll be in touch soon.</span>
          </div>
        )}

        <div ref={endRef} />
      </div>
      <div className="p-3 flex gap-2 border-t" style={{ borderColor: C.grayLine }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about services, pricing…" className="flex-1 px-4 py-2.5 rounded-lg text-sm border" style={{ ...bodyFont, borderColor: C.grayLine }} />
        <button onClick={send} aria-label="Send message" className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: C.emerald }}><Send size={16} color={C.navy} /></button>
      </div>
    </div>
  );
}
