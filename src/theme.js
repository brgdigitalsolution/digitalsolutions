// Shared design tokens and utilities used by both App.jsx and any code-split
// component (e.g. ChatWidget.jsx). Keeping these in their own module means
// React.lazy()-loaded components only pull in this small file, not all of
// App.jsx — that's the entire point of splitting them out.

/* ============================= DESIGN TOKENS ============================= */
// navy/navyDeep/indigo/emerald/onDark are the "always-dark" brand chrome
// (hero, nav, footer, CTAs) and stay constant across themes.
// heading/white/gray/blueSoft/grayLine/inkSoft/blue/emeraldDeep are theme-sensitive
// and resolve through CSS variables set in the App root (see App.jsx's <style> block).
export const C = {
  navy: "#140A24",
  navyDeep: "#0D0718",
  indigo: "#2E1065",
  onDark: "#FFFFFF",
  emerald: "#A3E635",
  blueBg: "#6D28D9",
  heading: "var(--c-heading)",
  white: "var(--c-white)",
  gray: "var(--c-gray)",
  blueSoft: "var(--c-blueSoft)",
  grayLine: "var(--c-grayLine)",
  inkSoft: "var(--c-inkSoft)",
  blue: "var(--c-blue)",
  emeraldDeep: "var(--c-emeraldDeep)",
  ink: "var(--c-heading)",
};

export const displayFont = { fontFamily: "'Poppins', sans-serif" };
export const bodyFont = { fontFamily: "'Inter', sans-serif" };

/* ============================= ANALYTICS + RECAPTCHA ============================= */
// Replace with your real GA4 Measurement ID (see index.html) — track() no-ops safely
// if gtag isn't loaded, so this file works unchanged in preview and production.
export function track(event, params = {}) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
}

// Replace with your real reCAPTCHA v3 site key (from google.com/recaptcha/admin).
// Forms still work without it — grecaptcha just won't be present until the key + script are added.
export const RECAPTCHA_SITE_KEY = "6Ld4naktAAAAAI8bSIVOZ4nmlG9zvgDO_LFxUMm1";

export async function getRecaptchaToken(action) {
  try {
    if (typeof window !== "undefined" && window.grecaptcha && RECAPTCHA_SITE_KEY !== "YOUR_RECAPTCHA_V3_SITE_KEY") {
      return await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
    }
  } catch (e) { /* fall through — worker treats a missing token as unverified, not fatal */ }
  return null;
}
