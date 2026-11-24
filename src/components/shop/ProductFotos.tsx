'use client';

import Image from 'next/image';
import { useState } from 'react';
import { LightboxKnop } from '@/components/Lightbox';

/** Hoofdfoto + thumbnailstrip (openProduct/kiesFoto in de oude main.js). */
export function ProductFotos({ fotos, titel }: { fotos: string[]; titel: string }) {
  const [actief, setActief] = useState(0);
  if (fotos.length === 0) return null;

  return (
    <div>
      <LightboxKnop
        fotos={fotos}
        index={actief}
        alt={titel}
        className="relative overflow-hidden block w-full p-0 border-none galerij-tegel"
        style={{ borderRadius: '12px', cursor: 'zoom-in', background: 'linear-gradient(135deg,#1a1400,#0a0a0a)' }}
        aria-label={'Vergroot foto van ' + titel}
      >
        {/* Hele foto tonen (contain), begrensd op de viewporthoogte. */}
        <Image
          id="product-hoofdfoto"
          key={fotos[actief]}
          src={fotos[actief]}
          alt={titel}
          width={1200}
          height={1200}
          priority={actief === 0}
          sizes="(min-width: 1152px) 556px, (min-width: 768px) 50vw, 100vw"
          style={{ width: '100%', height: 'auto', maxHeight: '62vh', objectFit: 'contain', display: 'block' }}
        />
      </LightboxKnop>

      {fotos.length > 1 && (
        <div className="thumb-strip">
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
    </div>
  );
}
