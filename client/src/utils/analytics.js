/**
 * Central analytics loader. All three integrations are gated behind
 * env vars - if a var isn't set, that integration silently never
 * loads. This means the app ships and runs fine with zero analytics
 * configured, and each service activates independently the moment
 * its ID is added to .env (no code changes needed).
 */

const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';
const CRISP_ID = import.meta.env.VITE_CRISP_WEBSITE_ID;

const isConfigured = (value) => value && !value.includes('xxxx') && value.trim() !== '';

// ---- GA4 ----
const initGA4 = () => {
  if (!isConfigured(GA4_ID)) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA4_ID, { send_page_view: false });
};

const trackGA4PageView = (path) => {
  if (!isConfigured(GA4_ID) || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', { page_path: path });
};

const trackGA4Event = (eventName, params = {}) => {
  if (!isConfigured(GA4_ID) || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
};

// ---- PostHog ----
let posthogInstance = null;

const initPostHog = async () => {
  if (!isConfigured(POSTHOG_KEY)) return;

  const { default: posthog } = await import('posthog-js');
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false, // we call this manually on route change
    autocapture: true,
  });
  posthogInstance = posthog;
};

const trackPostHogPageView = (path) => {
  if (!posthogInstance) return;
  posthogInstance.capture('$pageview', { $current_url: path });
};

const trackPostHogEvent = (eventName, properties = {}) => {
  if (!posthogInstance) return;
  posthogInstance.capture(eventName, properties);
};

const identifyPostHogUser = (userId, traits = {}) => {
  if (!posthogInstance) return;
  posthogInstance.identify(userId, traits);
};

// ---- Crisp ----
const initCrisp = () => {
  if (!isConfigured(CRISP_ID)) return;

  window.$crisp = [];
  window.CRISP_WEBSITE_ID = CRISP_ID;

  const script = document.createElement('script');
  script.src = 'https://client.crisp.chat/l.js';
  script.async = true;
  document.head.appendChild(script);
};

const identifyCrispUser = (email, name) => {
  if (!isConfigured(CRISP_ID) || !window.$crisp) return;
  if (email) window.$crisp.push(['set', 'user:email', [email]]);
  if (name) window.$crisp.push(['set', 'user:nickname', [name]]);
};

// ---- Unified API used by the rest of the app ----

/**
 * Call once on app boot (in main.jsx or App.jsx).
 */
export const initAnalytics = () => {
  initGA4();
  initPostHog();
  initCrisp();
};

/**
 * Call on every route change (wired via a small hook in App.jsx).
 */
export const trackPageView = (path) => {
  trackGA4PageView(path);
  trackPostHogPageView(path);
};

/**
 * Call for meaningful business events - checkout started, listing
 * created, dispute raised, etc. Fans out to every configured provider
 * that supports custom events (Crisp doesn't track custom events the
 * same way, so it's excluded here).
 */
export const trackEvent = (eventName, properties = {}) => {
  trackGA4Event(eventName, properties);
  trackPostHogEvent(eventName, properties);
};

/**
 * Call after login/signup to associate the session with a known user
 * across every configured provider.
 */
export const identifyUser = (user) => {
  if (!user) return;
  identifyPostHogUser(user.id, { email: user.email, role: user.role });
  identifyCrispUser(user.email, user.name);
};