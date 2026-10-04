# OZASMOTORS — automobilių supirkimas Vilniuje

Statinė, greita, konversijai skirta svetainė: hero video, daugiapakopė automobilio anketa su
nuotraukų ir vaizdo įrašų įkėlimu, PWA, SEO ir Schema.org, slapukų sutikimas.

**Technologijos:** HTML5 + CSS3 + vanilla JavaScript (ES moduliai). Jokio surinkimo (build),
jokių priklausomybių, jokio framework'o.

Kodėl ne React/Vite: tai vienas puslapis su viena forma. Be framework'o puslapis krauna
~0 KB JS karkaso, LCP ir INP būna geriausi, o svetainę gali prižiūrėti bet kuris žmogus,
mokantis HTML — nereikia `npm install` ar perkompiliavimo norint pakeisti telefono numerį.
Failus galima tiesiog įkelti į bet kurį hostingą.

---

## 1. Paleidimas

```bash
npm run dev
```

Atsidaro http://localhost:5173 (naudoja `npx serve`, nieko diegti nereikia).

Alternatyva be Node.js:

```bash
python3 -m http.server 5173
```

## 2. Surinkimas

```bash
npm run build
```

Surinkimo nereikia — projektas jau yra galutinis. „Build“ rezultatas = šio katalogo turinys.

## 3. Deploy

### Vercel
```bash
npx vercel --prod
```
Framework Preset: **Other**. Build Command: palikti tuščią. Output Directory: `.`

### Netlify
```bash
npx netlify deploy --prod --dir .
```
Arba per UI: nutempti katalogą į Netlify Drop (https://app.netlify.com/drop).

### Įprastas hostingas (cPanel, FTP, VPS)
Įkelkite **visą katalogo turinį** į `public_html` (arba domeno šaknį).
Svarbu: `index.html`, `sw.js` ir `manifest.webmanifest` turi likti **šaknyje**, kitaip
neveiks PWA. Įjunkite HTTPS — be jo neveikia service worker ir „Add to Home Screen“.

Serveryje rekomenduojama:
- `Cache-Control: public, max-age=31536000, immutable` — `/public/**`, `/src/**`
- `Cache-Control: no-cache` — `index.html`, `sw.js`, `manifest.webmanifest`

> `serve.json` yra tik vietiniam kūrimui (išjungia talpyklą) — gamybai jis nieko nedaro.

### GitHub Pages
Repozitorijoje: **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`**.
Po kelių minučių svetainė pasiekiama adresu `https://<vartotojas>.github.io/ozasmotors/`.

> Visi keliai svetainėje yra **santykiniai**, todėl ji vienodai veikia ir domeno šaknyje
> (`ozasmotors.lt`), ir subkataloge (`.../ozasmotors/`). Nekeiskite jų į `/src/...` —
> tada subkataloge nustotų veikti stiliai, JS ir PWA.
>
> `canonical` sąmoningai rodo į `https://ozasmotors.lt/`, todėl Google indeksuos tikrąjį
> domeną, o ne GitHub Pages peržiūrą. Perkėlus svetainę į realų domeną nieko keisti nereikia.

---

## 4. Ką reikia pakeisti prieš paleidžiant

Beveik viskas yra **viename faile: `src/js/config.js`**.

| Kintamasis | Kur | Ką įrašyti |
|---|---|---|
| `PHONE_NUMBER` | `config.js → CONTACTS.phone` | `+37060000000` (be tarpų, tarptautinis formatas) |
| | `config.js → CONTACTS.phoneDisplay` | Kaip rodyti ekrane: `+370 600 00000` |
| `EMAIL` | `config.js → CONTACTS.email` | `info@ozasmotors.lt` |
| `WHATSAPP_LINK` | `config.js → CONTACTS.whatsapp` | `https://wa.me/370...` |
| `VIBER_LINK` | `config.js → CONTACTS.viber` | `viber://chat?number=%2B370...` |
| `TELEGRAM_LINK` | `config.js → CONTACTS.telegram` | `https://t.me/...` |
| `INSTAGRAM_LINK` | `config.js → CONTACTS.instagram` | `https://instagram.com/...` |
| `FACEBOOK_LINK` | `config.js → CONTACTS.facebook` | `https://facebook.com/...` |
| `GA_MEASUREMENT_ID` | `config.js → ANALYTICS.ga4` | `G-XXXXXXXXXX` |
| `META_PIXEL_ID` | `config.js → ANALYTICS.metaPixel` | Pixel ID |
| Backend adresas | `config.js → FORM.endpoint` | `/api/leads` arba kitas URL |
| Domenas | `config.js → SITE.url` | `https://ozasmotors.lt` |

Jei kurios nors socialinės nuorodos neturite — palikite tuščią eilutę `''`, ir
mygtukas svetainėje nebus rodomas.

Papildomai, jei keičiasi domenas, pakeiskite `https://ozasmotors.lt` į savo:
`index.html` (canonical, Open Graph, Schema.org), `sitemap.xml`, `robots.txt`
ir teisinių puslapių `canonical`.

### Teisiniai duomenys
`privatumo-politika.html` ir `naudojimosi-salygos.html` turi aiškiai pažymėtus laukus:
`[ĮMONĖS KODAS]`, `[PVM KODAS]`, `[EMAIL]`, `[PHONE_NUMBER]`, `[SAUGOJIMO TERMINAS]`.
Jie vizualiai paryškinti raudonai — pakeiskite visus prieš paleidžiant.
Teisinių rekvizitų nesugalvojome — juos reikia įrašyti patiems.

### Atsiliepimai
`index.html` → `<section id="atsiliepimai" hidden>`. Realių atsiliepimų neišgalvojome.
Įrašykite tikrus atsiliepimus ir pašalinkite `hidden` atributą — blokas atsiras.

---

## 5. Formos prijungimas prie backend'o

Visa siuntimo logika — **viename faile `src/js/api.js`**, funkcijoje `submitLead()`.
Forma su serveriu nebendrauja niekaip kitaip.

1. `config.js → FORM.endpoint = '/api/leads'`
2. Serveris priima `POST` `multipart/form-data`:
   - `payload` — JSON su `{ car, contact, notes, meta }`
   - `photos[0..n]` — nuotraukų failai
   - `videos[0..n]` — vaizdo įrašai
3. Sėkmės atveju grąžinti `2xx` ir (nebūtinai) `{"id":"..."}`.

Kol `FORM.endpoint` tuščias, forma veikia demo režimu: viskas validuojama ir rodomas
sėkmės ekranas, bet niekas nesiunčiama (užklausa atspausdinama naršyklės konsolėje).

Paprasčiausi variantai be savo serverio: Formspree, Web3Forms, Netlify Forms,
Vercel Serverless Function (`/api/leads.js`).

---

## 6. SEO checklist — kas jau padaryta

- [x] `<html lang="lt">`, visas turinys lietuvių kalba
- [x] Unikalus `<title>` su pagrindiniu raktažodžiu ir prekės ženklu
- [x] `meta description` (~160 simbolių), `meta keywords`, `author`, `robots`
- [x] `canonical` visuose puslapiuose
- [x] Open Graph (`og:title/description/image/url/locale/site_name`) + `og:image` 1200×1200
- [x] Twitter/X card (`summary_large_image`)
- [x] Schema.org JSON-LD: `WebSite`, `AutomotiveBusiness` + `LocalBusiness` + `Organization`
      (adresas, telefonas, darbo laikas, `areaServed`), `FAQPage` su visais 8 klausimais
- [x] Semantinis HTML: `header / main / section / article / nav / footer`, `fieldset`+`legend`
- [x] Viena `<h1>`, logiška `h2`/`h3` hierarchija
- [x] `alt` tekstai visoms prasminėms nuotraukoms, dekoratyvinės pažymėtos `aria-hidden`
- [x] `robots.txt` su `Sitemap:` nuoroda
- [x] `sitemap.xml` su visais 4 puslapiais
- [x] Vietinis SEO: `automobilių supirkimas Vilniuje`, `auto supirkimas`,
      `automobilio įvertinimas`, `greitas automobilių supirkimas` — natūraliai tekste,
      be perkrovimo raktažodžiais
- [x] Adresas (NAP) vienodai užrašytas visoje svetainėje ir Schema.org

**Ką dar reikia padaryti jums:** pridėti svetainę į Google Search Console,
patvirtinti `sitemap.xml`, susikurti/atnaujinti Google Business Profile su tuo pačiu adresu.

## 7. PWA checklist — kas jau padaryta

- [x] `manifest.webmanifest`: `name`, `short_name` („OZASMOTORS“), `id`, `scope`,
      `start_url`, `lang: lt`, `categories`
- [x] `display: standalone` + `display_override`
- [x] `theme_color` ir `background_color` `#0a0a0b` (vientisas paleidimo ekranas)
- [x] Ikonos: 192, 512, 180 (apple-touch-icon), 32 (favicon) + atskira **maskable** 512
      su saugia zona (Android apvalūs/adaptyvūs kaukių formatai)
- [x] iOS: `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`,
      `status-bar-style: black-translucent`, `viewport-fit=cover`, `env(safe-area-inset-*)`
- [x] Service worker (`sw.js`): precache pagrindinių resursų, HTML — network-first,
      statika — stale-while-revalidate, video — visada iš tinklo
- [x] Offline atsarginis puslapis `offline.html` su mygtuku skambinti
- [x] App shortcuts: „Pateikti automobilį“ ir „Kontaktai“ (ilgas paspaudimas ant ikonos)
- [x] Service worker nekraunamas `localhost` — netrukdo kuriant

> Atnaujinus CSS/JS **pakeiskite `VERSION` konstantą `sw.js` faile** (pvz. `ozm-v2`)
> ir `?v=` numerį `index.html` nuorodose — taip lankytojai gaus naują versiją iš karto.

## 8. Greitis

- Nulis JS priklausomybių, ~20 KB savo JS (nesuspausto)
- Šriftai kraunami neblokuojančiai (`media="print" onload`), su `preconnect` ir `<noscript>` atsarga
- Hero video `preload="none"`, paleidžiamas tik po `canplay`; pauzė, kai nematomas
- Video visiškai nekraunamas, jei įjungtas `prefers-reduced-motion` arba `saveData`
- Hero fallback nuotrauka `preload` + `fetchpriority="high"` (LCP)
- Visi `img`/`video` turi `width`/`height` → nėra CLS
- Nuotraukos žemiau pirmo ekrano — `loading="lazy" decoding="async"`
- Google Maps `iframe` kraunamas tik paspaudus arba po sutikimo
- Animuojami tik `transform` ir `opacity`

**Rekomenduojama padaryti prieš paleidžiant:** suspausti `public/videos/hero.mp4`
(dabar 2,1 MB) ir pridėti WebM versiją:
```bash
ffmpeg -i hero.mp4 -vf scale=-2:720 -c:v libx264 -crf 28 -preset slow -an hero-opt.mp4
ffmpeg -i hero.mp4 -vf scale=-2:720 -c:v libvpx-vp9 -crf 34 -b:v 0 -an hero.webm
```

## 9. Prieinamumas

- Kontrastas atitinka WCAG AA (baltas ant `#0a0a0b`, raudonas `#e6151e` tik su baltu tekstu)
- Matomi `:focus-visible` kontūrai, „Pereiti prie anketos“ nuoroda klaviatūrai
- Visi formos laukai turi `<label>`, radio grupės — `role="radiogroup"` + `aria-labelledby`
- Klaidos rodomos šalia lauko + `aria-invalid`; jokių `alert()`
- Formos žingsnių keitimas skelbiamas ekrano skaitytuvui (`aria-live`)
- DUK — tikri `<button aria-expanded>` + `role="region"`
- Visi mygtukai ≥ 44–58 px aukščio
- `prefers-reduced-motion` išjungia visas animacijas ir hero video

## 10. Struktūra

```
ozasmotors/
├── index.html                  # pagrindinis puslapis
├── privatumo-politika.html
├── slapuku-politika.html
├── naudojimosi-salygos.html
├── offline.html                # PWA offline atsarginis
├── manifest.webmanifest
├── sw.js                       # service worker
├── robots.txt
├── sitemap.xml
├── serve.json                  # tik vietiniam kūrimui
├── package.json
├── public/
│   ├── images/                 # logotipas, ofiso nuotrauka, hero kadras, OG
│   ├── videos/hero.mp4
│   └── icons/                  # PWA ikonos
└── src/
    ├── styles/main.css
    └── js/
        ├── config.js           # ← visi keičiami duomenys
        ├── main.js             # header, meniu, animacijos, DUK, slapukai, žemėlapis
        ├── form.js             # daugiapakopė anketa + validacija + localStorage
        ├── uploads.js          # nuotraukų/video įkėlimas, peržiūra, limitai
        ├── api.js              # submitLead() — vienintelis ryšys su serveriu
        └── analytics.js        # GA4 / Meta Pixel + track()
```

## 11. Sekami įvykiai (`track()` iš `analytics.js`)

`cta_header`, `cta_hero_primary`, `cta_hero_call`, `cta_band`, `cta_contacts`,
`cta_mobile_menu`, `form_start`, `form_step_complete` (su žingsnio numeriu),
`photos_added`, `video_added`, `lead_submit`, `tel_click`, `email_click`,
`whatsapp_click`, `viber_click`, `telegram_click`, `instagram_click`,
`facebook_click`, `navigate_click`, `faq_open`, `sticky_call`, `sticky_whatsapp`,
`sticky_form`.

Kol GA4/Pixel ID nenurodyti, įvykiai tik spausdinami naršyklės konsolėje —
prijungus ID jie pradeda eiti automatiškai, kodo keisti nereikia.

## 12. Duomenų apsauga

Naršyklės `localStorage` saugomi **tik automobilio duomenys** (markė, modelis, metai,
rida, kuras, dėžė, būklė, kaina, pastabos), kad vartotojas neprarastų anketos perkrovęs
puslapį. Vardas, telefonas ir el. paštas **nesaugomi** — jie egzistuoja tik iki išsiuntimo.
Sėkmingai išsiuntus, išsaugoti duomenys ištrinami.
