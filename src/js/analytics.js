/* Analitikos abstrakcija.
   Niekas neįkeliama, kol vartotojas nesutinka su atitinkamais slapukais. */
import { ANALYTICS } from './config.js';

const PLACEHOLDER = ['GA_MEASUREMENT_ID', 'META_PIXEL_ID', ''];
const queue = [];
let gaReady = false;
let pixelReady = false;

function isReal(id) { return id && !PLACEHOLDER.includes(id); }

export function loadAnalytics(consent) {
  if (consent.analytics && !gaReady && isReal(ANALYTICS.ga4)) {
    gaReady = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ANALYTICS.ga4;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ANALYTICS.ga4, { anonymize_ip: true });
    queue.splice(0).forEach(([n, p]) => window.gtag('event', n, p));
  }

  if (consent.marketing && !pixelReady && isReal(ANALYTICS.metaPixel)) {
    pixelReady = true;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', ANALYTICS.metaPixel);
    window.fbq('track', 'PageView');
  }
}

/** Vienas įvykių taškas visai svetainei. */
export function track(name, params = {}) {
  if (window.gtag) window.gtag('event', name, params);
  else queue.push([name, params]);

  if (window.fbq) {
    const map = { lead_submit: 'Lead', form_start: 'InitiateCheckout', tel_click: 'Contact' };
    if (map[name]) window.fbq('track', map[name], params);
  }

  if (!window.gtag && !window.fbq) {
    // Kol analitika neprijungta — matoma tik naršyklės konsolėje.
    console.debug('[track]', name, params);
  }
}

/** Automatinis sekimas visiems elementams su data-track="..." */
export function bindTracking(root = document) {
  root.addEventListener('click', (e) => {
    const el = e.target.closest('[data-track]');
    if (el) track(el.dataset.track, { label: (el.textContent || '').trim().slice(0, 60) });
  });
}
