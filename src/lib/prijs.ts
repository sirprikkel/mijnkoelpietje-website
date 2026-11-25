/**
 * Prijs uit het CMS (vrije tekst, bijv. "8", "27,50", "0") netjes tonen.
 * Hele bedragen: "€ 8,–". Met centen: "€ 27,50". Nul: "Gratis". Leeg: "".
 */
export function formatPrijs(prijs: string): string {
  const schoon = prijs.trim().replace(/^€\s*/, '');
  if (!schoon) return '';
  const getal = parseFloat(schoon.replace(',', '.'));
  if (getal === 0) return 'Gratis';
  if (!Number.isFinite(getal)) return `€ ${schoon}`; // vrije tekst uit het CMS: ongewijzigd tonen
  if (Number.isInteger(getal)) return `€ ${getal},–`;
  return `€ ${getal.toFixed(2).replace('.', ',')}`;
}
