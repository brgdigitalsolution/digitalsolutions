import { useState, useEffect, useRef, lazy, Suspense } from "react";
import {
  Menu, X, ChevronDown, ChevronRight, ArrowRight, Check, Star,
  Globe, Smartphone, Search, Megaphone, Bot, Cloud, Wrench,
  Code2, Palette, ShoppingCart, Building2, School, Hospital,
  UtensilsCrossed, Dumbbell, Home as HomeIcon, Briefcase,
  Phone, Mail, MapPin, Clock, MessageCircle, Send, Quote,
  TrendingUp, Users, Award, Zap, Shield, Layers, Sparkles,
  Calculator, ExternalLink, Facebook, Instagram, Linkedin, Twitter, Sun, Moon
} from "lucide-react";
import { C, displayFont, bodyFont, track, getRecaptchaToken } from "./theme.js";

// ChatWidget is code-split into its own file and lazy-loaded — it's the one
// piece of UI most visitors never open, so there's no reason to ship its code
// in the initial bundle. See theme.js for why shared tokens live separately.
const ChatWidget = lazy(() => import("./ChatWidget.jsx"));

/* ============================= DATA ============================= */
const SERVICES = [
  { id: "web", icon: Globe, name: "Website Development", short: "Corporate, business & travel portals built to convert.",
    items: ["Corporate Websites", "Business Websites", "Landing Pages", "Travel Portals", "Hotel Websites", "School & Hospital Websites", "Restaurant & Gym Websites", "Real Estate Websites"] },
  { id: "app", icon: Smartphone, name: "Mobile App Development", short: "Native and cross-platform apps for Android & iOS.",
    items: ["Android Apps", "iOS Apps", "Flutter Apps", "Cross-Platform Apps"] },
  { id: "ecom", icon: ShoppingCart, name: "Ecommerce & Web Apps", short: "Custom storefronts and web applications that scale.",
    items: ["Ecommerce Websites", "Custom Web Applications", "Payment Integrations", "Inventory & Order Systems"] },
  { id: "seo", icon: Search, name: "SEO Services", short: "Technical, on-page and local SEO that ranks.",
    items: ["Technical SEO", "On-Page SEO", "Local SEO", "Schema Markup"] },
  { id: "marketing", icon: Megaphone, name: "Digital Marketing", short: "Paid and organic growth across every channel.",
    items: ["Google Ads", "Facebook Ads", "Instagram Ads", "Social Media Marketing"] },
  { id: "ai", icon: Bot, name: "AI Solutions", short: "Automation that works while you sleep.",
    items: ["AI Chatbots", "WhatsApp Automation"] },
  { id: "crm", icon: Users, name: "CRM Development & Integration", short: "Custom CRM systems that keep every customer relationship organized.",
    items: ["Custom CRM Development", "CRM Integration (Zoho, HubSpot, Salesforce)", "Sales Pipeline Automation", "Customer Data Management", "Lead Tracking & Scoring"] },
  { id: "messaging", icon: MessageCircle, name: "WhatsApp Marketing & Messaging APIs", short: "WhatsApp Marketing, and API-based messaging services to help businesses connect with customers instantly and effectively.",
    items: ["WhatsApp Marketing Campaigns", "WhatsApp Business API", "SMS API Integration", "Voice & IVR APIs", "Multi-Channel Messaging"] },
  { id: "cloud", icon: Cloud, name: "Cloud Solutions", short: "Fast, secure infrastructure built on Cloudflare.",
    items: ["Cloud Hosting", "Performance Optimization", "Security Hardening"] },
  { id: "amc", icon: Wrench, name: "Maintenance & AMC", short: "Ongoing care so your site never breaks.",
    items: ["Website Maintenance", "AMC Plans", "Hosting", "Domain Management"] },
];

const INDUSTRIES = [
  { icon: Building2, name: "Startups & SMEs" }, { icon: School, name: "Schools" },
  { icon: Hospital, name: "Hospitals" }, { icon: HomeIcon, name: "Hotels & Travel" },
  { icon: UtensilsCrossed, name: "Restaurants" }, { icon: Dumbbell, name: "Gyms & Fitness" },
  { icon: Briefcase, name: "Real Estate" }, { icon: ShoppingCart, name: "Retail & Manufacturing" },
];

const PORTFOLIO = [
  { id: 1, cat: "Travel", name: "One-Way Bhaarat", tag: "Intercity Cab Booking Platform", url: "https://one-waybharat.com",
    desc: "A one-way intercity cab booking platform with live fare estimation, WhatsApp OTP login and Razorpay checkout.",
    stack: ["Cloudflare Workers", "Razorpay", "WhatsApp API", "Google Places API"],
    results: ["Sub-2s page load on 3G", "Automated WhatsApp booking confirmations", "Zero-downtime payment flow"],
    challenge: "One-Way Bhaarat needed a booking flow that worked reliably on slow mobile connections across small Indian cities, with trustworthy OTP verification and instant fare transparency — without the delays and drop-off that plague typical cab-booking forms.",
    solution: "We built a Cloudflare Worker-backed architecture: city autocomplete via a proxied Google Places API, WhatsApp Business API for OTP and booking confirmations, and server-side fare validation so quoted prices can't be tampered with client-side. The whole stack runs at the edge for speed regardless of the visitor's location.",
    metrics: [
      { label: "Page load (3G)", before: "6–8s", after: "<2s" },
      { label: "OTP delivery", before: "Manual/unreliable", after: "Automated via WhatsApp" },
      { label: "Booking confirmation", before: "None", after: "Instant WhatsApp receipt" },
    ],
    quote: "Our booking conversions nearly doubled after the redesign. The team understood exactly what a travel customer needs to trust a site enough to pay online.",
    quoteAuthor: "Rohit Malhotra, Founder" },
  { id: 2, cat: "Travel", name: "BRG CABS", tag: "Outstation Cab & Char Dham Yatra Booking", url: "https://brgcabs.in",
    desc: "A full-stack booking system for outstation trips, airport transfers and Char Dham Yatra packages across 55+ routes.",
    stack: ["Cloudflare Workers", "KV Storage", "Razorpay", "WhatsApp Business API"],
    results: ["5-step guided booking flow", "Server-side fare validation", "5 vehicle categories, all-India coverage"],
    challenge: "BRG CABS needed to support a much wider route network — including seasonal, high-stakes Char Dham Yatra pilgrimage bookings — with a fare and payment system customers could trust for a significant upfront payment.",
    solution: "We designed a guided 5-step booking flow that breaks a complex decision (route, vehicle class, dates, add-ons, payment) into simple steps, backed by server-side OTP via crypto.getRandomValues(), rate limiting, and a full security hardening pass across CORS and CSP policies.",
    metrics: [
      { label: "Routes covered", before: "Limited", after: "55+ across India" },
      { label: "Vehicle categories", before: "1", after: "5" },
      { label: "Security posture", before: "Basic", after: "Full audit + hardening" },
    ],
    quote: "The new booking flow finally matches how seriously our customers take a Char Dham trip — it feels trustworthy from the first click to payment.",
    quoteAuthor: "BRG CABS operations team" },
  { id: 3, cat: "Education", name: "StudyCapital", tag: "Education Loan Consultancy", url: "https://studycapital.in",
    desc: "A lead-generation and consultation site for an education loan consultancy, with live Google reviews and WhatsApp intake.",
    stack: ["Cloudflare D1", "Google Places API v1", "WhatsApp Notifications"],
    results: ["Cached reviews for faster loads", "Hardened API key security", "Mobile-first lead capture"],
    challenge: "StudyCapital's site scored 61/100 on a full technical audit — slow, thin on trust signals, and leaking API keys client-side — while competing for students who compare several loan consultants before choosing one.",
    solution: "A comprehensive 15-category remediation across all 53 pages: WCAG focus styles, Cloudflare Turnstile spam protection, GA4 integration, and a migration of the Google Reviews integration to a cached, secure v1 API implementation that cut load time while fixing the key-exposure issue entirely.",
    metrics: [
      { label: "Audit score", before: "61/100", after: "95/100" },
      { label: "API key exposure", before: "Client-side", after: "Fully server-side" },
      { label: "Review load time", before: "Live API call", after: "6-hour cached" },
    ],
    quote: "The audit didn't just list problems — it fixed the security issue we didn't even know we had, and our page speed complaints from students stopped.",
    quoteAuthor: "StudyCapital team" },
  { id: 4, cat: "Hospitality", name: "BRG Tour India", tag: "Tour Operator Website Audit & Improvements", url: "https://brgtourindia.com",
    desc: "Technical and UX audit with performance and SEO improvements for a tour operator's booking site.",
    stack: ["SEO Audit", "Performance Tuning", "UX Review"],
    results: ["Improved Core Web Vitals", "Cleaner booking journey", "Stronger local search presence"],
    challenge: "BRG Tour India's Next.js site had thin route-page content, no schema markup, and no Google Business Profile — meaning it was largely invisible for the specific city-pair searches that drive outstation taxi bookings.",
    solution: "We ran a full technical and content audit, identifying priority fixes: schema markup for each route page, richer localized content, and a Google Business Profile setup to capture local intent search traffic.",
    metrics: [
      { label: "Route pages with schema", before: "0", after: "All priority routes" },
      { label: "Google Business Profile", before: "None", after: "Set up" },
      { label: "Content depth", before: "Thin", after: "Expanded per route" },
    ],
    quote: "A clear, prioritized audit that told us exactly what to fix first instead of a wall of generic recommendations.",
    quoteAuthor: "Client feedback" },
];

// Order leads with the international markets we're actively targeting;
// India stays listed (still our home base, still real clients) but last.
// `hreflang` codes are used for the <link rel="alternate" hreflang="..">
// tags in applyPageMeta() and index.html — see the note there on why these
// specific codes (ISO country codes, except Europe which uses the UN M49
// region code "150" since there's no single ISO country code for "Europe").
const COUNTRIES = [
  { code: "us", name: "United States", flag: "🇺🇸", currency: "USD", symbol: "$", hreflang: "en-us",
    note: "Evening IST calls line up with US morning/afternoon hours across time zones.",
    slug: "usa", headline: "Website & App Development for U.S. Businesses",
    intro: "We work with U.S. startups and SMEs who want senior-level web and app development without Silicon Valley rates — from SaaS marketing sites to booking platforms. Evening IST overlaps cleanly with US business hours coast to coast, so standups and reviews fit your calendar, not just ours.",
    industries: ["Startups & SaaS", "Professional Services", "Ecommerce"] },
  { code: "au", name: "Australia", flag: "🇦🇺", currency: "AUD", symbol: "$", hreflang: "en-au",
    note: "IST is 4.5–5.5 hours behind most of Australia — easy same-day overlap.",
    slug: "australia", headline: "Website & App Development for Australian Businesses",
    intro: "Australian businesses get same-day turnaround with us — IST sits comfortably behind AEST/AWST, so morning briefs from you often come back same-day. We've built booking and travel platforms that hold up under real traffic, not just demo traffic.",
    industries: ["Travel & Hospitality", "Retail", "Real Estate"] },
  { code: "eu", name: "Europe", flag: "🇪🇺", currency: "EUR", symbol: "€", hreflang: "en-150",
    note: "IST is 3.5–4.5 hours ahead of Central European Time — clean overlap for morning European calls.",
    slug: "europe", headline: "Website & App Development for European Businesses",
    intro: "We work with businesses across Europe who want senior-level web and app development at transparent, non-agency-inflated rates — from SaaS marketing sites to booking and hospitality platforms. IST sits 3.5–4.5 hours ahead of Central European Time, giving a clean morning-to-afternoon overlap for calls and reviews.",
    industries: ["Professional Services", "Retail & Ecommerce", "Travel & Hospitality"] },
  { code: "ae", name: "UAE", flag: "🇦🇪", currency: "AED", symbol: "د.إ", hreflang: "en-ae",
    note: "Only 1.5 hours behind IST — near-full working-day overlap.",
    slug: "uae", headline: "Website & App Development for UAE Businesses",
    intro: "With only a 1.5-hour gap to IST, working with our Delhi team feels local — full working-day overlap for calls, reviews and support. We've built hospitality and travel booking platforms that handle the trust and payment expectations UAE customers expect.",
    industries: ["Hospitality", "Real Estate", "Retail"] },
  { code: "gb", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£", hreflang: "en-gb",
    note: "IST is 4.5–5.5 hours ahead of the UK — easy overlap for morning UK calls.",
    slug: "uk", headline: "Website & App Development for UK Businesses",
    intro: "From local service businesses to growing consultancies, we build fast, accessible sites that meet UK expectations for polish and clarity. A 4.5–5.5 hour gap to IST means our afternoon overlaps your morning — reviews and calls fit before your lunch.",
    industries: ["Consultancies", "Retail", "Real Estate"] },
  { code: "ca", name: "Canada", flag: "🇨🇦", currency: "CAD", symbol: "$", hreflang: "en-ca",
    note: "Same time-zone overlap pattern as our US clients — evening IST works well.",
    slug: "canada", headline: "Website & App Development for Canadian Businesses",
    intro: "We build for Canadian SMEs and startups the same way we do for our U.S. clients — senior developers, transparent pricing, and evening-IST availability that lines up with your working day across every Canadian time zone.",
    industries: ["Startups", "Retail", "Professional Services"] },
  { code: "sg", name: "Singapore", flag: "🇸🇬", currency: "SGD", symbol: "$", hreflang: "en-sg",
    note: "2.5 hours ahead of IST — mornings overlap cleanly.",
    slug: "singapore", headline: "Website & App Development for Singapore Businesses",
    intro: "Singapore's 2.5-hour lead on IST means your morning is our mid-morning — clean overlap for daily standups. We build for the speed and polish Singapore's market expects, on infrastructure that performs well across Southeast Asia.",
    industries: ["Professional Services", "Retail", "Education"] },
  { code: "in", name: "India", flag: "🇮🇳", currency: "INR", symbol: "₹", hreflang: "en-in",
    note: "Our home market — same-day calls, on-the-ground meetings in Delhi NCR." },
];

// Approximate, illustrative conversion rates for the estimator only — not live
// exchange rates. Update periodically or wire to a real FX API if precision matters.
const CURRENCY_RATES = { INR: 1, USD: 0.012, GBP: 0.0095, EUR: 0.011, CAD: 0.016, AUD: 0.018, AED: 0.044, SGD: 0.016 };
const CURRENCY_SYMBOLS = { INR: "₹", USD: "$", GBP: "£", EUR: "€", CAD: "$", AUD: "$", AED: "د.إ", SGD: "$" };

const TEAM = [
  { name: "Aditya Rana", role: "Founder & Lead Developer", dept: "Leadership" },
  { name: "Priya Nair", role: "SEO & Growth Lead", dept: "Marketing" },
  { name: "Karan Mehta", role: "Frontend Developer", dept: "Engineering" },
  { name: "Simran Kaur", role: "Project Coordinator", dept: "Client Success" },
];

// Placeholder industry badges, not real client names/logos — swap for actual
// client logos (with permission) before launch. See README.
const CLIENT_INDUSTRIES = ["Travel & Tourism", "Education", "Hospitality", "Healthcare", "Real Estate", "Retail"];

const QUIZ_QUESTIONS = [
  {
    q: "What best describes your business?",
    options: [
      { label: "Travel, hotel or hospitality", tag: "travel" },
      { label: "School, hospital or NGO", tag: "institution" },
      { label: "Retail, restaurant or local business", tag: "local" },
      { label: "Startup or professional services", tag: "startup" },
    ],
  },
  {
    q: "What's your main goal right now?",
    options: [
      { label: "Get found on Google", tag: "seo" },
      { label: "Sell products/take bookings online", tag: "ecom" },
      { label: "Look more credible & professional", tag: "brand" },
      { label: "Automate customer replies", tag: "ai" },
      { label: "Keep track of leads & customers", tag: "crm" },
      { label: "Reach customers via WhatsApp/SMS", tag: "messaging" },
    ],
  },
];
// Maps (business tag, goal tag) combinations to a recommended service id from SERVICES.
const QUIZ_RECOMMENDATIONS = {
  "travel-ecom": "web", "travel-seo": "seo", "travel-brand": "web", "travel-ai": "ai", "travel-crm": "crm", "travel-messaging": "messaging",
  "institution-ecom": "web", "institution-seo": "seo", "institution-brand": "web", "institution-ai": "ai", "institution-crm": "crm", "institution-messaging": "messaging",
  "local-ecom": "ecom", "local-seo": "seo", "local-brand": "web", "local-ai": "ai", "local-crm": "crm", "local-messaging": "messaging",
  "startup-ecom": "ecom", "startup-seo": "seo", "startup-brand": "web", "startup-ai": "ai", "startup-crm": "crm", "startup-messaging": "messaging",
};

const TECH = [
  { name: "HTML5", desc: "Semantic, accessible markup" },
  { name: "CSS3", desc: "Modern layout & animation" },
  { name: "JavaScript", desc: "Core interactivity everywhere" },
  { name: "React", desc: "Component-driven UI" },
  { name: "Node.js", desc: "Backend & API services" },
  { name: "Flutter", desc: "Cross-platform mobile apps" },
  { name: "Firebase", desc: "Auth, database & hosting" },
  { name: "MongoDB", desc: "Flexible document storage" },
  { name: "GitHub", desc: "Version control & CI/CD" },
  { name: "Cloudflare", desc: "Edge hosting, CDN & security" },
];

const PROCESS = [
  { n: "01", title: "Discover", desc: "We map your business goals, audience and competitors before a single pixel is designed." },
  { n: "02", title: "Design", desc: "A tailored design system — colors, type, components — built for your brand, not a template." },
  { n: "03", title: "Develop", desc: "Clean, modular code with performance and SEO built in from the first commit." },
  { n: "04", title: "Deploy", desc: "Launch on secure, fast infrastructure with monitoring and analytics in place." },
  { n: "05", title: "Support", desc: "Ongoing maintenance, AMC and optimization so your site keeps performing." },
];

const TESTIMONIALS = [
  { name: "Rohit Malhotra", role: "Founder, Travel Startup",
    quote: "Our booking conversions nearly doubled after the redesign. The team understood exactly what a travel customer needs to trust a site enough to pay online.",
    reply: "Rohit, thrilled to hear this! Conversion lift from trust and speed is exactly what we aim for on every booking flow." },
  { name: "Dr. Anjali Sharma", role: "Director, Private Hospital",
    quote: "They delivered a hospital website that's fast, accessible, and actually easy for our admin staff to update — that mattered more than we expected.",
    reply: "Thank you, Dr. Sharma! Making it easy for your own team to manage was just as much a priority for us as the design itself." },
  { name: "Karan Bhatia", role: "CEO, Retail Chain",
    quote: "BRG Digital Solutions handled our SEO and ads together instead of treating them as separate projects. Our organic traffic and ad ROI both improved.",
    reply: "Karan, appreciate you sharing this! Treating SEO and paid together is how we approach every engagement — glad it showed in the numbers." },
];

// Real numbers pulled from the PORTFOLIO case studies above — not separately
// fabricated. Keep this in sync if you edit those metrics.
const STATS_HIGHLIGHTS = [
  { value: "<2s", label: "Page load on 3G", source: "One-Way Bhaarat" },
  { value: "55+", label: "Routes covered", source: "BRG CABS" },
  { value: "95/100", label: "Technical audit score", source: "StudyCapital" },
  { value: "5", label: "Vehicle categories supported", source: "BRG CABS" },
];

const FAQS = [
  { q: "How long does a typical website project take?", a: "Most business or corporate websites take 3–5 weeks from kickoff to launch. Ecommerce platforms and custom web applications typically take 6–10 weeks depending on scope." },
  { q: "Do you offer ongoing maintenance after launch?", a: "Yes. We offer AMC (Annual Maintenance Contract) plans covering updates, security patches, hosting management, and small content changes." },
  { q: "Can you work with businesses outside India?", a: "Yes — most of our clients are outside India. We actively serve businesses across the USA, Australia, Europe, UAE, UK, Canada and Singapore, with all communication and project management handled remotely." },
  { q: "What platforms do you build on?", a: "We choose the right stack per project — from static sites on Cloudflare for speed, to React and Node.js applications, to Flutter for cross-platform mobile apps." },
  { q: "Do you help with SEO after the website is live?", a: "Yes. SEO is built in from day one, and we offer ongoing technical, on-page and local SEO packages to keep improving your rankings post-launch." },
];

const BLOG = [
  { cat: "SEO", title: "5 Technical SEO Fixes Most Small Business Sites Miss", read: "6 min read" },
  { cat: "Web Dev", title: "Why Page Speed Is Now a Direct Revenue Metric", read: "5 min read" },
  { cat: "AI", title: "How WhatsApp Automation Cuts Response Time to Under a Minute", read: "4 min read" },
];

const BLOG_POSTS = [
  { id: 1, cat: "SEO", date: "Jun 18, 2026", author: "BRG Digital Team", read: "6 min read",
    title: "5 Technical SEO Fixes Most Small Business Sites Miss",
    excerpt: "Most small business sites lose search visibility to a handful of fixable technical issues — not a lack of content.",
    body: [
      "Most small business websites don't lose search rankings because of thin content — they lose them to technical issues that never get fixed. Here are five we see repeatedly during audits.",
      "First, missing or duplicate meta descriptions confuse search engines about which page to rank for a given query. Every page needs a unique, descriptive tag written for the person, not stuffed with keywords.",
      "Second, unoptimized images are still the single biggest cause of slow load times on small business sites. Compressing and lazy-loading images alone can cut load time in half.",
      "Third, broken internal links quietly waste crawl budget and hurt user trust. A quarterly link audit catches these before they compound.",
      "Fourth, missing schema markup means your business misses out on rich results — star ratings, FAQ dropdowns, business hours — directly in search results.",
      "Fifth, no XML sitemap or an outdated one makes it harder for search engines to discover new pages quickly. This is a five-minute fix with a disproportionate payoff.",
    ] },
  { id: 2, cat: "Web Dev", date: "Jun 5, 2026", author: "BRG Digital Team", read: "5 min read",
    title: "Why Page Speed Is Now a Direct Revenue Metric",
    excerpt: "Every extra second of load time is a measurable drop in conversions — here's how we think about speed as a business number, not a vanity score.",
    body: [
      "For years, page speed was treated as a technical nice-to-have. That's no longer true — it's one of the clearest levers on revenue we can pull for a client.",
      "Studies consistently show conversion rate drops sharply for every additional second of load time, especially on mobile where most traffic now originates.",
      "We treat performance as a design constraint from day one: critical CSS inlined, JavaScript code-split, images served in modern formats, and hosting on edge infrastructure like Cloudflare so pages load fast regardless of where a visitor is.",
      "The result isn't just a better PageSpeed score — it's fewer abandoned bookings, fewer abandoned carts, and a measurably better return on every marketing rupee spent driving traffic to the site.",
    ] },
  { id: 3, cat: "AI", date: "May 22, 2026", author: "BRG Digital Team", read: "4 min read",
    title: "How WhatsApp Automation Cuts Response Time to Under a Minute",
    excerpt: "Customers expect an instant reply on WhatsApp. Here's how automated flows handle the first response without losing the human touch.",
    body: [
      "WhatsApp is now the first point of contact for most bookings and inquiries we see across travel, hospitality and retail clients — and speed of response directly affects conversion.",
      "We build automation that handles OTP verification, booking confirmations, and common questions instantly, while routing anything unusual straight to a real person.",
      "The key is designing flows that never feel like a dead end. A customer should always be able to reach a human within one or two taps if the automated flow can't help.",
      "For our travel clients, this shift alone took average first-response time from over twenty minutes down to under a minute, with no increase in support headcount.",
    ] },
];

const CAREERS = [
  { id: 1, title: "Frontend Developer (React)", type: "Full-time", location: "New Delhi / Remote", dept: "Engineering",
    desc: "Build fast, accessible interfaces for client websites and web applications using React and modern CSS.",
    reqs: ["1–3 years with React and modern JavaScript", "Strong eye for UI detail and responsive design", "Familiarity with performance optimization"] },
  { id: 2, title: "SEO Specialist", type: "Full-time", location: "New Delhi", dept: "Marketing",
    desc: "Own technical, on-page and local SEO strategy across a portfolio of client websites.",
    reqs: ["2+ years hands-on SEO experience", "Comfortable with Search Console, schema markup, audits", "Clear written reporting skills"] },
  { id: 3, title: "WordPress / Full-Stack Developer", type: "Full-time", location: "New Delhi / Remote", dept: "Engineering",
    desc: "Develop and maintain custom websites and web applications end to end, from database to UI.",
    reqs: ["Experience with a modern JS framework and a backend language", "Comfortable owning a project from spec to deployment", "Cloudflare or similar hosting experience a plus"] },
  { id: 4, title: "Performance Marketing Executive", type: "Full-time", location: "New Delhi", dept: "Marketing",
    desc: "Plan and run Google and Meta ad campaigns for clients across travel, retail and hospitality.",
    reqs: ["1–2 years managing paid campaigns", "Comfortable with budgets, targeting, and reporting ROI", "Google Ads / Meta Ads certification a plus"] },
];

// track(), RECAPTCHA_SITE_KEY, and getRecaptchaToken() now live in ./theme.js
// (imported above) so ChatWidget.jsx can use them without importing this whole file.
/* ============================= SHARED UI ============================= */
function Reveal({ children, className = "" }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);
  const reduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    if (reduced) { setShow(true); return; }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setShow(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={reduced ? {} : { transition: "opacity 0.7s ease, transform 0.7s ease", opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(24px)" }}>
      {children}
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase"
      style={{ backgroundColor: C.blueSoft, color: C.blue, ...bodyFont }}>
      {children}
    </span>
  );
}

function Button({ children, variant = "primary", onClick, className = "", icon: Icon = ArrowRight, disabled = false }) {
  const styles = {
    primary: { backgroundColor: C.emerald, color: C.navy },
    secondary: { backgroundColor: C.blueBg, color: C.onDark },
    ghost: { backgroundColor: "transparent", color: C.onDark, border: `1.5px solid rgba(255,255,255,0.35)` },
    outline: { backgroundColor: "transparent", color: C.heading, border: `1.5px solid ${C.grayLine}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...styles[variant], ...bodyFont, opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
      className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-transform hover:-translate-y-0.5 hover:shadow-lg ${className}`}>
      {children}{Icon && <Icon size={16} />}
    </button>
  );
}

function SectionTitle({ eyebrow, title, sub, onDarkBg = false }) {
  return (
    <div className="max-w-2xl mx-auto text-center mb-14">
      <Badge>{eyebrow}</Badge>
      <h2 className="mt-5 text-3xl md:text-4xl font-bold leading-tight" style={{ ...displayFont, color: onDarkBg ? C.onDark : C.heading }}>{title}</h2>
      {sub && <p className="mt-4 text-base leading-relaxed" style={{ ...bodyFont, color: onDarkBg ? "rgba(255,255,255,0.65)" : C.inkSoft }}>{sub}</p>}
    </div>
  );
}

function ServiceQuiz({ setPage, onSelectService }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const answer = (tag) => {
    const key = step === 0 ? "business" : "goal";
    setAnswers({ ...answers, [key]: tag });
    setStep(step + 1);
    track("quiz_answer", { step, tag });
  };
  const reset = () => { setStep(0); setAnswers({}); };

  const recommendedId = answers.business && answers.goal ? QUIZ_RECOMMENDATIONS[`${answers.business}-${answers.goal}`] : null;
  const recommended = SERVICES.find((s) => s.id === recommendedId);

  const goToRecommendation = () => {
    track("quiz_completed", { service: recommendedId });
    if (onSelectService) onSelectService(recommendedId);
    setPage("services");
    window.scrollTo(0, 0);
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 shadow-sm" style={{ backgroundColor: C.white }}>
      {step < QUIZ_QUESTIONS.length ? (
        <>
          <div className="flex items-center gap-2 mb-2">
            {QUIZ_QUESTIONS.map((_, i) => (
              <div key={i} className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: i <= step ? C.blueBg : C.gray }} />
            ))}
          </div>
          <div className="text-xs mt-3 mb-1" style={{ ...bodyFont, color: C.inkSoft }}>Question {step + 1} of {QUIZ_QUESTIONS.length}</div>
          <div className="text-lg font-semibold mb-5" style={{ ...displayFont, color: C.heading }}>{QUIZ_QUESTIONS[step].q}</div>
          <div className="grid sm:grid-cols-2 gap-3">
            {QUIZ_QUESTIONS[step].options.map((opt) => (
              <button key={opt.tag} onClick={() => answer(opt.tag)} className="text-left px-4 py-3.5 rounded-lg text-sm font-medium border hover:shadow-md transition-shadow"
                style={{ ...bodyFont, borderColor: C.grayLine, color: C.heading }}>{opt.label}</button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: C.blueBg }}>
            {recommended && <recommended.icon size={26} color="#fff" />}
          </div>
          <div className="text-xs font-semibold uppercase tracking-wide" style={{ ...bodyFont, color: C.inkSoft }}>We'd recommend</div>
          <div className="text-xl font-bold mt-1" style={{ ...displayFont, color: C.heading }}>{recommended?.name}</div>
          <p className="text-sm mt-2 leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>{recommended?.short}</p>
          <div className="flex gap-3 justify-center mt-6">
            <Button onClick={goToRecommendation}>See This Service</Button>
            <Button variant="outline" onClick={reset}>Start Over</Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================= HERO PULSE (signature element) ============================= */
function PulseGrid() {
  const reduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nodes = [
    [40, 60], [140, 30], [230, 90], [320, 40], [400, 110],
    [90, 150], [200, 180], [300, 160], [380, 200], [60, 230],
    [170, 240], [270, 250], [350, 60], [120, 100],
  ];
  const edges = [[0,1],[1,3],[3,12],[0,13],[13,5],[5,10],[10,6],[6,11],[11,7],[7,8],[7,2],[2,3],[5,9],[9,10]];
  return (
    <svg viewBox="0 0 440 280" className="w-full h-full" role="img" aria-label="Animated network diagram representing digital connectivity">
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
          stroke="rgba(255,255,255,0.14)" strokeWidth="1">
          {!reduced && <animate attributeName="stroke" values="rgba(255,255,255,0.10);rgba(109,40,217,0.65);rgba(255,255,255,0.10)"
            dur={`${4 + (i % 5)}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} />}
        </line>
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 4 : 2.5} fill={i % 4 === 0 ? C.emerald : "#ffffff"} opacity="0.85">
          {!reduced && <animate attributeName="r" values={`${i % 3 === 0 ? 4 : 2.5};${i % 3 === 0 ? 6 : 4};${i % 3 === 0 ? 4 : 2.5}`}
            dur={`${3 + (i % 4)}s`} repeatCount="indefinite" begin={`${i * 0.2}s`} />}
        </circle>
      ))}
    </svg>
  );
}

/* ============================= NAVIGATION ============================= */
function Nav({ page, setPage, dark, setDark, onSelectService }) {
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);
  const links = [
    { id: "home", label: "Home" }, { id: "services", label: "Services", mega: true },
    { id: "portfolio", label: "Portfolio" }, { id: "about", label: "About" },
    { id: "blog", label: "Blog" }, { id: "careers", label: "Careers" }, { id: "contact", label: "Contact" },
  ];
  const go = (id) => { setPage(id); setOpen(false); window.scrollTo(0, 0); };
  const goToService = (serviceId) => { onSelectService(serviceId); go("services"); setMega(false); };
  return (
    <div className="sticky top-0 z-50" style={{ backgroundColor: scrolled ? "rgba(11,21,38,0.92)" : C.navy, backdropFilter: scrolled ? "blur(10px)" : "none", transition: "all 0.3s ease", borderBottom: scrolled ? `1px solid rgba(255,255,255,0.08)` : "1px solid transparent" }}>
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-20">
        <button onClick={() => go("home")} className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm" style={{ backgroundColor: C.blueBg, color: "#fff", ...displayFont }}>BD</div>
          <span className="font-bold text-lg" style={{ ...displayFont, color: C.onDark }}>BRG Digital</span>
        </button>
        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <div key={l.id} className="relative" onMouseEnter={() => l.mega && setMega(true)} onMouseLeave={() => l.mega && setMega(false)}
              onFocus={() => l.mega && setMega(true)}
              onBlur={(e) => { if (l.mega && !e.currentTarget.contains(e.relatedTarget)) setMega(false); }}
              onKeyDown={(e) => { if (e.key === "Escape") setMega(false); }}>
              <button onClick={() => go(l.id)} aria-haspopup={l.mega ? "true" : undefined} aria-expanded={l.mega ? mega : undefined}
                className="px-4 py-2 text-sm font-medium rounded-md flex items-center gap-1 transition-colors"
                style={{ ...bodyFont, color: page === l.id ? C.emerald : "rgba(255,255,255,0.85)" }}>
                {l.label}{l.mega && <ChevronDown size={14} />}
              </button>
              {l.mega && mega && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[560px] rounded-xl shadow-2xl p-6 grid grid-cols-2 gap-2"
                  style={{ backgroundColor: C.white }}>
                  {SERVICES.map((s) => (
                    <button key={s.id} onClick={() => goToService(s.id)} className="flex items-start gap-3 p-3 rounded-lg text-left hover:opacity-80 transition-opacity">
                      <s.icon size={18} style={{ color: C.blue, marginTop: 2 }} />
                      <div>
                        <div className="text-sm font-semibold" style={{ ...bodyFont, color: C.heading }}>{s.name}</div>
                        <div className="text-xs mt-0.5" style={{ ...bodyFont, color: C.inkSoft }}>{s.short}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <button onClick={() => setDark(!dark)} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
            {dark ? <Sun size={16} color="#fff" /> : <Moon size={16} color="#fff" />}
          </button>
          <a href="tel:+919811419910" className="text-sm font-medium flex items-center gap-2" style={{ ...bodyFont, color: "rgba(255,255,255,0.85)" }}>
            <Phone size={15} /> +91 98114 19910
          </a>
          <Button variant="primary" icon={ArrowRight} onClick={() => go("contact")}>Get a Quote</Button>
        </div>
        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} style={{ color: C.onDark }}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="lg:hidden px-6 pb-6 flex flex-col gap-1" style={{ backgroundColor: C.navy }}>
          {links.map((l) => (
            <button key={l.id} onClick={() => go(l.id)} className="text-left py-3 text-sm font-medium border-b" style={{ ...bodyFont, color: "#fff", borderColor: "rgba(255,255,255,0.08)" }}>{l.label}</button>
          ))}
          <button onClick={() => setDark(!dark)} className="text-left py-3 text-sm font-medium flex items-center gap-2" style={{ ...bodyFont, color: "#fff" }}>
            {dark ? <Sun size={16} /> : <Moon size={16} />} {dark ? "Light mode" : "Dark mode"}
          </button>
          <Button variant="primary" className="mt-4 justify-center" onClick={() => go("contact")}>Get a Quote</Button>
        </div>
      )}
    </div>
  );
}

/* ============================= FOOTER ============================= */
function Footer({ setPage }) {
  const go = (id) => { setPage(id); window.scrollTo(0, 0); };
  return (
    <footer style={{ backgroundColor: C.navyDeep }} className="pt-16 pb-24 lg:pb-8 px-6 md:px-10">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm" style={{ backgroundColor: C.blueBg, color: "#fff", ...displayFont }}>BD</div>
            <span className="font-bold text-lg" style={{ ...displayFont, color: "#fff" }}>BRG Digital</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ ...bodyFont, color: "rgba(255,255,255,0.55)" }}>Transforming Ideas into Digital Success — websites, apps and growth systems for ambitious businesses.</p>
          <div className="flex gap-3 mt-5">
            {[Facebook, Instagram, Linkedin, Twitter].map((I, i) => (
              <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}><I size={15} color="#fff" /></div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ ...bodyFont, color: "#fff" }}>Services</h4>
          <div className="flex flex-col gap-2">
            {SERVICES.map((s) => <button key={s.id} onClick={() => go("services")} className="text-xs text-left" style={{ ...bodyFont, color: "rgba(255,255,255,0.55)" }}>{s.name}</button>)}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ ...bodyFont, color: "#fff" }}>Company</h4>
          <div className="flex flex-col gap-2.5">
            {[["about","About Us"],["portfolio","Portfolio"],["careers","Careers"],["blog","Blog"],["contact","Contact"]].map(([id,label],i) => (
              <button key={i} onClick={() => go(id)} className="text-sm text-left" style={{ ...bodyFont, color: "rgba(255,255,255,0.55)" }}>{label}</button>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ ...bodyFont, color: "#fff" }}>Contact</h4>
          <div className="flex flex-col gap-3 text-sm" style={{ ...bodyFont, color: "rgba(255,255,255,0.55)" }}>
            <div className="flex gap-2"><MapPin size={16} className="shrink-0 mt-0.5" />B-158/159 Sainik Nagar, New Delhi – 110059, India</div>
            <div className="flex gap-2"><Phone size={16} />+91 98114 19910</div>
            <div className="flex gap-2"><Mail size={16} />brgdigitalsolutions@gmail.com</div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t mt-12 pt-6 flex flex-wrap items-center gap-x-4 gap-y-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <span className="text-xs" style={{ ...bodyFont, color: "rgba(255,255,255,0.35)" }}>Serving:</span>
        {COUNTRIES.filter((c) => c.slug).map((c) => (
          <button key={c.code} onClick={() => go(`loc-${c.code}`)} className="text-xs" style={{ ...bodyFont, color: "rgba(255,255,255,0.5)" }}>{c.name}</button>
        ))}
      </div>
      <div className="max-w-7xl mx-auto border-t mt-6 pt-6 flex flex-col md:flex-row justify-between gap-3 text-xs" style={{ borderColor: "rgba(255,255,255,0.08)", ...bodyFont, color: "rgba(255,255,255,0.4)" }}>
        <span>© 2026 BRG Digital Solutions. All rights reserved.</span>
        <div className="flex gap-4">
          <button onClick={() => go("privacy")} style={{ ...bodyFont, color: "rgba(255,255,255,0.4)" }}>Privacy Policy</button>
          <span>brgdigitalsolutions.com</span>
        </div>
      </div>
    </footer>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-semibold" style={{ ...bodyFont, color: C.inkSoft }}>{label}</label>
      {children}
    </div>
  );
}

// Computes real open/closed status against our actual stated hours
// (Mon–Sat, 10:00 AM–7:00 PM IST) — not hardcoded, so it's never stale.
function getISTBusinessStatus() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata", weekday: "short", hour: "numeric", hour12: false,
  }).formatToParts(new Date());
  const weekday = parts.find((p) => p.type === "weekday")?.value;
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value, 10);
  return weekday !== "Sun" && hour >= 10 && hour < 19;
}

function LiveStatusIndicator({ className = "" }) {
  const [online, setOnline] = useState(getISTBusinessStatus());
  useEffect(() => {
    const id = setInterval(() => setOnline(getISTBusinessStatus()), 60000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${className}`}
      style={{ ...bodyFont, backgroundColor: C.gray, color: online ? C.emeraldDeep : C.inkSoft }}>
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: online ? C.emerald : C.inkSoft }} aria-hidden="true" />
      {online ? "We're online now" : "Outside business hours — we'll reply within 1 business day"}
    </div>
  );
}

/* ============================= WHATSAPP / CALL FAB ============================= */
function Fabs({ onChat }) {
  return (
    <>
      {/* Desktop: full vertical stack, bottom-right */}
      <div className="hidden lg:flex fixed bottom-6 right-6 z-50 flex-col gap-3">
        <button onClick={() => { track("chat_opened"); onChat(); }} aria-label="Open chat assistant" className="w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-xl" style={{ backgroundColor: C.navy }}><Bot color="#fff" size={22} /></button>
        <a href="https://wa.me/919811419910" onClick={() => track("whatsapp_click", { source: "fab" })} aria-label="Chat on WhatsApp" className="w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-xl" style={{ backgroundColor: "#25D366" }}><MessageCircle color="#fff" size={24} /></a>
        <a href="tel:+919811419910" onClick={() => track("call_click", { source: "fab" })} aria-label="Call BRG Digital Solutions" className="w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-xl" style={{ backgroundColor: C.blueBg }}><Phone color="#fff" size={22} /></a>
      </div>

      {/* Mobile: only the chat FAB floats, sitting just above the sticky CTA bar */}
      <button onClick={() => { track("chat_opened"); onChat(); }} aria-label="Open chat assistant"
        className="lg:hidden fixed right-4 z-50 w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-xl"
        style={{ backgroundColor: C.navy, bottom: "76px" }}>
        <Bot color="#fff" size={22} />
      </button>
    </>
  );
}

function MobileCTABar({ setPage }) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 grid grid-cols-3" style={{ backgroundColor: C.navy, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
      <a href="tel:+919811419910" onClick={() => track("call_click", { source: "mobile_bar" })}
        className="flex flex-col items-center justify-center gap-0.5 py-2.5" style={{ borderRight: "1px solid rgba(255,255,255,0.1)" }}>
        <Phone size={17} color="#fff" />
        <span className="text-[10px] font-medium" style={{ ...bodyFont, color: "#fff" }}>Call</span>
      </a>
      <a href="https://wa.me/919811419910" onClick={() => track("whatsapp_click", { source: "mobile_bar" })}
        className="flex flex-col items-center justify-center gap-0.5 py-2.5" style={{ borderRight: "1px solid rgba(255,255,255,0.1)" }}>
        <MessageCircle size={17} color="#25D366" />
        <span className="text-[10px] font-medium" style={{ ...bodyFont, color: "#fff" }}>WhatsApp</span>
      </a>
      <button onClick={() => { track("cta_click", { source: "mobile_bar" }); setPage("contact"); window.scrollTo(0, 0); }}
        className="flex flex-col items-center justify-center gap-0.5 py-2.5">
        <Calculator size={17} color={C.emerald} />
        <span className="text-[10px] font-medium" style={{ ...bodyFont, color: "#fff" }}>Get Quote</span>
      </button>
    </div>
  );
}

/* ChatWidget now lives in ./ChatWidget.jsx, lazy-loaded below. */

/* ============================= HOME PAGE ============================= */
function HomePage({ setPage, onSelectService }) {
  const go = (id) => { setPage(id); window.scrollTo(0, 0); };
  const [calc, setCalc] = useState({ type: "Business Website", pages: 5, currency: "INR" });
  const rates = { "Business Website": 6000, "Ecommerce Website": 15000, "Web Application": 25000, "Mobile App": 40000 };
  const estimateINR = rates[calc.type] + calc.pages * 1500;
  const estimate = Math.round(estimateINR * CURRENCY_RATES[calc.currency]);
  const currencySymbol = CURRENCY_SYMBOLS[calc.currency];

  // Real geo-detection via Cloudflare's request.cf.country (see worker/index.js
  // -> /api/geo) — no external geolocation API or client-side IP lookup needed.
  // Fails silently if the endpoint isn't reachable (e.g. in the chat preview,
  // where there's no deployed worker) — the banner just doesn't show.
  const [detectedCountry, setDetectedCountry] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const userChangedCurrency = useRef(false);
  useEffect(() => {
    fetch("/api/geo").then((r) => r.json()).then((data) => {
      if (data?.country) setDetectedCountry(data.country);
    }).catch(() => {});
  }, []);
  const geoMatch = detectedCountry ? COUNTRIES.find((c) => c.slug && c.code.toUpperCase() === detectedCountry) : null;
  useEffect(() => {
    if (geoMatch && !userChangedCurrency.current) setCalc((prev) => ({ ...prev, currency: geoMatch.currency }));
  }, [geoMatch]);
  // Fades the banner in rather than having it pop in the instant geoMatch
  // resolves — the short timeout lets the initial (invisible) state paint
  // first, so the transition below actually has something to animate from.
  useEffect(() => {
    if (geoMatch) {
      const t = setTimeout(() => setBannerVisible(true), 20);
      return () => clearTimeout(t);
    }
  }, [geoMatch]);

  const [activeFaq, setActiveFaq] = useState(0);
  const [filter, setFilter] = useState("All");
  const cats = ["All", ...new Set(PORTFOLIO.map((p) => p.cat))];

  return (
    <>
      {/* HERO */}
      <section style={{ backgroundColor: C.navy }} className="relative overflow-hidden pt-16 pb-24 px-6 md:px-10">
        <div className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(circle at 80% 20%, ${C.indigo}55, transparent 60%)` }} />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center relative">
          <div>
            <Badge>Digital Agency · Delhi, India</Badge>
            <h1 className="mt-6 text-4xl md:text-5xl xl:text-6xl font-bold leading-[1.1]" style={{ ...displayFont, color: "#fff" }}>
              Transforming Ideas <br />into <span style={{ color: C.emerald }}>Digital Success</span>
            </h1>
            <p className="mt-6 text-lg max-w-lg leading-relaxed" style={{ ...bodyFont, color: "rgba(255,255,255,0.65)" }}>
              We design and build websites, apps and growth systems for startups, SMEs and enterprises — engineered for speed, trust and conversions from day one.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button onClick={() => go("contact")}>Start Your Project</Button>
              <Button variant="ghost" icon={ExternalLink} onClick={() => go("portfolio")}>View Our Work</Button>
            </div>
            <div className="mt-12 flex gap-10">
              {[["120+","Projects Delivered"],["7","Countries Served"],["4.9/5","Average Rating"]].map(([n,l],i) => (
                <div key={i}>
                  <div className="text-2xl font-bold" style={{ ...displayFont, color: "#fff" }}>{n}</div>
                  <div className="text-xs mt-1" style={{ ...bodyFont, color: "rgba(255,255,255,0.5)" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-[320px] md:h-[400px]">
            <PulseGrid />
            <div className="absolute bottom-2 left-2 md:bottom-6 md:left-6 rounded-xl px-5 py-4 shadow-2xl" style={{ backgroundColor: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ ...bodyFont, color: C.emerald }}><Zap size={14} /> Live Project Status</div>
              <div className="text-sm mt-2" style={{ ...bodyFont, color: "#fff" }}>3 launches in progress</div>
              <div className="text-xs mt-1" style={{ ...bodyFont, color: "rgba(255,255,255,0.5)" }}>Avg. response time: 12 min</div>
            </div>
          </div>
        </div>
      </section>

      {/* GEO-DETECTED REGION BANNER */}
      {geoMatch && !bannerDismissed && (
        <div className="px-6 md:px-10 py-3" style={{ backgroundColor: C.blueBg, opacity: bannerVisible ? 1 : 0, transform: bannerVisible ? "translateY(0)" : "translateY(-8px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <span className="text-sm" style={{ ...bodyFont, color: "#fff" }}>
              <span aria-hidden="true">{geoMatch.flag}</span> Visiting from {geoMatch.name}? See time-zone fit and {geoMatch.currency} pricing on our dedicated page.
            </span>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => { go(`loc-${geoMatch.code}`); }} className="text-xs font-semibold px-4 py-1.5 rounded-lg" style={{ ...bodyFont, backgroundColor: C.emerald, color: C.navy }}>
                View {geoMatch.name} Page
              </button>
              <button onClick={() => setBannerDismissed(true)} aria-label="Dismiss region suggestion" className="text-white/70 hover:text-white">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERNATIONAL TRUST STRIP */}
      <div className="py-5 px-6 md:px-10 overflow-x-auto" style={{ backgroundColor: C.navyDeep }}>
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 md:gap-10 flex-nowrap whitespace-nowrap">
          <span className="text-xs font-semibold uppercase tracking-wide shrink-0" style={{ ...bodyFont, color: "rgba(255,255,255,0.45)" }}>Serving clients in</span>
          {COUNTRIES.map((c) => (
            <span key={c.code} className="text-sm flex items-center gap-1.5 shrink-0" style={{ ...bodyFont, color: "rgba(255,255,255,0.75)" }}>
              <span aria-hidden="true">{c.flag}</span>{c.name}
            </span>
          ))}
        </div>
      </div>

      {/* ABOUT STRIP */}
      <section className="py-24 px-6 md:px-10" style={{ backgroundColor: C.white }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <Badge>Who We Are</Badge>
            <h2 className="mt-5 text-3xl md:text-4xl font-bold leading-tight" style={{ ...displayFont, color: C.heading }}>
              A full-stack digital partner, not just a website vendor
            </h2>
            <p className="mt-5 text-base leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>
              BRG Digital Solutions builds and maintains web platforms end to end — design, development, SEO, marketing and ongoing support — for businesses that need a digital presence they can actually trust to perform. We work with startups launching their first site and enterprises modernizing legacy systems alike.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6">
              {[[Shield,"Security-first builds"],[TrendingUp,"Conversion-focused design"],[Layers,"Modular, maintainable code"],[Users,"Dedicated project owner"]].map(([Icon,t],i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: C.blueSoft }}><Icon size={17} style={{ color: C.blue }} /></div>
                  <span className="text-sm font-medium" style={{ ...bodyFont, color: C.heading }}>{t}</span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <div className="rounded-2xl p-8" style={{ backgroundColor: C.gray }}>
              <div className="grid grid-cols-2 gap-5">
                {[["95+","PageSpeed Score"],["24/7","Uptime Monitoring"],["3–5wk","Avg. Launch Time"],["100%","Mobile Responsive"]].map(([n,l],i) => (
                  <div key={i} className="bg-white rounded-xl p-5 shadow-sm" style={{ backgroundColor: C.white }}>
                    <div className="text-2xl font-bold" style={{ ...displayFont, color: C.blue }}>{n}</div>
                    <div className="text-xs mt-1" style={{ ...bodyFont, color: C.inkSoft }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24 px-6 md:px-10" style={{ backgroundColor: C.gray }}>
        <SectionTitle eyebrow="What We Do" title="Services built for measurable outcomes" sub="From your first landing page to a full-scale ecommerce platform — every service is designed to work together." />
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((s, i) => (
            <Reveal key={s.id}>
              <button onClick={() => go("services")} className="text-left w-full h-full bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-shadow flex flex-col" style={{ backgroundColor: C.white }}>
                <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: C.blueSoft }}><s.icon size={20} style={{ color: C.blue }} /></div>
                <div className="font-semibold text-sm" style={{ ...displayFont, color: C.heading }}>{s.name}</div>
                <div className="text-xs mt-2 leading-relaxed flex-1" style={{ ...bodyFont, color: C.inkSoft }}>{s.short}</div>
                <div className="text-xs font-semibold mt-4 flex items-center gap-1" style={{ ...bodyFont, color: C.blue }}>Learn more <ChevronRight size={14} /></div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SERVICE QUIZ */}
      <section className="py-24 px-6 md:px-10" style={{ backgroundColor: C.white }}>
        <SectionTitle eyebrow="Not Sure Where to Start?" title="Find your service in 2 questions" sub="Answer two quick questions and we'll point you to the right service." />
        <ServiceQuiz setPage={setPage} onSelectService={onSelectService} />
      </section>

      {/* INDUSTRIES */}
      <section className="py-24 px-6 md:px-10" style={{ backgroundColor: C.white }}>
        <SectionTitle eyebrow="Who We Serve" title="Industries we build for" />
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {INDUSTRIES.map((ind, i) => (
            <Reveal key={i}>
              <div className="border rounded-xl p-6 text-center hover:border-transparent hover:shadow-lg transition-all" style={{ borderColor: C.grayLine }}>
                <ind.icon size={24} style={{ color: C.blue, margin: "0 auto" }} />
                <div className="text-sm font-medium mt-3" style={{ ...bodyFont, color: C.heading }}>{ind.name}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PORTFOLIO PREVIEW */}
      <section className="py-24 px-6 md:px-10" style={{ backgroundColor: C.gray }}>
        <SectionTitle eyebrow="Our Work" title="Recent projects, real results" />
        <div className="max-w-7xl mx-auto flex justify-center gap-2 mb-10 flex-wrap">
          {cats.map((c) => (
            <button key={c} onClick={() => setFilter(c)} className="px-4 py-2 rounded-full text-xs font-semibold transition-colors"
              style={{ ...bodyFont, backgroundColor: filter === c ? C.blueBg : C.white, color: filter === c ? "#fff" : C.inkSoft, border: `1px solid ${filter === c ? C.blueBg : C.grayLine}` }}>{c}</button>
          ))}
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
          {PORTFOLIO.filter((p) => filter === "All" || p.cat === filter).map((p) => (
            <Reveal key={p.id}>
              <div className="bg-white rounded-xl p-7 shadow-sm hover:shadow-xl transition-shadow h-full flex flex-col" style={{ backgroundColor: C.white }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: C.blueSoft, color: C.blue, ...bodyFont }}>{p.cat}</span>
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" onClick={() => track("portfolio_visit_site", { project: p.name })} className="text-xs font-semibold flex items-center gap-1" style={{ ...bodyFont, color: C.emeraldDeep }}>
                      Visit Site <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <div className="font-bold text-lg mt-4" style={{ ...displayFont, color: C.heading }}>{p.name}</div>
                <div className="text-xs font-medium mt-1" style={{ ...bodyFont, color: C.emeraldDeep }}>{p.tag}</div>
                <p className="text-sm mt-3 leading-relaxed flex-1" style={{ ...bodyFont, color: C.inkSoft }}>{p.desc}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {p.stack.map((t, i) => <span key={i} className="text-[11px] px-2.5 py-1 rounded-md" style={{ backgroundColor: C.gray, color: C.inkSoft, ...bodyFont }}>{t}</span>)}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="text-center mt-10"><Button variant="outline" onClick={() => go("portfolio")}>View Full Portfolio</Button></div>
      </section>

      {/* CLIENT TRUST STRIP */}
      <div className="py-10 px-6 md:px-10" style={{ backgroundColor: C.white, borderTop: `1px solid ${C.grayLine}`, borderBottom: `1px solid ${C.grayLine}` }}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-xs font-semibold uppercase tracking-wide mb-5" style={{ ...bodyFont, color: C.inkSoft }}>Trusted by teams across</div>
          <div className="flex flex-wrap justify-center gap-3">
            {CLIENT_INDUSTRIES.map((ind, i) => (
              <span key={i} className="px-4 py-2 rounded-full text-sm font-medium" style={{ ...bodyFont, backgroundColor: C.gray, color: C.inkSoft }}>{ind}</span>
            ))}
          </div>
        </div>
      </div>

      {/* TECH STACK */}
      <section className="py-20 px-6 md:px-10" style={{ backgroundColor: C.navy }}>
        <SectionTitle eyebrow="Technology" title="Tools we build with" onDarkBg />
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-4">
          {TECH.map((t, i) => (
            <div key={i} className="group relative px-5 py-3 rounded-lg text-sm font-medium cursor-default" tabIndex={0}
              style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", ...bodyFont }}>
              {t.name}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-[200px] px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-opacity z-10"
                style={{ backgroundColor: C.blueBg, color: "#fff", ...bodyFont }}>
                {t.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-24 px-6 md:px-10" style={{ backgroundColor: C.white }}>
        <SectionTitle eyebrow="How We Work" title="A clear process, start to finish" sub="Every project follows the same five stages, so you always know what happens next." />
        <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-6">
          {PROCESS.map((p, i) => (
            <Reveal key={i}>
              <div className="relative">
                <div className="text-4xl font-bold" style={{ ...displayFont, color: C.blueSoft }}>{p.n}</div>
                <div className="font-semibold text-sm mt-2" style={{ ...displayFont, color: C.heading }}>{p.title}</div>
                <div className="text-xs mt-2 leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>{p.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* QUOTE ESTIMATOR */}
      <section className="py-24 px-6 md:px-10" style={{ backgroundColor: C.gray }}>
        <SectionTitle eyebrow="Pricing" title="Get an instant ballpark estimate" sub="A quick starting point — every quote is refined after a short discovery call." />
        <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-sm" style={{ backgroundColor: C.white }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2"><Calculator size={18} style={{ color: C.blue }} /><span className="text-sm font-semibold" style={{ ...bodyFont, color: C.heading }}>Quote Estimator</span></div>
            <select value={calc.currency} onChange={(e) => { userChangedCurrency.current = true; setCalc({ ...calc, currency: e.target.value }); }} aria-label="Currency"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ ...bodyFont, borderColor: C.grayLine, color: C.inkSoft }}>
              {Object.keys(CURRENCY_RATES).map((cur) => <option key={cur} value={cur}>{cur}</option>)}
            </select>
          </div>
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ ...bodyFont, color: C.inkSoft }}>Project Type</label>
          <div className="grid grid-cols-2 gap-2 mt-2 mb-6">
            {Object.keys(rates).map((t) => (
              <button key={t} onClick={() => setCalc({ ...calc, type: t })} className="text-xs font-medium py-2.5 rounded-lg transition-colors"
                style={{ ...bodyFont, backgroundColor: calc.type === t ? C.blueBg : C.gray, color: calc.type === t ? "#fff" : C.inkSoft }}>{t}</button>
            ))}
          </div>
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ ...bodyFont, color: C.inkSoft }}>Number of Pages: {calc.pages}</label>
          <input type="range" min="1" max="20" value={calc.pages} onChange={(e) => setCalc({ ...calc, pages: Number(e.target.value) })} className="w-full mt-3 mb-6" style={{ accentColor: C.blue }} />
          <div className="flex items-center justify-between rounded-xl p-5" style={{ backgroundColor: C.navy }}>
            <div>
              <div className="text-xs" style={{ ...bodyFont, color: "rgba(255,255,255,0.6)" }}>Estimated starting price</div>
              <div className="text-2xl font-bold mt-1" style={{ ...displayFont, color: "#fff" }}>{currencySymbol}{estimate.toLocaleString("en-IN")}</div>
            </div>
            <Button onClick={() => go("contact")}>Get Exact Quote</Button>
          </div>
          {calc.currency !== "INR" && (
            <div className="text-[11px] mt-3 text-center" style={{ ...bodyFont, color: C.inkSoft }}>Converted at an approximate rate for reference — final quotes are in INR unless agreed otherwise.</div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 md:px-10" style={{ backgroundColor: C.white }}>
        <SectionTitle eyebrow="Client Feedback" title="What our clients say" />
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i}>
              <div className="rounded-xl p-5 h-full flex flex-col gap-3" style={{ backgroundColor: C.gray }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0" style={{ background: `linear-gradient(135deg, ${C.blueBg}, ${C.indigo})`, color: "#fff", ...displayFont }}>{t.name.charAt(0)}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ ...bodyFont, color: C.heading }}>{t.name}</div>
                    <div className="text-xs truncate" style={{ ...bodyFont, color: C.inkSoft }}>{t.role}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5 shrink-0">{[...Array(5)].map((_, j) => <Star key={j} size={11} fill={C.emeraldDeep} color={C.emeraldDeep} />)}</div>
                </div>
                {/* Customer message bubble */}
                <div className="rounded-xl rounded-tl-sm px-4 py-3" style={{ backgroundColor: C.white }}>
                  <p className="text-sm leading-relaxed" style={{ ...bodyFont, color: C.heading }}>{t.quote}</p>
                </div>
                {/* BRG reply bubble */}
                <div className="rounded-xl rounded-tr-sm px-4 py-3 self-end max-w-[92%]" style={{ backgroundColor: C.blueSoft }}>
                  <div className="text-[11px] font-semibold mb-1" style={{ ...bodyFont, color: C.blue }}>BRG Digital Solutions</div>
                  <p className="text-sm leading-relaxed" style={{ ...bodyFont, color: C.heading }}>{t.reply}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 md:px-10" style={{ backgroundColor: C.gray }}>
        <SectionTitle eyebrow="Questions" title="Frequently asked questions" />
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {FAQS.map((f, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden" style={{ backgroundColor: C.white }}>
              <button onClick={() => setActiveFaq(activeFaq === i ? -1 : i)} className="w-full flex items-center justify-between px-6 py-5 text-left">
                <span className="text-sm font-semibold" style={{ ...bodyFont, color: C.heading }}>{f.q}</span>
                <ChevronDown size={16} style={{ color: C.blue, transform: activeFaq === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {activeFaq === i && <div className="px-6 pb-5 text-sm leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <section className="py-24 px-6 md:px-10" style={{ backgroundColor: C.white }}>
        <SectionTitle eyebrow="Insights" title="From our blog" />
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {BLOG.map((b, i) => (
            <Reveal key={i}>
              <div className="rounded-xl p-6 border hover:shadow-lg transition-shadow" style={{ borderColor: C.grayLine }}>
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: C.blueSoft, color: C.blue, ...bodyFont }}>{b.cat}</span>
                <div className="font-semibold text-sm mt-4 leading-snug" style={{ ...displayFont, color: C.heading }}>{b.title}</div>
                <div className="text-xs mt-4" style={{ ...bodyFont, color: C.inkSoft }}>{b.read}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-10" style={{ backgroundColor: C.navy }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ ...displayFont, color: "#fff" }}>Ready to build something your customers trust?</h2>
          <p className="mt-4 text-base" style={{ ...bodyFont, color: "rgba(255,255,255,0.6)" }}>Tell us about your project — we'll get back within one business day.</p>
          <div className="mt-8 flex justify-center gap-4"><Button onClick={() => go("contact")}>Start Your Project</Button></div>
        </div>
      </section>
    </>
  );
}

/* ============================= SERVICES PAGE ============================= */
function ServicesPage({ setPage, initialServiceId }) {
  const [active, setActive] = useState(initialServiceId || SERVICES[0].id);
  useEffect(() => { if (initialServiceId) setActive(initialServiceId); }, [initialServiceId]);
  const svc = SERVICES.find((s) => s.id === active);
  return (
    <>
      <section className="py-20 px-6 md:px-10 text-center" style={{ backgroundColor: C.navy }}>
        <Badge>Services</Badge>
        <h1 className="mt-5 text-4xl font-bold" style={{ ...displayFont, color: "#fff" }}>Everything you need, under one roof</h1>
        <p className="mt-4 max-w-xl mx-auto text-base" style={{ ...bodyFont, color: "rgba(255,255,255,0.6)" }}>Website development, apps, SEO, marketing, AI and infrastructure — designed to work as one system.</p>
      </section>
      <section className="py-16 px-6 md:px-10" style={{ backgroundColor: C.white }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[280px_1fr] gap-10">
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
            {SERVICES.map((s) => (
              <button key={s.id} onClick={() => setActive(s.id)} className="flex items-start lg:items-start gap-3 px-4 py-3 rounded-lg text-left whitespace-nowrap lg:whitespace-normal shrink-0 lg:w-full"
                style={{ backgroundColor: active === s.id ? C.blueSoft : "transparent", ...bodyFont }}>
                <s.icon size={18} className="shrink-0 mt-0.5" style={{ color: active === s.id ? C.blue : C.inkSoft }} />
                <span className="text-sm font-medium" style={{ color: active === s.id ? C.blueBg : C.heading }}>{s.name}</span>
              </button>
            ))}
          </div>
          <div className="bg-gray-50 rounded-2xl p-8 md:p-10" style={{ backgroundColor: C.gray }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: C.blueBg }}><svc.icon size={26} color="#fff" /></div>
            <h2 className="text-2xl font-bold" style={{ ...displayFont, color: C.heading }}>{svc.name}</h2>
            <p className="mt-3 text-base leading-relaxed max-w-xl" style={{ ...bodyFont, color: C.inkSoft }}>{svc.short}</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-8">
              {svc.items.map((it, i) => (
                <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-4 py-3" style={{ backgroundColor: C.white }}>
                  <Check size={15} style={{ color: C.emeraldDeep }} />
                  <span className="text-sm font-medium" style={{ ...bodyFont, color: C.heading }}>{it}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-3 flex-wrap">
              <div className="bg-white rounded-lg px-4 py-3 flex-1 min-w-[140px]" style={{ backgroundColor: C.white }}><div className="text-xs" style={{...bodyFont,color:C.inkSoft}}>Typical Timeline</div><div className="text-sm font-semibold mt-1" style={{...bodyFont,color:C.heading}}>3–6 weeks</div></div>
              <div className="bg-white rounded-lg px-4 py-3 flex-1 min-w-[140px]" style={{ backgroundColor: C.white }}><div className="text-xs" style={{...bodyFont,color:C.inkSoft}}>Starting From</div><div className="text-sm font-semibold mt-1" style={{...bodyFont,color:C.heading}}>₹6,000</div></div>
            </div>
            <div className="mt-8"><Button onClick={() => setPage("contact")}>Get a Custom Quote</Button></div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============================= PORTFOLIO PAGE ============================= */
function ResultsStrip() {
  return (
    <div className="py-14 px-6 md:px-10" style={{ backgroundColor: C.navy }}>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {STATS_HIGHLIGHTS.map((s, i) => (
          <div key={i}>
            <div className="text-3xl md:text-4xl font-bold" style={{ ...displayFont, color: C.emerald }}>{s.value}</div>
            <div className="text-xs mt-2" style={{ ...bodyFont, color: "rgba(255,255,255,0.7)" }}>{s.label}</div>
            <div className="text-[11px] mt-0.5" style={{ ...bodyFont, color: "rgba(255,255,255,0.4)" }}>{s.source}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PortfolioPage({ setPage }) {
  const [filter, setFilter] = useState("All");
  const [openId, setOpenId] = useState(null);
  const cats = ["All", ...new Set(PORTFOLIO.map((p) => p.cat))];
  const open = PORTFOLIO.find((p) => p.id === openId);

  if (open) {
    return (
      <section className="py-20 px-6 md:px-10" style={{ backgroundColor: C.white }}>
        <div className="max-w-3xl mx-auto">
          <button onClick={() => setOpenId(null)} className="text-sm font-semibold flex items-center gap-1 mb-8" style={{ ...bodyFont, color: C.blue }}>
            <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> Back to Portfolio
          </button>
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: C.blueSoft, color: C.blue, ...bodyFont }}>{open.cat}</span>
          <h1 className="mt-5 text-3xl font-bold leading-tight" style={{ ...displayFont, color: C.heading }}>{open.name}</h1>
          <div className="text-sm font-medium mt-2" style={{ ...bodyFont, color: C.emeraldDeep }}>{open.tag}</div>

          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            {open.metrics.map((m, i) => (
              <div key={i} className="rounded-xl p-4" style={{ backgroundColor: C.gray }}>
                <div className="text-xs" style={{ ...bodyFont, color: C.inkSoft }}>{m.label}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs line-through" style={{ ...bodyFont, color: C.inkSoft }}>{m.before}</span>
                  <ArrowRight size={12} style={{ color: C.blue }} />
                  <span className="text-sm font-bold" style={{ ...displayFont, color: C.heading }}>{m.after}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ ...bodyFont, color: C.heading }}>The Challenge</div>
            <p className="text-base mt-2 leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>{open.challenge}</p>
          </div>
          <div className="mt-6">
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ ...bodyFont, color: C.heading }}>The Solution</div>
            <p className="text-base mt-2 leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>{open.solution}</p>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            {open.stack.map((t, i) => <span key={i} className="text-xs px-3 py-1.5 rounded-md" style={{ backgroundColor: C.gray, color: C.inkSoft, ...bodyFont }}>{t}</span>)}
          </div>

          <div className="mt-8 rounded-xl p-6" style={{ backgroundColor: C.gray }}>
            <Quote size={20} style={{ color: C.blue, opacity: 0.5 }} />
            <p className="text-sm mt-3 leading-relaxed italic" style={{ ...bodyFont, color: C.heading }}>{open.quote}</p>
            <div className="text-xs font-semibold mt-3" style={{ ...bodyFont, color: C.inkSoft }}>— {open.quoteAuthor}</div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            {open.url && (
              <a href={open.url} target="_blank" rel="noopener noreferrer" onClick={() => track("portfolio_visit_site", { project: open.name, source: "case_study" })}>
                <Button variant="outline" icon={ExternalLink}>Visit Live Site</Button>
              </a>
            )}
            <Button onClick={() => setPage("contact")}>Start a Similar Project</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-20 px-6 md:px-10 text-center" style={{ backgroundColor: C.navy }}>
        <Badge>Portfolio</Badge>
        <h1 className="mt-5 text-4xl font-bold" style={{ ...displayFont, color: "#fff" }}>Projects that moved real metrics</h1>
        <p className="mt-4 max-w-xl mx-auto text-base" style={{ ...bodyFont, color: "rgba(255,255,255,0.6)" }}>A selection of platforms we've designed, built and continue to maintain.</p>
      </section>
      <ResultsStrip />
      <section className="py-16 px-6 md:px-10" style={{ backgroundColor: C.white }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center gap-2 mb-12 flex-wrap">
            {cats.map((c) => (
              <button key={c} onClick={() => setFilter(c)} className="px-4 py-2 rounded-full text-xs font-semibold"
                style={{ ...bodyFont, backgroundColor: filter === c ? C.blueBg : C.gray, color: filter === c ? "#fff" : C.inkSoft }}>{c}</button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {PORTFOLIO.filter((p) => filter === "All" || p.cat === filter).map((p) => (
              <div key={p.id} className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border" style={{ borderColor: C.grayLine }}>
                <button onClick={() => { setOpenId(p.id); window.scrollTo(0, 0); }} className="w-full h-40 flex flex-col items-center justify-center gap-1 group" style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.indigo})` }}>
                  <span className="text-2xl font-bold" style={{ ...displayFont, color: "#fff" }}>{p.name}</span>
                  <span className="text-xs font-medium flex items-center gap-1 opacity-80 group-hover:opacity-100" style={{ ...bodyFont, color: "#fff" }}>Read case study <ChevronRight size={12} /></span>
                </button>
                <div className="p-7">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: C.blueSoft, color: C.blue, ...bodyFont }}>{p.cat}</span>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" onClick={() => track("portfolio_visit_site", { project: p.name })} className="text-xs font-semibold flex items-center gap-1" style={{ ...bodyFont, color: C.emeraldDeep }}>
                        Visit Site <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  <div className="text-xs font-medium mt-3" style={{ ...bodyFont, color: C.emeraldDeep }}>{p.tag}</div>
                  <p className="text-sm mt-2 leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>{p.desc}</p>
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wide" style={{ ...bodyFont, color: C.heading }}>Results</div>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {p.results.map((r, i) => <li key={i} className="text-xs flex items-center gap-2" style={{ ...bodyFont, color: C.inkSoft }}><Check size={12} style={{ color: C.emeraldDeep }} />{r}</li>)}
                    </ul>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {p.stack.map((t, i) => <span key={i} className="text-[11px] px-2.5 py-1 rounded-md" style={{ backgroundColor: C.gray, color: C.inkSoft, ...bodyFont }}>{t}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-6 md:px-10 text-center" style={{ backgroundColor: C.gray }}>
        <h2 className="text-2xl font-bold" style={{ ...displayFont, color: C.heading }}>Want to be our next case study?</h2>
        <div className="mt-6"><Button onClick={() => setPage("contact")}>Start a Conversation</Button></div>
      </section>
    </>
  );
}

/* ============================= ABOUT PAGE ============================= */
function AboutPage({ setPage }) {
  return (
    <>
      <section className="py-20 px-6 md:px-10 text-center" style={{ backgroundColor: C.navy }}>
        <Badge>About Us</Badge>
        <h1 className="mt-5 text-4xl font-bold" style={{ ...displayFont, color: "#fff" }}>Built by people who ship, not just pitch</h1>
        <p className="mt-4 max-w-xl mx-auto text-base" style={{ ...bodyFont, color: "rgba(255,255,255,0.6)" }}>We work with clients across the USA, Australia, Europe, UAE, UK, Canada, Singapore and India — headquartered in New Delhi, remote by design.</p>
      </section>
      <section className="py-20 px-6 md:px-10" style={{ backgroundColor: C.white }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>
            We started BRG Digital Solutions because too many small and mid-sized businesses were being sold templated websites that looked fine in a demo but never actually drove bookings, leads or sales. Our approach is different: every project starts with your business goals, not a theme library. We handle design, development, SEO and growth as one connected system — so a beautiful site is also a fast, findable, secure one.
          </p>
        </div>
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6 mt-16">
          {[[Award,"Quality First","We ship production-grade code with performance and accessibility built in, not bolted on."],
            [Users,"True Partnership","You get a dedicated point of contact who understands your business, not a rotating ticket queue."],
            [Sparkles,"Built to Grow","Every platform is architected to scale — from a five-page site to a full application."]].map(([Icon,t,d],i) => (
            <div key={i} className="text-center">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto" style={{ backgroundColor: C.blueSoft }}><Icon size={24} style={{ color: C.blue }} /></div>
              <div className="font-semibold text-base mt-4" style={{ ...displayFont, color: C.heading }}>{t}</div>
              <div className="text-sm mt-2 leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>{d}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="py-20 px-6 md:px-10" style={{ backgroundColor: C.gray }}>
        <SectionTitle eyebrow="How We Work" title="Our process" sub="The same five stages, every time." />
        <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-6">
          {PROCESS.map((p, i) => (
            <div key={i}>
              <div className="text-4xl font-bold" style={{ ...displayFont, color: C.blue, opacity: 0.18 }}>{p.n}</div>
              <div className="font-semibold text-sm mt-2" style={{ ...displayFont, color: C.heading }}>{p.title}</div>
              <div className="text-xs mt-2 leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="py-20 px-6 md:px-10" style={{ backgroundColor: C.white }}>
        <SectionTitle eyebrow="Who You'll Work With" title="Meet the team" sub="A small, senior team — you'll talk to the people actually building your project, not a rotating account manager." />
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((t, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-lg font-bold" style={{ background: `linear-gradient(135deg, ${C.blueBg}, ${C.indigo})`, color: "#fff", ...displayFont }}>
                {t.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="font-semibold text-sm mt-3" style={{ ...displayFont, color: C.heading }}>{t.name}</div>
              <div className="text-xs mt-1" style={{ ...bodyFont, color: C.inkSoft }}>{t.role}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="py-20 px-6 md:px-10" style={{ backgroundColor: C.gray }}>
        <SectionTitle eyebrow="Global Reach" title="Where we work" sub="Click your region for time-zone fit, currency and relevant work." />
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-4">
          {COUNTRIES.filter((c) => c.slug).map((c) => (
            <button key={c.code} onClick={() => { setPage(`loc-${c.code}`); window.scrollTo(0, 0); }} className="text-left bg-white rounded-xl p-5 hover:shadow-lg transition-shadow" style={{ backgroundColor: C.white }}>
              <span className="text-2xl" aria-hidden="true">{c.flag}</span>
              <div className="text-sm font-semibold mt-2" style={{ ...displayFont, color: C.heading }}>{c.name}</div>
              <div className="text-xs mt-1" style={{ ...bodyFont, color: C.inkSoft }}>{c.currency} quotes available</div>
            </button>
          ))}
        </div>
      </section>
      <section className="py-20 px-6 md:px-10" style={{ backgroundColor: C.white }}>
        <SectionTitle eyebrow="A Fair Question" title="Why work with an India-based agency?" sub="The honest answer, not a sales pitch." />
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-8">
          {[
            [Award, "Quality you can check yourself", "Every project on our Portfolio page is real, live, and built by the same team you'd actually work with — not a gallery of stock templates or someone else's case studies."],
            [Clock, "Real overlap, not a 12-hour lag", "Each country page states our actual time-zone overlap with your working day. Most clients get same-day or next-morning responses, not an overnight round trip on every email."],
            [Calculator, "Transparent, upfront pricing", "Our quote estimator shows real starting prices in your currency before you ever get on a call — no \"contact us for a quote\" games or hidden agency markup."],
            [Users, "A dedicated project owner, not a ticket queue", "You work directly with the person building your project, English-first, using the same remote-native tools and workflow as any agency you'd hire locally."],
          ].map(([Icon, t, d], i) => (
            <div key={i} className="flex gap-4">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: C.blueSoft }}><Icon size={20} style={{ color: C.blue }} /></div>
              <div>
                <div className="font-semibold text-sm" style={{ ...displayFont, color: C.heading }}>{t}</div>
                <div className="text-sm mt-1.5 leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="py-16 px-6 md:px-10 text-center" style={{ backgroundColor: C.navy }}>
        <h2 className="text-2xl font-bold" style={{ ...displayFont, color: "#fff" }}>Let's talk about your project</h2>
        <div className="mt-6"><Button onClick={() => setPage("contact")}>Contact Us</Button></div>
      </section>
    </>
  );
}

function RequestCallWidget({ setPage }) {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", date: "", time: "", company_website: "", consent: false });
  const timezone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "your local time zone";

  const submit = async (e) => {
    e.preventDefault();
    if (form.company_website) return;
    setSubmitting(true);
    setError("");
    try {
      const recaptchaToken = await getRecaptchaToken("contact");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email, phone: "",
          service: "Call Request",
          message: `Requested call: ${form.date} at ${form.time} (${timezone}).`,
          company_website: form.company_website,
          consent: form.consent,
          recaptchaToken,
        }),
      });
      if (res.status === 429) throw new Error("rate_limited");
      if (!res.ok) throw new Error("Request failed");
      track("call_request_submit");
      setSent(true);
    } catch (err) {
      setError(err.message === "rate_limited" ? "rate_limited" : "generic");
    }
    setSubmitting(false);
  };

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: C.gray }}>
      <div className="flex items-center gap-2 mb-1">
        <Clock size={16} style={{ color: C.blue }} />
        <span className="text-sm font-semibold" style={{ ...bodyFont, color: C.heading }}>Request a 15-min call</span>
      </div>
      {sent ? (
        <div className="text-sm mt-3 flex items-center gap-2" style={{ ...bodyFont, color: C.heading }}>
          <Check size={15} style={{ color: C.emeraldDeep }} /> Got it — we'll confirm a time by email.
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3 mt-3">
          <p className="text-xs leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>
            Tell us a time that works and we'll confirm by email — this isn't a live calendar, so treat it as a request, not a locked booking.
          </p>
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true"
            value={form.company_website} onChange={(e) => setForm({ ...form, company_website: e.target.value })}
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
          <div className="grid grid-cols-2 gap-2">
            <input required type="date" min={new Date().toISOString().split("T")[0]} aria-label="Preferred date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 rounded-lg text-xs border" style={{ ...bodyFont, borderColor: C.grayLine }} />
            <select required aria-label="Preferred time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full px-3 py-2 rounded-lg text-xs border" style={{ ...bodyFont, borderColor: C.grayLine }}>
              <option value="">Time</option>
              {["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM", "7:00 PM"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="text-[11px]" style={{ ...bodyFont, color: C.inkSoft }}>Your time zone: {timezone}</div>
          <input required placeholder="Name" aria-label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg text-xs border" style={{ ...bodyFont, borderColor: C.grayLine }} />
          <input required type="email" placeholder="Email" aria-label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-lg text-xs border" style={{ ...bodyFont, borderColor: C.grayLine }} />
          <label className="flex items-start gap-1.5 text-[11px]" style={{ ...bodyFont, color: C.inkSoft }}>
            <input required type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-0.5" />
            <span><span style={{ color: "#DC2626", fontWeight: 700 }}>*</span> I consent to being contacted about this request. See our{" "}
              <button type="button" onClick={() => setPage("privacy")} style={{ color: C.blue, fontWeight: 600, textDecoration: "underline" }}>Privacy Policy</button>.
            </span>
          </label>
          {error && (
            <div className="text-[11px] rounded-lg px-3 py-2" style={{ ...bodyFont, backgroundColor: "rgba(220,38,38,0.12)", color: "#EF4444" }}>
              {error === "rate_limited" ? "Too many requests — please try again shortly." : "Something went wrong — please try again."}
            </div>
          )}
          <Button className="justify-center text-xs py-2" disabled={submitting}>{submitting ? "Sending…" : "Request This Time"}</Button>
        </form>
      )}
    </div>
  );
}

/* ============================= LOCATION PAGE ============================= */
function LocationPage({ setPage, country }) {
  const relatedCase = PORTFOLIO.find((p) => country.industries.some((ind) => p.cat === ind.split(" ")[0])) || PORTFOLIO[0];
  return (
    <>
      <section className="py-20 px-6 md:px-10 text-center" style={{ backgroundColor: C.navy }}>
        <Badge><span aria-hidden="true">{country.flag}</span> {country.name}</Badge>
        <h1 className="mt-5 text-4xl font-bold max-w-2xl mx-auto" style={{ ...displayFont, color: "#fff" }}>{country.headline}</h1>
        <p className="mt-4 max-w-xl mx-auto text-base leading-relaxed" style={{ ...bodyFont, color: "rgba(255,255,255,0.65)" }}>{country.intro}</p>
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={() => setPage("contact")}>Start Your Project</Button>
          <Button variant="ghost" onClick={() => setPage("portfolio")}>See Our Work</Button>
        </div>
      </section>

      <section className="py-16 px-6 md:px-10" style={{ backgroundColor: C.white }}>
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-6 text-center">
          <div>
            <Clock size={22} style={{ color: C.blue, margin: "0 auto" }} />
            <div className="text-sm font-semibold mt-3" style={{ ...displayFont, color: C.heading }}>Time Zone Fit</div>
            <div className="text-xs mt-1.5 leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>{country.note}</div>
            <LiveStatusIndicator className="mt-3" />
          </div>
          <div>
            <TrendingUp size={22} style={{ color: C.blue, margin: "0 auto" }} />
            <div className="text-sm font-semibold mt-3" style={{ ...displayFont, color: C.heading }}>Currency</div>
            <div className="text-xs mt-1.5 leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>Quotes available in {country.currency} — see our estimator</div>
          </div>
          <div>
            <Building2 size={22} style={{ color: C.blue, margin: "0 auto" }} />
            <div className="text-sm font-semibold mt-3" style={{ ...displayFont, color: C.heading }}>Common Industries We Serve</div>
            <div className="text-xs mt-1.5 leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>{country.industries.join(", ")}</div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 md:px-10" style={{ backgroundColor: C.gray }}>
        <SectionTitle eyebrow="Relevant Work" title="A project like yours" />
        <div className="max-w-2xl mx-auto bg-white rounded-xl p-7" style={{ backgroundColor: C.white }}>
          <div className="text-xs font-semibold px-3 py-1 rounded-full inline-block" style={{ backgroundColor: C.blueSoft, color: C.blue, ...bodyFont }}>{relatedCase.cat}</div>
          <div className="font-bold text-lg mt-3" style={{ ...displayFont, color: C.heading }}>{relatedCase.name}</div>
          <p className="text-sm mt-2 leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>{relatedCase.desc}</p>
          <div className="mt-4"><Button variant="outline" onClick={() => setPage("portfolio")}>View Full Portfolio</Button></div>
        </div>
      </section>

      <section className="py-16 px-6 md:px-10 text-center" style={{ backgroundColor: C.navy }}>
        <h2 className="text-2xl font-bold" style={{ ...displayFont, color: "#fff" }}>Let's talk about your project</h2>
        <p className="mt-3 text-sm" style={{ ...bodyFont, color: "rgba(255,255,255,0.6)" }}>Response within one business day, wherever you're calling from.</p>
        <div className="mt-6"><Button onClick={() => setPage("contact")}>Get a Quote</Button></div>
      </section>
    </>
  );
}

/* ============================= PRIVACY POLICY PAGE ============================= */
function PrivacyPage({ setPage }) {
  return (
    <section className="py-20 px-6 md:px-10" style={{ backgroundColor: C.white }}>
      <div className="max-w-2xl mx-auto">
        <Badge>Privacy Policy</Badge>
        <h1 className="mt-5 text-3xl font-bold" style={{ ...displayFont, color: C.heading }}>How we handle your information</h1>
        <p className="text-sm mt-3" style={{ ...bodyFont, color: C.inkSoft }}>Last updated: July 2026</p>

        <div className="mt-8 flex flex-col gap-6">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide" style={{ ...bodyFont, color: C.heading }}>What we collect</div>
            <p className="text-sm mt-2 leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>
              When you use our contact form, request a call, apply for a role, chat with our website assistant, or
              download a resource, we collect what you submit directly — typically your name, email, phone number,
              and the content of your message. We do not collect this information through any other means.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide" style={{ ...bodyFont, color: C.heading }}>How we use it</div>
            <p className="text-sm mt-2 leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>
              Solely to respond to your enquiry, provide a quote, process a job application, or follow up on a
              conversation you started with our chat assistant. If you separately opt in, we may also send you
              occasional updates — you can unsubscribe at any time.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide" style={{ ...bodyFont, color: C.heading }}>Third parties involved</div>
            <p className="text-sm mt-2 leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>
              Form submissions are processed via Cloudflare Workers and delivered to us by email through Resend.
              Our website chat assistant sends your message text to Anthropic's API to generate a reply. We use
              Google reCAPTCHA to reduce spam and Google Analytics to understand site usage. None of these
              providers are permitted to use your data for their own marketing.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide" style={{ ...bodyFont, color: C.heading }}>How long we keep it</div>
            <p className="text-sm mt-2 leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>
              We retain enquiry and application data only as long as needed to respond to you and maintain our own
              business records, and delete it on request (see below).
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide" style={{ ...bodyFont, color: C.heading }}>Your rights</div>
            <p className="text-sm mt-2 leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>
              You can ask us what information we hold about you, correct it, or have it deleted at any time by
              emailing <a href="mailto:brgdigitalsolutions@gmail.com" style={{ color: C.blue, fontWeight: 600 }}>brgdigitalsolutions@gmail.com</a>.
            </p>
          </div>
        </div>

        <div className="mt-10"><Button onClick={() => setPage("contact")}>Contact Us</Button></div>
      </div>
    </section>
  );
}

/* ============================= CONTACT PAGE ============================= */
function ContactPage({ setPage }) {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: SERVICES[0].name, message: "", company_website: "", consent: false, newsletter: false });

  const submit = async (e) => {
    e.preventDefault();
    if (form.company_website) return; // honeypot tripped — silently drop, no error shown to the bot
    setSubmitting(true);
    setError("");
    try {
      const recaptchaToken = await getRecaptchaToken("contact");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, recaptchaToken }),
      });
      if (res.status === 429) throw new Error("rate_limited");
      if (!res.ok) throw new Error("Request failed");
      track("contact_form_submit", { service: form.service });
      setSent(true);
    } catch (err) {
      setError(err.message === "rate_limited" ? "rate_limited" : "generic");
    }
    setSubmitting(false);
  };
  return (
    <>
      <section className="py-20 px-6 md:px-10 text-center" style={{ backgroundColor: C.navy }}>
        <Badge>Contact</Badge>
        <h1 className="mt-5 text-4xl font-bold" style={{ ...displayFont, color: "#fff" }}>Let's build something great</h1>
        <p className="mt-4 max-w-xl mx-auto text-base" style={{ ...bodyFont, color: "rgba(255,255,255,0.6)" }}>Tell us about your project and we'll respond within one business day.</p>
      </section>
      <section className="py-16 px-6 md:px-10" style={{ backgroundColor: C.white }}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-12">
          <div className="flex flex-col gap-5">
            {[[MapPin,"Office","B-158/159 Sainik Nagar, New Delhi – 110059, India"],
              [Phone,"Phone","+91 98114 19910"],
              [Mail,"Email","brgdigitalsolutions@gmail.com"],
              [Clock,"Business Hours","Mon–Sat, 10:00 AM – 7:00 PM IST"]].map(([Icon,t,d],i) => (
              <div key={i} className="flex items-start gap-4 bg-gray-50 rounded-xl p-5" style={{ backgroundColor: C.gray }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: C.blueSoft }}><Icon size={18} style={{ color: C.blue }} /></div>
                <div><div className="text-sm font-semibold" style={{ ...bodyFont, color: C.heading }}>{t}</div><div className="text-sm mt-1" style={{ ...bodyFont, color: C.inkSoft }}>{d}</div></div>
              </div>
            ))}
            <LiveStatusIndicator className="self-start" />
            <a href="https://wa.me/919811419910" className="flex items-center justify-center gap-2 rounded-xl p-4 font-semibold text-sm" style={{ backgroundColor: "#25D366", color: "#fff", ...bodyFont }}><MessageCircle size={18} /> Chat on WhatsApp</a>
            <RequestCallWidget setPage={setPage} />
          </div>
          <div className="rounded-2xl p-8" style={{ backgroundColor: C.gray }}>
            {sent ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: C.emerald }}><Check color={C.navy} size={26} /></div>
                <div className="font-semibold text-lg mt-5" style={{ ...displayFont, color: C.heading }}>Thanks — we've got your message</div>
                <div className="text-sm mt-2" style={{ ...bodyFont, color: C.inkSoft }}>Our team will reach out within one business day.</div>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-4">
                {/* Honeypot — invisible to people, often auto-filled by bots. Never shown, never focusable. */}
                <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                  value={form.company_website} onChange={(e) => setForm({ ...form, company_website: e.target.value })}
                  style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full name" htmlFor="contact-name">
                    <input id="contact-name" required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-lg text-sm border" style={{ ...bodyFont, borderColor: C.grayLine }} />
                  </Field>
                  <Field label="Email address" htmlFor="contact-email">
                    <input id="contact-email" required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-lg text-sm border" style={{ ...bodyFont, borderColor: C.grayLine }} />
                  </Field>
                </div>
                <Field label="Phone number" htmlFor="contact-phone">
                  <input id="contact-phone" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-lg text-sm border" style={{ ...bodyFont, borderColor: C.grayLine }} />
                </Field>
                <Field label="Service you're interested in" htmlFor="contact-service">
                  <select id="contact-service" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="w-full px-4 py-3 rounded-lg text-sm border" style={{ ...bodyFont, borderColor: C.grayLine }}>
                    {SERVICES.map((s) => <option key={s.id}>{s.name}</option>)}
                  </select>
                </Field>
                <Field label="Your message" htmlFor="contact-message">
                  <textarea id="contact-message" required placeholder="Tell us about your project" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-3 rounded-lg text-sm border resize-none" style={{ ...bodyFont, borderColor: C.grayLine }} />
                </Field>
                <label className="flex items-start gap-2 text-xs" style={{ ...bodyFont, color: C.inkSoft }}>
                  <input required type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-0.5" />
                  <span>
                    <span style={{ color: "#DC2626", fontWeight: 700 }}>*</span> I agree to be contacted about my enquiry and consent to BRG Digital Solutions storing my
                    information to respond. See our{" "}
                    <button type="button" onClick={() => setPage("privacy")} style={{ color: C.blue, fontWeight: 600, textDecoration: "underline" }}>Privacy Policy</button>.
                  </span>
                </label>
                <label className="flex items-start gap-2 text-xs" style={{ ...bodyFont, color: C.inkSoft }}>
                  <input type="checkbox" checked={form.newsletter} onChange={(e) => setForm({ ...form, newsletter: e.target.checked })} className="mt-0.5" />
                  <span>Send me occasional updates and offers from BRG Digital Solutions.</span>
                </label>
                {error && (
                  <div className="text-sm rounded-lg px-4 py-3" style={{ ...bodyFont, backgroundColor: "rgba(220,38,38,0.12)", color: "#EF4444" }}>
                    {error === "rate_limited" ? (
                      "Too many submissions from this connection — please wait a bit and try again, or reach us directly on "
                    ) : (
                      "Something went wrong sending this — please try again, or reach us directly on "
                    )}
                    <a href="https://wa.me/919811419910" style={{ fontWeight: 600, textDecoration: "underline" }}>WhatsApp</a> or{" "}
                    <a href="mailto:brgdigitalsolutions@gmail.com" style={{ fontWeight: 600, textDecoration: "underline" }}>email</a>.
                  </div>
                )}
                <Button icon={Send} className="justify-center" disabled={submitting}>{submitting ? "Sending…" : "Send Message"}</Button>
              </form>
            )}
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 rounded-2xl overflow-hidden h-64" style={{ backgroundColor: C.gray }}>
          <div className="w-full h-full flex items-center justify-center text-sm" style={{ ...bodyFont, color: C.inkSoft }}>
            <MapPin size={18} className="mr-2" style={{ color: C.blue }} /> Sainik Nagar, New Delhi — map preview
          </div>
        </div>
      </section>
    </>
  );
}

/* ============================= BLOG PAGE ============================= */
function AuditChecklistGate() {
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await fetch("/api/audit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      track("audit_checklist_lead");
    } catch (err) {
      // Non-blocking — the checklist is a static file either way, so we still
      // unlock the download even if the lead-logging request fails.
    }
    setUnlocked(true);
    setSubmitting(false);
  };

  return (
    <div className="rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-6" style={{ backgroundColor: C.navy }}>
      <div className="flex-1 text-center md:text-left">
        <div className="text-xs font-semibold uppercase tracking-wide" style={{ ...bodyFont, color: C.emerald }}>Free Download</div>
        <div className="text-xl font-bold mt-2" style={{ ...displayFont, color: "#fff" }}>The Website Audit Checklist</div>
        <p className="text-sm mt-2 leading-relaxed" style={{ ...bodyFont, color: "rgba(255,255,255,0.6)" }}>37 checks across SEO, performance, security and accessibility — the same categories we review on every client audit.</p>
      </div>
      <div className="w-full md:w-auto">
        {unlocked ? (
          <a href="/resources/website-audit-checklist.pdf" download onClick={() => track("audit_checklist_download")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm" style={{ backgroundColor: C.emerald, color: C.navy, ...bodyFont }}>
            Download PDF <ArrowRight size={16} />
          </a>
        ) : (
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
            <input required type="email" placeholder="Your email" aria-label="Email for checklist download" value={email} onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-lg text-sm" style={{ ...bodyFont, minWidth: "220px" }} />
            <Button disabled={submitting}>{submitting ? "…" : "Get the Checklist"}</Button>
          </form>
        )}
      </div>
    </div>
  );
}

function BlogPage({ setPage }) {
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const cats = ["All", ...new Set(BLOG_POSTS.map((b) => b.cat))];
  const open = BLOG_POSTS.find((b) => b.id === openId);
  const visible = BLOG_POSTS.filter((b) => {
    const matchesCat = filter === "All" || b.cat === filter;
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || b.title.toLowerCase().includes(q) || b.excerpt.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  if (open) {
    return (
      <section className="py-20 px-6 md:px-10" style={{ backgroundColor: C.white }}>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setOpenId(null)} aria-label="Back to blog list" className="text-sm font-semibold flex items-center gap-1 mb-8" style={{ ...bodyFont, color: C.blue }}>
            <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> Back to Blog
          </button>
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: C.blueSoft, color: C.blue, ...bodyFont }}>{open.cat}</span>
          <h1 className="mt-5 text-3xl font-bold leading-tight" style={{ ...displayFont, color: C.heading }}>{open.title}</h1>
          <div className="flex items-center gap-3 mt-4 text-xs" style={{ ...bodyFont, color: C.inkSoft }}>
            <span>{open.author}</span><span>·</span><span>{open.date}</span><span>·</span><span>{open.read}</span>
          </div>
          <div className="mt-8 flex flex-col gap-5">
            {open.body.map((p, i) => <p key={i} className="text-base leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>{p}</p>)}
          </div>
          <div className="mt-12 rounded-xl p-6 text-center" style={{ backgroundColor: C.gray }}>
            <div className="text-sm font-semibold" style={{ ...displayFont, color: C.heading }}>Want results like this for your website?</div>
            <div className="mt-4"><Button onClick={() => setPage("contact")}>Talk to Us</Button></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-20 px-6 md:px-10 text-center" style={{ backgroundColor: C.navy }}>
        <Badge>Blog</Badge>
        <h1 className="mt-5 text-4xl font-bold" style={{ ...displayFont, color: "#fff" }}>Insights on web, SEO & growth</h1>
        <p className="mt-4 max-w-xl mx-auto text-base" style={{ ...bodyFont, color: "rgba(255,255,255,0.6)" }}>Practical notes from the projects we build and maintain.</p>
      </section>
      <section className="py-16 px-6 md:px-10" style={{ backgroundColor: C.white }}>
        <div className="max-w-6xl mx-auto mb-16">
          <AuditChecklistGate />
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="max-w-md mx-auto mb-8 relative">
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.inkSoft }} />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles…" aria-label="Search blog articles"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border" style={{ ...bodyFont, borderColor: C.grayLine }} />
          </div>
          <div className="flex justify-center gap-2 mb-12 flex-wrap">
            {cats.map((c) => (
              <button key={c} onClick={() => setFilter(c)} className="px-4 py-2 rounded-full text-xs font-semibold"
                style={{ ...bodyFont, backgroundColor: filter === c ? C.blueBg : C.gray, color: filter === c ? "#fff" : C.inkSoft }}>{c}</button>
            ))}
          </div>
          {visible.length === 0 ? (
            <div className="text-center py-12 text-sm" style={{ ...bodyFont, color: C.inkSoft }}>No articles match "{query}" — try a different search.</div>
          ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {visible.map((b) => (
              <button key={b.id} onClick={() => setOpenId(b.id)} className="text-left rounded-xl p-6 border hover:shadow-lg transition-shadow" style={{ borderColor: C.grayLine }}>
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: C.blueSoft, color: C.blue, ...bodyFont }}>{b.cat}</span>
                <div className="font-semibold text-base mt-4 leading-snug" style={{ ...displayFont, color: C.heading }}>{b.title}</div>
                <p className="text-sm mt-2 leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>{b.excerpt}</p>
                <div className="flex items-center gap-2 mt-5 text-xs" style={{ ...bodyFont, color: C.inkSoft }}>
                  <span>{b.date}</span><span>·</span><span>{b.read}</span>
                </div>
              </button>
            ))}
          </div>
          )}
        </div>
      </section>
    </>
  );
}

/* ============================= CAREERS PAGE ============================= */
function CareersPage({ setPage }) {
  const [openId, setOpenId] = useState(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", note: "", company_website: "", consent: false });
  const role = CAREERS.find((c) => c.id === openId);

  const submit = async (e) => {
    e.preventDefault();
    if (form.company_website) return; // honeypot tripped — silently drop
    setSubmitting(true);
    setError("");
    try {
      const recaptchaToken = await getRecaptchaToken("careers_apply");
      const res = await fetch("/api/careers-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: role?.title, recaptchaToken }),
      });
      if (res.status === 429) throw new Error("rate_limited");
      if (!res.ok) throw new Error("Request failed");
      track("careers_application_submit", { role: role?.title });
      setSent(true);
    } catch (err) {
      setError(err.message === "rate_limited" ? "rate_limited" : "generic");
    }
    setSubmitting(false);
  };

  return (
    <>
      <section className="py-20 px-6 md:px-10 text-center" style={{ backgroundColor: C.navy }}>
        <Badge>Careers</Badge>
        <h1 className="mt-5 text-4xl font-bold" style={{ ...displayFont, color: "#fff" }}>Build things that matter, with people who ship</h1>
        <p className="mt-4 max-w-xl mx-auto text-base" style={{ ...bodyFont, color: "rgba(255,255,255,0.6)" }}>We're a small, hands-on team in New Delhi working on real client products every day — no bench time, no busywork.</p>
      </section>
      <section className="py-16 px-6 md:px-10" style={{ backgroundColor: C.white }}>
        <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-6 mb-16 text-center">
          {[[Users,"Small, senior team"],[TrendingUp,"Real client impact"],[Award,"Growth-linked reviews"]].map(([Icon,t],i) => (
            <div key={i}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto" style={{ backgroundColor: C.blueSoft }}><Icon size={20} style={{ color: C.blue }} /></div>
              <div className="text-sm font-semibold mt-3" style={{ ...bodyFont, color: C.heading }}>{t}</div>
            </div>
          ))}
        </div>
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {CAREERS.map((c) => (
            <div key={c.id} className="rounded-xl border overflow-hidden" style={{ borderColor: C.grayLine }}>
              <button onClick={() => { setOpenId(openId === c.id ? null : c.id); setSent(false); setError(""); }} className="w-full flex items-center justify-between px-6 py-5 text-left">
                <div>
                  <div className="text-sm font-semibold" style={{ ...displayFont, color: C.heading }}>{c.title}</div>
                  <div className="flex gap-3 mt-1.5 text-xs" style={{ ...bodyFont, color: C.inkSoft }}>
                    <span>{c.dept}</span><span>·</span><span>{c.location}</span><span>·</span><span>{c.type}</span>
                  </div>
                </div>
                <ChevronDown size={16} style={{ color: C.blue, transform: openId === c.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {openId === c.id && (
                <div className="px-6 pb-6">
                  <p className="text-sm leading-relaxed" style={{ ...bodyFont, color: C.inkSoft }}>{c.desc}</p>
                  <div className="text-xs font-semibold uppercase tracking-wide mt-4" style={{ ...bodyFont, color: C.heading }}>What we're looking for</div>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {c.reqs.map((r, i) => <li key={i} className="text-xs flex items-center gap-2" style={{ ...bodyFont, color: C.inkSoft }}><Check size={12} style={{ color: C.emeraldDeep }} />{r}</li>)}
                  </ul>
                  {sent && openId === c.id ? (
                    <div className="mt-5 rounded-lg p-4 flex items-center gap-2" style={{ backgroundColor: C.gray }}>
                      <Check size={16} style={{ color: C.emeraldDeep }} />
                      <span className="text-sm font-medium" style={{ ...bodyFont, color: C.heading }}>Application received — we'll be in touch.</span>
                    </div>
                  ) : (
                    <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
                      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                        value={form.company_website} onChange={(e) => setForm({ ...form, company_website: e.target.value })}
                        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Field label="Full name" htmlFor={`apply-name-${c.id}`}>
                          <input id={`apply-name-${c.id}`} required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm border" style={{ ...bodyFont, borderColor: C.grayLine }} />
                        </Field>
                        <Field label="Email" htmlFor={`apply-email-${c.id}`}>
                          <input id={`apply-email-${c.id}`} required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm border" style={{ ...bodyFont, borderColor: C.grayLine }} />
                        </Field>
                      </div>
                      <Field label="Phone" htmlFor={`apply-phone-${c.id}`}>
                        <input id={`apply-phone-${c.id}`} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm border" style={{ ...bodyFont, borderColor: C.grayLine }} />
                      </Field>
                      <Field label="Resume link or note" htmlFor={`apply-note-${c.id}`}>
                        <textarea id={`apply-note-${c.id}`} placeholder="Link to resume/portfolio or a quick note" rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm border resize-none" style={{ ...bodyFont, borderColor: C.grayLine }} />
                      </Field>
                      <label className="flex items-start gap-2 text-xs" style={{ ...bodyFont, color: C.inkSoft }}>
                        <input required type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-0.5" />
                        <span>
                          <span style={{ color: "#DC2626", fontWeight: 700 }}>*</span> I consent to BRG Digital Solutions storing my application details to consider me for this
                          role. See our{" "}
                          <button type="button" onClick={() => setPage("privacy")} style={{ color: C.blue, fontWeight: 600, textDecoration: "underline" }}>Privacy Policy</button>.
                        </span>
                      </label>
                      {error && (
                        <div className="text-xs rounded-lg px-4 py-2.5" style={{ ...bodyFont, backgroundColor: "rgba(220,38,38,0.12)", color: "#EF4444" }}>
                          {error === "rate_limited" ? "Too many submissions from this connection — please wait a bit and try again, or email " : "Something went wrong — please try again or email "}
                          <a href="mailto:brgdigitalsolutions@gmail.com" style={{ fontWeight: 600, textDecoration: "underline" }}>brgdigitalsolutions@gmail.com</a> directly.
                        </div>
                      )}
                      <Button icon={Send} className="justify-center self-start" disabled={submitting}>{submitting ? "Sending…" : "Apply Now"}</Button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="max-w-3xl mx-auto text-center mt-12 text-sm" style={{ ...bodyFont, color: C.inkSoft }}>
          Don't see a role that fits? Email us at <a href="mailto:brgdigitalsolutions@gmail.com" style={{ color: C.blue, fontWeight: 600 }}>brgdigitalsolutions@gmail.com</a>.
        </div>
      </section>
    </>
  );
}

/* ============================= APP ROOT ============================= */
const PAGE_META = {
  home: { title: "BRG Digital Solutions | Transforming Ideas into Digital Success", desc: "BRG Digital Solutions builds websites, mobile apps, SEO and digital marketing systems for startups, SMEs and enterprises across the USA, Australia, Europe, UAE, UK, Canada, Singapore and India.", crumb: "Home", path: "/" },
  services: { title: "Services | BRG Digital Solutions", desc: "Website development, mobile apps, SEO, digital marketing, AI solutions and cloud services from BRG Digital Solutions in New Delhi.", crumb: "Services", path: "/services" },
  portfolio: { title: "Portfolio | BRG Digital Solutions", desc: "Real projects, real results — see the travel, education and hospitality platforms BRG Digital Solutions has designed and built.", crumb: "Portfolio", path: "/portfolio" },
  about: { title: "About Us | BRG Digital Solutions", desc: "BRG Digital Solutions is a New Delhi digital agency building fast, trustworthy websites and apps for businesses worldwide.", crumb: "About", path: "/about" },
  blog: { title: "Blog | BRG Digital Solutions", desc: "Practical insights on SEO, web performance and digital marketing from the BRG Digital Solutions team.", crumb: "Blog", path: "/blog" },
  careers: { title: "Careers | BRG Digital Solutions", desc: "Join BRG Digital Solutions — open roles in engineering and marketing at a New Delhi digital agency.", crumb: "Careers", path: "/careers" },
  contact: { title: "Contact Us | BRG Digital Solutions", desc: "Get in touch with BRG Digital Solutions for a website, app or digital marketing quote — response within one business day.", crumb: "Contact", path: "/contact" },
  privacy: { title: "Privacy Policy | BRG Digital Solutions", desc: "How BRG Digital Solutions collects, uses and protects the information you share through our website and forms.", crumb: "Privacy Policy", path: "/privacy" },
  ...Object.fromEntries(
    COUNTRIES.filter((c) => c.slug).map((c) => [
      `loc-${c.code}`,
      { title: `${c.headline} | BRG Digital Solutions`, desc: c.intro.slice(0, 155), crumb: c.name, path: `/websites-for/${c.slug}` },
    ])
  ),
};
const PAGE_TITLES = Object.fromEntries(Object.entries(PAGE_META).map(([k, v]) => [k, v.title]));
const VALID_PAGES = Object.keys(PAGE_META);
const SITE_ORIGIN = "https://brgdigitalsolutions.com";

function getPageFromPath() {
  if (typeof window === "undefined") return "home";
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const match = Object.entries(PAGE_META).find(([, meta]) => meta.path === path);
  return match ? match[0] : "home";
}

// Sets or creates a <meta name="..."> tag — defensive so this works whether
// index.html already defines the tag or not.
function setMetaByName(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
  el.setAttribute("content", content);
}
function setMetaByProperty(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute("property", property); document.head.appendChild(el); }
  el.setAttribute("content", content);
}
function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) { el = document.createElement("link"); el.setAttribute("rel", "canonical"); document.head.appendChild(el); }
  el.setAttribute("href", href);
}
function setBreadcrumbSchema(page) {
  const meta = PAGE_META[page];
  const items = page === "home"
    ? [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN + "/" }]
    : [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN + "/" },
        { "@type": "ListItem", position: 2, name: meta.crumb, item: SITE_ORIGIN + meta.path },
      ];
  const json = JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items });
  let el = document.getElementById("breadcrumb-schema");
  if (!el) { el = document.createElement("script"); el.type = "application/ld+json"; el.id = "breadcrumb-schema"; document.head.appendChild(el); }
  el.textContent = json;
}
// Updates title, description, canonical, Open Graph and breadcrumb schema together.
// Note: this covers crawlers that execute JS (Googlebot, Bingbot). Non-JS scrapers
// (some social-share bots, some AI crawlers) only ever see index.html's static tags —
// see index.html's own defaults and the prerendered fallback content for that case.
// hreflang only applies to pages that are genuine region-variants of the same
// content — the home page and the country landing pages. Universal pages
// (/services, /portfolio, /privacy, etc.) have no regional alternates, so they
// get none — adding hreflang there would incorrectly imply they do. Every
// page in the cluster must list the FULL set including itself (the "return
// tag" requirement) — a common source of hreflang errors when skipped.
function setHreflangTags(page) {
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
  const isRegional = page === "home" || page.startsWith("loc-");
  if (!isRegional) return;

  const entries = [
    { hreflang: "x-default", path: "/" },
    { hreflang: "en-in", path: "/" },
    ...COUNTRIES.filter((c) => c.slug).map((c) => ({ hreflang: c.hreflang, path: `/websites-for/${c.slug}` })),
  ];
  entries.forEach(({ hreflang, path }) => {
    const link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", hreflang);
    link.setAttribute("href", SITE_ORIGIN + path);
    document.head.appendChild(link);
  });
}

function applyPageMeta(page) {
  if (typeof document === "undefined") return;
  const meta = PAGE_META[page] || PAGE_META.home;
  const url = SITE_ORIGIN + meta.path;
  document.title = meta.title;
  setMetaByName("description", meta.desc);
  setCanonical(url);
  setMetaByProperty("og:title", meta.title);
  setMetaByProperty("og:description", meta.desc);
  setMetaByProperty("og:url", url);
  setBreadcrumbSchema(page);
  setHreflangTags(page);
}

export default function App() {
  const [page, setPageState] = useState(getPageFromPath());
  const [chatOpen, setChatOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [deepLinkService, setDeepLinkService] = useState(null);

  const setPage = (id) => {
    setPageState(id);
    if (typeof window !== "undefined") {
      const path = (PAGE_META[id] || PAGE_META.home).path;
      if (window.location.pathname !== path) window.history.pushState({}, "", path);
    }
  };

  useEffect(() => {
    const onPopState = () => setPageState(getPageFromPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    applyPageMeta(page);
  }, [page]);

  return (
    <div data-theme={dark ? "dark" : "light"} style={{ ...bodyFont }} className="min-h-screen brg-root" >
      <style>{`
        /* Fonts loaded via <link> in index.html — not duplicated here. */
        * { box-sizing: border-box; }
        body { margin: 0; }
        .brg-root {
          --c-heading: #140A24;
          --c-white: #FFFFFF;
          --c-gray: #F6F5FA;
          --c-blueSoft: #F5F3FF;
          --c-grayLine: #E5E1F0;
          --c-inkSoft: #5F5871;
          --c-blue: #6D28D9;
          --c-emeraldDeep: #65A30D;
          transition: background-color 0.2s ease;
        }
        .brg-root[data-theme="dark"] {
          --c-heading: #F3F0FA;
          --c-white: #1E1730;
          --c-gray: #17101F;
          --c-blueSoft: #2A2140;
          --c-grayLine: #35294F;
          --c-inkSoft: #B8AFC9;
          --c-blue: #A78BFA;
          --c-emeraldDeep: #A3E635;
        }
        input:focus, select:focus, textarea:focus { outline: 2px solid ${C.blue}; outline-offset: 1px; }
        button:focus-visible, a:focus-visible { outline: 2px solid ${C.emerald}; outline-offset: 2px; }
        .skip-link { position: absolute; left: -9999px; top: 0; z-index: 100; background: ${C.emerald}; color: ${C.navy}; padding: 10px 16px; border-radius: 8px; font-weight: 600; font-size: 14px; }
        .skip-link:focus { left: 12px; top: 12px; }
      `}</style>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Nav page={page} setPage={setPage} dark={dark} setDark={setDark} onSelectService={setDeepLinkService} />
      <main id="main-content">
        {page === "home" && <HomePage setPage={setPage} onSelectService={setDeepLinkService} />}
        {page === "services" && <ServicesPage setPage={setPage} initialServiceId={deepLinkService} />}
        {page === "portfolio" && <PortfolioPage setPage={setPage} />}
        {page === "about" && <AboutPage setPage={setPage} />}
        {page === "blog" && <BlogPage setPage={setPage} />}
        {page === "careers" && <CareersPage setPage={setPage} />}
        {page === "contact" && <ContactPage setPage={setPage} />}
        {page === "privacy" && <PrivacyPage setPage={setPage} />}
        {page.startsWith("loc-") && (
          <LocationPage setPage={setPage} country={COUNTRIES.find((c) => `loc-${c.code}` === page)} />
        )}
      </main>
      <Footer setPage={setPage} />
      <Suspense fallback={null}>
        <ChatWidget open={chatOpen} setOpen={setChatOpen} />
      </Suspense>
      <Fabs onChat={() => setChatOpen((o) => !o)} />
      <MobileCTABar setPage={setPage} />
    </div>
  );
}
