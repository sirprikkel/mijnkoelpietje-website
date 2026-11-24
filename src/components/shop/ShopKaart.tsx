import Image from 'next/image';
import Link from 'next/link';
import type { Kunstwerk } from '@/lib/types';
import { productUrl } from '@/lib/slug';
import { externeHref, renderMarkdown } from '@/lib/markdown';
import { KoopKnop } from './KoopKnop';
import { KlikVlak } from './KlikVlak';

const LEEG_STIJL: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'radial-gradient(circle at 40% 50%,rgba(245,196,0,0.18),transparent 60%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

/** Shopkaart (renderShop in de oude main.js). */
export function ShopKaart({ k }: { k: Kunstwerk }) {
  const href = productUrl(k.slug);
  const fotos = k.fotos;
  const meerInfo = externeHref(k.link);

  return (
    <div className="kaart group">
      {/* Beeldvlak apart klikbaar, zodat koopknop en 'Meer info' niet genest raken. */}
      <Link
        href={href}
        className="relative overflow-hidden block w-full p-0 border-none galerij-tegel"
        style={{ height: '360px', background: 'linear-gradient(135deg,#1a1400,#0a0a0a)', cursor: 'pointer' }}
        aria-label={'Bekijk ' + k.titel}
      >
        {fotos.length > 0 ? (
          <Image
            src={fotos[0]}
            alt={k.titel}
            fill
            sizes="(min-width: 1024px) 384px, (min-width: 768px) 50vw, 100vw"
            style={{ objectFit: 'contain', opacity: 0.85 }}
          />
        ) : (
          <div style={LEEG_STIJL}>
            <span style={{ fontSize: '5rem', opacity: 0.15 }}>🖼️</span>
          </div>
        )}
        {fotos.length > 1 && <span className="foto-badge mono">📷 {fotos.length}</span>}
      </Link>

      <div className="p-6">
        <div className="text-xs text-gray-500 mono mb-1">{k.collectie}</div>
        <h3 style={{ fontFamily: "'Poiret One',sans-serif", fontWeight: 400 }} className="text-lg mb-1">
          <Link href={href} style={{ color: 'inherit', textDecoration: 'none' }}>
            {k.titel}
          </Link>
        </h3>
        <KlikVlak href={href} className="prose prose-kaart mb-4" html={renderMarkdown(k.beschrijving)} />
        {meerInfo && (
          <a
            href={meerInfo}
            target="_blank"
            rel="noopener"
            className="mono text-xs mt-2 inline-block"
            style={{ color: 'var(--geel)' }}
          >
            Meer info →
          </a>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xl font-bold" style={{ color: 'var(--geel)' }}>
            € {k.prijs},–
          </span>
          <KoopKnop titel={k.titel} mollieLink={k.mollieLink} />
        </div>
      </div>
    </div>
  );
}
