import Image from 'next/image';
import Link from 'next/link';
import type { Kunstwerk } from '@/lib/types';
import { productUrl } from '@/lib/slug';
import { formatPrijs } from '@/lib/prijs';

const KOP_STIJL: React.CSSProperties = {
  fontFamily: "'Poiret One',sans-serif",
  fontSize: 'clamp(1.8rem,4vw,2.5rem)',
  fontWeight: 400,
};

/** SHOP PREVIEW — Chapter 3 (renderShopPreview: de eerste 3 producten). */
export function ShopPreview({ kunstwerken }: { kunstwerken: Kunstwerk[] }) {
  const drie = kunstwerken.slice(0, 3);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
      <div className="reveal flex items-end justify-between mb-12 flex-wrap gap-4">
        <div>
          <div className="mono text-xs tracking-widest uppercase mb-2" style={{ color: 'rgba(245,196,0,0.7)' }}>
            Daal af in onze shop
          </div>
          <h2 style={KOP_STIJL}>Shop</h2>
        </div>
        <Link href="/shop" className="btn-outline hidden md:block">
          Bekijk de shop
        </Link>
      </div>

      <div id="shop-preview" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {drie.map((k) => (
          <Link
            key={k.slug}
            href={productUrl(k.slug)}
            className="kaart reveal block"
            style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}
          >
            <div
              className="relative overflow-hidden"
              style={{ height: '200px', background: 'linear-gradient(135deg,#1a1400,#0a0a0a)' }}
            >
              {k.afbeelding ? (
                <Image
                  src={k.afbeelding}
                  alt={k.titel}
                  fill
                  sizes="(min-width: 1152px) 368px, (min-width: 768px) 33vw, 100vw"
                  style={{ objectFit: 'cover', opacity: 0.85 }}
                />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 40% 50%,rgba(245,196,0,0.18),transparent 60%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '3rem', opacity: 0.15 }}>🖼️</span>
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="mono text-xs text-gray-600 mb-1">{k.collectie}</div>
              <h3 style={{ fontFamily: "'Poiret One',sans-serif", fontWeight: 400 }} className="text-lg mb-1">
                {k.titel}
              </h3>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold" style={{ color: 'var(--geel)' }}>
                  {formatPrijs(k.prijs)}
                </span>
                <span className="mono text-xs" style={{ color: 'var(--geel)' }}>
                  Bekijk →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-8 md:hidden">
        <Link href="/shop" className="btn-outline">
          Bekijk de shop
        </Link>
      </div>
    </section>
  );
}
