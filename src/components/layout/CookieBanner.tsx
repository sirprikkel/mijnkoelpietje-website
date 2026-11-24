'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const SLEUTEL = 'cookie_akkoord';

export function CookieBanner() {
  const [zichtbaar, setZichtbaar] = useState(false);

  useEffect(() => {
    let akkoord = false;
    try {
      akkoord = !!localStorage.getItem(SLEUTEL);
    } catch {
      // localStorage geblokkeerd (privémodus): banner gewoon tonen
    }
    if (akkoord) return;
    const t = setTimeout(() => setZichtbaar(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const akkoord = () => {
    try {
      localStorage.setItem(SLEUTEL, '1');
    } catch {
      // niet op te slaan: banner verdwijnt alleen voor deze pagina
    }
    setZichtbaar(false);
  };

  if (!zichtbaar) return null;

  return (
    <div id="cookie-banner" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300, background: 'rgba(10,10,10,0.97)', borderTop: '1px solid rgba(245,196,0,0.2)', padding: '1.25rem 1.5rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
        <p style={{ color: '#aaa', fontFamily: "'Didact Gothic',sans-serif", fontSize: '0.82rem', lineHeight: 1.6, margin: 0, flex: 1, minWidth: 260 }}>
          Deze website gebruikt <strong style={{ color: '#e8e8e8' }}>functionele cookies</strong> en lokale opslag om jouw stem (like) te onthouden via Supabase. Er worden geen persoonsgegevens verkocht of gedeeld met adverteerders.{' '}
          <Link href="/disclaimer" style={{ color: 'var(--geel)', fontSize: '0.82rem', textDecoration: 'underline' }}>Meer info</Link>
        </p>
        <button id="cookie-akkoord" onClick={akkoord} style={{ background: 'var(--geel)', color: '#000', fontFamily: "'Space Mono',monospace", fontSize: '0.78rem', fontWeight: 700, border: 'none', borderRadius: 8, padding: '0.65rem 1.5rem', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 44 }}>
          Akkoord
        </button>
      </div>
    </div>
  );
}
