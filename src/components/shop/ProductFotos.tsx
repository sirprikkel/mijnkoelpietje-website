'use client';

import Image from 'next/image';
import { useState } from 'react';
import { LightboxKnop } from '@/components/Lightbox';

/**
 * Productfoto's zoals in het voorbeeld: verticale fotostrip links (desktop),
 * grote foto rechts met vergrootglas. Op mobiel staat de strip onder de foto.
 */
export function ProductFotos({ fotos, titel }: { fotos: string[]; titel: string }) {
  const [actief, setActief] = useState(0);
  if (fotos.length === 0) return null;
  const meer = fotos.length > 1;

  return (
    <div className={meer ? 'product-fotos met-strip' : 'product-fotos'}>
      {meer && (
        <div className="product-strip" role="group" aria-label="Kies een foto">
          {fotos.map((foto, i) => (
            <button
              key={foto}
              type="button"
              className={'thumb' + (i === actief ? ' actief' : '')}
              aria-label={`Foto ${i + 1} van ${fotos.length}`}
              aria-pressed={i === actief}
              onClick={() => setActief(i)}
            >
              <Image src={foto} alt="" width={96} height={96} sizes="96px" />
            </button>
          ))}
        </div>
      )}

      <LightboxKnop
        fotos={fotos}
        index={actief}
        alt={titel}
        className="product-hoofdfoto"
        aria-label={'Vergroot foto van ' + titel}
      >
        <Image
          id="product-hoofdfoto"
          key={fotos[actief]}
          src={fotos[actief]}
          alt={titel}
          fill
          priority={actief === 0}
          sizes="(min-width: 1152px) 560px, (min-width: 768px) 50vw, 100vw"
          style={{ objectFit: 'contain' }}
        />
        <span className="product-zoom" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width={18} height={18}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z" />
          </svg>
        </span>
      </LightboxKnop>
    </div>
  );
}
