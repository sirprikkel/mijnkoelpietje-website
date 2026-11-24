'use client';

import { useEffect, useRef, useState } from 'react';
import { SITE_URL } from '@/lib/slug';

interface DeelBlokProps {
  titel: string;
  /** Pad van de pagina, bv. verhaalUrl(slug). De origin komt uit de browser. */
  pad: string;
  kopTekst?: string;
}

async function kopieer(tekst: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(tekst);
    return true;
  } catch {
    // Geen clipboard-API (oudere browser of geen https): oude methode.
    const ta = document.createElement('textarea');
    ta.value = tekst;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:absolute;left:-9999px;';
    document.body.appendChild(ta);
    ta.select();
    let gelukt = false;
    try {
      gelukt = document.execCommand('copy');
    } catch {
      gelukt = false;
    }
    document.body.removeChild(ta);
    return gelukt;
  }
}

/** Port van deelBlok() uit de oude main.js. */
export function DeelBlok({ titel: ruweTitel, pad, kopTekst = 'Deel dit verhaal' }: DeelBlokProps) {
  const titel = ruweTitel || 'MijnKoelPietje';
  const [url, setUrl] = useState(SITE_URL + pad);
  // Server-HTML: WhatsApp/e-mail (zonder JS werkt dat ook). Na hydratie de
  // systeemdeelknop als de browser die heeft, zoals de oude site.
  const [kanDelen, setKanDelen] = useState(false);
  const [melding, setMelding] = useState('');
  const [toon, setToon] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setUrl(window.location.origin + pad);
    setKanDelen(typeof navigator.share === 'function');
  }, [pad]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const meld = (tekst: string) => {
    setMelding(tekst);
    setToon(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToon(false), 2000);
  };

  const deel = async () => {
    try {
      await navigator.share({ title: titel, text: titel, url });
    } catch {
      // geannuleerd door de bezoeker
    }
  };

  return (
    <div className="kaart" style={{ marginTop: '2.5rem', padding: '1.25rem 1.5rem' }}>
      <div className="mono text-xs uppercase mb-3" style={{ color: 'rgba(245,196,0,0.7)', letterSpacing: '0.1em' }}>
        {kopTekst}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
        {kanDelen ? (
          <button type="button" className="btn-outline" aria-label={kopTekst} onClick={deel}>
            Deel
          </button>
        ) : (
          <>
            <a
              className="btn-outline"
              href={'https://wa.me/?text=' + encodeURIComponent(titel + '\n' + url)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              WhatsApp
            </a>
            <a
              className="btn-outline"
              href={'mailto:?subject=' + encodeURIComponent(titel) + '&body=' + encodeURIComponent(titel + '\n\n' + url)}
              style={{ textDecoration: 'none' }}
            >
              E-mail
            </a>
          </>
        )}
        <button
          type="button"
          className="btn-outline"
          aria-label="Kopieer de link naar dit verhaal"
          onClick={async () => meld((await kopieer(url)) ? 'gekopieerd!' : 'kopiëren mislukt')}
        >
          Link kopiëren
        </button>
        <span
          className="mono text-xs"
          style={{ color: 'var(--geel)', opacity: toon ? 1 : 0, transition: 'opacity 0.2s' }}
          role="status"
          aria-live="polite"
        >
          {melding}
        </span>
      </div>
    </div>
  );
}
