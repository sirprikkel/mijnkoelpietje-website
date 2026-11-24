'use client';

import { useEffect, useRef, useState } from 'react';
import { SITE_URL } from '@/lib/slug';

interface DeelKnoppenProps {
  titel: string;
  /** Pad zoals productUrl(slug). */
  pad: string;
  kopTekst?: string;
}

/** Deelblok onder een product (deelBlok in de oude main.js). */
export function DeelKnoppen({ titel: ruweTitel, pad, kopTekst = 'Deel dit product' }: DeelKnoppenProps) {
  const titel = ruweTitel || 'MijnKoelPietje';
  // Server-HTML met de vaste site-URL; in de browser de echte origin (zoals location.origin).
  const [url, setUrl] = useState(SITE_URL + pad);
  const [kanDelen, setKanDelen] = useState(false);
  const [melding, setMelding] = useState('');
  const [zichtbaar, setZichtbaar] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setUrl(window.location.origin + pad);
    setKanDelen(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, [pad]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const toon = (tekst: string) => {
    setMelding(tekst);
    setZichtbaar(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setZichtbaar(false), 2000);
  };

  const deel = async () => {
    try {
      await navigator.share({ title: titel, text: titel, url });
    } catch {
      // geannuleerd door de bezoeker
    }
  };

  const kopieer = async () => {
    let gelukt = false;
    try {
      await navigator.clipboard.writeText(url);
      gelukt = true;
    } catch {
      // Geen clipboard-API (oudere browser of geen https): oude methode.
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:absolute;left:-9999px;';
      document.body.appendChild(ta);
      ta.select();
      try {
        gelukt = document.execCommand('copy');
      } catch {
        gelukt = false;
      }
      document.body.removeChild(ta);
    }
    toon(gelukt ? 'gekopieerd!' : 'kopiëren mislukt');
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
        <button type="button" className="btn-outline" aria-label="Kopieer de link naar dit product" onClick={kopieer}>
          Link kopiëren
        </button>
        <span
          className="mono text-xs"
          role="status"
          aria-live="polite"
          style={{ color: 'var(--geel)', opacity: zichtbaar ? 1 : 0, transition: 'opacity 0.2s' }}
        >
          {melding}
        </span>
      </div>
    </div>
  );
}
