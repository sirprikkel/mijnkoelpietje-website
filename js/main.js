// ═══════════════════════════════════════════════════════════
// MijnKoelPietje — Hoofd JavaScript
// ═══════════════════════════════════════════════════════════

// ─── Instellingen ─────────────────────────────────────────────────
// Reacties onder de verhalen. Op verzoek van de klant uitgezet.
// Op true zetten om ze weer te tonen; de code en de reacties die al in
// de database staan blijven bewaard. Let op: bij weer aanzetten ook de
// teksten in index.html terugzetten (cookiebanner + disclaimer).
const REACTIES_AAN = false;

// ─── Tekst cleanup — strip per ongeluk ingevoerde formaatwoorden ──
function cleanTekst(txt) {
  if (!txt) return '';
  return txt.replace(/^(staand|liggend|vierkant|none|None)\s*/gi, '').trim();
}

// ─── Link helper — zorgt voor correcte URL en geeft HTML-link terug ──
function linkHTML(url, kleur) {
  if (!url) return '';
  const href = url.match(/^https?:\/\//) ? url : 'https://' + url;
  return `<a href="${href}" target="_blank" rel="noopener" class="mono text-xs mt-2 inline-block" style="color:${kleur || 'var(--geel)'};">Meer info \u2192</a>`;
}

// ─── Markdown naar HTML converter ────────────────────────────────
function renderMarkdown(txt) {
  if (!txt) return '';
  const schoon = cleanTekst(txt);
  // Als de tekst al HTML bevat (bijv. <p> tags), geef het direct terug
  if (schoon.match(/<(p|div|blockquote|h[1-6]|ul|ol|li|em|strong)\b/i)) {
    return schoon;
  }
  // Converteer **~~kopje~~** patroon naar h3 heading (CMS-compatibiliteit)
  const processed = schoon.replace(/\*\*~~([^~]+)~~\*\*/g, '### $1');
  // Anders: parse als Markdown via marked.js
  if (typeof marked !== 'undefined') {
    return marked.parse(processed);
  }
  // Fallback als marked.js niet geladen is
  return processed.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
}

// ─── Afbeelding formaat helper ────────────────────────────────────
// Vaste beeldhoogte per weergave, met de foto er volledig in gepast
// (object-fit: contain). Zo blijven de kaarten netjes uitgelijnd terwijl er
// niets wordt bijgesneden. Voorheen stond hier een handmatig CMS-veld
// 'afbeelding_formaat', maar dat klopte bij een derde van de verhalen niet.
function beeldHoogte(standaardHoogte) {
  return standaardHoogte + 'px';
}



// ─── Fotolijst van een product ────────────────────────────────────
// Hoofdafbeelding altijd eerst, daarna de extra foto's uit het CMS.
// Werkt ook als 'fotos' ontbreekt — dan is de lijst simpelweg 1 foto.
function productFotos(k) {
  const lijst = [];
  if (typeof k.afbeelding === 'string' && k.afbeelding) lijst.push(k.afbeelding);
  (k.fotos || []).forEach(f => {
    // Sveltia levert paden als string. Mocht een CMS ooit objecten opleveren
    // ({afbeelding: '...'}), dan pakken we het pad eruit i.p.v. het object.
    const pad = typeof f === 'string' ? f : (f && (f.afbeelding || f.image || f.src));
    if (typeof pad === 'string' && pad && !lijst.includes(pad)) lijst.push(pad);
  });
  return lijst;
}

// ─── Supabase configuratie ────────────────────────────────────────
const SUPABASE_URL  = 'https://nwufmlayvaofmjetacfd.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dWZtbGF5dmFvZm1qZXRhY2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5ODYzMjksImV4cCI6MjA5MDU2MjMyOX0._TUyvaHByhC0BeOpwt9Z9pFLEN0o0yi3c13lsvd76Kg';
let sbClient = null;
try {
  if (typeof supabase !== 'undefined' && SUPABASE_URL !== 'JOUW_SUPABASE_URL_HIER') {
    sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('[MijnKoelPietje] Supabase verbonden');
  } else {
    console.warn('[MijnKoelPietje] Supabase NIET beschikbaar — typeof supabase:', typeof supabase);
  }
} catch(e) {
  console.error('[MijnKoelPietje] Supabase init fout:', e);
}

// ─── Likes ────────────────────────────────────────────────────────
async function laadLikes(verhaalId) {
  if (!sbClient) { console.warn('[MijnKoelPietje] Geen sbClient voor likes'); return 0; }
  try {
    const { count, error: countErr } = await sbClient.from('likes').select('*', { count: 'exact', head: true }).eq('verhaal_id', verhaalId);
    console.log('[MijnKoelPietje] Likes voor', verhaalId, ':', count, countErr ? 'ERROR: ' + countErr.message : 'OK');
    if (!countErr && count !== null) return count;
    const { data, error } = await sbClient.from('likes').select('*').eq('verhaal_id', verhaalId);
    if (error) { console.error('[MijnKoelPietje] Likes fallback mislukt:', error.message); return 0; }
    console.log('[MijnKoelPietje] Likes fallback voor', verhaalId, ':', data?.length);
    return (data || []).length;
  } catch(e) { console.error('[MijnKoelPietje] Likes exception:', e); return 0; }
}

async function stemLike(verhaalId) {
  const sleutel = 'like_' + verhaalId;
  if (localStorage.getItem(sleutel)) return;
  if (sbClient) {
    await sbClient.from('likes').insert({ verhaal_id: verhaalId, type: 'groen' });
  }
  localStorage.setItem(sleutel, 'like');
  renderLikeKnop(verhaalId);
}

async function renderLikeKnop(verhaalId) {
  const el = document.getElementById('like-sectie-' + verhaalId);
  if (!el) return;
  let totaal = await laadLikes(verhaalId);
  const gestemd = localStorage.getItem('like_' + verhaalId);

  el.innerHTML = `
    <div style="margin-top:2.5rem;padding:1rem 1.5rem;background:var(--grijs);border-radius:12px;border:1px solid rgba(245,196,0,0.1);display:flex;align-items:center;gap:1rem;">
      <button onclick="stemLike('${verhaalId}')" style="background:none;border:none;cursor:${gestemd ? 'default' : 'pointer'};padding:0;display:flex;align-items:center;gap:0.5rem;min-height:44px;" ${gestemd ? '' : 'onmouseenter="this.style.opacity=\'0.7\'" onmouseleave="this.style.opacity=\'1\'"'}>
        <span style="font-size:1.4rem;">${gestemd ? '\u2764\uFE0F' : '\u2661'}</span>
        <span class="mono text-lg" style="color:var(--geel);">${totaal}</span>
      </button>
      <span class="mono text-xs text-gray-600">${gestemd ? 'Bedankt voor je stem!' : 'Vond je dit verhaal mooi? Geef een like!'}</span>
    </div>
  `;
}

// ─── Reacties ────────────────────────────────────────────────────
async function laadReacties(verhaalId) {
  if (!sbClient) return [];
  const { data } = await sbClient.from('reactions')
    .select('naam, tekst, datum')
    .eq('verhaal_id', verhaalId)
    .order('datum', { ascending: true });
  return data || [];
}

async function renderReacties(verhaalId) {
  if (!REACTIES_AAN) return;   // uitgezet: niets tonen, ook niets ophalen
  const el = document.getElementById('reacties-sectie-' + verhaalId);
  if (!el) return;
  const reacties = await laadReacties(verhaalId);

  const lijst = reacties.length === 0
    ? '<p class="text-gray-600 text-sm">Nog geen reacties. Wees de eerste!</p>'
    : reacties.map(r => `
        <div style="border-left:2px solid rgba(245,196,0,0.3);padding-left:1rem;margin-bottom:1.5rem;">
          <div class="mono text-xs mb-1" style="color:rgba(245,196,0,0.7);">${r.naam} <span class="text-gray-600">\u00b7 ${new Date(r.datum).toLocaleDateString('nl-NL')}</span></div>
          <p class="text-gray-400 text-sm leading-relaxed">${r.tekst.replace(/</g,'&lt;')}</p>
        </div>`).join('');

  el.innerHTML = `
    <div style="margin-top:3rem;">
      <div class="mono text-xs tracking-widest uppercase mb-6" style="color:rgba(245,196,0,0.6);">Reacties (${reacties.length})</div>
      <div class="mb-8">${lijst}</div>
      <div class="kaart p-6">
        <div class="mono text-xs tracking-widest uppercase mb-4" style="color:rgba(245,196,0,0.6);">Laat een reactie achter</div>
        <div class="flex flex-col gap-4">
          <input id="reactie-naam-${verhaalId}" type="text" placeholder="Jouw naam" class="zoek-input" maxlength="80" />
          <textarea id="reactie-tekst-${verhaalId}" placeholder="Jouw reactie..." class="zoek-input" rows="4" style="resize:vertical;" maxlength="1000"></textarea>
          <button onclick="verstuurReactie('${verhaalId}')" class="btn-geel" style="align-self:flex-start;">Reactie plaatsen</button>
        </div>
      </div>
    </div>
  `;
}

async function verstuurReactie(verhaalId) {
  if (!REACTIES_AAN) return;   // extra slot: ook niet via de console opslaan
  const naam  = document.getElementById('reactie-naam-'  + verhaalId)?.value.trim();
  const tekst = document.getElementById('reactie-tekst-' + verhaalId)?.value.trim();
  if (!naam || !tekst) { alert('Vul je naam en reactie in.'); return; }
  if (sbClient) {
    const { error } = await sbClient.from('reactions').insert({ verhaal_id: verhaalId, naam, tekst });
    if (error) { alert('Er ging iets mis. Probeer het later opnieuw.'); return; }
  }
  renderReacties(verhaalId);
}

// ─── Content Loader (dynamisch uit JSON) ──────────────────────────
let verhalen = {};
// Tweede index op slug. verhalen[] blijft gesleuteld op titel, want die sleutel
// is ook de verhaal_id in Supabase (likes/reacties) - die mag niet verschuiven.
let slugNaarVerhaal = {};
let slugNaarProduct = {};   // idem voor de shop
let kunstwerken = [];
let nieuwsItems = [];
let sponsoren = [];

const rubriekConfig = {
  'ondergronds': { label: 'Ondergronds', kleur: '#f5c400', bg: 'rgba(245,196,0,0.15)' },
  'bovengronds': { label: 'Bovengronds', kleur: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  'de-sporen':   { label: 'De Sporen',   kleur: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  'knipoog':     { label: 'Knipoog',     kleur: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  'de-stem':     { label: 'De Stem',     kleur: '#a855f7', bg: 'rgba(168,85,247,0.15)' }
};

async function laadContent() {
  try {
    await Promise.all([
      laadVerhalen(),
      laadKunstwerken(),
      laadNieuws(),
      laadSponsoren(),
      laadActiviteiten(),
      laadBundel()
    ]);
  } catch(e) {
    console.log('Content laden via directe fetch...');
    await laadVerhalen();
    await laadKunstwerken();
    await laadNieuws();
    await laadSponsoren();
    await laadActiviteiten();
    await laadBundel();
  }
  // Re-init scroll reveals zodat dynamisch geladen kaarten ook zichtbaar worden
  initScrollReveals();
}

async function fetchJSON(url) {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    return await r.json();
  } catch(e) { return null; }
}

async function laadVerhalen() {
  verhalen = {};
  slugNaarVerhaal = {};
  try {
    const r = await fetch('/content/verhalen/index.json');
    if (r.ok) {
      const idx = await r.json();
      const results = await Promise.all(idx.map(slug => fetchJSON(`/content/verhalen/${slug}.json`)));
      results.forEach((v, i) => {
        if (!v) return;
        if (!v.id) v.id = v.titel || 'onbekend';
        v.slug = idx[i];                       // Promise.all bewaart de volgorde
        verhalen[v.id] = v;
        if (v.slug) {
          slugNaarVerhaal[v.slug] = v;
          // Ook op de padveilige variant, want dat is wat er in de URL staat.
          slugNaarVerhaal[padVeilig(v.slug)] = v;
        }
      });
    }
  } catch(e) { console.log('[MijnKoelPietje] Verhalen laden mislukt:', e); }
  renderVerhalenGrid();
  renderVerhalenPreview();
  renderGalerij();
}

// Sorteert de shop op het CMS-veld 'volgorde' (laag getal bovenaan). Producten
// zonder volgorde komen achteraan, onderling op titel, zodat een nieuw product
// nooit onaangekondigd bovenaan springt.
function sorteerKunstwerken(lijst) {
  const nummer = k => {
    const n = parseInt(k && k.volgorde, 10);
    return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
  };
  // slice(): niet de meegegeven array muteren.
  return lijst.slice().sort((a, b) => {
    const verschil = nummer(a) - nummer(b);
    if (verschil !== 0) return verschil;
    return String(a.titel || '').localeCompare(String(b.titel || ''), 'nl');
  });
}

async function laadKunstwerken() {
  kunstwerken = [];
  try {
    const r = await fetch('/content/kunstwerken/index.json');
    if (r.ok) {
      const idx = await r.json();
      const results = await Promise.all(idx.map(slug => fetchJSON(`/content/kunstwerken/${slug}.json`)));
      // Slug eerst koppelen (results loopt gelijk op met idx), dan pas filteren.
      results.forEach((k, i) => { if (k) k.slug = idx[i]; });
      kunstwerken = results.filter(k => k).map(k => { if (!k.id) k.id = k.titel || 'onbekend'; return k; });
      // Volgorde uit het CMS. Hier sorteren en niet in renderShop(), want
      // openProduct() werkt op de array-index - die moet dus al kloppen.
      kunstwerken = sorteerKunstwerken(kunstwerken);
      // Pas na het sorteren indexeren: de router heeft de index in de
      // gesorteerde array nodig, want openProduct() werkt daarop.
      slugNaarProduct = {};
      kunstwerken.forEach((k, i) => { if (k.slug) slugNaarProduct[padVeilig(k.slug)] = i; });
    }
  } catch(e) { console.log('[MijnKoelPietje] Kunstwerken laden mislukt:', e); }
  renderShop();
  renderShopPreview();
}

async function laadNieuws() {
  nieuwsItems = [];
  try {
    const r = await fetch('/content/nieuws/index.json');
    if (r.ok) {
      const idx = await r.json();
      const results = await Promise.all(idx.map(slug => fetchJSON(`/content/nieuws/${slug}.json`)));
      nieuwsItems = results.filter(n => n).map(n => { if (!n.id) n.id = n.titel || 'onbekend'; return n; });
      nieuwsItems.sort((a, b) => parseNLDatum(b.datum) - parseNLDatum(a.datum));
    }
  } catch(e) { console.log('[MijnKoelPietje] Nieuws laden mislukt:', e); }
  renderNieuws();
}

async function laadSponsoren() {
  sponsoren = [];
  try {
    const r = await fetch('/content/sponsoren/index.json');
    if (r.ok) {
      const idx = await r.json();
      const results = await Promise.all(idx.map(id => fetchJSON(`/content/sponsoren/${id}.json`)));
      sponsoren = results.filter(s => s && (s.id || s.naam));
    }
  } catch(e) {}
  renderSponsoren();
}

let activiteiten = [];

async function laadActiviteiten() {
  activiteiten = [];
  try {
    const r = await fetch('/content/activiteiten/index.json');
    if (r.ok) {
      const idx = await r.json();
      const results = await Promise.all(idx.map(slug => fetchJSON(`/content/activiteiten/${slug}.json`)));
      activiteiten = results.filter(a => a && a.titel);
    }
  } catch(e) { console.log('[MijnKoelPietje] Activiteiten laden mislukt:', e); }
  renderActiviteiten();
}

const typeKleuren = {
  'Tentoonstelling': { bg: 'rgba(245,196,0,0.12)', kleur: 'var(--geel)' },
  'Lezing': { bg: 'rgba(59,130,246,0.12)', kleur: '#60a5fa' },
  'Workshop': { bg: 'rgba(16,185,129,0.12)', kleur: '#34d399' },
  'Evenement': { bg: 'rgba(168,85,247,0.12)', kleur: '#a855f7' },
  'Anders': { bg: 'rgba(245,196,0,0.12)', kleur: 'var(--geel)' }
};

function renderActiviteiten() {
  const grid = document.getElementById('activiteiten-grid');
  if (!grid) return;
  if (activiteiten.length === 0) {
    grid.innerHTML = '<p class="text-gray-600 text-center py-8">Er zijn momenteel geen activiteiten gepland.</p>';
    return;
  }
  grid.innerHTML = '';
  activiteiten.forEach(a => {
    const tc = typeKleuren[a.type] || typeKleuren['Anders'];
    const kaart = document.createElement('div');
    kaart.className = 'kaart overflow-hidden';
    const heeftAfb = a.afbeelding && a.afbeelding.length > 0;
    kaart.innerHTML = `
      <div class="flex flex-col md:flex-row">
        ${heeftAfb ? `<div class="relative overflow-hidden md:w-64 shrink-0" style="min-height:180px;background:linear-gradient(135deg,#1a1400,#0a0a0a);"><img src="${a.afbeelding}" alt="${a.titel}" style="width:100%;height:100%;object-fit:cover;opacity:0.75;" /></div>` : ''}
        <div class="p-6 sm:p-8 flex-1" style="border-left:3px solid ${tc.kleur};">
          <span class="rubriek-tag" style="background:${tc.bg};color:${tc.kleur};">${a.type || 'Evenement'}</span>
          <h2 style="font-family:'Poiret One',sans-serif;font-weight:400;" class="text-xl mt-2 mb-2">${a.titel}</h2>
          <p class="text-gray-400 text-sm leading-relaxed mb-3">${cleanTekst(a.beschrijving) || ''}</p>
          ${a.locatie ? `<div class="mono text-xs text-gray-600 mb-3">${a.locatie}</div>` : ''}
          <div class="mono text-xs" style="color:${tc.kleur};">${a.datum || ''}</div>
          ${linkHTML(a.link, tc.kleur)}
        </div>
      </div>`;
    grid.appendChild(kaart);
  });
}

// ─── Bundel ──────────────────────────────────────────────────────
let bundelData = null;

async function laadBundel() {
  try {
    bundelData = await fetchJSON('/content/shop-instellingen/bundel.json');
  } catch(e) { console.log('[MijnKoelPietje] Bundel laden mislukt:', e); }
}

function renderBundel(grid) {
  if (!bundelData || bundelData.tonen === false) return;
  const b = bundelData;
  const bundelKaart = document.createElement('div');
  bundelKaart.className = 'kaart md:col-span-2 lg:col-span-3';
  bundelKaart.style.borderColor = 'rgba(245,196,0,0.25)';
  bundelKaart.innerHTML = `
    <div class="p-8 flex flex-col md:flex-row items-center gap-8">
      <div class="text-center md:text-left flex-1">
        <div class="mono text-xs mb-2 uppercase tracking-widest" style="color:rgba(245,196,0,0.7);">${b.label || ''}</div>
        <h3 style="font-family:'Poiret One',sans-serif;font-weight:400;" class="text-2xl mb-2">${b.titel}</h3>
        <p class="text-gray-500 mb-4 text-sm">${b.beschrijving || ''}</p>
        <div class="flex items-center gap-4 flex-wrap">
          <span class="text-2xl font-bold" style="color:var(--geel);">\u20ac ${b.prijs},\u2013</span>
          ${b.oude_prijs ? `<span class="text-gray-600 line-through text-sm">\u20ac ${b.oude_prijs},\u2013</span>` : ''}
          ${b.korting ? `<span class="mono text-xs px-2 py-1 rounded-full" style="background:rgba(245,196,0,0.12);color:var(--geel);">${b.korting}</span>` : ''}
        </div>
      </div>
      ${b.mollie_link
        ? `<a href="${b.mollie_link}" target="_blank" class="btn-geel text-base px-8 py-3 whitespace-nowrap">${b.knop_tekst || 'Bundel kopen'}</a>`
        : `<button class="btn-geel text-base px-8 py-3 whitespace-nowrap" onclick="contactKopen('${b.titel}')">${b.knop_tekst || 'Bundel kopen'}</button>`
      }
    </div>`;
  grid.appendChild(bundelKaart);
}

// ─── Render functies ──────────────────────────────────────────

function parseNLDatum(d) {
  if (!d) return 0;
  const maanden = {januari:0,februari:1,maart:2,april:3,mei:4,juni:5,juli:6,augustus:7,september:8,oktober:9,november:10,december:11};
  const delen = d.trim().split(/\s+/);
  if (delen.length >= 2) {
    const dag = parseInt(delen[0]);
    const maand = maanden[delen[1].toLowerCase()];
    const jaar = delen.length >= 3 ? parseInt(delen[2]) : new Date().getFullYear();
    if (!isNaN(dag) && maand !== undefined && !isNaN(jaar)) return new Date(jaar, maand, dag).getTime();
  }
  return 0;
}

function verhalenGesorteerd() {
  return Object.values(verhalen).sort((a, b) => parseNLDatum(b.datum) - parseNLDatum(a.datum));
}

function renderVerhalenGrid() {
  const grid = document.getElementById('verhalen-grid');
  if (!grid) return;
  grid.innerHTML = '';
  verhalenGesorteerd().forEach(v => {
    const cfg = rubriekConfig[v.rubriek] || { label: v.rubriek, kleur: '#f5c400', bg: 'rgba(245,196,0,0.15)' };
    const kaart = document.createElement('div');
    kaart.className = 'kaart overflow-hidden';
    kaart.dataset.rubriek = v.rubriek;
    kaart.dataset.tags = (v.intro || '') + ' ' + (v.titel || '');
    const parsed = parseNLDatum(v.datum);
    kaart.dataset.jaar = parsed ? new Date(parsed).getFullYear() : '';
    kaart.setAttribute('role', 'listitem');
    kaart.onclick = () => openVerhaal(v.id);
    const heeftAfb = v.afbeelding && v.afbeelding.length > 0;
    kaart.innerHTML = `
      ${heeftAfb ? `<div class="relative overflow-hidden" style="height:${beeldHoogte(220)};background:linear-gradient(135deg,#1a1400,#0a0a0a);"><img src="${v.afbeelding}" alt="${v.titel}" style="width:100%;height:100%;object-fit:contain;opacity:0.75;" /></div>` : ''}
      <div style="height:3px;background:${cfg.kleur};width:100%;"></div>
      <div class="p-6">
        <span class="rubriek-tag" style="background:${cfg.bg};color:${cfg.kleur};">${cfg.label}</span>
        <h3 class="font-bold text-lg mt-3 mb-2">${v.titel}</h3>
        <p class="text-gray-500 text-sm leading-relaxed">${cleanTekst(v.intro)}</p>
        ${v.link ? linkHTML(v.link, cfg.kleur) : `<div class="mt-4 text-xs mono" style="color:${cfg.kleur};">Lees meer \u2192</div>`}
      </div>`;
    grid.appendChild(kaart);
  });
}

// ─── Galerij — uitgelichte afbeeldingen, klik opent het verhaal ──
function renderGalerij() {
  const grid = document.getElementById('galerij-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const items = verhalenGesorteerd().filter(v => v.uitgelicht && v.afbeelding);

  if (items.length === 0) {
    grid.innerHTML = `<p class="text-gray-500 w-full text-center py-12">Er zijn nog geen afbeeldingen uitgelicht voor de galerij.</p>`;
    return;
  }

  items.forEach(v => {
    const cfg = rubriekConfig[v.rubriek] || { label: v.rubriek, kleur: '#f5c400', bg: 'rgba(245,196,0,0.15)' };

    // Wrapper is het kolomkind van de masonry en draagt .reveal, zodat de
    // reveal-transform en de hover-lift van .kaart elkaar niet overschrijven.
    const item = document.createElement('div');
    item.className = 'galerij-item reveal';

    // <button> i.p.v. <div>: toetsenbord en screenreader werken dan vanzelf
    const tegel = document.createElement('button');
    tegel.type = 'button';
    tegel.className = 'kaart overflow-hidden relative block w-full p-0 text-left galerij-tegel';
    tegel.setAttribute('aria-label', 'Lees het verhaal: ' + v.titel);
    tegel.onclick = () => openVerhaalUitGalerij(v.id);

    // Titels bevatten aanhalingstekens en emoji — daarom via DOM-properties
    // opbouwen i.p.v. innerHTML, zodat escaping vanzelf goed gaat.
    const beeld = document.createElement('div');
    beeld.className = 'galerij-beeld';

    const img = document.createElement('img');
    img.alt = v.titel;
    img.loading = 'lazy';

    // De verhouding lezen we uit de foto zelf. Tot die binnen is houdt
    // .galerij-beeld zijn 3/4-plaatshouder aan, zodat er niets verspringt.
    const zetVerhouding = () => {
      if (img.naturalWidth && img.naturalHeight) {
        beeld.style.aspectRatio = img.naturalWidth + ' / ' + img.naturalHeight;
      }
    };
    img.addEventListener('load', zetVerhouding);
    // Bij een gebroken foto de plaatshouderverhouding laten staan, anders
    // klapt de tegel dicht en springt de kolomverdeling.
    img.addEventListener('error', () => { img.style.display = 'none'; });
    img.src = v.afbeelding;
    // Stond de foto al in de cache, dan is 'load' mogelijk al geweest.
    if (img.complete) zetVerhouding();

    beeld.appendChild(img);

    const overlay = document.createElement('div');
    overlay.className = 'galerij-overlay';

    const rubriek = document.createElement('div');
    rubriek.className = 'mono text-xs uppercase mb-1';
    rubriek.style.color = cfg.kleur;
    rubriek.textContent = cfg.label;

    const titel = document.createElement('div');
    titel.className = 'text-sm leading-snug';
    titel.textContent = v.titel;

    overlay.appendChild(rubriek);
    overlay.appendChild(titel);
    beeld.appendChild(overlay);

    tegel.appendChild(beeld);
    item.appendChild(tegel);
    grid.appendChild(item);
  });
}

function renderVerhalenPreview() {
  const grid = document.getElementById('verhalen-preview');
  if (!grid) return;
  const vArr = verhalenGesorteerd().slice(0, 3);
  if (vArr.length === 0) return;
  grid.innerHTML = '';
  vArr.forEach(v => {
    const cfg = rubriekConfig[v.rubriek] || { label: v.rubriek, kleur: '#f5c400', bg: 'rgba(245,196,0,0.15)' };
    const heeftAfb = v.afbeelding && v.afbeelding.length > 0;
    const kaart = document.createElement('div');
    kaart.className = 'kaart reveal overflow-hidden';
    kaart.style.cursor = 'pointer';
    kaart.onclick = () => { toonSectie('verhalen'); openVerhaal(v.id); };
    kaart.innerHTML = `
      ${heeftAfb ? `<div class="relative overflow-hidden" style="height:${beeldHoogte(220)};background:linear-gradient(135deg,#1a1400,#0a0a0a);"><img src="${v.afbeelding}" alt="${v.titel}" style="width:100%;height:100%;object-fit:contain;opacity:0.75;" /></div>` : ''}
      <div style="height:3px;background:${cfg.kleur};width:100%;"></div>
      <div class="p-6">
        <span class="rubriek-tag" style="background:${cfg.bg};color:${cfg.kleur};">${cfg.label}</span>
        <h3 style="font-family:'Poiret One',sans-serif;font-weight:400;" class="text-xl mt-3 mb-2">${v.titel}</h3>
        <p class="text-gray-500 text-sm leading-relaxed">${cleanTekst(v.intro)}</p>
        <div class="mt-4 mono text-xs" style="color:${cfg.kleur};">Lees meer \u2192</div>
      </div>`;
    grid.appendChild(kaart);
  });
}

// Koop-/bestelknop voor een product. Bindt de handler als functie i.p.v. een
// onclick-string, zodat een apostrof in de titel de knop niet breekt.
function koopKnop(k, groot) {
  const maat = groot ? 'text-base px-8 py-3' : 'text-sm';
  if (k.mollie_link) {
    const a = document.createElement('a');
    a.href = k.mollie_link;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'btn-geel ' + maat;
    a.textContent = 'Kopen';
    // Niet laten bubbelen naar een klikbare kaart eromheen; de link zelf volgt wel.
    a.onclick = (e) => { e.stopPropagation(); };
    return a;
  }
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn-geel ' + maat;
  btn.textContent = 'Bestellen';
  btn.onclick = (e) => { e.stopPropagation(); contactKopen(k.titel); };
  return btn;
}

function renderShop() {
  const grid = document.getElementById('shop-grid');
  if (!grid || kunstwerken.length === 0) return;
  grid.innerHTML = '';

  kunstwerken.forEach((k, i) => {
    const kaart = document.createElement('div');
    kaart.className = 'kaart group';
    const fotos = productFotos(k);
    const heeftAfb = fotos.length > 0;

    // Beeld-vlak is een button i.p.v. de hele kaart, zodat de bestelknop
    // en een eventuele 'Meer info'-link geen geneste interactieve elementen worden.
    const beeldKnop = document.createElement('button');
    beeldKnop.type = 'button';
    beeldKnop.className = 'relative overflow-hidden block w-full p-0 border-none galerij-tegel';
    beeldKnop.style.cssText = `height:${beeldHoogte(360)};background:linear-gradient(135deg,#1a1400,#0a0a0a);cursor:pointer;`;
    beeldKnop.setAttribute('aria-label', 'Bekijk ' + k.titel);
    beeldKnop.onclick = () => openProduct(i);

    if (heeftAfb) {
      const img = document.createElement('img');
      img.src = fotos[0];
      img.alt = k.titel;
      img.loading = 'lazy';
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;opacity:0.85;';
      beeldKnop.appendChild(img);
    } else {
      const leeg = document.createElement('div');
      leeg.style.cssText = 'position:absolute;inset:0;background:radial-gradient(circle at 40% 50%,rgba(245,196,0,0.18),transparent 60%);display:flex;align-items:center;justify-content:center;';
      leeg.innerHTML = '<span style="font-size:5rem;opacity:0.15;">\ud83d\uddbc\ufe0f</span>';
      beeldKnop.appendChild(leeg);
    }

    // Indicator dat er meer te zien is
    if (fotos.length > 1) {
      const badge = document.createElement('span');
      badge.className = 'foto-badge mono';
      badge.textContent = '\ud83d\udcf7 ' + fotos.length;
      beeldKnop.appendChild(badge);
    }

    const body = document.createElement('div');
    body.className = 'p-6';
    body.innerHTML = `
      <div class="text-xs text-gray-500 mono mb-1"></div>
      <h3 style="font-family:'Poiret One',sans-serif;font-weight:400;" class="text-lg mb-1"></h3>
      <div class="prose prose-kaart mb-4">${renderMarkdown(k.beschrijving)}</div>
      ${linkHTML(k.link)}
      <div class="flex items-center justify-between mt-2">
        <span class="text-xl font-bold" style="color:var(--geel);">\u20ac ${k.prijs},\u2013</span>
      </div>`;
    // Titels bevatten &, en-dashes en mogelijk aanhalingstekens \u2014 via textContent
    // opbouwen zodat escaping vanzelf goed gaat (zelfde aanpak als renderGalerij).
    body.querySelector('.mono').textContent = k.collectie || '';
    body.querySelector('h3').textContent = k.titel;

    const knopRij = body.querySelector('.justify-between');
    knopRij.appendChild(koopKnop(k));

    // Titel en beschrijving openen ook het product. Een div met onclick (geen <a>
    // of <button>) zodat links in de beschrijving geen geneste interactieve
    // elementen worden - dat is dezelfde reden dat het beeld apart een button is.
    const tekstVlakken = [body.querySelector('h3'), body.querySelector('.prose-kaart')];
    tekstVlakken.forEach(el => {
      if (!el) return;
      el.style.cursor = 'pointer';
      el.onclick = (e) => {
        // Een link in de markdown-beschrijving houdt voorrang.
        if (e.target.closest('a, button')) return;
        openProduct(i);
      };
    });

    kaart.appendChild(beeldKnop);
    kaart.appendChild(body);
    grid.appendChild(kaart);
  });

  renderBundel(grid);
}

function renderShopPreview() {
  const grid = document.getElementById('shop-preview');
  if (!grid || kunstwerken.length === 0) return;
  grid.innerHTML = '';
  kunstwerken.slice(0, 3).forEach((k, i) => {
    const kaart = document.createElement('div');
    kaart.className = 'kaart reveal';
    kaart.style.cursor = 'pointer';
    kaart.onclick = (e) => {
      // Zelfde regel als in renderShop: knoppen en links houden voorrang.
      if (e.target.closest('a, button')) return;
      openProduct(i);
    };
    const heeftAfb = k.afbeelding && k.afbeelding.length > 0;
    kaart.innerHTML = `
      <div class="relative overflow-hidden" style="height:200px;background:linear-gradient(135deg,#1a1400,#0a0a0a);">
        ${heeftAfb
          ? `<img src="${k.afbeelding}" alt="${k.titel}" style="width:100%;height:100%;object-fit:cover;opacity:0.85;" />`
          : `<div style="position:absolute;inset:0;background:radial-gradient(circle at 40% 50%,rgba(245,196,0,0.18),transparent 60%);display:flex;align-items:center;justify-content:center;"><span style="font-size:3rem;opacity:0.15;">\ud83d\uddbc\ufe0f</span></div>`
        }
      </div>
      <div class="p-5">
        <div class="mono text-xs text-gray-600 mb-1">${k.collectie || ''}</div>
        <h3 style="font-family:'Poiret One',sans-serif;font-weight:400;" class="text-lg mb-1">${k.titel}</h3>
        <div class="flex items-center justify-between mt-2">
          <span class="font-bold" style="color:var(--geel);">\u20ac ${k.prijs},\u2013</span>
          <span class="mono text-xs" style="color:var(--geel);">Bekijk \u2192</span>
        </div>
      </div>`;
    grid.appendChild(kaart);
  });
}

function renderNieuws() {
  const container = document.getElementById('nieuws-container');
  if (!container || nieuwsItems.length === 0) return;
  container.innerHTML = '';
  nieuwsItems.forEach(n => {
    const art = document.createElement('article');
    art.className = 'kaart p-8 flex flex-col md:flex-row gap-6 items-start';
    art.innerHTML = `
      <div class="mono text-xs whitespace-nowrap pt-1" style="color:rgba(245,196,0,0.7);">${n.datum}</div>
      <div>
        <div class="text-xs text-gray-600 mono mb-2 uppercase tracking-wide">${n.categorie || ''}</div>
        <h2 class="font-bold text-xl mb-2">${n.titel}</h2>
        <p class="text-gray-400 text-sm leading-relaxed">${n.tekst}</p>
        ${linkHTML(n.link)}
      </div>`;
    container.appendChild(art);
  });
}

function renderSponsoren() {
  const grid = document.getElementById('sponsoren-grid');
  if (!grid) return;
  grid.innerHTML = '';

  sponsoren.forEach(s => {
    const kaart = document.createElement('div');
    kaart.className = 'kaart p-6 reveal';
    kaart.style.borderColor = 'rgba(245,196,0,0.3)';
    const heeftLogo = s.logo && s.logo.length > 0;
    kaart.innerHTML = `
      <div class="flex items-center gap-4 mb-3">
        ${heeftLogo ? `<img src="${s.logo}" alt="${s.naam} logo" style="width:64px;height:64px;object-fit:contain;border-radius:8px;" />` : ''}
        <div>
          <div class="mono text-xs tracking-widest uppercase mb-1" style="color:rgba(245,196,0,0.7);">Sponsor</div>
          <h3 style="font-family:'Poiret One',sans-serif;font-weight:400;" class="text-lg">${s.naam}</h3>
        </div>
      </div>
      ${s.omschrijving ? `<p class="text-gray-400 text-sm leading-relaxed">${s.omschrijving}</p>` : ''}
      ${s.website ? `<a href="${s.website}" target="_blank" rel="noopener" class="mono text-xs mt-2 inline-block" style="color:var(--geel);">Bezoek website \u2192</a>` : ''}`;
    grid.appendChild(kaart);
  });

  // Placeholder kaart
  const placeholder = document.createElement('div');
  placeholder.className = 'kaart p-6 reveal';
  placeholder.style.borderStyle = 'dashed';
  placeholder.style.borderColor = 'rgba(245,196,0,0.2)';
  placeholder.innerHTML = `
    <div class="mono text-xs tracking-widest uppercase mb-3" style="color:rgba(245,196,0,0.4);">Jouw naam hier</div>
    <p class="text-gray-600 text-sm">Word ook vriend of sponsor van MijnKoelPietje. Neem contact op via het contactformulier.</p>`;
  grid.appendChild(placeholder);
}

function contactKopen(titel) {
  toonSectie('contact');
  setTimeout(() => {
    const onderwerp = document.querySelector('select');
    if (onderwerp) onderwerp.value = 'Vraag over de kunst';
    const bericht = document.querySelector('textarea');
    if (bericht) bericht.value = `Hallo, ik heb interesse in het kunstwerk "${titel}". Kunt u mij meer informatie sturen?`;
  }, 300);
}

// Laad alles bij pagina start
document.addEventListener('DOMContentLoaded', async () => {
  await laadContent();
  startRouter();
});

// ─── Router ──────────────────────────────────────────────────────────────────
// De site is één pagina, maar een verhaal moet je kunnen delen. Elk verhaal
// heeft daarom een eigen URL (/verhaal/<slug>) en een vooraf gegenereerde
// pagina met de juiste og-tags (zie build-index.js). Deze router zorgt dat die
// URL ook binnen de app klopt, en dat de terugknop het verhaal sluit in plaats
// van de site te verlaten.

// Schild tegen een lus tussen onze eigen pushState en de popstate-handler.
let routerBezig = false;

// Windows kan geen mapnaam maken die op een punt of spatie eindigt. Tien
// slugs doen dat wel, dus build-index.js strippt die voor het pad. De URL
// volgt diezelfde regel, anders wijst de link naar een map die niet bestaat.
function padVeilig(slug) {
  return String(slug).replace(/[. ]+$/, '');
}

function productUrl(slug) {
  return '/product/' + encodeURIComponent(padVeilig(slug));
}

function verhaalUrl(slug) {
  return '/verhaal/' + encodeURIComponent(padVeilig(slug));
}

function zetUrl(url, vervang) {
  if (!window.history || !history.pushState) return;
  routerBezig = true;
  try {
    if (vervang) history.replaceState({ kp: true }, '', url);
    else         history.pushState({ kp: true }, '', url);
  } catch (e) {
    // Bijv. bij openen vanaf file:// - dan werkt de site gewoon zonder router.
  } finally {
    routerBezig = false;
  }
}

// Vertaalt de huidige URL naar de juiste weergave.
// Losse pagina's met een eigen URL. Deze hebben geen detailweergave, alleen
// een sectie - de router hoeft er dus alleen naartoe te schakelen.
const paginaRoutes = {
  '/voorwaarden': 'voorwaarden',
  '/disclaimer': 'disclaimer'
};

function routeerVanUrl(opties = {}) {
  const pad = location.pathname.replace(/\/$/, '') || '/';

  const sectie = paginaRoutes[pad];
  if (sectie) {
    toonSectie(sectie, { stilleUrl: true });
    return;
  }

  const mp = /^\/product\/([^/]+)\/?$/.exec(location.pathname);
  if (mp) {
    let pslug;
    try { pslug = decodeURIComponent(mp[1]).normalize('NFC'); } catch (e) { pslug = mp[1]; }
    const index = slugNaarProduct[pslug];
    if (index === undefined) {
      toonSectie('shop', { stilleUrl: true });
      zetUrl('/', true);
      return;
    }
    toonSectie('shop', { stilleUrl: true });
    openProduct(index, { stilleUrl: true });
    return;
  }

  const m = /^\/verhaal\/([^/]+)\/?$/.exec(location.pathname);

  if (!m) {
    // Geen verhaal- of product-URL. Staat er nog iets open, dan hoort dat
    // dicht - dat is het terugknop-gedrag.
    if (opties.vanPopstate) {
      sluitVerhaal({ stilleUrl: true });
      sluitProduct({ stilleUrl: true });
    }
    return;
  }

  let slug;
  try {
    slug = decodeURIComponent(m[1]).normalize('NFC');
  } catch (e) {
    slug = m[1];
  }

  const v = slugNaarVerhaal[slug];
  if (!v) {
    // Verhaal bestaat niet (meer): naar het overzicht in plaats van een lege pagina.
    toonSectie('verhalen', { stilleUrl: true });
    zetUrl('/', true);
    return;
  }

  toonSectie('verhalen', { stilleUrl: true });
  openVerhaal(v.id, { stilleUrl: true });
}

function startRouter() {
  window.addEventListener('popstate', () => {
    if (routerBezig) return;
    routeerVanUrl({ vanPopstate: true });
  });
  routeerVanUrl();
}

// ─── Deelknoppen ─────────────────────────────────────────────────────────────
// Opgebouwd met DOM-methoden, niet met een HTML-sjabloon: titels en slugs
// bevatten apostroffen en aanhalingstekens die een onclick-string zouden breken.
// Verhaal: knoppen onder het artikel.
function renderDeelKnoppen(v) {
  if (!v || !v.slug) return;
  deelBlok('deel-sectie', v.titel, location.origin + verhaalUrl(v.slug), 'Deel dit verhaal');
}

// Shop: zelfde blok onder het product.
function renderDeelKnoppenProduct(k) {
  if (!k || !k.slug) return;
  deelBlok('deel-sectie-product', k.titel, location.origin + productUrl(k.slug), 'Deel dit product');
}

function deelBlok(containerId, ruweTitel, url, kopTekst) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const titel = ruweTitel || 'MijnKoelPietje';

  const wrap = document.createElement('div');
  wrap.className = 'kaart';
  wrap.style.cssText = 'margin-top:2.5rem;padding:1.25rem 1.5rem;';

  const kop = document.createElement('div');
  kop.className = 'mono text-xs uppercase mb-3';
  kop.style.cssText = 'color:rgba(245,196,0,0.7);letter-spacing:0.1em;';
  kop.textContent = kopTekst || 'Delen';

  const rij = document.createElement('div');
  rij.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.6rem;align-items:center;';

  const melding = document.createElement('span');
  melding.className = 'mono text-xs';
  melding.style.cssText = 'color:var(--geel);opacity:0;transition:opacity 0.2s;';
  melding.setAttribute('role', 'status');
  melding.setAttribute('aria-live', 'polite');

  function toon(tekst) {
    melding.textContent = tekst;
    melding.style.opacity = '1';
    setTimeout(() => { melding.style.opacity = '0'; }, 2000);
  }

  function knop(label, aria, fn) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn-outline';
    b.textContent = label;
    b.setAttribute('aria-label', aria);
    b.onclick = fn;
    return b;
  }

  function link(label, href, extern) {
    const a = document.createElement('a');
    a.className = 'btn-outline';
    a.textContent = label;
    a.href = href;
    a.style.textDecoration = 'none';
    if (extern) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    return a;
  }

  // Op mobiel dekt het systeemdeelmenu WhatsApp, mail en de rest in één knop.
  if (navigator.share) {
    rij.appendChild(knop('Deel', kopTekst || 'Delen', async () => {
      try { await navigator.share({ title: titel, text: titel, url: url }); }
      catch (e) { /* geannuleerd door de bezoeker */ }
    }));
  } else {
    rij.appendChild(link('WhatsApp', 'https://wa.me/?text=' + encodeURIComponent(titel + '\n' + url), true));
    rij.appendChild(link('E-mail', 'mailto:?subject=' + encodeURIComponent(titel) +
                                   '&body=' + encodeURIComponent(titel + '\n\n' + url), false));
  }

  rij.appendChild(knop('Link kopiëren', 'Kopieer de link naar dit verhaal', async () => {
    let gelukt = false;
    try {
      await navigator.clipboard.writeText(url);
      gelukt = true;
    } catch (e) {
      // Geen clipboard-API (oudere browser of geen https): oude methode.
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:absolute;left:-9999px;';
      document.body.appendChild(ta);
      ta.select();
      try { gelukt = document.execCommand('copy'); } catch (e2) { gelukt = false; }
      document.body.removeChild(ta);
    }
    toon(gelukt ? 'gekopieerd!' : 'kopiëren mislukt');
  }));

  rij.appendChild(melding);
  wrap.appendChild(kop);
  wrap.appendChild(rij);
  el.innerHTML = '';
  el.appendChild(wrap);
}

// ─── Navigatie ───────────────────────────────────────────────────────────────
let huidigeSectie = 'home';

// Springt naar de uitleg van de 5 rubrieken op de Over-pagina. toonSectie()
// scrollt zelf naar boven, dus de uitleg wordt daarna in beeld gebracht.
function toonRubriekUitleg() {
  toonSectie('over');
  const el = document.getElementById('de-rubrieken');
  if (!el) return;
  // Even wachten tot de sectie zichtbaar is, anders klopt de scrollpositie niet.
  setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
}

function toonSectie(naam, opties = {}) {
  document.querySelectorAll('.sectie').forEach(s => s.classList.remove('actief'));
  const el = document.getElementById('sectie-' + naam);
  if (el) el.classList.add('actief');

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => {
    const oc = l.getAttribute('onclick') || '';
    if (naam !== 'home' && oc.includes("'" + naam + "'")) l.classList.add('active');
  });

  huidigeSectie = naam;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Navigeert de bezoeker zelf weg (navbalk), dan vervalt een onthouden
  // galerij-herkomst. Anders zou een later verhaal uit het overzicht nog
  // 'Terug naar galerij' tonen. Ook de galerij zelf hoort hierbij: klikken op
  // 'Galerij' met een verhaal open is geen terugkeer via terugNaarGalerij().
  // Die functie lost de herkomst al voor ze toonSectie() aanroept.
  if (naam !== 'verhalen') {
    verhaalHerkomst = 'verhalen';
    galerijScrollPositie = null;
  }

  if (naam === 'verhalen') sluitVerhaal(opties);
  if (naam === 'shop') sluitProduct(opties);

  // Trigger scroll reveals voor nieuwe sectie
  setTimeout(initScrollReveals, 50);
}

// ─── Verhalen ────────────────────────────────────────────────────────────────
let actieveRubriek = 'alle';

let overzichtScrollPositie = null;

// Vanuit welke sectie is het verhaal geopend? Bepaalt waar de terugknop naartoe gaat.
// Alleen de galerij wijkt af; overzicht en home-preview vallen terug op 'verhalen'.
let verhaalHerkomst = 'verhalen';      // 'verhalen' | 'galerij'
let galerijScrollPositie = null;

// Klik op een galerij-tegel. De herkomst wordt hier vastgelegd - niet afgeleid uit
// huidigeSectie, want de home-preview wisselt de sectie al voor openVerhaal draait.
function openVerhaalUitGalerij(id) {
  verhaalHerkomst = 'galerij';
  galerijScrollPositie = window.scrollY;
  openVerhaal(id);
}

function openVerhaal(id, opties = {}) {
  // Elke andere ingang (overzicht, home-preview) valt terug op het overzicht.
  if (verhaalHerkomst !== 'galerij') verhaalHerkomst = 'verhalen';

  if (huidigeSectie === 'verhalen') {
    overzichtScrollPositie = window.scrollY;
  } else {
    overzichtScrollPositie = null;
    // Stil: anders pusht sluitVerhaal() hier '/' vlak voordat wij de
    // verhaal-URL pushen, en moet de bezoeker twee keer terug.
    toonSectie('verhalen', { stilleUrl: true });
  }
  const v = verhalen[id];
  if (!v) return;

  const cfg = rubriekConfig[v.rubriek] || { label: v.rubriek, kleur: '#f5c400', bg: 'rgba(245,196,0,0.15)' };
  const kleur = cfg.kleur;
  const label = cfg.label;

  const content = document.getElementById('verhaal-content');
  const heeftAfb = v.afbeelding && v.afbeelding.length > 0;
  content.innerHTML = `
    ${heeftAfb ? `<div style="margin-bottom:2rem;border-radius:12px;overflow:hidden;"><img src="${v.afbeelding}" alt="${v.titel}" style="width:100%;height:auto;max-height:70vh;object-fit:contain;opacity:0.85;display:block;" /></div>` : ''}
    <div style="border-left:3px solid ${kleur};padding-left:1.5rem;margin-bottom:2.5rem;">
      <div class="mono text-xs mb-2 uppercase" style="color:${kleur};letter-spacing:0.1em;">${label}</div>
      <h1 style="font-family:'Poiret One',sans-serif;font-weight:400;font-size:clamp(1.8rem,4vw,2.8rem);line-height:1.2;margin-bottom:0.5rem;">${v.titel}</h1>
      <div class="mono text-xs text-gray-600">${v.datum || ''}</div>
    </div>
    <div class="prose leading-relaxed" style="max-width:65ch;">${renderMarkdown(v.tekst)}</div>
    <div id="deel-sectie"></div>
    <div id="like-sectie-${v.id}"></div>
    <div id="reacties-sectie-${v.id}"></div>
    <div style="margin-top:3rem;">
      <button onclick="${terugActieNaam()}" class="btn-outline">\u2190 ${terugLabel()}</button>
    </div>
  `;

  renderDeelKnoppen(v);
  renderLikeKnop(v.id);
  renderReacties(v.id);

  document.getElementById('verhaal-detail').classList.add('open');
  document.getElementById('verhalen-overzicht').classList.add('verborgen');
  updateTerugKnoppen();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Deelbare URL. Alle bestaande aanroepen geven geen opties mee en pushen dus;
  // alleen de router zet stilleUrl, want daar staat de URL al goed.
  if (!opties.stilleUrl && v.slug) zetUrl(verhaalUrl(v.slug), false);
}

// ─── Terugknoppen ───
// Er zijn twee terugknoppen: een vaste bovenaan het detail (index.html) en een
// die in de openVerhaal-template wordt meegerenderd. Beide volgen de herkomst.
function terugLabel() {
  return verhaalHerkomst === 'galerij' ? 'Terug naar galerij' : 'Terug naar overzicht';
}

function terugActieNaam() {
  return verhaalHerkomst === 'galerij' ? 'terugNaarGalerij()' : 'sluitVerhaal()';
}

// Werkt de vaste knop bovenaan bij. De pijl is een <svg> naast een los
// tekstknooppunt — daarom alleen dat tekstknooppunt vervangen, niet textContent
// van de hele button (dat zou de pijl slopen).
function updateTerugKnoppen() {
  const knop = document.getElementById('verhaal-terug-boven');
  if (!knop) return;
  const label = terugLabel();

  const tekstNode = Array.from(knop.childNodes)
    .reverse()
    .find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0);
  if (tekstNode) tekstNode.textContent = ' ' + label + ' ';

  knop.setAttribute('aria-label', label);
  knop.onclick = verhaalHerkomst === 'galerij' ? () => terugNaarGalerij() : () => sluitVerhaal();
}

// Sluit het verhaal en gaat terug naar de galerij, op de oude scrollpositie.
function terugNaarGalerij(opties = {}) {
  const positie = galerijScrollPositie;

  document.getElementById('verhaal-detail').classList.remove('open');
  document.getElementById('verhalen-overzicht').classList.remove('verborgen');

  // Herkomst eerst lossen: toonSectie() roept sluitVerhaal() aan en mag daarbij
  // niet opnieuw in dit pad belanden.
  verhaalHerkomst = 'verhalen';
  galerijScrollPositie = null;
  overzichtScrollPositie = null;

  toonSectie('galerij', { stilleUrl: true });
  if (!opties.stilleUrl) zetUrl('/', false);

  // toonSectie doet zelf een smooth scroll naar 0; daarom hierna en 'instant'.
  if (positie !== null) {
    requestAnimationFrame(() => {
      window.scrollTo({ top: positie, behavior: 'instant' });
    });
  }
}

function sluitVerhaal(opties = {}) {
  const stond = document.getElementById('verhaal-detail').classList.contains('open');
  document.getElementById('verhaal-detail').classList.remove('open');
  document.getElementById('verhalen-overzicht').classList.remove('verborgen');
  if (stond && !opties.stilleUrl) zetUrl('/', false);
  if (overzichtScrollPositie !== null) {
    const positie = overzichtScrollPositie;
    overzichtScrollPositie = null;
    requestAnimationFrame(() => {
      window.scrollTo({ top: positie, behavior: 'instant' });
    });
  }
}

// ─── Product detail (shop) ───────────────────────────────────────────────────
// Eigen scroll-global: shop en verhalen mogen niet om dezelfde variabele vechten.
let shopScrollPositie = null;
let huidigProduct = null;
// Welke foto staat er groot? Bijgehouden zodat de lightbox op dezelfde foto opent.
let actieveFotoIndex = 0;

function openProduct(index, opties = {}) {
  const k = kunstwerken[index];
  if (!k) return;   // guard vóór het opslaan van de scrollpositie
  actieveFotoIndex = 0;   // nieuw product start altijd bij de eerste foto

  if (huidigeSectie === 'shop') {
    shopScrollPositie = window.scrollY;
  } else {
    shopScrollPositie = null;
    // Stil: anders pusht sluitProduct() hier '/' vlak voordat wij de
    // product-URL pushen, en moet de bezoeker twee keer terug.
    toonSectie('shop', { stilleUrl: true });
  }

  huidigProduct = index;
  const fotos = productFotos(k);
  const content = document.getElementById('product-content');
  content.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'grid grid-cols-1 md:grid-cols-2 gap-10 items-start';

  // ── Linkerkolom: hoofdfoto + thumbnails ──
  const beeldKol = document.createElement('div');

  if (fotos.length > 0) {
    const hoofdKnop = document.createElement('button');
    hoofdKnop.type = 'button';
    hoofdKnop.className = 'relative overflow-hidden block w-full p-0 border-none galerij-tegel';
    hoofdKnop.style.cssText = 'border-radius:12px;cursor:zoom-in;background:linear-gradient(135deg,#1a1400,#0a0a0a);';
    hoofdKnop.setAttribute('aria-label', 'Vergroot foto van ' + k.titel);

    const hoofdImg = document.createElement('img');
    hoofdImg.id = 'product-hoofdfoto';
    hoofdImg.src = fotos[0];
    hoofdImg.alt = k.titel;
    // In de detailweergave willen we de héle foto zien (contain, niet cover) en
    // begrensd op de viewporthoogte, zodat staande foto's de thumbnails niet wegdrukken.
    hoofdImg.style.cssText = 'width:100%;height:auto;max-height:62vh;object-fit:contain;display:block;';
    hoofdKnop.appendChild(hoofdImg);
    hoofdKnop.onclick = () => openLightboxSerie(fotos, actieveFotoIndex, k.titel);
    beeldKol.appendChild(hoofdKnop);

    // Thumbnailstrip alleen zinvol bij meerdere foto's
    if (fotos.length > 1) {
      const strip = document.createElement('div');
      strip.className = 'thumb-strip';
      fotos.forEach((foto, fi) => {
        const t = document.createElement('button');
        t.type = 'button';
        t.className = 'thumb' + (fi === 0 ? ' actief' : '');
        t.setAttribute('aria-label', `Foto ${fi + 1} van ${fotos.length}`);
        const ti = document.createElement('img');
        ti.src = foto;
        ti.alt = '';
        ti.loading = 'lazy';
        t.appendChild(ti);
        t.onclick = () => kiesFoto(fi, fotos, k.titel);
        strip.appendChild(t);
      });
      beeldKol.appendChild(strip);
    }
  }

  // ── Rechterkolom: tekst ──
  const tekstKol = document.createElement('div');

  const collectie = document.createElement('div');
  collectie.className = 'mono text-xs uppercase mb-2';
  collectie.style.cssText = 'color:rgba(245,196,0,0.7);letter-spacing:0.1em;';
  collectie.textContent = k.collectie || '';
  tekstKol.appendChild(collectie);

  const titel = document.createElement('h1');
  titel.style.cssText = "font-family:'Poiret One',sans-serif;font-weight:400;font-size:clamp(1.6rem,3.5vw,2.4rem);line-height:1.2;margin-bottom:0.75rem;";
  titel.textContent = k.titel;
  tekstKol.appendChild(titel);

  const prijsRij = document.createElement('div');
  prijsRij.className = 'flex items-center gap-4 mb-6 flex-wrap';
  const prijs = document.createElement('span');
  prijs.className = 'text-2xl font-bold';
  prijs.style.color = 'var(--geel)';
  prijs.textContent = `€ ${k.prijs},–`;
  prijsRij.appendChild(prijs);
  if (k.editie) {
    const ed = document.createElement('span');
    ed.className = 'mono text-xs text-gray-500';
    ed.textContent = 'Editie ' + k.editie;
    prijsRij.appendChild(ed);
  }
  tekstKol.appendChild(prijsRij);

  const besch = document.createElement('div');
  besch.className = 'prose leading-relaxed mb-6';
  besch.style.maxWidth = '60ch';
  besch.innerHTML = renderMarkdown(k.beschrijving);   // levert HTML op
  tekstKol.appendChild(besch);

  if (k.link) {
    const l = document.createElement('div');
    l.className = 'mb-6';
    l.innerHTML = linkHTML(k.link);
    tekstKol.appendChild(l);
  }

  tekstKol.appendChild(koopKnop(k, true));

  wrap.appendChild(beeldKol);
  wrap.appendChild(tekstKol);
  content.appendChild(wrap);

  document.getElementById('product-detail').classList.add('open');
  document.getElementById('shop-overzicht').classList.add('verborgen');
  const kop = document.getElementById('shop-header');
  if (kop) kop.classList.add('verborgen');
  renderDeelKnoppenProduct(k);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Deelbare URL, net als bij de verhalen.
  if (!opties.stilleUrl && k.slug) zetUrl(productUrl(k.slug), false);
}

function kiesFoto(index, fotos, alt) {
  actieveFotoIndex = index;
  const img = document.getElementById('product-hoofdfoto');
  if (img) { img.src = fotos[index]; img.alt = alt || ''; }
  document.querySelectorAll('#product-content .thumb').forEach((t, i) => {
    t.classList.toggle('actief', i === index);
  });
}

function sluitProduct(opties = {}) {
  const detail = document.getElementById('product-detail');
  if (!detail) return;
  const stond = detail.classList.contains('open');
  detail.classList.remove('open');
  document.getElementById('shop-overzicht').classList.remove('verborgen');
  const kop = document.getElementById('shop-header');
  if (kop) kop.classList.remove('verborgen');
  huidigProduct = null;
  actieveFotoIndex = 0;
  if (stond && !opties.stilleUrl) zetUrl('/', false);
  if (shopScrollPositie !== null) {
    const positie = shopScrollPositie;
    shopScrollPositie = null;
    requestAnimationFrame(() => {
      window.scrollTo({ top: positie, behavior: 'instant' });
    });
  }
}

// ─── Filteren ────────────────────────────────────────────────────────────────
function filterRubriek(rubriek, btn) {
  actieveRubriek = rubriek;
  document.querySelectorAll('#rubriek-filters .rubriek-tag').forEach(b => {
    b.classList.remove('actief');
    b.style.color = '#777';
  });
  btn.classList.add('actief');
  btn.style.color = '';
  filterVerhalen();
}

function filterVerhalen() {
  const zoek = document.getElementById('zoek-verhalen').value.toLowerCase().trim();
  const jaarSelect = document.getElementById('filter-jaar');
  const actiefJaar = jaarSelect ? jaarSelect.value : 'alle';
  const kaarten = document.querySelectorAll('#verhalen-grid .kaart');
  let zichtbaar = 0;

  kaarten.forEach(kaart => {
    const rubriek = kaart.dataset.rubriek || '';
    const tags = kaart.dataset.tags || '';
    const tekst = kaart.innerText.toLowerCase();
    const rubriekMatch = actieveRubriek === 'alle' || rubriek === actieveRubriek;
    const zoekMatch = !zoek || tekst.includes(zoek) || tags.includes(zoek);
    const jaarMatch = actiefJaar === 'alle' || kaart.dataset.jaar === actiefJaar;
    kaart.style.display = (rubriekMatch && zoekMatch && jaarMatch) ? '' : 'none';
    if (rubriekMatch && zoekMatch && jaarMatch) zichtbaar++;
  });

  const geenRes = document.getElementById('geen-resultaten');
  const termDisplay = document.getElementById('zoek-term-display');
  if (termDisplay) termDisplay.textContent = zoek;
  geenRes.classList.toggle('hidden', zichtbaar !== 0);
}

// ─── Mobiel menu ────────────────────────────────────────────────────────────
function updateNav() {
  const deskMenu = document.getElementById('desk-menu');
  const mobBtn = document.getElementById('mob-menu-btn');
  const mobMenu = document.getElementById('mob-menu');
  // 1060px: onder deze breedte passen de 8 menu-items + Facebook-icoon niet meer naast elkaar
  if (window.innerWidth < 1060) {
    deskMenu.style.display = 'none';
    mobBtn.style.display = 'flex';
  } else {
    deskMenu.style.display = 'flex';
    mobBtn.style.display = 'none';
    mobMenu.style.display = 'none';
  }
}
window.addEventListener('resize', updateNav);
document.addEventListener('DOMContentLoaded', updateNav);
updateNav();

function toggleMobMenu() {
  const m = document.getElementById('mob-menu');
  const btn = document.getElementById('mob-menu-btn');
  const open = m.style.display === 'block';
  m.style.display = open ? 'none' : 'block';
  btn.setAttribute('aria-expanded', String(!open));
}

// ─── Contact ─────────────────────────────────────────────────────────────────
async function verstuurContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  const naam = document.getElementById('contact-naam')?.value.trim();
  const email = document.getElementById('contact-email')?.value.trim();
  const onderwerp = document.getElementById('contact-onderwerp')?.value || '';
  const bericht = document.getElementById('contact-bericht')?.value.trim();

  if (!naam || !bericht) {
    alert('Vul minimaal je naam en bericht in.');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Bezig met versturen...';

  if (sbClient) {
    const { error } = await sbClient.from('contact_berichten').insert({
      naam, email, onderwerp, bericht
    });
    if (error) {
      btn.disabled = false;
      btn.textContent = 'Verstuur bericht';
      alert('Er ging iets mis. Probeer het later opnieuw.');
      return;
    }
  }

  btn.textContent = '\u2713 Verstuurd!';
  btn.style.background = '#10b981';
  btn.style.color = '#fff';
  btn.disabled = false;
  setTimeout(() => {
    btn.textContent = 'Verstuur bericht';
    btn.style.background = '';
    btn.style.color = '';
    e.target.reset();
  }, 3000);
}

// ─── Nieuwsbrief ─────────────────────────────────────────────────────────────
async function aanmeldenNieuwsbrief(e) {
  e.preventDefault();
  const emailInput = document.getElementById('nieuwsbrief-email');
  const btn = document.getElementById('nieuwsbrief-btn');
  const email = emailInput?.value.trim();

  if (!email) return;

  btn.disabled = true;
  btn.textContent = 'Bezig...';

  if (sbClient) {
    const { error } = await sbClient.from('nieuwsbrief').insert({ email });
    if (error) {
      if (error.code === '23505') {
        btn.textContent = 'Al aangemeld!';
        btn.style.background = '#f97316';
      } else {
        btn.textContent = 'Fout opgetreden';
        btn.style.background = '#ef4444';
      }
      btn.style.color = '#fff';
      btn.disabled = false;
      setTimeout(() => {
        btn.textContent = 'Aanmelden';
        btn.style.background = '';
        btn.style.color = '';
      }, 3000);
      return;
    }
  }

  btn.textContent = '\u2713 Aangemeld!';
  btn.style.background = '#10b981';
  btn.style.color = '#fff';
  emailInput.value = '';
  btn.disabled = false;
  setTimeout(() => {
    btn.textContent = 'Aanmelden';
    btn.style.background = '';
    btn.style.color = '';
  }, 4000);
}

// ─── Lightbox ────────────────────────────────────────────────────────────────
let lightboxFotos = [];
let lightboxIndex = 0;
let lightboxAlt = '';

// Enkele foto — blijft werken zoals voorheen.
function openLightbox(src, alt) {
  openLightboxSerie([src], 0, alt);
}

// Serie foto's, met vorige/volgende.
function openLightboxSerie(fotos, index, alt) {
  if (!fotos || fotos.length === 0) return;
  lightboxFotos = fotos;
  lightboxIndex = Math.min(Math.max(index || 0, 0), fotos.length - 1);
  lightboxAlt = alt || '';
  const lb = document.getElementById('lightbox');
  lb.classList.toggle('enkel', fotos.length < 2);
  toonLightboxFoto();
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  const sluit = document.getElementById('lightbox-close');
  if (sluit) sluit.focus();
}

function toonLightboxFoto() {
  const img = document.getElementById('lightbox-img');
  if (!img) return;
  img.src = lightboxFotos[lightboxIndex];
  img.alt = lightboxAlt;
  const teller = document.getElementById('lightbox-teller');
  if (teller) teller.textContent = `${lightboxIndex + 1} / ${lightboxFotos.length}`;
}

// Modulo zodat je van de laatste foto naar de eerste doorloopt.
function lightboxVorige() {
  if (lightboxFotos.length < 2) return;
  lightboxIndex = (lightboxIndex - 1 + lightboxFotos.length) % lightboxFotos.length;
  toonLightboxFoto();
}
function lightboxVolgende() {
  if (lightboxFotos.length < 2) return;
  lightboxIndex = (lightboxIndex + 1) % lightboxFotos.length;
  toonLightboxFoto();
}

function sluitLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { sluitLightbox(); return; }
  // Pijltjes alleen als de lightbox open staat — anders kapen we de
  // pijltoetsen van bijv. de jaar-dropdown op de verhalenpagina.
  const lb = document.getElementById('lightbox');
  if (!lb || !lb.classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  { e.preventDefault(); lightboxVorige(); }
  if (e.key === 'ArrowRight') { e.preventDefault(); lightboxVolgende(); }
});

// ─── Scroll reveals (Intersection Observer) ─────────────────────────────────
function initScrollReveals() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('zichtbaar');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.sectie.actief .reveal').forEach(el => {
    if (!el.classList.contains('zichtbaar')) obs.observe(el);
  });
}

// ─── Facebook-icoon in de nav — hover-animatie ───────────────────
function initFacebookIcoon() {
  const link = document.getElementById('fb-nav');
  if (!link) return;

  // Zonder GSAP of bij voorkeur voor minder beweging: gewoon een stille link
  if (typeof gsap === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const pad = link.querySelector('.fb-path');
  const duim = link.querySelector('.fb-duim');
  if (!pad || !duim) return;

  link.addEventListener('mouseenter', () => {
    gsap.fromTo(pad, { scale: 1 }, {
      keyframes: [{ scale: 0.9 }, { scale: 1.05 }, { scale: 1 }],
      duration: 0.5, ease: 'power1.inOut'
    });
    gsap.fromTo(duim, { y: -10, opacity: 0 }, {
      keyframes: [{ opacity: 1 }, { opacity: 0 }],
      y: 0, duration: 0.6, ease: 'power2.out'
    });
  });

  link.addEventListener('mouseleave', () => {
    gsap.to(pad, { scale: 1, duration: 0.2, ease: 'power1.inOut' });
    gsap.set(duim, { y: 0, opacity: 0 });
  });
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveals();
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i * 80) + 'ms';
  });
  initFacebookIcoon();
});
