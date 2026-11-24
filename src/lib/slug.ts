// Slug- en URL-helpers. Bewust zonder Node-imports: ook bruikbaar in client components.

/**
 * Windows kan geen map maken die op een punt of spatie eindigt. De oude site
 * strippte die daarom uit de URL. Bestaande gedeelde links volgen die regel,
 * dus de nieuwe site doet hetzelfde.
 */
export function padVeilig(slug: string): string {
  return String(slug).replace(/[. ]+$/, '');
}

/** Normaliseert een slug uit een URL-segment: veilig decoderen, NFC, padVeilig. */
export function normaliseerSlug(segment: string): string {
  let s = segment;
  try {
    s = decodeURIComponent(segment);
  } catch {
    // segment was al gedecodeerd of ongeldig gecodeerd: gebruik zoals het is
  }
  return padVeilig(s.normalize('NFC'));
}

export function verhaalUrl(slug: string): string {
  return '/verhaal/' + encodeURIComponent(padVeilig(slug));
}

export function productUrl(slug: string): string {
  return '/product/' + encodeURIComponent(padVeilig(slug));
}

export const SITE_URL = 'https://www.mijnkoelpietje.nl';
