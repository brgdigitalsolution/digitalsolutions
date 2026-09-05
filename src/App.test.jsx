import { describe, it, expect, vi } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

// These are deliberately broad smoke + behavior tests, not exhaustive coverage —
// the goal is to catch "the app no longer renders" or "a core flow silently
// broke" regressions on every push, per the CI workflow in .github/workflows/ci.yml.

describe("App — smoke tests", () => {
  it("renders the homepage by default with the hero heading", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Transforming Ideas/i);
  });

  it("renders the nav with all primary links", () => {
    render(<App />);
    const nav = screen.getAllByText("Services")[0];
    expect(nav).toBeInTheDocument();
    expect(screen.getAllByText("Portfolio")[0]).toBeInTheDocument();
    expect(screen.getAllByText("About")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Contact")[0]).toBeInTheDocument();
  });

  it("renders the WhatsApp, call, and chat FABs with accessible labels", () => {
    render(<App />);
    expect(screen.getByLabelText(/chat on whatsapp/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/call brg digital solutions/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/open chat assistant/i)[0]).toBeInTheDocument();
  });
});

describe("Navigation", () => {
  it("lists WhatsApp Marketing & Messaging APIs as a service", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByText("Services")[0]);
    expect(screen.getAllByText(/WhatsApp Marketing/i).length).toBeGreaterThan(0);
  });

  it("lists CRM Development & Integration as its own service", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByText("Services")[0]);
    expect(screen.getAllByText(/CRM Development/i).length).toBeGreaterThan(0);
  });

  it("navigates to the Services page and updates the URL path", async () => {
    const user = userEvent.setup();
    render(<App />);
    const links = screen.getAllByText("Services");
    await user.click(links[0]);
    expect(window.location.pathname).toBe("/services");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Everything you need/i);
  });

  it("navigates to the Contact page via a CTA button", async () => {
    const user = userEvent.setup();
    render(<App />);
    const ctaButtons = screen.getAllByText(/Start Your Project|Get a Quote/i);
    await user.click(ctaButtons[0]);
    expect(window.location.pathname).toBe("/contact");
  });

  it("restores the correct page on browser back/forward (popstate)", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByText("About")[0]);
    expect(window.location.pathname).toBe("/about");
    window.history.back();
    // jsdom fires popstate asynchronously
    await new Promise((r) => setTimeout(r, 0));
  });
});

describe("Dark mode toggle", () => {
  it("switches the theme attribute when toggled", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const root = container.querySelector(".brg-root");
    expect(root).toHaveAttribute("data-theme", "light");
    await user.click(screen.getByLabelText(/switch to dark mode/i));
    expect(root).toHaveAttribute("data-theme", "dark");
  });
});

describe("Quote estimator", () => {
  it("recalculates the estimate when project type or page count changes", async () => {
    const user = userEvent.setup();
    render(<App />);
    const initialEstimate = screen.getByText(/₹\d[\d,]*/).textContent;
    await user.click(screen.getByText("Ecommerce Website"));
    const updatedEstimate = screen.getByText(/₹\d[\d,]*/).textContent;
    expect(updatedEstimate).not.toBe(initialEstimate);
  });
});

describe("Contact form", () => {
  async function goToContact(user) {
    render(<App />);
    await user.click(screen.getAllByText("Contact")[0]);
  }

  it("does not call the API when the honeypot field is filled (bot behavior)", async () => {
    const user = userEvent.setup();
    await goToContact(user);
    // Scope to the main contact form specifically — the "Request a call" widget
    // on the same page has its own, identically-named honeypot field.
    const messageField = screen.getByLabelText(/your message/i);
    const form = messageField.closest("form");
    const honeypot = form.querySelector('input[name="company_website"]');
    await user.type(honeypot, "http://spam.example");
    await user.type(screen.getByLabelText(/full name/i), "Test User");
    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.type(messageField, "Hello");
    await user.click(screen.getByLabelText(/i agree to be contacted/i));
    await user.click(screen.getByRole("button", { name: /send message/i }));
    // Scoped to /api/contact specifically, not "fetch never called" — the
    // homepage's geo-detection banner (see App.jsx) legitimately calls
    // /api/geo on mount regardless of what this test is doing.
    expect(global.fetch).not.toHaveBeenCalledWith("/api/contact", expect.anything());
  });

  it("submits successfully and shows a confirmation when the API succeeds", async () => {
    const user = userEvent.setup();
    await goToContact(user);
    await user.type(screen.getByLabelText(/full name/i), "Test User");
    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.type(screen.getByLabelText(/your message/i), "Hello, I need a website.");
    await user.click(screen.getByLabelText(/i agree to be contacted/i));
    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByText(/we've got your message/i)).toBeInTheDocument();
  });

  it("shows a rate-limit-specific message on a 429 response", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: false, status: 429, json: () => Promise.resolve({ error: "Too many requests" }) })
    ));
    const user = userEvent.setup();
    await goToContact(user);
    await user.type(screen.getByLabelText(/full name/i), "Test User");
    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.type(screen.getByLabelText(/your message/i), "Hello");
    await user.click(screen.getByLabelText(/i agree to be contacted/i));
    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByText(/too many submissions/i)).toBeInTheDocument();
  });

  it("does not submit when consent is left unchecked", async () => {
    const user = userEvent.setup();
    await goToContact(user);
    await user.type(screen.getByLabelText(/full name/i), "Test User");
    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.type(screen.getByLabelText(/your message/i), "Hello");
    // Consent checkbox deliberately left unchecked.
    await user.click(screen.getByRole("button", { name: /send message/i }));
    // Scoped to /api/contact specifically, not "fetch never called" — the
    // homepage's geo-detection banner (see App.jsx) legitimately calls
    // /api/geo on mount regardless of what this test is doing.
    expect(global.fetch).not.toHaveBeenCalledWith("/api/contact", expect.anything());
  });
});

describe("Live status indicator", () => {
  it("shows an online or offline status on the Contact page", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByText("Contact")[0]);
    expect(screen.getAllByText(/we're online now|outside business hours/i).length).toBeGreaterThan(0);
  });

  it("also appears on a country landing page, tied to time-zone messaging", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByText("About")[0]);
    await user.click(screen.getAllByText("United States")[0]);
    expect(screen.getAllByText(/we're online now|outside business hours/i).length).toBeGreaterThan(0);
  });
});

describe("Why an India-based agency section", () => {
  it("appears on the About page addressing international-client objections", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByText("About")[0]);
    expect(screen.getByText(/why work with an india-based agency/i)).toBeInTheDocument();
    expect(screen.getByText(/quality you can check yourself/i)).toBeInTheDocument();
  });
});

describe("Privacy policy", () => {
  it("is reachable from the contact form's consent text", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByText("Contact")[0]);
    await user.click(screen.getAllByText("Privacy Policy")[0]);
    expect(window.location.pathname).toBe("/privacy");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/how we handle your information/i);
  });
});

describe("Blog search", () => {
  it("filters articles by search query", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByText("Blog")[0]);
    await user.type(screen.getByLabelText(/search blog articles/i), "WhatsApp");
    expect(screen.getByText(/WhatsApp Automation/i)).toBeInTheDocument();
    expect(screen.queryByText(/Technical SEO Fixes/i)).not.toBeInTheDocument();
  });

  it("shows an empty state when no articles match", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByText("Blog")[0]);
    await user.type(screen.getByLabelText(/search blog articles/i), "zzz-no-match-zzz");
    expect(screen.getByText(/no articles match/i)).toBeInTheDocument();
  });
});

describe("Currency estimator", () => {
  it("converts the estimate when currency changes", async () => {
    const user = userEvent.setup();
    render(<App />);
    const inrEstimate = screen.getByText(/₹\d[\d,]*/).textContent;
    await user.selectOptions(screen.getByLabelText("Currency"), "USD");
    expect(screen.queryByText(inrEstimate)).not.toBeInTheDocument();
    expect(screen.getByText(/\$\d/)).toBeInTheDocument();
  });
});

describe("Service quiz", () => {
  it("walks through both questions and shows a recommendation", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Retail, restaurant or local business"));
    await user.click(screen.getByText("Sell products/take bookings online"));
    expect(screen.getByText(/we'd recommend/i)).toBeInTheDocument();
  });

  it("navigates to Services with the recommended service pre-selected", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Retail, restaurant or local business"));
    await user.click(screen.getByText("Sell products/take bookings online"));
    await user.click(screen.getByText("See This Service"));
    expect(window.location.pathname).toBe("/services");
  });

  it("can recommend CRM Development & Integration", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Startup or professional services"));
    await user.click(screen.getByText("Keep track of leads & customers"));
    expect(screen.getByText(/we'd recommend/i)).toBeInTheDocument();
    expect(screen.getAllByText("CRM Development & Integration").length).toBeGreaterThan(0);
  });

  it("can recommend WhatsApp Marketing & Messaging APIs", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Travel, hotel or hospitality"));
    await user.click(screen.getByText("Reach customers via WhatsApp/SMS"));
    expect(screen.getByText(/we'd recommend/i)).toBeInTheDocument();
    expect(screen.getAllByText("WhatsApp Marketing & Messaging APIs").length).toBeGreaterThan(0);
  });
});

describe("Location landing pages", () => {
  it("navigates to a country page from the About page's Global Reach section", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByText("About")[0]);
    await user.click(screen.getAllByText("United States")[0]);
    expect(window.location.pathname).toBe("/websites-for/usa");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/U\.S\. Businesses/i);
  });

  it("includes Europe as a reachable region", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByText("About")[0]);
    await user.click(screen.getAllByText("Europe")[0]);
    expect(window.location.pathname).toBe("/websites-for/europe");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/European Businesses/i);
  });
});

describe("hreflang tags", () => {
  it("are present on the home page and cover all regions plus x-default", () => {
    render(<App />);
    const tags = document.querySelectorAll('link[rel="alternate"][hreflang]');
    const hreflangs = Array.from(tags).map((t) => t.getAttribute("hreflang"));
    expect(hreflangs).toEqual(expect.arrayContaining(["x-default", "en-in", "en-us", "en-au", "en-150", "en-ae", "en-gb", "en-ca", "en-sg"]));
  });

  it("are absent on universal pages that have no regional variant", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByText("Services")[0]);
    expect(document.querySelectorAll('link[rel="alternate"][hreflang]').length).toBe(0);
  });
});

describe("Geo-detection banner", () => {
  it("shows a region-specific banner when /api/geo detects a matching country", async () => {
    vi.stubGlobal("fetch", vi.fn((url) => {
      if (url === "/api/geo") return Promise.resolve({ ok: true, json: () => Promise.resolve({ country: "AU" }) });
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ ok: true }) });
    }));
    render(<App />);
    expect(await screen.findByText(/visiting from australia/i)).toBeInTheDocument();
  });

  it("shows no banner when the detected country has no dedicated page", async () => {
    const geoFetch = vi.fn((url) => {
      if (url === "/api/geo") return Promise.resolve({ ok: true, json: () => Promise.resolve({ country: "BR" }) });
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ ok: true }) });
    });
    vi.stubGlobal("fetch", geoFetch);
    render(<App />);
    await waitFor(() => expect(geoFetch).toHaveBeenCalledWith("/api/geo"));
    expect(screen.queryByText(/visiting from/i)).not.toBeInTheDocument();
  });
});

describe("Portfolio case studies", () => {
  it("opens a case study with challenge/solution/metrics", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByText("Portfolio")[0]);
    await user.click(screen.getAllByText("Read case study", { exact: false })[0]);
    expect(screen.getByText(/the challenge/i)).toBeInTheDocument();
    expect(screen.getByText(/the solution/i)).toBeInTheDocument();
  });
});

describe("Mobile sticky CTA bar", () => {
  it("renders Call, WhatsApp, and Get Quote actions", () => {
    render(<App />);
    expect(screen.getAllByText("Call").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Get Quote").length).toBeGreaterThan(0);
  });
});
