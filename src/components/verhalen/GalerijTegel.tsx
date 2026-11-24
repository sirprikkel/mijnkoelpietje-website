'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { verhaalUrl } from '@/lib/slug';
import { ANKER_ATTRIBUUT, legHerkomstVast } from './herkomst';
import { rubriekStijl } from './rubriek';

interface GalerijTegelProps {
  titel: string;
  slug: string;
  urlSlug: string;
  rubriek: string;
  afbeelding: string;
}

/**
 * Eén tegel uit renderGalerij(). De verhouding komt uit de foto zelf: tot die
 * geladen is houdt .galerij-beeld zijn 3/4-plaatshouder aan.
 */
export function GalerijTegel({ titel, slug, urlSlug, rubriek, afbeelding }: GalerijTegelProps) {
  const cfg = rubriekStijl(rubriek);
  const [verhouding, setVerhouding] = useState<string | null>(null);
  const [kapot, setKapot] = useState(false);

  return (
    <div className="galerij-item reveal" {...{ [ANKER_ATTRIBUUT]: urlSlug }}>
      <Link
        href={verhaalUrl(slug)}
        className="kaart overflow-hidden relative block w-full p-0 text-left galerij-tegel"
        aria-label={'Lees het verhaal: ' + titel}
        onClick={e => legHerkomstVast('/galerij', urlSlug, e.currentTarget)}
      >
        <div className="galerij-beeld" style={verhouding ? { aspectRatio: verhouding } : undefined}>
          {!kapot && (
            <Image
              src={afbeelding}
              alt={titel}
              fill
              sizes="(min-width: 1024px) 288px, (min-width: 768px) 33vw, 50vw"
              onLoad={e => {
                const img = e.currentTarget;
                if (img.naturalWidth && img.naturalHeight) setVerhouding(`${img.naturalWidth} / ${img.naturalHeight}`);
              }}
              // Gebroken foto: plaatshouderverhouding laten staan, anders springt de kolomverdeling.
              onError={() => setKapot(true)}
            />
          )}
          <div className="galerij-overlay">
            <div className="mono text-xs uppercase mb-1" style={{ color: cfg.kleur }}>
              {cfg.label}
            </div>
            <div className="text-sm leading-snug">{titel}</div>
          </div>
        </div>
      </Link>
    </div>
  );
}
