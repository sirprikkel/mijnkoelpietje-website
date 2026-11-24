import { RUBRIEK_CONFIG } from '@/lib/types';

export interface RubriekStijl {
  label: string;
  kleur: string;
  bg: string;
}

/** Zelfde terugval als `rubriekConfig[v.rubriek] || {...}` in de oude main.js. */
export function rubriekStijl(rubriek: string): RubriekStijl {
  return RUBRIEK_CONFIG[rubriek] ?? { label: rubriek, kleur: '#f5c400', bg: 'rgba(245,196,0,0.15)' };
}

/**
 * Zelfde als cleanTekst() in @/lib/markdown. Hier gedupliceerd zodat client
 * components niet via markdown.ts de hele marked-bibliotheek meebundelen.
 */
export function cleanTekst(txt: string | undefined | null): string {
  if (!txt) return '';
  return txt.replace(/^(staand|liggend|vierkant|none|None)\s*/gi, '').trim();
}
