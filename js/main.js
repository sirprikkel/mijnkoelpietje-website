// ═══════════════════════════════════════════════════════════
// MijnKoelPietje — Hoofd JavaScript
// ═══════════════════════════════════════════════════════════

// ─── Supabase configuratie ────────────────────────────────────────
const SUPABASE_URL  = 'https://nwufmlayvaofmjetacfd.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dWZtbGF5dmFvZm1qZXRhY2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5ODYzMjksImV4cCI6MjA5MDU2MjMyOX0._TUyvaHByhC0BeOpwt9Z9pFLEN0o0yi3c13lsvd76Kg';
let sbClient = null;
try {
  if (typeof supabase !== 'undefined' && SUPABASE_URL !== 'JOUW_SUPABASE_URL_HIER') {
    sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('[KoelPietje] Supabase verbonden');
  } else {
    console.warn('[KoelPietje] Supabase NIET beschikbaar — typeof supabase:', typeof supabase);
  }
} catch(e) {
  console.error('[KoelPietje] Supabase init fout:', e);
}

// ─── Likes ────────────────────────────────────────────────────────
async function laadLikes(verhaalId) {
  if (!sbClient) { console.warn('[KoelPietje] Geen sbClient voor likes'); return 0; }
  try {
    const { count, error: countErr } = await sbClient.from('likes').select('*', { count: 'exact', head: true }).eq('verhaal_id', verhaalId);
    console.log('[KoelPietje] Likes voor', verhaalId, ':', count, countErr ? 'ERROR: ' + countErr.message : 'OK');
    if (!countErr && count !== null) return count;
    const { data, error } = await sbClient.from('likes').select('*').eq('verhaal_id', verhaalId);
    if (error) { console.error('[KoelPietje] Likes fallback mislukt:', error.message); return 0; }
    console.log('[KoelPietje] Likes fallback voor', verhaalId, ':', data?.length);
    return (data || []).length;
  } catch(e) { console.error('[KoelPietje] Likes exception:', e); return 0; }
}

function meterKleur(totaal) {
  if (totaal >= 6) return '#22c55e';
  if (totaal >= 4) return '#f97316';
  return '#ef4444';
}

function meterLabel(totaal) {
  if (totaal >= 6) return 'Populair!';
  if (totaal >= 4) return 'Groeiend';
  if (totaal >= 2) return 'Warming up';
  return 'Eerste like?';
}

async function stemLike(verhaalId) {
  const sleutel = 'like_' + verhaalId;
  if (localStorage.getItem(sleutel)) return;
  if (sbClient) {
    await sbClient.from('likes').insert({ verhaal_id: verhaalId, type: 'like' });
  }
  localStorage.setItem(sleutel, 'like');
  renderLikeKnop(verhaalId);
}

async function renderLikeKnop(verhaalId) {
  const el = document.getElementById('like-sectie-' + verhaalId);
  if (!el) return;
  let totaal = await laadLikes(verhaalId);
  let gestemd = localStorage.getItem('like_' + verhaalId);

  // Fix: als localStorage zegt gestemd maar Supabase heeft 0 likes,
  // dan is de eerdere stem nooit aangekomen — opnieuw inserten
  if (gestemd && totaal === 0 && sbClient) {
    console.log('[KoelPietje] Herstel verloren like voor', verhaalId);
    await sbClient.from('likes').insert({ verhaal_id: verhaalId, type: 'like' });
    localStorage.setItem('like_' + verhaalId, 'like');
    totaal = await laadLikes(verhaalId);
  }

  const kleur = meterKleur(totaal);
  const label = meterLabel(totaal);

  el.innerHTML = `
    <div style="margin-top:2.5rem;padding:1.5rem;background:var(--grijs);border-radius:12px;border:1px solid rgba(245,196,0,0.1);">
      <div class="mono text-xs tracking-widest uppercase mb-4" style="color:rgba(245,196,0,0.6);">Wat vind jij van dit verhaal?</div>
      <div class="flex items-center gap-6">
        <button onclick="stemLike('${verhaalId}')" class="like-meter-btn" style="background:none;border:none;cursor:${gestemd ? 'default' : 'pointer'};padding:0;transition:transform 0.2s;" ${gestemd ? '' : 'onmouseenter="this.style.transform=\'scale(1.15)\'" onmouseleave="this.style.transform=\'scale(1)\'"'}>
          <svg width="64" height="64" viewBox="0 0 507.9 507.9" fill="${kleur}" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 0 8px ${kleur}40);transition:fill 0.3s,filter 0.3s;">
            <path d="M402.2,0H105.8C82.5,0,63.5,19,63.5,42.3v423.3c0,23.3,19,42.3,42.3,42.3h296.3c23.3,0,42.3-19,42.3-42.3V42.3C444.5,19,425.5,0,402.2,0z M402.2,479.8H105.8c-7.8,0-14.1-6.3-14.1-14.1v-71.6h16.7c7.8,0,14.1-6.3,14.1-14.1s-6.3-14.1-14.1-14.1H91.7v-28.2h44.9c7.8,0,14.1-6.3,14.1-14.1s-6.3-14.1-14.1-14.1H91.7V42.3c0-7.8,6.3-14.1,14.1-14.1h296.3c7.8,0,14.1,6.3,14.1,14.1v423.4h0.1C416.3,473.5,410,479.8,402.2,479.8z"/>
            <path d="M254,302.5c-40.9,0-74.1,33.2-74.1,74.1c0,40.9,33.2,74.1,74.1,74.1s74.1-33.2,74.1-74.1C328.1,335.7,294.9,302.5,254,302.5z M208.1,376.6c0-25.3,20.5-45.9,45.9-45.9c7.5,0,14.6,1.8,20.9,5.1l-61.7,61.7C210,391.1,208.1,384.1,208.1,376.6z M254,422.4c-7.5,0-14.6-1.8-20.9-5.1l61.7-61.7c3.2,6.3,5.1,13.3,5.1,20.9C299.9,401.9,279.3,422.4,254,422.4z"/>
            <path d="M373.9,56.4H134.1c-7.8,0-14.1,6.3-14.1,14.1V254c0,7.8,6.3,14.1,14.1,14.1H374c7.8,0,14.1-6.3,14.1-14.1V70.6C388.1,62.8,381.7,56.4,373.9,56.4z M359.9,239.9h-0.1h-88.2l36.1-111.8c2.4-7.4-1.7-15.4-9.1-17.8c-7.4-2.4-15.4,1.7-17.8,9.1L242,239.9h-93.8V84.7h211.7V239.9z"/>
          </svg>
        </button>
        <div>
          <div class="mono text-2xl font-bold" style="color:${kleur};">${totaal}</div>
          <div class="mono text-xs" style="color:${kleur};opacity:0.8;">${label}</div>
          ${gestemd ? '<div class="mono text-xs text-gray-600 mt-1">Je hebt gestemd!</div>' : '<div class="mono text-xs text-gray-500 mt-1">Klik om te liken</div>'}
        </div>
      </div>
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
      laadSponsoren()
    ]);
  } catch(e) {
    console.log('Content laden via directe fetch...');
    await laadVerhalen();
    await laadKunstwerken();
    await laadNieuws();
    await laadSponsoren();
  }
}

async function fetchJSON(url) {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    return await r.json();
  } catch(e) { return null; }
}

async function laadVerhalen() {
  const bekende = ['v1','v2','v3','v4','v5','v6'];
  verhalen = {};
  const promises = bekende.map(id => fetchJSON(`/content/verhalen/${id}.json`));
  const results = await Promise.all(promises);
  results.forEach(v => {
    if (v && v.id) verhalen[v.id] = v;
  });

  try {
    const r = await fetch('/content/verhalen/index.json');
    if (r.ok) {
      const idx = await r.json();
      const extra = await Promise.all(idx.map(id => fetchJSON(`/content/verhalen/${id}.json`)));
      extra.forEach(v => { if (v && v.id) verhalen[v.id] = v; });
    }
  } catch(e) {}

  renderVerhalenGrid();
  renderVerhalenPreview();
}

async function laadKunstwerken() {
  const bekende = ['k1','k2','k3','k4','k5','k6','k7','k8'];
  const promises = bekende.map(id => fetchJSON(`/content/kunstwerken/${id}.json`));
  const results = await Promise.all(promises);
  kunstwerken = results.filter(k => k && k.id);

  try {
    const r = await fetch('/content/kunstwerken/index.json');
    if (r.ok) {
      const idx = await r.json();
      const extra = await Promise.all(idx.map(id => fetchJSON(`/content/kunstwerken/${id}.json`)));
      extra.forEach(k => { if (k && k.id && !kunstwerken.find(x => x.id === k.id)) kunstwerken.push(k); });
    }
  } catch(e) {}

  renderShop();
}

async function laadNieuws() {
  const bekende = ['n1','n2','n3','n4','n5'];
  const promises = bekende.map(id => fetchJSON(`/content/nieuws/${id}.json`));
  const results = await Promise.all(promises);
  nieuwsItems = results.filter(n => n && n.id);
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

// ─── Render functies ──────────────────────────────────────────

function parseNLDatum(d) {
  if (!d) return 0;
  const maanden = {januari:0,februari:1,maart:2,april:3,mei:4,juni:5,juli:6,augustus:7,september:8,oktober:9,november:10,december:11};
  const delen = d.trim().split(/\s+/);
  if (delen.length === 3) {
    const dag = parseInt(delen[0]);
    const maand = maanden[delen[1].toLowerCase()];
    const jaar = parseInt(delen[2]);
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
    kaart.setAttribute('role', 'listitem');
    kaart.onclick = () => openVerhaal(v.id);
    const heeftAfb = v.afbeelding && v.afbeelding.length > 0;
    kaart.innerHTML = `
      ${heeftAfb ? `<div class="relative overflow-hidden" style="height:180px;background:linear-gradient(135deg,#1a1400,#0a0a0a);"><img src="${v.afbeelding}" alt="${v.titel}" style="width:100%;height:100%;object-fit:cover;opacity:0.75;" /></div>` : ''}
      <div style="height:3px;background:${cfg.kleur};width:100%;"></div>
      <div class="p-6">
        <span class="rubriek-tag" style="background:${cfg.bg};color:${cfg.kleur};">${cfg.label}</span>
        <h3 class="font-bold text-lg mt-3 mb-2">${v.titel}</h3>
        <p class="text-gray-500 text-sm leading-relaxed">${v.intro || ''}</p>
        <div class="mt-4 text-xs mono" style="color:${cfg.kleur};">Lees meer \u2192</div>
      </div>`;
    grid.appendChild(kaart);
  });
}

function renderVerhalenPreview() {
  const previews = document.querySelectorAll('#verhalen-preview .kaart');
  const vArr = verhalenGesorteerd().slice(0, 3);
  previews.forEach((kaart, i) => {
    if (!vArr[i]) return;
    const v = vArr[i];
    const cfg = rubriekConfig[v.rubriek] || { label: v.rubriek, kleur: '#f5c400', bg: 'rgba(245,196,0,0.15)' };
    kaart.onclick = () => { toonSectie('verhalen'); openVerhaal(v.id); };
    const titleEl = kaart.querySelector('h3');
    const introEl = kaart.querySelector('p');
    if (titleEl) titleEl.textContent = v.titel;
    if (introEl) introEl.textContent = v.intro || '';
  });
}

function renderShop() {
  const grid = document.getElementById('shop-grid');
  if (!grid || kunstwerken.length === 0) return;
  const bundelKaart = grid.querySelector('.bundel-kaart');
  grid.innerHTML = '';

  kunstwerken.forEach(k => {
    const kaart = document.createElement('div');
    kaart.className = 'kaart group';
    const heeftAfb = k.afbeelding && k.afbeelding.length > 0;
    kaart.innerHTML = `
      <div class="relative overflow-hidden" style="height:320px;background:linear-gradient(135deg,#1a1400,#0a0a0a);">
        ${heeftAfb
          ? `<img src="${k.afbeelding}" alt="${k.titel}" style="width:100%;height:100%;object-fit:cover;opacity:0.85;" />`
          : `<div style="position:absolute;inset:0;background:radial-gradient(circle at 40% 50%,rgba(245,196,0,0.18),transparent 60%);display:flex;align-items:center;justify-content:center;"><span style="font-size:5rem;opacity:0.15;">\ud83d\uddbc\ufe0f</span></div>`
        }
        <div class="absolute bottom-0 left-0 right-0 p-4" style="background:linear-gradient(0deg,rgba(0,0,0,0.85),transparent);">
          <div class="mono text-xs" style="color:rgba(245,196,0,0.7);">Editie ${k.editie || '\u2013'}</div>
        </div>
      </div>
      <div class="p-6">
        <div class="text-xs text-gray-500 mono mb-1">${k.collectie || ''}</div>
        <h3 class="font-bold text-lg mb-1">${k.titel}</h3>
        <p class="text-gray-500 text-sm mb-4">${k.beschrijving || ''}</p>
        <div class="flex items-center justify-between">
          <span class="text-xl font-bold" style="color:var(--geel);">\u20ac ${k.prijs},\u2013</span>
          ${k.mollie_link
            ? `<a href="${k.mollie_link}" target="_blank" class="btn-geel text-sm">Kopen</a>`
            : `<button class="btn-geel text-sm" onclick="contactKopen('${k.titel}')">Bestellen</button>`
          }
        </div>
      </div>`;
    grid.appendChild(kaart);
  });

  if (bundelKaart) grid.appendChild(bundelKaart);
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
document.addEventListener('DOMContentLoaded', laadContent);

// ─── Navigatie ───────────────────────────────────────────────────────────────
let huidigeSectie = 'home';

function toonSectie(naam) {
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

  if (naam === 'verhalen') sluitVerhaal();

  // Trigger scroll reveals voor nieuwe sectie
  setTimeout(initScrollReveals, 50);
}

// ─── Verhalen ────────────────────────────────────────────────────────────────
let actieveRubriek = 'alle';

function openVerhaal(id) {
  if (huidigeSectie !== 'verhalen') toonSectie('verhalen');
  const v = verhalen[id];
  if (!v) return;

  const content = document.getElementById('verhaal-content');
  const heeftAfb = v.afbeelding && v.afbeelding.length > 0;
  content.innerHTML = `
    ${heeftAfb ? `<div style="margin-bottom:2rem;border-radius:12px;overflow:hidden;max-height:300px;"><img src="${v.afbeelding}" alt="${v.titel}" style="width:100%;height:300px;object-fit:cover;opacity:0.85;" /></div>` : ''}
    <div style="border-left:3px solid ${v.rubriekKleur};padding-left:1.5rem;margin-bottom:2.5rem;">
      <div class="mono text-xs mb-2 uppercase" style="color:${v.rubriekKleur};letter-spacing:0.1em;">${v.rubriekLabel || v.rubriek}</div>
      <h1 style="font-family:'Poiret One',sans-serif;font-weight:400;font-size:clamp(1.8rem,4vw,2.8rem);line-height:1.2;margin-bottom:0.5rem;">${v.titel}</h1>
      <div class="mono text-xs text-gray-600">${v.datum || ''}</div>
    </div>
    <div class="prose leading-relaxed" style="max-width:65ch;">${v.tekst}</div>
    <div id="like-sectie-${v.id}"></div>
    <div id="reacties-sectie-${v.id}"></div>
    <div style="margin-top:3rem;">
      <button onclick="sluitVerhaal()" class="btn-outline">\u2190 Terug naar overzicht</button>
    </div>
  `;

  renderLikeKnop(v.id);
  renderReacties(v.id);

  document.getElementById('verhaal-detail').classList.add('open');
  document.getElementById('verhalen-overzicht').classList.add('verborgen');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function sluitVerhaal() {
  document.getElementById('verhaal-detail').classList.remove('open');
  document.getElementById('verhalen-overzicht').classList.remove('verborgen');
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
  const kaarten = document.querySelectorAll('#verhalen-grid .kaart');
  let zichtbaar = 0;

  kaarten.forEach(kaart => {
    const rubriek = kaart.dataset.rubriek || '';
    const tags = kaart.dataset.tags || '';
    const tekst = kaart.innerText.toLowerCase();
    const rubriekMatch = actieveRubriek === 'alle' || rubriek === actieveRubriek;
    const zoekMatch = !zoek || tekst.includes(zoek) || tags.includes(zoek);
    kaart.style.display = (rubriekMatch && zoekMatch) ? '' : 'none';
    if (rubriekMatch && zoekMatch) zichtbaar++;
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
  if (window.innerWidth <= 768) {
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
function openLightbox(src, alt) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  img.src = src;
  img.alt = alt || '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function sluitLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') sluitLightbox();
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

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveals();
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i * 80) + 'ms';
  });
});
