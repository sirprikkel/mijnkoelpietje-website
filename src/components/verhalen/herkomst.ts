// Onthoudt vanuit welke pagina een verhaal is geopend (overzicht of galerij),
// zodat de terugknop daarheen gaat en de scrollpositie kan herstellen.
// Port van verhaalHerkomst / galerijScrollPositie / overzichtScrollPositie uit
// de oude main.js. sessionStorage: overleeft de navigatie, niet een nieuw tabblad.

export type HerkomstPad = '/verhalen' | '/galerij';

export interface Herkomst {
  pad: HerkomstPad;
  /** urlSlug van het geopende verhaal: herkomst geldt alleen voor dát verhaal. */
  urlSlug: string;
  scrollY: number;
  /** Afstand van de aangeklikte kaart/tegel tot de bovenkant van het venster. */
  ankerTop?: number;
  /** Filterstand van het overzicht, om die bij terugkeer te herstellen. */
  filters?: OverzichtFilters;
}

export interface OverzichtFilters {
  zoek: string;
  rubriek: string;
  jaar: string;
}

const HERKOMST_SLEUTEL = 'mkp-verhaal-herkomst';
const HERSTEL_SLEUTEL = 'mkp-verhaal-herstel';
const FILTER_SLEUTEL = 'mkp-verhalen-filters';

function lees<T>(sleutel: string): T | null {
  try {
    const ruw = window.sessionStorage.getItem(sleutel);
    return ruw ? (JSON.parse(ruw) as T) : null;
  } catch {
    return null; // geen sessionStorage (privémodus) of kapotte waarde
  }
}

function schrijf(sleutel: string, waarde: unknown): void {
  try {
    if (waarde === null) window.sessionStorage.removeItem(sleutel);
    else window.sessionStorage.setItem(sleutel, JSON.stringify(waarde));
  } catch {
    // geen sessionStorage: terugknop valt terug op het overzicht zonder scrollherstel
  }
}

export function zetHerkomst(herkomst: Herkomst): void {
  schrijf(HERKOMST_SLEUTEL, herkomst);
}

/** Herkomst voor dit verhaal, of null (direct geopend / via home / gedeelde link). */
export function leesHerkomst(urlSlug: string): Herkomst | null {
  const h = lees<Herkomst>(HERKOMST_SLEUTEL);
  if (!h || h.urlSlug !== urlSlug) return null;
  if (h.pad !== '/verhalen' && h.pad !== '/galerij') return null;
  return h;
}

/** Terugknop geklikt: de doelpagina leest dit één keer uit en herstelt de stand. */
export function zetHerstel(herkomst: Herkomst): void {
  schrijf(HERKOMST_SLEUTEL, null);
  schrijf(HERSTEL_SLEUTEL, herkomst);
}

export function pakHerstel(pad: HerkomstPad): Herkomst | null {
  const h = lees<Herkomst>(HERSTEL_SLEUTEL);
  if (!h || h.pad !== pad) return null;
  schrijf(HERSTEL_SLEUTEL, null);
  return h;
}

/** Filters van het overzicht blijven de hele sessie staan (zoals in de oude site), ook bij browser-Terug. */
export function bewaarFilters(filters: OverzichtFilters): void {
  schrijf(FILTER_SLEUTEL, filters);
}

export function leesFilters(): OverzichtFilters | null {
  const f = lees<OverzichtFilters>(FILTER_SLEUTEL);
  if (!f || typeof f.zoek !== 'string' || typeof f.rubriek !== 'string' || typeof f.jaar !== 'string') return null;
  return f;
}

/** Attribuut op de kaart/tegel waarop het scrollherstel ankert. */
export const ANKER_ATTRIBUUT = 'data-verhaal-anker';

/**
 * Zet de aangeklikte kaart/tegel weer op dezelfde plek in het venster. Ankeren
 * op het element i.p.v. op scrollY: lazy beelden boven het zicht staan bij
 * terugkomst nog op hun plaatshouderhoogte, waardoor dezelfde Y andere tegels
 * toont. Een paar keer herhalen, omdat beelden nog binnenkomen.
 */
export function herstelScroll(h: Herkomst): void {
  const ga = () => {
    const el = document.querySelector<HTMLElement>(`[${ANKER_ATTRIBUUT}="${CSS.escape(h.urlSlug)}"]`);
    const doel = el && h.ankerTop !== undefined
      ? window.scrollY + el.getBoundingClientRect().top - h.ankerTop
      : h.scrollY;
    if (Math.abs(window.scrollY - doel) > 2) window.scrollTo({ top: doel, behavior: 'instant' });
  };
  requestAnimationFrame(ga);
  window.setTimeout(ga, 300);
  window.setTimeout(ga, 1000);
}

/** Herkomst vastleggen bij een klik op een kaart/tegel. */
export function legHerkomstVast(
  pad: HerkomstPad,
  urlSlug: string,
  element: Element | null,
  filters?: OverzichtFilters,
): void {
  const anker = element?.closest(`[${ANKER_ATTRIBUUT}]`);
  zetHerkomst({
    pad,
    urlSlug,
    scrollY: window.scrollY,
    ankerTop: anker ? anker.getBoundingClientRect().top : undefined,
    filters,
  });
}
