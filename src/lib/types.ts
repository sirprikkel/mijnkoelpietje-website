export type Rubriek = 'ondergronds' | 'bovengronds' | 'de-sporen' | 'knipoog' | 'de-stem';

export interface Verhaal {
  /** Bestandsnaam zonder .json (kan emoji en een afsluitende punt bevatten). */
  slug: string;
  /** URL-segment: padVeilig(slug). */
  urlSlug: string;
  /** Sleutel voor likes/reacties in Supabase: v.id || v.titel, NIET de slug. Niet wijzigen. */
  likeId: string;
  titel: string;
  rubriek: string;
  datum: string;
  datumTs: number;
  intro: string;
  tekst: string;
  afbeelding: string | null;
  uitgelicht: boolean;
  link: string | null;
}

/** Lichte variant voor overzichten/zoeken: geen volledige tekst meesturen naar de browser. */
export type VerhaalKaart = Omit<Verhaal, 'tekst'>;

export interface Kunstwerk {
  slug: string;
  urlSlug: string;
  id: string;
  titel: string;
  volgorde: number | null;
  collectie: string;
  beschrijving: string;
  prijs: string;
  afbeelding: string | null;
  /** Hoofdafbeelding eerst, daarna extra foto's (productFotos() uit main.js). */
  fotos: string[];
  editie: string;
  mollieLink: string | null;
  link: string | null;
}

export interface NieuwsItem {
  slug: string;
  id: string;
  titel: string;
  categorie: string;
  datum: string;
  datumTs: number;
  tekst: string;
  link: string | null;
}

export interface Sponsor {
  slug: string;
  naam: string;
  omschrijving: string;
  website: string | null;
  logo: string | null;
}

export interface Activiteit {
  slug: string;
  titel: string;
  type: string;
  datum: string;
  beschrijving: string;
  locatie: string;
  afbeelding: string | null;
  link: string | null;
}

export interface Bundel {
  titel: string;
  label: string;
  beschrijving: string;
  prijs: string;
  oudePrijs: string;
  korting: string;
  knopTekst: string;
  mollieLink: string | null;
  tonen: boolean;
}

export type VoordeelIcoon = 'betalen' | 'retour' | 'contact' | 'verzending' | 'levertijd' | 'handgemaakt' | 'ophalen';

export interface ShopVoordeel {
  icoon: VoordeelIcoon;
  titel: string;
  tekst: string;
}

export interface ShopInstellingen {
  voordelen: ShopVoordeel[];
  actie: { tekst: string; code: string } | null;
}

export const RUBRIEK_CONFIG: Record<string, { label: string; kleur: string; bg: string }> = {
  ondergronds: { label: 'Ondergronds', kleur: '#f5c400', bg: 'rgba(245,196,0,0.15)' },
  bovengronds: { label: 'Bovengronds', kleur: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  'de-sporen': { label: 'De Sporen', kleur: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  knipoog: { label: 'Knipoog', kleur: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  'de-stem': { label: 'De Stem', kleur: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
};
