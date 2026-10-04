/* OZASMOTORS — pagrindinis scenarijus. */
import { SITE, CONTACTS } from './config.js';
import { loadAnalytics, track, bindTracking } from './analytics.js';
import { initForm } from './form.js';

/* ---------- 1. Kontaktai iš config.js ---------- */
function applyContacts() {
  const tel = 'tel:' + CONTACTS.phone.replace(/\s/g, '');
  const mail = 'mailto:' + CONTACTS.email;

  document.querySelectorAll('[data-contact]').forEach((el) => {
    switch (el.dataset.contact) {
      case 'phone': el.setAttribute('href', tel); break;
      case 'phoneDisplay': el.textContent = CONTACTS.phoneDisplay; break;
      case 'email': el.setAttribute('href', mail); break;
      case 'emailDisplay': el.textContent = CONTACTS.email; break;
      case 'hours': el.textContent = CONTACTS.workingHours; break;
    }
  });

  document.querySelectorAll('#nav-btn, [data-track="navigate_click"]').forEach((a) => {
    if (a.tagName === 'A') a.href = SITE.mapsUrl;
  });

  const wa = document.getElementById('sticky-wa');
  if (wa) {
    if (CONTACTS.whatsapp) wa.href = CONTACTS.whatsapp;
    else wa.remove();
  }

  /* Susisiekimo kanalai */
  const box = document.getElementById('channels');
  if (!box) return;
  const icons = {
    whatsapp: '<path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.04-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.57-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.47s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z"/>',
    viber: '<path d="M12 1C8.5 1 5.6 1.6 4 3.1 2.8 4.3 2.2 6.3 2.2 9.3c0 3 .6 5 1.8 6.2.5.5 1.2.9 2 1.2V21l2.6-2.2c1 .1 2 .2 3.4.2 3.5 0 6.4-.6 8-2.1 1.2-1.2 1.8-3.2 1.8-6.2v-1.4c0-3-.6-5-1.8-6.2C18.4 1.6 15.5 1 12 1zm4.9 13.6c-.2.5-1 1-1.6 1.1-.4.1-.9.1-1.5-.1-.4-.1-.8-.3-1.4-.5-2.4-1-3.9-3.4-4-3.5-.1-.2-1-1.3-1-2.4s.6-1.7.8-1.9c.2-.2.4-.3.6-.3h.4c.1 0 .3 0 .5.4l.7 1.7c.1.1.1.3 0 .4l-.2.4-.3.3c-.1.1-.2.2-.1.4.1.2.5.8 1 1.3.7.6 1.3.8 1.5.9.2.1.3.1.4-.1l.6-.7c.1-.2.3-.2.4-.1l1.6.8c.2.1.4.2.4.3.1.2.1.6-.1 1.1zM12 4.6c-.3 0-.5.2-.5.5s.2.5.5.5c2.2 0 4 1.8 4 4 0 .3.2.5.5.5s.5-.2.5-.5c0-2.8-2.2-5-5-5zm0 2c-.3 0-.5.2-.5.5s.2.5.5.5c1.1 0 2 .9 2 2 0 .3.2.5.5.5s.5-.2.5-.5c0-1.7-1.3-3-3-3z"/>',
    telegram: '<path d="M21.9 4.3 18.7 19c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.3 12.8l-4.8-1.5c-1-.3-1.1-1 .2-1.5l18.8-7.3c.9-.3 1.6.2 1.4 1.8z"/>',
    instagram: '<path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1zm0 3.8A6 6 0 1 0 18 12a6 6 0 0 0-6-6zm0 9.9A3.9 3.9 0 1 1 15.9 12 3.9 3.9 0 0 1 12 15.9zm7.7-10.1a1.4 1.4 0 1 1-1.4-1.4 1.4 1.4 0 0 1 1.4 1.4z"/>',
    facebook: '<path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/>',
  };
  const labels = { whatsapp: 'WhatsApp', viber: 'Viber', telegram: 'Telegram', instagram: 'Instagram', facebook: 'Facebook' };
  const cls = { whatsapp: 'wa', viber: 'vb', telegram: 'tg', instagram: 'ig', facebook: 'fb' };

  Object.keys(labels).forEach((key) => {
    const href = CONTACTS[key];
    if (!href) return; // nuorodos nėra — mygtuko nerodome
    const a = document.createElement('a');
    a.className = 'channel channel--' + cls[key];
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.dataset.track = key + '_click';
    a.innerHTML = `<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${icons[key]}</svg><span>${labels[key]}</span>`;
    box.appendChild(a);
  });
}

/* ---------- 2. Header ---------- */
function initHeader() {
  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobile-menu');

  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 24);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Uždaryti meniu' : 'Atidaryti meniu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
}

/* ---------- 3. Hero video ---------- */
function initHeroVideo() {
  const video = document.getElementById('hero-video');
  const poster = document.getElementById('hero-poster');
  if (!video) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection?.saveData;
  if (reduced || saveData) { video.remove(); return; }

  video.preload = 'auto';
  video.load();
  const start = () => {
    video.play().then(() => { poster?.remove(); }).catch(() => { /* paliekame nuotrauką */ });
  };
  if (video.readyState >= 3) start();
  else video.addEventListener('canplay', start, { once: true });

  // Taupome resursus, kai hero nematomas
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) video.play().catch(() => {});
    else video.pause();
  }, { threshold: 0.05 });
  io.observe(video);
}

/* ---------- 4. Scroll animacijos ---------- */
function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((i) => i.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach((i) => io.observe(i));
}

/* ---------- 5. DUK ---------- */
function initFaq() {
  document.querySelectorAll('.faq__q').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.classList.toggle('is-open', !open);
      if (!open) track('faq_open', { q: btn.textContent.trim().slice(0, 60) });
    });
  });
}

/* ---------- 6. Lipni juosta ---------- */
function initStickyBar() {
  const bar = document.getElementById('sticky-bar');
  const hero = document.querySelector('.hero');
  if (!bar || !hero) return;
  const io = new IntersectionObserver(([e]) => {
    const show = !e.isIntersecting;
    bar.classList.toggle('is-visible', show);
    document.body.classList.toggle('sticky-bar-on', show);
  }, { threshold: 0 });
  io.observe(hero);
}

/* ---------- 7. Žemėlapis (įkeliamas tik paprašius) ---------- */
function initMap() {
  const box = document.querySelector('[data-map]');
  if (!box) return;

  const load = () => {
    if (box.querySelector('iframe')) return;
    box.innerHTML = '';
    const f = document.createElement('iframe');
    f.src = SITE.mapsEmbed;
    f.loading = 'lazy';
    f.title = 'OZASMOTORS žemėlapyje — Ozo g. 12, Vilnius';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.allowFullscreen = true;
    box.appendChild(f);
  };

  const placeholder = () => {
    box.innerHTML = '';
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn--ghost';
    b.style.cssText = 'width:100%;height:100%;border:0;flex-direction:column;gap:6px';
    b.innerHTML = '<span>Rodyti žemėlapį</span><span style="font-family:var(--font-mono);font-size:.68rem;letter-spacing:.1em;opacity:.65;text-transform:none">Įkeliamas Google Maps turinys</span>';
    b.addEventListener('click', load);
    box.appendChild(b);
  };

  if (getConsent()?.analytics) load();
  else placeholder();
  document.addEventListener('consent:change', (e) => { if (e.detail.analytics) load(); });
}

/* ---------- 8. Slapukai ---------- */
const CONSENT_KEY = 'ozasmotors.consent.v1';

function getConsent() {
  try { return JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null'); } catch { return null; }
}

function setConsent(consent) {
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...consent, at: Date.now() })); } catch { /* ignoruojame */ }
  loadAnalytics(consent);
  document.dispatchEvent(new CustomEvent('consent:change', { detail: consent }));
}

function initCookies() {
  const box = document.getElementById('cookie');
  const prefs = document.getElementById('cookie-prefs');
  const saved = getConsent();

  const open = () => box.classList.add('is-visible');
  const close = () => box.classList.remove('is-visible');

  if (saved) loadAnalytics(saved);
  else setTimeout(open, 1200);

  document.getElementById('cc-accept').addEventListener('click', () => {
    setConsent({ analytics: true, marketing: true });
    close();
  });
  document.getElementById('cc-reject').addEventListener('click', () => {
    setConsent({ analytics: false, marketing: false });
    close();
  });
  document.getElementById('cc-settings').addEventListener('click', (e) => {
    prefs.classList.add('is-open');
    e.currentTarget.hidden = true;
    document.getElementById('cc-accept').hidden = true;
    document.getElementById('cc-reject').hidden = true;
    document.getElementById('cc-save').hidden = false;
  });
  document.getElementById('cc-save').addEventListener('click', () => {
    setConsent({
      analytics: document.getElementById('cc-analytics').checked,
      marketing: document.getElementById('cc-marketing').checked,
    });
    close();
  });
  document.getElementById('cookie-reopen')?.addEventListener('click', () => {
    const c = getConsent() || {};
    document.getElementById('cc-analytics').checked = Boolean(c.analytics);
    document.getElementById('cc-marketing').checked = Boolean(c.marketing);
    prefs.classList.add('is-open');
    document.getElementById('cc-settings').hidden = true;
    document.getElementById('cc-accept').hidden = true;
    document.getElementById('cc-reject').hidden = true;
    document.getElementById('cc-save').hidden = false;
    open();
  });
}

/* ---------- 9. Service worker ---------- */
function initSW() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return;
  // Vietinio kūrimo metu SW tik trukdo — naudojamas tik realiame domene.
  if (['localhost', '127.0.0.1', '::1'].includes(location.hostname)) return;
  addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((e) => console.warn('SW:', e));
  });
}

/* ---------- Paleidimas ---------- */
applyContacts();
initHeader();
initHeroVideo();
initReveal();
initFaq();
initStickyBar();
initMap();
initCookies();
bindTracking();
initForm();
initSW();

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
