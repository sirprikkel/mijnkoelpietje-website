'use client';

import { useMemo, useState } from 'react';
import { ProductTegel, type ShopTegelData } from './ProductTegel';

type Sortering = 'standaard' | 'prijs-op' | 'prijs-af' | 'naam';

const OPTIES: Array<{ waarde: Sortering; label: string }> = [
  { waarde: 'standaard', label: 'Standaard sortering' },
  { waarde: 'prijs-op', label: 'Prijs: laag naar hoog' },
  { waarde: 'prijs-af', label: 'Prijs: hoog naar laag' },
  { waarde: 'naam', label: 'Naam: A tot Z' },
];

function sorteer(items: ShopTegelData[], s: Sortering): ShopTegelData[] {
  const kopie = [...items];
  // Producten zonder leesbare prijs altijd achteraan bij prijssortering.
  const prijs = (p: ShopTegelData, leeg: number) => p.prijsGetal ?? leeg;
  switch (s) {
    case 'prijs-op':
      return kopie.sort((a, b) => prijs(a, Infinity) - prijs(b, Infinity) || a.positie - b.positie);
    case 'prijs-af':
      return kopie.sort((a, b) => prijs(b, -Infinity) - prijs(a, -Infinity) || a.positie - b.positie);
    case 'naam':
      return kopie.sort((a, b) => a.titel.localeCompare(b.titel, 'nl'));
    default:
      return kopie.sort((a, b) => a.positie - b.positie);
  }
}

export function ShopOverzicht({ items }: { items: ShopTegelData[] }) {
  const [sortering, setSortering] = useState<Sortering>('standaard');
  const gesorteerd = useMemo(() => sorteer(items, sortering), [items, sortering]);

  return (
    <>
      <div className="shop-toolbar">
        <p className="mono text-xs text-gray-500" aria-live="polite">
          {items.length === 1 ? 'Toont 1 product' : `Toont alle ${items.length} producten`}
        </p>
        <label className="flex items-center gap-2">
          <span className="sr-only">Sorteer producten</span>
          <select
            value={sortering}
            onChange={e => setSortering(e.target.value as Sortering)}
            className="shop-sorteer mono"
          >
            {OPTIES.map(o => (
              <option key={o.waarde} value={o.waarde}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div id="shop-grid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
        {gesorteerd.map((p, i) => (
          <ProductTegel key={p.href} p={p} prioriteit={i < 4} />
        ))}
      </div>
    </>
  );
}
