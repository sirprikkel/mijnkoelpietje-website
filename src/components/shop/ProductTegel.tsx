import Image from 'next/image';
import Link from 'next/link';
import { formatPrijs } from '@/lib/prijs';

/** Lichte productgegevens voor het shopoverzicht (geen beschrijving naar de browser). */
export interface ShopTegelData {
  href: string;
  titel: string;
  collectie: string;
  prijs: string;
  /** Prijs als getal voor sorteren; null als de prijs niet te lezen is. */
  prijsGetal: number | null;
  foto: string | null;
  fotoAantal: number;
  /** Positie in de standaard CMS-volgorde. */
  positie: number;
}

const prijsLabel = formatPrijs;

/** Producttegel in de stijl van het voorbeeld: vierkante foto, titel, prijs, knop bij hover. */
export function ProductTegel({ p, prioriteit = false }: { p: ShopTegelData; prioriteit?: boolean }) {
  return (
    <Link href={p.href} className="shop-tegel group" aria-label={`${p.titel}${p.prijs ? `, ${prijsLabel(p.prijs)}` : ''}`}>
      <div className="shop-tegel-foto">
        {p.foto ? (
          <Image
            src={p.foto}
            alt=""
            fill
            priority={prioriteit}
            sizes="(min-width: 1152px) 270px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="shop-tegel-img"
          />
        ) : (
          <span className="shop-tegel-leeg" aria-hidden="true">🖼️</span>
        )}
        {p.fotoAantal > 1 && <span className="foto-badge mono" aria-hidden="true">📷 {p.fotoAantal}</span>}
        <span className="shop-tegel-knop mono" aria-hidden="true">Bekijk product</span>
      </div>
      <div className="pt-3 px-1">
        {p.collectie && <div className="mono text-[0.68rem] uppercase tracking-widest text-gray-500 mb-1 truncate">{p.collectie}</div>}
        <h2 className="shop-tegel-titel">{p.titel}</h2>
        {p.prijs && <div className="mono text-sm mt-1" style={{ color: 'var(--geel)' }}>{prijsLabel(p.prijs)}</div>}
      </div>
    </Link>
  );
}
