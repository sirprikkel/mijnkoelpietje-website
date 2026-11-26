import type { Metadata } from 'next';
import { getBundel, getKunstwerken } from '@/lib/content';
import { productUrl } from '@/lib/slug';
import type { Kunstwerk } from '@/lib/types';
import { ShopOverzicht } from '@/components/shop/ShopOverzicht';
import type { ShopTegelData } from '@/components/shop/ProductTegel';
import { BundelKaart } from '@/components/shop/BundelKaart';

export const metadata: Metadata = {
  title: 'Shop — MijnKoelPietje',
  description: 'Mijn-erfgoed voor thuis: hebbedingen met de ziel van ons mijnverleden',
  alternates: { canonical: '/shop' },
};

function naarTegel(k: Kunstwerk, positie: number): ShopTegelData {
  const getal = parseFloat(k.prijs.replace(',', '.'));
  return {
    href: productUrl(k.slug),
    titel: k.titel,
    collectie: k.collectie,
    prijs: k.prijs,
    prijsGetal: Number.isFinite(getal) ? getal : null,
    foto: k.fotos[0] ?? null,
    fotoAantal: k.fotos.length,
    positie,
  };
}

export default function ShopPagina() {
  const kunstwerken = getKunstwerken();
  const bundel = getBundel();

  return (
    <div id="sectie-shop">
      <div className="pt-24 pb-32 max-w-6xl mx-auto px-4 sm:px-6">
        <div id="shop-header" className="text-center mb-12 pt-8">
          <div className="mono text-xs tracking-widest uppercase mb-3" style={{ color: 'rgba(245,196,0,0.7)' }}>
            Daal af in onze shop
          </div>
          <h1 style={{ fontFamily: "'Poiret One',sans-serif", fontSize: 'clamp(2.5rem,6vw,4rem)', fontWeight: 400 }} className="mb-4">
            Shop
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Mijn-erfgoed voor thuis: hebbedingen met de ziel van ons mijnverleden
          </p>
        </div>

        <div id="shop-overzicht" className="shop-overzicht">
          {kunstwerken.length > 0 ? (
            <ShopOverzicht items={kunstwerken.map(naarTegel)} />
          ) : (
            <p className="text-center text-gray-500 py-16">Er staan op dit moment geen producten in de shop.</p>
          )}
          {kunstwerken.length > 0 && bundel && (
            <div className="grid grid-cols-1 mt-12">
              <BundelKaart b={bundel} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
