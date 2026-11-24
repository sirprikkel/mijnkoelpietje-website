'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { leesHerkomst, zetHerstel, type Herkomst } from './herkomst';

interface TerugKnopProps {
  urlSlug: string;
  /** 'boven': vaste knop met pijl-icoon; 'onder': btn-outline onder het artikel. */
  variant: 'boven' | 'onder';
}

/**
 * Port van terugLabel()/terugNaarGalerij()/sluitVerhaal(): gaat terug naar de
 * pagina waar het verhaal is geopend (galerij of overzicht), met scrollherstel.
 * Zonder bekende herkomst (gedeelde link, home): naar het overzicht.
 */
export function TerugKnop({ urlSlug, variant }: TerugKnopProps) {
  const router = useRouter();
  const [herkomst, setHerkomst] = useState<Herkomst | null>(null);

  useEffect(() => {
    setHerkomst(leesHerkomst(urlSlug));
  }, [urlSlug]);

  const naarGalerij = herkomst?.pad === '/galerij';
  const label = naarGalerij ? 'Terug naar galerij' : 'Terug naar overzicht';
  const doel = herkomst?.pad ?? '/verhalen';

  const terug = () => {
    if (herkomst) zetHerstel(herkomst);
    router.push(doel, { scroll: !herkomst });
  };

  if (variant === 'onder') {
    return (
      <button type="button" onClick={terug} className="btn-outline">
        {'←'} {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      id="verhaal-terug-boven"
      onClick={terug}
      className="flex items-center gap-2 mb-8 transition-colors text-sm mono cursor-pointer bg-transparent border-none min-h-[44px]"
      style={{ color: 'rgba(245,196,0,0.8)' }}
      aria-label={label}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      {label}
    </button>
  );
}
