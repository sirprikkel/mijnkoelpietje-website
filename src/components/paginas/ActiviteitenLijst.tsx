import Image from 'next/image';
import type { Activiteit } from '@/lib/types';
import { cleanTekst } from '@/lib/markdown';
import { MeerInfoLink } from './MeerInfoLink';
import { POIRET } from './stijl';

const TYPE_KLEUREN: Record<string, { bg: string; kleur: string }> = {
  Tentoonstelling: { bg: 'rgba(245,196,0,0.12)', kleur: 'var(--geel)' },
  Lezing: { bg: 'rgba(59,130,246,0.12)', kleur: '#60a5fa' },
  Workshop: { bg: 'rgba(16,185,129,0.12)', kleur: '#34d399' },
  Evenement: { bg: 'rgba(168,85,247,0.12)', kleur: '#a855f7' },
  Anders: { bg: 'rgba(245,196,0,0.12)', kleur: 'var(--geel)' },
};

/**
 * Port van renderActiviteiten(). In de oude site is de sectie (#activiteiten-grid)
 * op verzoek van de klant uit index.html en het menu gehaald; content en code zijn
 * bewust bewaard. Deze component wordt daarom nergens gerenderd, maar staat klaar
 * om terug te zetten (bijv. in een src/app/activiteiten/page.tsx met getActiviteiten()).
 */
export function ActiviteitenLijst({ activiteiten }: { activiteiten: Activiteit[] }) {
  if (activiteiten.length === 0) {
    return (
      <div id="activiteiten-grid">
        <p className="text-gray-600 text-center py-8">Er zijn momenteel geen activiteiten gepland.</p>
      </div>
    );
  }
  return (
    <div id="activiteiten-grid" className="flex flex-col gap-6">
      {activiteiten.map(a => {
        const tc = TYPE_KLEUREN[a.type] || TYPE_KLEUREN.Anders;
        return (
          <div key={a.slug} className="kaart overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {a.afbeelding && (
                <div
                  className="relative overflow-hidden md:w-64 shrink-0"
                  style={{ minHeight: 180, background: 'linear-gradient(135deg,#1a1400,#0a0a0a)' }}
                >
                  <Image
                    src={a.afbeelding}
                    alt={a.titel}
                    fill
                    sizes="(min-width: 768px) 256px, 100vw"
                    style={{ objectFit: 'cover', opacity: 0.75 }}
                  />
                </div>
              )}
              <div className="p-6 sm:p-8 flex-1" style={{ borderLeft: `3px solid ${tc.kleur}` }}>
                <span className="rubriek-tag" style={{ background: tc.bg, color: tc.kleur }}>
                  {a.type || 'Evenement'}
                </span>
                <h2 style={POIRET} className="text-xl mt-2 mb-2">
                  {a.titel}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">{cleanTekst(a.beschrijving)}</p>
                {a.locatie && <div className="mono text-xs text-gray-600 mb-3">{a.locatie}</div>}
                <div className="mono text-xs" style={{ color: tc.kleur }}>
                  {a.datum}
                </div>
                <MeerInfoLink url={a.link} kleur={tc.kleur} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
