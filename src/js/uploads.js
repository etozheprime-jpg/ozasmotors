/* Nuotraukų ir vaizdo įrašų įkėlimas: pasirinkimas, kamera, drag & drop,
   peržiūra, trynimas, validacija. */
import { FORM } from './config.js';
import { track } from './analytics.js';

const MB = 1024 * 1024;

const MSG = {
  tooMany: (n) => `Galima įkelti ne daugiau kaip ${n} failus`,
  tooBig: (name, mb) => `„${name}“ per didelis. Maks. ${mb} MB`,
  badType: (name) => `„${name}“ — nepalaikomas failo formatas`,
};

export class FileField {
  /**
   * @param {'photo'|'video'} kind
   * @param {{drop:HTMLElement, previews:HTMLElement, error:HTMLElement, inputs:HTMLInputElement[]}} els
   */
  constructor(kind, els) {
    this.kind = kind;
    this.els = els;
    this.files = [];
    this.max = kind === 'photo' ? FORM.maxPhotos : FORM.maxVideos;
    this.maxSize = (kind === 'photo' ? FORM.maxPhotoSizeMB : FORM.maxVideoSizeMB) * MB;
    this.maxSizeMB = kind === 'photo' ? FORM.maxPhotoSizeMB : FORM.maxVideoSizeMB;
    this.types = kind === 'photo' ? FORM.photoTypes : FORM.videoTypes;
    this.#bind();
  }

  #bind() {
    this.els.inputs.forEach((input) => {
      input.addEventListener('change', () => {
        this.add(Array.from(input.files || []));
        input.value = '';
      });
    });

    const drop = this.els.drop;
    ['dragenter', 'dragover'].forEach((ev) =>
      drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach((ev) =>
      drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
    drop.addEventListener('drop', (e) => {
      const list = Array.from(e.dataTransfer?.files || []);
      this.add(list);
    });
  }

  #accepts(file) {
    if (this.types.includes(file.type)) return true;
    // Kai kurios naršyklės nepateikia MIME tipo (pvz. HEIC iš iOS)
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const okExt = this.kind === 'photo'
      ? ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']
      : ['mp4', 'mov', 'webm', 'm4v'];
    if (okExt.includes(ext)) return true;
    return file.type.startsWith(this.kind === 'photo' ? 'image/' : 'video/');
  }

  add(list) {
    this.#error('');
    const errors = [];

    for (const file of list) {
      if (this.files.length >= this.max) { errors.push(MSG.tooMany(this.max)); break; }
      if (!this.#accepts(file)) { errors.push(MSG.badType(file.name)); continue; }
      if (file.size > this.maxSize) { errors.push(MSG.tooBig(file.name, this.maxSizeMB)); continue; }
      if (this.files.some((f) => f.name === file.name && f.size === file.size)) continue;
      this.files.push(file);
      this.#renderOne(file);
    }

    if (errors.length) this.#error(errors[0]);
    if (this.files.length) {
      track(this.kind === 'photo' ? 'photos_added' : 'video_added', { count: this.files.length });
    }
    this.els.drop.dispatchEvent(new CustomEvent('files:change', { bubbles: true }));
  }

  #renderOne(file) {
    const url = URL.createObjectURL(file);
    const item = document.createElement('figure');
    item.className = 'preview';

    const media = document.createElement(this.kind === 'photo' ? 'img' : 'video');
    media.src = url;
    if (this.kind === 'photo') {
      media.alt = 'Įkelta automobilio nuotrauka';
      media.loading = 'lazy';
    } else {
      media.muted = true;
      media.playsInline = true;
      media.preload = 'metadata';
    }

    const badge = document.createElement('figcaption');
    badge.className = 'preview__badge';
    badge.textContent = (file.size / MB).toFixed(1) + ' MB';

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'preview__del';
    del.setAttribute('aria-label', 'Pašalinti failą „' + file.name + '“');
    del.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';
    del.addEventListener('click', () => {
      this.files = this.files.filter((f) => f !== file);
      URL.revokeObjectURL(url);
      item.remove();
      this.#error('');
      this.els.drop.dispatchEvent(new CustomEvent('files:change', { bubbles: true }));
    });

    // Progreso juosta — pildoma siunčiant užklausą
    const bar = document.createElement('div');
    bar.className = 'preview__bar';
    bar.innerHTML = '<i></i>';

    item.append(media, badge, del, bar);
    this.els.previews.appendChild(item);
  }

  setProgress(percent) {
    this.els.previews.querySelectorAll('.preview__bar i').forEach((i) => {
      i.style.width = percent + '%';
    });
  }

  #error(msg) {
    const el = this.els.error;
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('is-visible', Boolean(msg));
  }
}
