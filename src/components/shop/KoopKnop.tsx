import Link from 'next/link';

/**
 * Link naar het contactformulier met het product als onderwerp
 * (vervangt contactKopen(titel) uit de oude main.js).
 */
export function contactKopenHref(titel: string): string {
  const bericht = `Hallo, ik heb interesse in of een vraag over het product "${titel}" in de webshop.`;
  return (
    '/contact?onderwerp=' +
    encodeURIComponent('Vraag over de kunst: ' + titel) +
    '&bericht=' +
    encodeURIComponent(bericht)
  );
}

interface KoopKnopProps {
  titel: string;
  mollieLink: string | null;
  groot?: boolean;
  /** Tekst op de knop; standaard 'Kopen' (Mollie) of 'Bestellen' (contact). */
  tekst?: string;
  className?: string;
}

/** Port van koopKnop(k, groot): Mollie-betaallink, anders naar het contactformulier. */
export function KoopKnop({ titel, mollieLink, groot = false, tekst, className }: KoopKnopProps) {
  const maat = className ?? (groot ? 'text-base px-8 py-3' : 'text-sm');
  if (mollieLink) {
    return (
      <a href={mollieLink} target="_blank" rel="noopener" className={'btn-geel ' + maat}>
        {tekst ?? 'Kopen'}
      </a>
    );
  }
  return (
    <Link href={contactKopenHref(titel)} className={'btn-geel ' + maat}>
      {tekst ?? 'Bestellen'}
    </Link>
  );
}
