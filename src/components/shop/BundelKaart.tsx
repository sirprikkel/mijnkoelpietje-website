import type { Bundel } from '@/lib/types';
import { KoopKnop } from './KoopKnop';
import { formatPrijs } from '@/lib/prijs';

/** Bundelkaart onder de shop (renderBundel in de oude main.js). */
export function BundelKaart({ b }: { b: Bundel }) {
  if (!b.tonen) return null;
  return (
    <div className="kaart md:col-span-2 lg:col-span-3" style={{ borderColor: 'rgba(245,196,0,0.25)' }}>
      <div className="p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="text-center md:text-left flex-1">
          <div className="mono text-xs mb-2 uppercase tracking-widest" style={{ color: 'rgba(245,196,0,0.7)' }}>
            {b.label}
          </div>
          <h3 style={{ fontFamily: "'Poiret One',sans-serif", fontWeight: 400 }} className="text-2xl mb-2">
            {b.titel}
          </h3>
          <p className="text-gray-500 mb-4 text-sm">{b.beschrijving}</p>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-2xl font-bold" style={{ color: 'var(--geel)' }}>
              {formatPrijs(b.prijs)}
            </span>
            {b.oudePrijs && <span className="text-gray-600 line-through text-sm">{formatPrijs(b.oudePrijs)}</span>}
            {b.korting && (
              <span
                className="mono text-xs px-2 py-1 rounded-full"
                style={{ background: 'rgba(245,196,0,0.12)', color: 'var(--geel)' }}
              >
                {b.korting}
              </span>
            )}
          </div>
        </div>
        <KoopKnop
          titel={b.titel}
          mollieLink={b.mollieLink}
          tekst={b.knopTekst || 'Bundel kopen'}
          className="text-base px-8 py-3 whitespace-nowrap"
        />
      </div>
    </div>
  );
}
