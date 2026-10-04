/* Daugiapakopė automobilio anketa. */
import { FileField } from './uploads.js';
import { submitLead } from './api.js';
import { track } from './analytics.js';
import { FORM } from './config.js';

const STORAGE_KEY = 'ozasmotors.lead.v1';
// Kontaktiniai (asmens) duomenys NĖRA saugomi naršyklėje.
const PERSISTED = ['make', 'model', 'year', 'mileage', 'fuel', 'gearbox', 'condition', 'damage', 'price', 'notes'];

const MSG = {
  required: 'Privalomas laukas',
  phone: 'Neteisingas telefono numeris',
  email: 'Neteisingas el. pašto adresas',
  year: 'Nurodykite metus nuo 1950 iki ' + (new Date().getFullYear() + 1),
  mileage: 'Nurodykite ridą kilometrais',
  choice: 'Pasirinkite vieną variantą',
  consent: 'Reikalingas jūsų sutikimas',
  network: 'Nepavyko išsiųsti užklausos. Patikrinkite ryšį ir bandykite dar kartą arba paskambinkite mums.',
};

export function initForm() {
  const form = document.getElementById('lead-form');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('.step'));
  const total = steps.length;
  const bar = document.getElementById('progress-bar');
  const label = document.getElementById('progress-label');
  const announcer = document.getElementById('step-announcer');
  const btnBack = document.getElementById('btn-back');
  const btnNext = document.getElementById('btn-next');
  const btnSubmit = document.getElementById('btn-submit');
  const success = document.getElementById('success');

  let current = 0;
  let started = false;

  /* ---------- Failai ---------- */
  const photos = new FileField('photo', {
    drop: document.getElementById('drop-photos'),
    previews: document.getElementById('previews-photos'),
    error: form.querySelector('[data-error-for="photos"]'),
    inputs: [document.getElementById('input-photos'), document.getElementById('input-camera')],
  });
  const videos = new FileField('video', {
    drop: document.getElementById('drop-video'),
    previews: document.getElementById('previews-video'),
    error: form.querySelector('[data-error-for="video"]'),
    inputs: [document.getElementById('input-video')],
  });

  form.querySelectorAll('[data-pick]').forEach((btn) => {
    const map = { photos: 'input-photos', camera: 'input-camera', video: 'input-video' };
    btn.addEventListener('click', () => document.getElementById(map[btn.dataset.pick]).click());
  });

  // Limitų tekstai iš config.js
  form.querySelectorAll('[data-max-photos]').forEach((el) => (el.textContent = FORM.maxPhotos));
  form.querySelectorAll('[data-max-photo-size]').forEach((el) => (el.textContent = FORM.maxPhotoSizeMB));
  form.querySelectorAll('[data-max-video-size]').forEach((el) => (el.textContent = FORM.maxVideoSizeMB));

  /* ---------- Klaidos ---------- */
  function showError(name, msg) {
    const box = form.querySelector(`[data-error-for="${name}"]`);
    if (box) {
      box.textContent = msg;
      box.classList.toggle('is-visible', Boolean(msg));
    }
    const field = form.elements[name];
    const nodes = field && field.length !== undefined && !field.tagName ? Array.from(field) : [field];
    nodes.forEach((n) => n && n.setAttribute && n.setAttribute('aria-invalid', msg ? 'true' : 'false'));
  }

  function clearErrors(stepEl) {
    stepEl.querySelectorAll('.error').forEach((e) => { e.textContent = ''; e.classList.remove('is-visible'); });
    stepEl.querySelectorAll('[aria-invalid="true"]').forEach((e) => e.setAttribute('aria-invalid', 'false'));
  }

  /* ---------- Validacija ---------- */
  const phoneOk = (v) => {
    const s = v.replace(/[\s()\-.]/g, '');
    return /^(\+370\d{8}|8\d{8}|\+\d{8,15})$/.test(s);
  };
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v);

  function validateStep(index) {
    const stepEl = steps[index];
    clearErrors(stepEl);
    let firstBad = null;

    // Tekstiniai / skaitiniai laukai
    stepEl.querySelectorAll('input[required], textarea[required]').forEach((input) => {
      if (input.type === 'radio' || input.type === 'checkbox') return;
      const v = input.value.trim();
      let msg = '';
      if (!v) msg = input.dataset.error || MSG.required;
      else if (input.id === 'year') {
        const y = Number(v);
        if (y < 1950 || y > new Date().getFullYear() + 1) msg = MSG.year;
      } else if (input.id === 'mileage') {
        const km = Number(v);
        if (!(km >= 0) || km > 2000000) msg = MSG.mileage;
      } else if (input.type === 'tel' && !phoneOk(v)) msg = MSG.phone;
      if (msg) { showError(input.name, msg); firstBad = firstBad || input; }
    });

    // El. paštas (neprivalomas, bet jei įvestas — turi būti teisingas)
    const email = stepEl.querySelector('#email');
    if (email && email.value.trim() && !emailOk(email.value.trim())) {
      showError('email', MSG.email);
      firstBad = firstBad || email;
    }

    // Radio grupės
    stepEl.querySelectorAll('[data-group]').forEach((group) => {
      const name = group.dataset.group;
      if (!form.querySelector(`input[name="${name}"]:checked`)) {
        showError(name, MSG.choice);
        firstBad = firstBad || group.querySelector('input');
      }
    });

    // Sutikimas
    const consent = stepEl.querySelector('#consent');
    if (consent && !consent.checked) {
      showError('consent', MSG.consent);
      firstBad = firstBad || consent;
    }

    if (firstBad) {
      firstBad.focus({ preventScroll: true });
      firstBad.closest('.field, .step')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return false;
    }
    return true;
  }

  /* ---------- Navigacija ---------- */
  function render(scroll = true) {
    steps.forEach((s, i) => s.classList.toggle('is-active', i === current));
    const pct = ((current + 1) / total) * 100;
    bar.style.width = pct + '%';
    label.textContent = `Žingsnis ${current + 1} iš ${total}`;
    announcer.textContent = `Žingsnis ${current + 1} iš ${total}. ` + (steps[current].querySelector('.step__title')?.textContent || '');
    btnBack.hidden = current === 0;
    btnNext.hidden = current === total - 1;
    btnSubmit.hidden = current !== total - 1;
    if (scroll) {
      const top = form.getBoundingClientRect().top + window.scrollY - 110;
      if (window.scrollY > top + 200 || window.scrollY < top - 200) {
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  }

  btnNext.addEventListener('click', () => {
    if (!validateStep(current)) return;
    track('form_step_complete', { step: current + 1 });
    current = Math.min(current + 1, total - 1);
    render();
    save();
  });

  btnBack.addEventListener('click', () => {
    current = Math.max(current - 1, 0);
    render();
  });

  // Enter = „Toliau“ (išskyrus textarea)
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      (current === total - 1 ? btnSubmit : btnNext).click();
    }
  });

  // Klaidos dingsta taisant lauką
  form.addEventListener('input', (e) => {
    if (e.target.name) showError(e.target.name, '');
    if (!started) { started = true; track('form_start'); }
    save();
  });
  form.addEventListener('change', save);

  /* ---------- Išsaugojimas naršyklėje ---------- */
  function save() {
    try {
      const data = {};
      PERSISTED.forEach((n) => {
        const f = form.elements[n];
        if (!f) return;
        if (f.length !== undefined && !f.tagName) {
          const checked = Array.from(f).find((i) => i.checked);
          if (checked) data[n] = checked.value;
        } else if (f.value) data[n] = f.value;
      });
      data._step = current;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { /* privatus režimas arba pilna saugykla */ }
  }

  function restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      PERSISTED.forEach((n) => {
        if (data[n] == null) return;
        const f = form.elements[n];
        if (!f) return;
        if (f.length !== undefined && !f.tagName) {
          Array.from(f).forEach((i) => { i.checked = i.value === data[n]; });
        } else f.value = data[n];
      });
      if (typeof data._step === 'number') current = Math.min(data._step, total - 1);
    } catch { /* ignoruojame */ }
  }

  /* ---------- Siuntimas ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateStep(current)) return;

    const original = btnSubmit.textContent;
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Siunčiama…';
    showError('submit', '');

    const v = (n) => (form.elements[n]?.value || '').trim();
    const r = (n) => form.querySelector(`input[name="${n}"]:checked`)?.value || '';

    const lead = {
      car: {
        make: v('make'), model: v('model'),
        year: v('year'), mileage: v('mileage'),
        fuel: r('fuel'), gearbox: r('gearbox'),
        condition: r('condition'), damage: v('damage'),
        price: v('price'),
      },
      contact: { name: v('name'), phone: v('phone'), email: v('email'), consent: true },
      notes: v('notes'),
      photos: photos.files,
      videos: videos.files,
      meta: {
        url: location.href,
        referrer: document.referrer,
        language: navigator.language,
        submittedAt: new Date().toISOString(),
      },
    };

    try {
      const res = await submitLead(lead, (p) => {
        photos.setProgress(p);
        videos.setProgress(p);
        btnSubmit.textContent = p < 100 ? `Siunčiama… ${p}%` : 'Beveik…';
      });
      if (!res.ok) throw new Error('Serveris atmetė užklausą');

      track('lead_submit', {
        make: lead.car.make,
        photos: lead.photos.length,
        videos: lead.videos.length,
      });

      form.style.display = 'none';
      success.classList.add('is-active');
      success.scrollIntoView({ block: 'center', behavior: 'smooth' });
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignoruojame */ }
    } catch (err) {
      console.error(err);
      showError('submit', MSG.network);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = original;
    }
  });

  document.getElementById('btn-restart')?.addEventListener('click', () => {
    location.reload();
  });

  restore();
  render(false);
}
