'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { VerhaalKaart } from '@/lib/types';
import { verhaalUrl } from '@/lib/slug';
import { cleanTekst, rubriekStijl } from './rubriek';
import { ANKER_ATTRIBUUT } from './herkomst';

function externeHref(url: string): string {
  return /^https?:\/\//.test(url) ? url : 'https://' + url;
}

/** Tekst waarop gezocht wordt: wat de oude filterVerhalen() via kaart.innerText zag. */
export function zoekTekst(v: VerhaalKaart): string {
  const cfg = rubriekStijl(v.rubriek);
  const voet = v.link ? 'Meer info →' : 'Lees meer →';
  return `${cfg.label} ${v.titel} ${cleanTekst(v.intro)} ${voet}`.toLowerCase();
}

interface VerhaalKaartItemProps {
  verhaal: VerhaalKaart;
  onOpen: (urlSlug: string, element: Element) => void;
}

/**
 * Eén kaart uit renderVerhalenGrid(). De hele kaart is klikbaar via een
 * 'stretched link' op de titel; de optionele externe link ligt erboven, zodat
 * er geen <a> in een <a> staat.
 */
export function VerhaalKaartItem({ verhaal: v, onOpen }: VerhaalKaartItemProps) {
  const cfg = rubriekStijl(v.rubriek);

  return (
    <div className="kaart overflow-hidden relative" data-rubriek={v.rubriek} role="listitem" {...{ [ANKER_ATTRIBUUT]: v.urlSlug }}>
      {v.afbeelding && (
        <div
          className="relative overflow-hidden"
          style={{ height: '220px', background: 'linear-gradient(135deg,#1a1400,#0a0a0a)' }}
        >
          <Image
            src={v.afbeelding}
            alt={v.titel}
            fill
            sizes="(min-width: 1024px) 384px, (min-width: 768px) 50vw, 100vw"
            style={{ objectFit: 'contain', opacity: 0.75 }}
          />
        </div>
      )}
      <div style={{ height: 3, background: cfg.kleur, width: '100%' }} />
      <div className="p-6">
        <span className="rubriek-tag" style={{ background: cfg.bg, color: cfg.kleur }}>
          {cfg.label}
        </span>
        <h3 className="font-bold text-lg mt-3 mb-2">
          <Link
            href={verhaalUrl(v.slug)}
            onClick={e => onOpen(v.urlSlug, e.currentTarget)}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-[-2px] focus-visible:after:rounded-2xl"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {v.titel}
          </Link>
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed">{cleanTekst(v.intro)}</p>
        {v.link ? (
          <a
            href={externeHref(v.link)}
            target="_blank"
            rel="noopener"
            className="mono text-xs mt-2 inline-block relative z-10"
            style={{ color: cfg.kleur }}
          >
            Meer info {'→'}
          </a>
        ) : (
          <div className="mt-4 text-xs mono" style={{ color: cfg.kleur }}>
            Lees meer {'→'}
          </div>
        )}
      </div>
    </div>
  );
}
