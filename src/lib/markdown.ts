import { marked } from 'marked';

/** Strip per ongeluk ingevoerde formaatwoorden (zelfde als cleanTekst() in de oude main.js). */
export function cleanTekst(txt: string | undefined | null): string {
  if (!txt) return '';
  return txt.replace(/^(staand|liggend|vierkant|none|None)\s*/gi, '').trim();
}

/**
 * Port van renderMarkdown() uit de oude main.js. Draait bij het bouwen, zodat de
 * browser geen marked.js meer hoeft te laden. Content komt uit de eigen CMS-repo
 * en werd ook in de oude site ongefilterd als HTML getoond.
 */
export function renderMarkdown(txt: string | undefined | null): string {
  if (!txt) return '';
  const schoon = cleanTekst(txt);
  if (/<(p|div|blockquote|h[1-6]|ul|ol|li|em|strong)\b/i.test(schoon)) return schoon;
  const processed = schoon.replace(/\*\*~~([^~]+)~~\*\*/g, '### $1');
  return marked.parse(processed, { async: false }) as string;
}

/** Normaliseert een externe link (zelfde als linkHTML() in de oude main.js, maar alleen de href). */
export function externeHref(url: string | undefined | null): string | null {
  if (!url) return null;
  return /^https?:\/\//.test(url) ? url : 'https://' + url;
}
