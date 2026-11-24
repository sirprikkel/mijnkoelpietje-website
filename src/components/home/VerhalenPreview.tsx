import Image from 'next/image';
import Link from 'next/link';
import type { VerhaalKaart } from '@/lib/types';
import { RUBRIEK_CONFIG } from '@/lib/types';
import { cleanTekst } from '@/lib/markdown';
import { verhaalUrl } from '@/lib/slug';

const KOP_STIJL: React.CSSProperties = {
  fontFamily: "'Poiret One',sans-serif",
  fontSize: 'clamp(1.8rem,4vw,2.5rem)',
  fontWeight: 400,
};

/** VERHALEN PREVIEW — Chapter 2 (renderVerhalenPreview: de 3 nieuwste). */
export function VerhalenPreview({ verhalen }: { verhalen: VerhaalKaart[] }) {
  const drie = verhalen.slice(0, 3);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
      <div className="reveal flex items-end justify-between mb-12 flex-wrap gap-4">
        <div>
          <div className="mono text-xs tracking-widest uppercase mb-2" style={{ color: 'rgba(245,196,0,0.7)' }}>
            Verhalen
          </div>
          <h2 style={KOP_STIJL}>Uit de Diepte</h2>
        </div>
        <Link href="/verhalen" className="btn-outline hidden md:block">
          Alle verhalen
        </Link>
      </div>

      <div id="verhalen-preview" className="grid md:grid-cols-3 gap-6">
        {drie.map((v) => {
          const cfg = RUBRIEK_CONFIG[v.rubriek] ?? { label: v.rubriek, kleur: '#f5c400', bg: 'rgba(245,196,0,0.15)' };
          return (
            <Link
              key={v.slug}
              href={verhaalUrl(v.slug)}
              className="kaart reveal overflow-hidden block"
              style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}
            >
              {v.afbeelding && (
                <div
                  className="relative overflow-hidden"
                  style={{ height: '220px', background: 'linear-gradient(135deg,#1a1400,#0a0a0a)' }}
                >
                  <Image
                    src={v.afbeelding}
                    alt={v.titel}
                    fill
                    sizes="(min-width: 1152px) 368px, (min-width: 768px) 33vw, 100vw"
                    style={{ objectFit: 'contain', opacity: 0.75 }}
                  />
                </div>
              )}
              <div style={{ height: '3px', background: cfg.kleur, width: '100%' }} />
              <div className="p-6">
                <span className="rubriek-tag" style={{ background: cfg.bg, color: cfg.kleur }}>
                  {cfg.label}
                </span>
                <h3 style={{ fontFamily: "'Poiret One',sans-serif", fontWeight: 400 }} className="text-xl mt-3 mb-2">
                  {v.titel}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{cleanTekst(v.intro)}</p>
                <div className="mt-4 mono text-xs" style={{ color: cfg.kleur }}>
                  Lees meer →
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="text-center mt-8 md:hidden">
        <Link href="/verhalen" className="btn-outline">
          Alle verhalen
        </Link>
      </div>
    </section>
  );
}
