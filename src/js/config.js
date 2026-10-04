/* ===========================================================================
   OZASMOTORS — vienintelis failas, kurį reikia redaguoti paleidžiant svetainę.
   PAKEISKITE žemiau esančias reikšmes savo realiais duomenimis.
   =========================================================================== */

export const SITE = {
  name: 'OZASMOTORS',
  url: 'https://ozasmotors.lt',            // PAKEISTI: galutinis domenas
  city: 'Vilnius',
  address: {
    street: 'Ozo g. 12',
    locality: 'Vilnius',
    postalCode: '08311',
    region: 'Vilniaus m. sav.',
    country: 'LT',
  },
  // Google Maps navigacijos nuoroda (veikia ir iOS, ir Android)
  mapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Ozo+g.+12%2C+Vilnius+08311%2C+Lietuva',
  mapsEmbed: 'https://www.google.com/maps?q=Ozo%20g.%2012,%20Vilnius%2008311&output=embed',
};

export const CONTACTS = {
  // PAKEISTI: realus numeris tarptautiniu formatu, be tarpų — naudojamas tel: nuorodai
  phone: '+37060000000',
  // PAKEISTI: kaip numeris rodomas ekrane
  phoneDisplay: '+370 600 00000',
  // PAKEISTI
  email: 'info@ozasmotors.lt',
  workingHours: 'I–VI 09:00–19:00',
  // PAKEISTI: pilnos nuorodos. Jei kurios nors neturite — palikite tuščią eilutę '' ir mygtukas nebus rodomas.
  whatsapp: 'https://wa.me/37060000000',
  viber: 'viber://chat?number=%2B37060000000',
  telegram: 'https://t.me/ozasmotors',
  instagram: 'https://www.instagram.com/ozasmotors',
  facebook: 'https://www.facebook.com/ozasmotors',
};

export const ANALYTICS = {
  // PAKEISTI: 'G-XXXXXXXXXX'. Paliekant tuščia — Google Analytics nebus įkeltas.
  ga4: 'GA_MEASUREMENT_ID',
  // PAKEISTI: Meta Pixel ID. Paliekant tuščia — Pixel nebus įkeltas.
  metaPixel: 'META_PIXEL_ID',
};

export const FORM = {
  // PAKEISTI: galinio serverio adresas (žr. src/js/api.js).
  // Pvz. '/api/leads', 'https://formspree.io/f/xxxx' arba Netlify/Vercel funkcija.
  endpoint: '',
  maxPhotos: 12,
  maxVideos: 2,
  maxPhotoSizeMB: 12,
  maxVideoSizeMB: 120,
  photoTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  videoTypes: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'],
};
