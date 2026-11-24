import type { Metadata } from 'next';
import { getBundel, getKunstwerken } from '@/lib/content';
import { ShopKaart } from '@/components/shop/ShopKaart';
import { BundelKaart } from '@/components/shop/BundelKaart';

export const metadata: Metadata = {
  title: 'Shop — MijnKoelPietje',
  description: 'Mijn-erfgoed voor thuis unieke prints en hebbedingen met de ziel van ons mijnverleden',
  alternates: { canonical: '/shop' },
};

export default function ShopPagina() {
  const kunstwerken = getKunstwerken();
  const bundel = getBundel();

  return (
    <div id="sectie-shop">
      <div className="pt-24 pb-32 max-w-6xl mx-auto px-4 sm:px-6">
        <div id="shop-header" className="text-center mb-16 pt-8">
          <div className="mono text-xs tracking-widest uppercase mb-3" style={{ color: 'rgba(245,196,0,0.7)' }}>
            Daal af in onze shop
          </div>
          <h1 style={{ fontFamily: "'Poiret One',sans-serif", fontSize: 'clamp(2.5rem,6vw,4rem)', fontWeight: 400 }} className="mb-4">
            Shop
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Mijn-erfgoed voor thuis unieke prints en hebbedingen met de ziel van ons mijnverleden
          </p>
        </div>

        <div id="shop-overzicht" className="shop-overzicht">
          <div id="shop-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {kunstwerken.map((k) => (
              <ShopKaart key={k.slug} k={k} />
            ))}
            {kunstwerken.length > 0 && bundel && <BundelKaart b={bundel} />}
          </div>
        </div>
      </div>
    </div>
  );
}
