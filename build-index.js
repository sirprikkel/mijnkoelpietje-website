const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const SITE = 'https://www.mijnkoelpietje.nl';

// ─── 1. Content-index per collectie ──────────────────────────────────────────
const dirs = ['content/verhalen', 'content/kunstwerken', 'content/nieuws', 'content/sponsoren', 'content/activiteiten'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  const ids = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'index.json').map(f => f.replace('.json', ''));
  fs.writeFileSync(`${dir}/index.json`, JSON.stringify(ids));
  console.log(`${dir}/index.json → ${ids.length} items: ${ids.join(', ')}`);
});

// ─── 2. Deelbare verhaalpagina's ─────────────────────────────────────────────
// Elk verhaal krijgt een eigen map met een kopie van index.html waarin alleen
// de <head> is vervangen. Dat is nodig omdat WhatsApp en Facebook geen
// JavaScript uitvoeren: de og-tags moeten al in de HTML staan die de server
// teruggeeft. Een hash (#verhaal/x) werkt daarvoor niet - die wordt nooit naar
// de server gestuurd.

// Escape voor gebruik binnen een HTML-attribuut.
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Windows kan geen map- of bestandsnamen maken die op een punt of spatie
// eindigen; die worden stil ingekort, waarna git de map niet meer kan openen.
// Tien slugs eindigen op een punt, dus strippen we die voor het pad. Levert
// geen botsingen op (gecontroleerd over alle 254 slugs).
function padVeilig(slug) {
  return slug.replace(/[. ]+$/, '');
}

// Dezelfde opschoning als cleanTekst() in js/main.js: per ongeluk ingevoerde
// formaatwoorden vooraan de intro horen niet in de omschrijving.
function cleanTekst(txt) {
  if (!txt) return '';
  return String(txt).replace(/^(staand|liggend|vierkant|none|None)\s*/gi, '').trim();
}

// Korte platte omschrijving voor de preview-kaart: markdown eruit, één regel.
function omschrijving(v, max = 200) {
  const ruw = cleanTekst(v.intro) || cleanTekst(v.tekst);
  const plat = String(ruw)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')      // afbeeldingen
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')   // links → linktekst
    .replace(/[*_~`#>]/g, '')                  // markdown-tekens
    .replace(/\s+/g, ' ')
    .trim();
  return plat.length > max ? plat.slice(0, max - 1).trimEnd() + '…' : plat;
}

// Verkleint een bronafbeelding tot een og-afbeelding van 1200x630.
// WhatsApp toont niets boven ~600KB en croppt zelf naar het midden, dus we
// leveren precies 1,91:1 aan. Geeft true terug als er een bruikbaar bestand is.
function maakOgAfbeelding(bron, doel) {
  try {
    if (fs.existsSync(doel) && fs.statSync(doel).mtimeMs >= fs.statSync(bron).mtimeMs) {
      return true; // al actueel
    }
    // execFileSync met een argumentenlijst: slugs bevatten apostroffen en
    // emoji, die zouden in een shell-string stukgaan.
    execFileSync('magick', [
      bron,
      '-resize', '1200x630^',
      '-gravity', 'center',
      '-extent', '1200x630',
      '-strip',
      '-interlace', 'JPEG',
      '-quality', '80',
      '-define', 'jpeg:extent=500kb',
      doel
    ], { stdio: ['ignore', 'ignore', 'pipe'] });
    // Let op: ImageMagick schrijft waarschuwingen ("Corrupt JPEG data") naar
    // stderr maar sluit af met 0. Alleen de exitcode telt als fout.
    return fs.existsSync(doel);
  } catch (e) {
    console.warn(`  ! og-afbeelding mislukt voor ${path.basename(bron)}: ${e.message.split('\n')[0]}`);
    return false;
  }
}

function bouwVerhaalPaginas() {
  const dir = 'content/verhalen';
  if (!fs.existsSync(dir) || !fs.existsSync('index.html')) return;

  const sjabloon = fs.readFileSync('index.html', 'utf8');

  // De head-tags die per verhaal vervangen worden: <title> t/m og:url.
  const kop = sjabloon.indexOf('  <title>');
  const staart = sjabloon.indexOf('\n', sjabloon.indexOf('<meta property="og:url"'));
  if (kop === -1 || staart === -1) {
    console.warn('! head-blok niet gevonden in index.html - verhaalpaginas overgeslagen');
    return;
  }

  const slugs = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'index.json').map(f => f.replace(/\.json$/, ''));

  // Eerst opruimen: een hernoemd of verwijderd verhaal mag geen wees-pagina
  // achterlaten die nog steeds een preview-kaart serveert.
  if (fs.existsSync('verhaal')) fs.rmSync('verhaal', { recursive: true, force: true });
  fs.mkdirSync('og', { recursive: true });

  let metBeeld = 0, terugval = 0;

  slugs.forEach(slug => {
    let v;
    try {
      v = JSON.parse(fs.readFileSync(path.join(dir, slug + '.json'), 'utf8'));
    } catch (e) {
      console.warn(`  ! ${slug}.json onleesbaar, overgeslagen`);
      return;
    }

    // og-afbeelding: eigen beeld verkleinen, anders de vaste terugval.
    let ogPad = '/og/_default.jpg';
    const bron = v.afbeelding ? '.' + v.afbeelding : null;
    if (bron && fs.existsSync(bron)) {
      const doel = path.join('og', padVeilig(slug) + '.jpg');
      if (maakOgAfbeelding(bron, doel)) { ogPad = '/og/' + padVeilig(slug) + '.jpg'; metBeeld++; }
      else terugval++;
    } else {
      terugval++;
    }

    const url = `${SITE}/verhaal/${encodeURIComponent(padVeilig(slug))}`;
    const beeld = SITE + ogPad.split('/').map(encodeURIComponent).join('/');
    const titel = esc(v.titel || 'MijnKoelPietje');
    const oms = esc(omschrijving(v));

    const head = `  <title>${titel} — MijnKoelPietje</title>
  <meta name="description" content="${oms}" />
  <meta property="og:title" content="${titel}" />
  <meta property="og:description" content="${oms}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="MijnKoelPietje" />
  <meta property="og:locale" content="nl_NL" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${beeld}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${titel}" />
  <meta name="twitter:description" content="${oms}" />
  <meta name="twitter:image" content="${beeld}" />
  <link rel="canonical" href="${url}" />`;

    const pagina = sjabloon.slice(0, kop) + head + sjabloon.slice(staart);
    const map = path.join('verhaal', padVeilig(slug));
    fs.mkdirSync(map, { recursive: true });
    fs.writeFileSync(path.join(map, 'index.html'), pagina);
  });

  console.log(`verhaal/ → ${slugs.length} pagina's (${metBeeld} met eigen og-beeld, ${terugval} met terugval)`);
}

// ─── 3. Losse pagina's met een eigen URL ─────────────────────────────────────
// Ook de juridische pagina's moeten te versturen zijn en vindbaar voor
// zoekmachines. Zelfde truc als bij de verhalen, maar met vaste teksten.
const LOSSE_PAGINAS = [
  {
    pad: 'voorwaarden',
    titel: 'Algemene Voorwaarden',
    oms: 'De algemene voorwaarden van MijnKoelPietje: bestellen, prijzen, retourneren en herroepingsrecht, garantie, klachten, privacy en cookies.'
  },
  {
    pad: 'disclaimer',
    titel: 'Disclaimer & Privacy',
    oms: 'Disclaimer en privacyverklaring van MijnKoelPietje: historische context, gebruik van AI, intellectueel eigendom en de omgang met persoonsgegevens.'
  }
];

function bouwLossePaginas() {
  if (!fs.existsSync('index.html')) return;
  const sjabloon = fs.readFileSync('index.html', 'utf8');
  const kop = sjabloon.indexOf('  <title>');
  const staart = sjabloon.indexOf('\n', sjabloon.indexOf('<meta property="og:url"'));
  if (kop === -1 || staart === -1) return;

  const beeld = SITE + '/og/_default.jpg';

  LOSSE_PAGINAS.forEach(p => {
    const url = `${SITE}/${p.pad}`;
    const titel = esc(p.titel);
    const oms = esc(p.oms);
    const head = `  <title>${titel} — MijnKoelPietje</title>
  <meta name="description" content="${oms}" />
  <meta property="og:title" content="${titel}" />
  <meta property="og:description" content="${oms}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="MijnKoelPietje" />
  <meta property="og:locale" content="nl_NL" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${beeld}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${titel}" />
  <meta name="twitter:description" content="${oms}" />
  <meta name="twitter:image" content="${beeld}" />
  <link rel="canonical" href="${url}" />`;

    fs.mkdirSync(p.pad, { recursive: true });
    fs.writeFileSync(path.join(p.pad, 'index.html'), sjabloon.slice(0, kop) + head + sjabloon.slice(staart));
  });

  console.log(`losse pagina's → ${LOSSE_PAGINAS.map(p => '/' + p.pad).join(', ')}`);
}

// ─── 4. Deelbare productpagina's ─────────────────────────────────────────────
// Zelfde aanpak als bij de verhalen. Let op: de bestandsnaam is hier de
// stabiele sleutel, ook waar die niet meer op de titel lijkt - de klant heeft
// een paar producten hergebruikt zonder ze te hernoemen. De previewkaart toont
// de actuele titel en foto, dus de bezoeker ziet altijd het juiste product.
function bouwProductPaginas() {
  const dir = 'content/kunstwerken';
  if (!fs.existsSync(dir) || !fs.existsSync('index.html')) return;

  const sjabloon = fs.readFileSync('index.html', 'utf8');
  const kop = sjabloon.indexOf('  <title>');
  const staart = sjabloon.indexOf('\n', sjabloon.indexOf('<meta property="og:url"'));
  if (kop === -1 || staart === -1) return;

  const slugs = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'index.json').map(f => f.replace(/\.json$/, ''));

  if (fs.existsSync('product')) fs.rmSync('product', { recursive: true, force: true });
  fs.mkdirSync('og/product', { recursive: true });

  let metBeeld = 0;

  slugs.forEach(slug => {
    let k;
    try {
      k = JSON.parse(fs.readFileSync(path.join(dir, slug + '.json'), 'utf8'));
    } catch (e) {
      console.warn(`  ! ${slug}.json onleesbaar, overgeslagen`);
      return;
    }

    const veilig = padVeilig(slug);
    let ogPad = '/og/_default.jpg';
    const bron = k.afbeelding ? '.' + k.afbeelding : null;
    if (bron && fs.existsSync(bron)) {
      const doel = path.join('og', 'product', veilig + '.jpg');
      if (maakOgAfbeelding(bron, doel)) { ogPad = '/og/product/' + veilig + '.jpg'; metBeeld++; }
    }

    const url = `${SITE}/product/${encodeURIComponent(veilig)}`;
    const beeld = SITE + ogPad.split('/').map(encodeURIComponent).join('/');
    const titel = esc(k.titel || 'MijnKoelPietje');
    // Prijs erbij: dat is precies wat iemand wil zien in een gedeelde link.
    const prijs = k.prijs !== undefined && k.prijs !== '' && String(k.prijs) !== '0' ? ` — € ${k.prijs},-` : '';
    const oms = esc(omschrijving({ intro: k.beschrijving }));

    const head = `  <title>${titel} — MijnKoelPietje</title>
  <meta name="description" content="${oms}" />
  <meta property="og:title" content="${titel}${esc(prijs)}" />
  <meta property="og:description" content="${oms}" />
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="MijnKoelPietje" />
  <meta property="og:locale" content="nl_NL" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${beeld}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${titel}${esc(prijs)}" />
  <meta name="twitter:description" content="${oms}" />
  <meta name="twitter:image" content="${beeld}" />
  <link rel="canonical" href="${url}" />`;

    const map = path.join('product', veilig);
    fs.mkdirSync(map, { recursive: true });
    fs.writeFileSync(path.join(map, 'index.html'), sjabloon.slice(0, kop) + head + sjabloon.slice(staart));
  });

  console.log(`product/ → ${slugs.length} pagina's (${metBeeld} met eigen og-beeld)`);
}

bouwVerhaalPaginas();
bouwProductPaginas();
bouwLossePaginas();
