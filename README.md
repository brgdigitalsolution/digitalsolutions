# BRG Digital Solutions — Website

React + Vite + Tailwind CSS site for brgdigitalsolutions.in, with a Cloudflare Worker
powering chat, contact, and careers. Same architecture pattern as your other projects
(BRG CABS, One-Way Bhaarat): static frontend + Worker backend.

Real, distinct URLs per page (`/services`, `/portfolio`, etc.), a passing automated
test suite, and CI are all in place — see "Testing" and "Routing" below.

## Quiz now covers all 10 services

The homepage's 2-question service-matching quiz previously only recommended
among the original 8 services — CRM Development & Integration and WhatsApp
Marketing & Messaging APIs (added in a later pass) were unreachable through
it. Added two new goal options ("Keep track of leads & customers", "Reach
customers via WhatsApp/SMS") to the second question, mapped across all 4
business types in `QUIZ_RECOMMENDATIONS`, so the quiz can now recommend
either. Covered by 2 new tests.

## Latest audit fixes + new functionality

- **`/api/geo` now rate-limited** (30/hour/IP) — was the one endpoint missing
  it; low actual risk (read-only, no PII, no cost exposure) but now
  consistent with the other 5 endpoints.
- **Geo-detection banner's dismiss button** has a specific `aria-label`
  ("Dismiss region suggestion") instead of a generic "Dismiss" — matters once
  more than one dismissible element exists on a page.
- **Geo-detection banner now fades in** instead of popping in the instant
  `/api/geo` resolves.
- **New: "Why work with an India-based agency?" section** on the About page,
  directly addressing the objections an international prospect actually has —
  quality proof, real time-zone overlap, transparent pricing, communication —
  rather than leaving them unaddressed.
- **New: live business-hours status indicator** (`LiveStatusIndicator` in
  `App.jsx`) — genuinely computed against our stated hours (Mon–Sat,
  10am–7pm IST) via `Intl.DateTimeFormat`, not hardcoded, so it can't go
  stale if the hours ever change. Shown on the Contact page next to the
  Business Hours card, and on every country landing page next to the
  Time Zone Fit card — ties the "we overlap with your day" messaging to
  something visibly live rather than just a static claim.

## International SEO pass (targeting outside India)

Reoriented toward international markets — USA, Australia, Europe, UAE, UK,
Canada and Singapore now lead everywhere they're mentioned; India stays listed
(still a real market, still your home base) but last, not first.

- **Added Europe as a full region** — `/websites-for/europe`, with its own
  headline, intro copy, and industries. Not previously covered at all.
- **hreflang tags** — the actual technical mechanism for "same-language,
  different-country" targeting (not a meta description tweak). Implemented
  two ways:
  - Dynamically via `setHreflangTags()` in `App.jsx`, called from
    `applyPageMeta()` on every navigation. Only applies to the home page and
    country pages — those are the only pages with real regional alternates.
    Universal pages (`/services`, `/portfolio`, etc.) correctly get none.
  - Statically in `index.html`'s `<head>` for the home page, so non-JS
    clients see a correct set on first paint too.
  - Every page in the cluster lists the **full set including itself** (the
    "return tag" requirement) — the most common source of hreflang errors is
    skipping this.
  - Europe uses the UN M49 region code `en-150` (there's no single ISO
    country code for "Europe" — this is Google's documented workaround).
  - Verify in Search Console under Legacy tools and reports → International
    Targeting once this is live and indexed — that report's exact
    availability has shifted over time, so if you don't see it, hreflang
    validation via a third-party checker or Search Console's URL Inspection
    tool on individual pages both work as fallbacks.
- **`areaServed` added to the ProfessionalService schema** (`index.html`) —
  explicitly lists all 8 target markets for Google.
- **Real Cloudflare-based geo-detection** — `GET /api/geo` in `worker/index.js`
  reads Cloudflare's own `request.cf.country` (populated automatically at the
  edge, no external geolocation API or client-side IP lookup). The homepage
  calls it on load and, if the visitor's country matches one of our region
  pages, shows a dismissible banner suggesting that page and defaults the
  quote estimator's currency to theirs — without overriding a currency they
  already picked manually. Fails silently wherever the endpoint isn't reachable
  (e.g. the `.jsx` preview artifact, which has no deployed worker) — the
  banner just doesn't show there, everything else works normally.
- **EUR added** to the currency estimator.
- Reordered the FAQ answer, About page hero, home meta description, and the
  chatbot's own knowledge of target markets to match — the chatbot can now
  answer "do you work with clients in Europe?" correctly.

## Latest audit fixes

- **Services sidebar overflow fixed** — the two longer new service names
  ("CRM Development & Integration", "WhatsApp Marketing & Messaging APIs")
  were overflowing the fixed-width desktop sidebar on the Services page,
  since it forced single-line text. Now wraps on desktop, stays single-line
  on the mobile horizontal-scroll variant.
- **sitemap.xml now includes `/privacy`** — was the one real page missing
  from an otherwise-complete sitemap.
- **Footer now lists all services**, not just the first 6 — that cutoff was
  hiding both of the newest services (CRM, WhatsApp Marketing) from the one
  place that's on every page.
- **"Request a call" date field has a minimum date** — previously nothing
  stopped someone from requesting a call in the past.
- **Required consent checkboxes now show a visual `*`** before someone hits
  submit, not just a native browser validation popup after.

## New in this pass (OneXtel-inspired additions)

- **New service: WhatsApp Marketing & Messaging APIs** — a service card
  (`SERVICES` in `App.jsx`, id `messaging`) covering WhatsApp marketing
  campaigns, WhatsApp Business API, SMS API integration, voice/IVR APIs, and
  multi-channel messaging.
- **CRM promoted to its own service** — "CRM Development" used to be a
  sub-item under AI Solutions; it's now its own full service card (id `crm`)
  covering custom CRM builds, Zoho/HubSpot/Salesforce integration, sales
  pipeline automation, and lead tracking. Removed from AI Solutions' item
  list to avoid the same capability appearing twice.
- Both new services are reflected in the chatbot's system prompt
  (`worker/index.js`, which is what production actually uses, and
  `ChatWidget.jsx`'s local copy, which is unused dead code in production but
  kept in sync to avoid confusion) and the `index.html` noscript fallback.
  Neither is yet added to the homepage service-quiz recommendations
  (`QUIZ_RECOMMENDATIONS`) — the quiz still only routes to the original 8
  services it shipped with.

- **Results strip** — 4 real numbers pulled from the existing case studies
  (`STATS_HIGHLIGHTS` in `App.jsx`), shown prominently on the Portfolio page
  before the project grid. Keep these in sync if you edit the underlying
  case-study metrics — they're not auto-derived.
- **Dialogue-style testimonials** — each testimonial now renders as a
  two-bubble exchange (client message + a BRG reply), instead of a flat quote
  card. The reply text is illustrative, same as the rest of the testimonial
  content — replace with real responses when you have real testimonials.
- **Privacy Policy page** (`/privacy`) — genuinely describes what this site's
  actual forms/chat/analytics do with data (Cloudflare Workers, Resend,
  Anthropic, reCAPTCHA, GA4). This is a real policy for what the code does,
  not legal boilerplate — have a lawyer review before publishing if you want
  it to carry legal weight.
- **Consent checkboxes** — added to the Contact form (required consent +
  optional newsletter opt-in), the Careers application form (required
  consent), and the "Request a call" widget (required consent). All three
  link to the new Privacy Policy page. The worker now rejects `/api/contact`
  and `/api/careers-apply` submissions server-side if consent wasn't given,
  matching the client-side `required` checkbox.

## Earlier pass

- **Multi-currency quote estimator** — INR/USD/GBP/CAD/AUD/AED/SGD, using
  approximate static conversion rates (see `CURRENCY_RATES` in `App.jsx` — not
  a live FX feed, update periodically).
- **Service-matching quiz** — 2 questions on the homepage that recommend a
  service and deep-link into it on the Services page.
- **Sticky mobile CTA bar** — Call / WhatsApp / Get Quote, fixed to the bottom
  on mobile only; the desktop FAB stack is unaffected.
- **Chat lead capture** — after 2 exchanges, the chatbot offers a human
  callback; submissions post to `/api/chat-lead` with the full transcript.
- **Portfolio case studies** — each project now expands into a full page
  (challenge/solution/metrics/quote) instead of just a card.
- **Team section + Global Reach** — on the About page. Team names are
  placeholders (see "What still needs real content" below).
- **Client trust strip** — industry categories, not real client logos (same
  placeholder caveat).
- **"Request a call" widget** — on the Contact page. This is a request, not a
  live calendar — it emails you the requested slot for manual confirmation.
- **Country landing pages** — `/websites-for/usa`, `/uk`, `/canada`,
  `/australia`, `/uae`, `/singapore`, each with genuinely distinct copy (not
  templated thin content) to avoid the SEO risk of near-duplicate pages.
- **Lead-magnet PDF** — "The Website Audit Checklist" (37 real checks across
  SEO/performance/security/accessibility), gated behind an email on the Blog
  page. The gate is a soft one: the file is a static public asset either way,
  so treat this as lead-gen, not real DRM.
- **Code-split chat widget** — `ChatWidget.jsx` and its shared dependencies
  (`theme.js`) are now separate files, lazy-loaded via `React.lazy` +
  `Suspense`. Verified in the build output: `ChatWidget-*.js` ships as its own
  ~5.6KB chunk, not bundled into the main JS. This is the one piece of code
  that's actually split out — full route-based splitting would mean breaking
  the rest of the single-file structure, which conflicts with keeping one
  synced source for both this file and the chat preview artifact. Worth doing
  as a dedicated follow-up if bundle size becomes a real problem.

## Local development

```bash
npm install
npm run dev
```

The chatbot and forms will fail locally until the worker is deployed and `/api/*` is
reachable — everything else works fully offline.

## Testing

```bash
npm test           # runs once (used in CI)
npm run test:watch # watch mode while developing
```

33 tests cover navigation, dark mode, the quote estimator (including currency conversion),
the contact form (honeypot spam-blocking, rate-limit response, required consent), blog search,
the service quiz, location pages, portfolio case studies, and the privacy policy page. `.github/workflows/ci.yml`
runs this suite plus a production build on every push and PR — set up branch protection
on `main` requiring this check if you want it enforced before merge.

These are smoke/behavior tests, not exhaustive coverage. If you add a page or a new
form, add a test alongside it in `src/App.test.jsx`.

## Build

```bash
npm run build
```

Outputs a static site to `dist/`, ready for GitHub Pages, Cloudflare Pages, or any static host.

## Routing

Real path-based routing (`/services`, not `/#services`) via the History API — this
matters for SEO (distinct indexable URLs, working canonical tags) and for sharing
direct links. Two pieces make deep links work when someone visits a path directly
instead of clicking through the app:

- `public/404.html` — GitHub Pages serves this for any unrecognized path. It redirects
  to `/` with the original path preserved in a query string.
- The inline script at the top of `index.html`'s `<head>` — decodes that query string
  and restores the real URL via `history.replaceState` before React mounts.

This is the standard GitHub Pages SPA pattern ([reference](https://github.com/rafgraph/spa-github-pages)).
**If you deploy via the Cloudflare Worker instead of GitHub Pages**, skip `404.html`
and instead add a fallback in `worker/index.js` that serves `index.html` for any
non-`/api/*` path.

## Deploy the frontend (GitHub Pages, matching your other sites)

1. Push this repo to GitHub.
2. Enable GitHub Pages, pointing at the `dist/` output (via a build workflow) or push
   `dist/` contents to a `gh-pages` branch.
3. In Cloudflare DNS, set the `brgdigitalsolutions.in` record to **Proxied (orange cloud)**.

## Deploy the API worker (Cloudflare)

One worker handles chat, contact, and careers — same pattern as `oneway-bhaarat`.

```bash
cd worker
npm install -g wrangler   # if not already installed
wrangler login
wrangler kv:namespace create RATE_LIMIT_KV     # then paste the id into wrangler.toml
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put RESEND_API_KEY             # for contact/careers emails
wrangler secret put RECAPTCHA_SECRET_KEY       # optional — forms work without it, just unverified
wrangler deploy
```

Then confirm the route `brgdigitalsolutions.in/api/*` in `wrangler.toml` matches
a route in your Cloudflare zone, same as `oneway-bhaarat`'s `/api/*` routing — the
worker name must match the route, and the DNS record must stay proxied (orange cloud),
or requests will 404 exactly like the issue you hit on One-Way Bhaarat.

**Rate limiting:** `/api/chat` is capped at 15 requests/hour/IP (it hits a paid API),
contact and careers at 5/hour/IP. This fails *open* (no limit enforced) until you create
the KV namespace above — nothing breaks before you've set it up, but the endpoints are
unprotected against abuse until you do.

**Before forms will actually send email:**
- Verify a sending domain in Resend and update `FROM_EMAIL` in `worker/index.js`.
  Note this is deliberately still `notifications@brgdigitalsolutions.in`, not
  the `brgdigitalsolutions@gmail.com` address forms now deliver to
  (`NOTIFY_EMAIL`) — Resend (like any transactional email provider) requires
  you to verify DNS ownership of whatever domain you send *from*, and you
  can't verify `gmail.com` since you don't own it. Gmail addresses work fine
  as the destination (`NOTIFY_EMAIL`), just not as the sender.
- Get a reCAPTCHA v3 site key + secret key from google.com/recaptcha/admin, then set:
  - `RECAPTCHA_SITE_KEY` in `src/App.jsx`
  - the site key in the `api.js?render=` script tag in `index.html`
  - `RECAPTCHA_SECRET_KEY` as a worker secret (above)
- Both forms already have a honeypot field, which works immediately with no setup.

## SEO

- Per-page `<title>`, meta description, canonical URL, Open Graph tags, and a
  `BreadcrumbList` schema update automatically on navigation (see `applyPageMeta()`
  in `App.jsx`) — for any crawler that executes JS (Googlebot, Bingbot, and most
  modern AI crawlers).
- `public/sitemap.xml` lists all 7 real routes.
- A static `FAQPage` schema in `index.html` mirrors the FAQs shown on the homepage —
  it's hand-written, not generated, so if you edit the `FAQS` array in `App.jsx`,
  update this block too or they'll drift out of sync.
- **AI/non-JS crawler visibility:** this is still a client-rendered React app — a
  crawler that doesn't execute JavaScript sees only the `<noscript>` fallback in
  `index.html`'s `<body>`, which has real (if brief) text content: business
  description, service list, and contact info, so at least *something* meaningful
  is indexable. This is a genuine mitigation, not a full fix — a real fix means
  server-side rendering or static prerendering (e.g. `vite-plugin-ssr` or a
  prerendering build step), which is a larger change than this pass covered.

## What still needs real content/assets before launch

- Replace the portfolio "logo" placeholders (colored blocks with project names) with
  real screenshots.
- Replace the team names/roles on the About page (`TEAM` in `App.jsx`) with your
  actual team — the current names are placeholders.
- Replace the "Trusted by teams across" industry badges (`CLIENT_INDUSTRIES`) with
  real client logos once you have permission to use them.
- Add a real Google Maps embed on the Contact page (currently a placeholder block).
- Replace `G-XXXXXXXXXX` in `index.html` with your real GA4 Measurement ID.
- Complete the reCAPTCHA setup above (site works fine without it — honeypot alone
  blocks most basic bots — but reCAPTCHA catches more sophisticated ones).
- Complete the rate-limiting KV setup above before this is exposed to real traffic.
- Update `CURRENCY_RATES` in `App.jsx` periodically, or wire it to a real FX API —
  it's a static approximation, not live rates.
- Verify a Resend sending domain and update `FROM_EMAIL` in `worker/index.js`,
  or the two new lead-capture endpoints (`/api/chat-lead`, `/api/audit-lead`)
  won't actually deliver email either.

## One thing to know if you edit `src/App.jsx` further

Three things deliberately differ between this file and the `.jsx` preview artifact
shared in chat:

1. **Chat endpoint** — the preview calls the Anthropic API directly (only works
   inside Claude's own sandbox); this file calls `/api/chat` on our Worker.
2. **Routing** — the preview uses hash routing (`#services`), safe inside any iframe
   sandbox; this file uses real path-based routing (`/services`), which needs the
   `404.html` + redirect-script pair above to work on a real host.
3. **File structure** — the preview is a single self-contained file (an artifact
   constraint); this project splits `theme.js` and `ChatWidget.jsx` out for real
   code-splitting (see "New in this pass" above). If you copy a newer version of
   the preview artifact in wholesale, you'll need to re-extract these two files
   rather than just overwriting `App.jsx`.

If you paste in a newer version of the chat logic or the routing logic,
double-check none of these three got silently reverted.

## Project structure

```
brg-digital-solutions/
├── index.html                # SEO meta tags, schema markup (incl. FAQPage), favicon,
│                              # GA4 + reCAPTCHA scripts, SPA redirect script, noscript fallback
├── src/
│   ├── main.jsx
│   ├── App.jsx                # Entire site: all pages, nav, footer, dark mode
│   ├── theme.js                # Shared design tokens/utilities (so ChatWidget.jsx
│   │                            # doesn't need to import all of App.jsx)
│   ├── ChatWidget.jsx          # Code-split, lazy-loaded chat widget
│   ├── App.test.jsx           # Automated test suite (33 tests)
│   ├── index.css
│   └── test/setup.js          # jsdom polyfills + fetch mocking for tests
├── worker/
│   ├── index.js                # Cloudflare Worker: /api/chat, /api/contact, /api/careers-apply,
│   │                            # /api/chat-lead, /api/audit-lead + rate limiting, honeypot + reCAPTCHA
│   └── wrangler.toml
├── .github/workflows/ci.yml   # Runs tests + build on every push/PR
└── public/
    ├── robots.txt
    ├── sitemap.xml               # 13 routes: core pages + 6 country landing pages
    ├── 404.html                # GitHub Pages SPA routing fallback
    ├── resources/website-audit-checklist.pdf   # Lead-magnet PDF
    ├── favicon.ico / favicon-32.png / apple-touch-icon.png / icon-512.png
```
