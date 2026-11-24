import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { cache } from 'react';
import { createHash } from 'node:crypto';
import { parseNLDatum } from './datum';
import { normaliseerSlug, padVeilig } from './slug';
import type {
  Activiteit, Bundel, Kunstwerk, NieuwsItem, Sponsor, Verhaal, VerhaalKaart,
} from './types';

// Leest de CMS-content (content/<collectie>/*.json) bij het bouwen.
// Eén kapot bestand mag de build niet breken: dan zou de site niet meer
// bijwerken na een publicatie in het CMS. Overslaan + duidelijke waarschuwing.

// Moet gelijk blijven aan scripts/og-naam.mjs.
function ogNaam(bron: string): string {
  return createHash('sha1').update(String(bron)).digest('hex').slice(0, 16) + '.jpg';
}

const CONTENT_DIR = path.join(process.cwd(), 'content');

type Ruw = Record<string, unknown>;

function str(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}

function strOfNull(v: unknown): string | null {
  const s = str(v).trim();
  return s ? s : null;
}

function leesCollectie(collectie: string): Array<{ slug: string; data: Ruw }> {
  const dir = path.join(CONTENT_DIR, collectie);
  if (!fs.existsSync(dir)) return [];
  const uit: Array<{ slug: string; data: Ruw }> = [];
  for (const bestand of fs.readdirSync(dir)) {
    if (!bestand.endsWith('.json') || bestand === 'index.json') continue;
    const slug = bestand.slice(0, -'.json'.length).normalize('NFC');
    try {
      const data: unknown = JSON.parse(fs.readFileSync(path.join(dir, bestand), 'utf8'));
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        console.warn(`[content] ${collectie}/${bestand}: geen object, overgeslagen`);
        continue;
      }
      uit.push({ slug, data: data as Ruw });
    } catch (e) {
      console.warn(`[content] ${collectie}/${bestand}: ongeldige JSON, overgeslagen (${(e as Error).message})`);
    }
  }
  return uit;
}

function productFotos(d: Ruw): string[] {
  const lijst: string[] = [];
  const hoofd = d.afbeelding;
  if (typeof hoofd === 'string' && hoofd) lijst.push(hoofd);
  const extra = Array.isArray(d.fotos) ? d.fotos : [];
  for (const f of extra) {
    const o = f as Ruw | string | null;
    const pad = typeof o === 'string' ? o : o && (o.afbeelding || o.image || o.src);
    if (typeof pad === 'string' && pad && !lijst.includes(pad)) lijst.push(pad);
  }
  return lijst;
}

// ─── Verhalen ────────────────────────────────────────────────────────────────

export const getVerhalen = cache((): Verhaal[] => {
  const lijst: Verhaal[] = [];
  for (const { slug, data } of leesCollectie('verhalen')) {
    const titel = str(data.titel);
    if (!titel) {
      console.warn(`[content] verhalen/${slug}: geen titel, overgeslagen`);
      continue;
    }
    lijst.push({
      slug,
      urlSlug: padVeilig(slug),
      likeId: str(data.id) || titel || 'onbekend',
      titel,
      rubriek: str(data.rubriek),
      datum: str(data.datum),
      datumTs: parseNLDatum(str(data.datum)),
      intro: str(data.intro),
      tekst: str(data.tekst),
      afbeelding: strOfNull(data.afbeelding),
      uitgelicht: data.uitgelicht === true,
      link: strOfNull(data.link),
    });
  }
  // Nieuwste eerst (verhalenGesorteerd() in de oude main.js).
  return lijst.sort((a, b) => b.datumTs - a.datumTs);
});

export function naarKaart(v: Verhaal): VerhaalKaart {
  const { tekst: _tekst, ...kaart } = v;
  return kaart;
}

export const getVerhaalKaarten = cache((): VerhaalKaart[] => getVerhalen().map(naarKaart));

/** Zoekt een verhaal op URL-segment; tolerant voor codering, NFC en afsluitende punten. */
export function getVerhaalBySegment(segment: string): Verhaal | null {
  const gezocht = normaliseerSlug(segment);
  return getVerhalen().find(v => v.urlSlug === gezocht) ?? null;
}

// ─── Kunstwerken (shop) ──────────────────────────────────────────────────────

export const getKunstwerken = cache((): Kunstwerk[] => {
  const lijst: Kunstwerk[] = [];
  for (const { slug, data } of leesCollectie('kunstwerken')) {
    if (data.tonen === false) continue; // tijdelijk uit de shop gehaald via het CMS
    const titel = str(data.titel);
    const n = parseInt(str(data.volgorde), 10);
    lijst.push({
      slug,
      urlSlug: padVeilig(slug),
      id: str(data.id) || titel || 'onbekend',
      titel,
      volgorde: Number.isFinite(n) ? n : null,
      collectie: str(data.collectie),
      beschrijving: str(data.beschrijving),
      prijs: str(data.prijs),
      afbeelding: strOfNull(data.afbeelding),
      fotos: productFotos(data),
      editie: str(data.editie),
      mollieLink: strOfNull(data.mollie_link),
      link: strOfNull(data.link),
    });
  }
  // Laag volgnummer bovenaan; zonder volgorde achteraan, onderling op titel.
  return lijst.sort((a, b) => {
    const va = a.volgorde ?? Number.MAX_SAFE_INTEGER;
    const vb = b.volgorde ?? Number.MAX_SAFE_INTEGER;
    if (va !== vb) return va - vb;
    return a.titel.localeCompare(b.titel, 'nl');
  });
});

export function getKunstwerkBySegment(segment: string): Kunstwerk | null {
  const gezocht = normaliseerSlug(segment);
  return getKunstwerken().find(k => k.urlSlug === gezocht) ?? null;
}

// ─── Overige collecties ──────────────────────────────────────────────────────

export const getNieuws = cache((): NieuwsItem[] =>
  leesCollectie('nieuws')
    .map(({ slug, data }) => ({
      slug,
      id: str(data.id) || str(data.titel) || 'onbekend',
      titel: str(data.titel),
      categorie: str(data.categorie),
      datum: str(data.datum),
      datumTs: parseNLDatum(str(data.datum)),
      tekst: str(data.tekst),
      link: strOfNull(data.link),
    }))
    .sort((a, b) => b.datumTs - a.datumTs),
);

export const getSponsoren = cache((): Sponsor[] =>
  leesCollectie('sponsoren')
    .filter(({ data }) => data.id || data.naam)
    .map(({ slug, data }) => ({
      slug,
      naam: str(data.naam),
      omschrijving: str(data.omschrijving),
      website: strOfNull(data.website),
      logo: strOfNull(data.logo),
    })),
);

export const getActiviteiten = cache((): Activiteit[] =>
  leesCollectie('activiteiten')
    .filter(({ data }) => data.titel)
    .map(({ slug, data }) => ({
      slug,
      titel: str(data.titel),
      type: str(data.type),
      datum: str(data.datum),
      beschrijving: str(data.beschrijving),
      locatie: str(data.locatie),
      afbeelding: strOfNull(data.afbeelding),
      link: strOfNull(data.link),
    })),
);

export const getBundel = cache((): Bundel | null => {
  const bestand = path.join(CONTENT_DIR, 'shop-instellingen', 'bundel.json');
  if (!fs.existsSync(bestand)) return null;
  try {
    const d = JSON.parse(fs.readFileSync(bestand, 'utf8')) as Ruw;
    return {
      titel: str(d.titel),
      label: str(d.label),
      beschrijving: str(d.beschrijving),
      prijs: str(d.prijs),
      oudePrijs: str(d.oude_prijs),
      korting: str(d.korting),
      knopTekst: str(d.knop_tekst) || 'Bundel kopen',
      mollieLink: strOfNull(d.mollie_link),
      tonen: d.tonen !== false,
    };
  } catch (e) {
    console.warn(`[content] shop-instellingen/bundel.json: ongeldig (${(e as Error).message})`);
    return null;
  }
});

export const OG_STANDAARD = '/og-default.jpg';

/** og-afbeelding (1200x630) uit scripts/build-og.mjs; zonder bron de standaardafbeelding. */
export function ogAfbeelding(bron: string | null): string {
  if (!bron || !bron.startsWith('/')) return OG_STANDAARD;
  return `/og/${ogNaam(bron)}`;
}
