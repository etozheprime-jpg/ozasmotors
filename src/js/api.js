/* Užklausų siuntimo abstrakcija.
   Visa forma kalbasi su serveriu TIK per šią funkciją — todėl backend'ą
   galima prijungti nekeičiant jokio kito kodo.

   Prijungimas: src/js/config.js -> FORM.endpoint = '/api/leads'
   Serveris turi priimti multipart/form-data POST užklausą. */
import { FORM } from './config.js';

/**
 * @param {Object} lead
 * @param {Object} lead.car      automobilio duomenys (make, model, year, mileage, fuel, gearbox, condition, damage, price)
 * @param {Object} lead.contact  kontaktai (name, phone, email, consent)
 * @param {string} lead.notes    papildoma informacija
 * @param {File[]} lead.photos
 * @param {File[]} lead.videos
 * @param {Object} lead.meta     puslapio kontekstas (url, referrer, utm, kalba)
 * @param {(p:number)=>void} [onProgress] įkėlimo progresas 0–100
 * @returns {Promise<{ok:boolean, id?:string}>}
 */
export async function submitLead(lead, onProgress) {
  const fd = new FormData();
  fd.append('payload', JSON.stringify({
    car: lead.car,
    contact: lead.contact,
    notes: lead.notes,
    meta: lead.meta,
  }));
  lead.photos.forEach((f, i) => fd.append('photos[' + i + ']', f, f.name));
  lead.videos.forEach((f, i) => fd.append('videos[' + i + ']', f, f.name));

  if (!FORM.endpoint) {
    // Demo režimas: backend dar neprijungtas.
    console.info('[submitLead] FORM.endpoint tuščias — užklausa nebuvo išsiųsta.', lead);
    for (let p = 0; p <= 100; p += 20) {
      onProgress?.(p);
      await new Promise((r) => setTimeout(r, 90));
    }
    return { ok: true, id: 'demo-' + Date.now() };
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', FORM.endpoint, true);
    xhr.timeout = 120000;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let id;
        try { id = JSON.parse(xhr.responseText).id; } catch { /* serveris grąžino ne JSON */ }
        resolve({ ok: true, id });
      } else {
        reject(new Error('Serverio klaida (' + xhr.status + ')'));
      }
    };
    xhr.onerror = () => reject(new Error('Nepavyko prisijungti prie serverio'));
    xhr.ontimeout = () => reject(new Error('Baigėsi laukimo laikas'));
    xhr.send(fd);
  });
}
