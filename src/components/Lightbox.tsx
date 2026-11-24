'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface LightboxKnopProps {
  fotos: string[];
  index?: number;
  alt: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

/**
 * Knop die een lightbox (serie foto's) opent. Zelfde markup, ids en gedrag als de
 * oude #lightbox: vorige/volgende (doorlopend), teller, Esc en klik buiten sluiten,
 * pijltjestoetsen alleen als hij open staat, focus terug naar de knop na sluiten.
 */
export function LightboxKnop({
  fotos,
  index = 0,
  alt,
  children,
  className,
  style,
  'aria-label': ariaLabel,
}: LightboxKnopProps) {
  const [open, setOpen] = useState(false);
  const [huidig, setHuidig] = useState(0);
  const knopRef = useRef<HTMLButtonElement>(null);
  const sluitRef = useRef<HTMLButtonElement>(null);
  const aantal = fotos.length;

  const openen = () => {
    if (aantal === 0) return;
    setHuidig(Math.min(Math.max(index, 0), aantal - 1));
    setOpen(true);
  };

  const sluiten = useCallback(() => {
    setOpen(false);
    knopRef.current?.focus();
  }, []);

  const vorige = useCallback(() => {
    if (aantal < 2) return;
    setHuidig((i) => (i - 1 + aantal) % aantal);
  }, [aantal]);

  const volgende = useCallback(() => {
    if (aantal < 2) return;
    setHuidig((i) => (i + 1) % aantal);
  }, [aantal]);

  useEffect(() => {
    if (!open) return;
    const vorigeOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sluitRef.current?.focus();

    const opToets = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sluiten();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        vorige();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        volgende();
      }
    };
    document.addEventListener('keydown', opToets);
    return () => {
      document.removeEventListener('keydown', opToets);
      document.body.style.overflow = vorigeOverflow;
    };
  }, [open, sluiten, vorige, volgende]);

  const lightbox = open ? (
    <div
      id="lightbox"
      className={'open' + (aantal < 2 ? ' enkel' : '')}
      role="dialog"
      aria-modal="true"
      aria-label="Afbeeldingsvergroting"
      onClick={sluiten}
    >
      <button id="lightbox-close" ref={sluitRef} type="button" onClick={sluiten} aria-label="Sluiten">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="24" height="24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button
        id="lightbox-prev"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          vorige();
        }}
        aria-label="Vorige foto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="28" height="28">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        id="lightbox-next"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          volgende();
        }}
        aria-label="Volgende foto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="28" height="28">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
      <div id="lightbox-teller" className="mono" aria-live="polite">
        {huidig + 1} / {aantal}
      </div>
      {/* Volle weergave van het origineel: bewust een gewone <img>. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img id="lightbox-img" src={fotos[huidig]} alt={alt} />
    </div>
  ) : null;

  return (
    <>
      <button
        ref={knopRef}
        type="button"
        className={className}
        style={style}
        aria-label={ariaLabel}
        onClick={openen}
      >
        {children}
      </button>
      {lightbox && typeof document !== 'undefined' ? createPortal(lightbox, document.body) : null}
    </>
  );
}

export default LightboxKnop;
