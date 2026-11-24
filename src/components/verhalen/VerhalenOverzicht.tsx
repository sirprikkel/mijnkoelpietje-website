'use client';

import { useEffect, useMemo, useState } from 'react';
import type { VerhaalKaart } from '@/lib/types';
import Link from 'next/link';
import { cleanTekst } from './rubriek';
import {
  bewaarFilters, herstelScroll, leesFilters, legHerkomstVast, pakHerstel, type OverzichtFilters,
} from './herkomst';
import { VerhaalKaartItem, zoekTekst } from './VerhaalKaartItem';

// Rubriekknoppen in dezelfde volgorde en kleuren als legacy/index.html.
const RUBRIEK_KNOPPEN: ReadonlyArray<{ waarde: string; label: string; bg: string }> = [
  { waarde: 'alle', label: 'Alle', bg: 'rgba(245,196,0,0.12)' },
  { waarde: 'ondergronds', label: 'Ondergronds', bg: 'rgba(245,196,0,0.06)' },
  { waarde: 'bovengronds', label: 'Bovengronds', bg: 'rgba(59,130,246,0.06)' },
  { waarde: 'de-sporen', label: 'De Sporen', bg: 'rgba(16,185,129,0.06)' },
  { waarde: 'knipoog', label: 'Knipoog', bg: 'rgba(249,115,22,0.06)' },
  { waarde: 'de-stem', label: 'De Stem', bg: 'rgba(168,85,247,0.06)' },
];

const BEGIN_FILTERS: OverzichtFilters = { zoek: '', rubriek: 'alle', jaar: 'alle' };

function jaarVan(ts: number): string {
  return ts ? String(new Date(ts).getFullYear()) : '';
}

interface VerhalenOverzichtProps {
  /** Al gesorteerd: nieuwste eerst (getVerhaalKaarten). */
  verhalen: VerhaalKaart[];
}

/** Port van renderVerhalenGrid() + filterRubriek()/filterVerhalen(). */
export function VerhalenOverzicht({ verhalen }: VerhalenOverzichtProps) {
  const [filters, setFiltersState] = useState<OverzichtFilters>(BEGIN_FILTERS);
  // Oude site: de beginknop 'Alle' is geel; na een klik erft de actieve knop de tekstkleur.
  const [gekozen, setGekozen] = useState(false);

  const setFilters = (update: (f: OverzichtFilters) => OverzichtFilters) =>
    setFiltersState(f => {
      const nieuw = update(f);
      bewaarFilters(nieuw);
      return nieuw;
    });

  // Filters blijven de hele sessie staan; terug uit een verhaal ook de scrollpositie.
  useEffect(() => {
    const herstel = pakHerstel('/verhalen');
    const bewaard = herstel?.filters ?? leesFilters();
    if (bewaard) {
      setFiltersState(bewaard);
      if (bewaard.rubriek !== 'alle') setGekozen(true);
    }
    if (herstel) herstelScroll(herstel);
  }, []);

  const geindexeerd = useMemo(
    () => verhalen.map(v => ({ v, jaar: jaarVan(v.datumTs), tekst: zoekTekst(v), tags: `${cleanTekst(v.intro)} ${v.titel}` })),
    [verhalen],
  );

  const jaren = useMemo(
    () => Array.from(new Set(geindexeerd.map(i => i.jaar).filter(Boolean))).sort(),
    [geindexeerd],
  );

  const zoek = filters.zoek.toLowerCase().trim();
  const zichtbaar = geindexeerd.filter(({ v, jaar, tekst, tags }) => {
    const rubriekMatch = filters.rubriek === 'alle' || v.rubriek === filters.rubriek;
    const zoekMatch = !zoek || tekst.includes(zoek) || tags.includes(zoek);
    const jaarMatch = filters.jaar === 'alle' || jaar === filters.jaar;
    return rubriekMatch && zoekMatch && jaarMatch;
  });

  const onthoudHerkomst = (urlSlug: string, element: Element) =>
    legHerkomstVast('/verhalen', urlSlug, element, filters);

  return (
    <div id="verhalen-overzicht" className="verhaal-overzicht">
      {/* Zoeken */}
      <div className="mb-6">
        <input
          type="search"
          id="zoek-verhalen"
          placeholder="Zoek op trefwoord..."
          className="zoek-input max-w-md"
          value={filters.zoek}
          onChange={e => setFilters(f => ({ ...f, zoek: e.target.value }))}
          aria-label="Zoeken in verhalen"
        />
      </div>

      {/* Rubriek filters */}
      <div className="flex flex-wrap items-center gap-2 mb-10" id="rubriek-filters" role="group" aria-label="Filter op rubriek">
        {RUBRIEK_KNOPPEN.map(k => {
          const actief = filters.rubriek === k.waarde;
          return (
            <button
              key={k.waarde}
              type="button"
              className={actief ? 'rubriek-tag actief' : 'rubriek-tag'}
              style={{ background: k.bg, color: actief ? (gekozen ? undefined : 'var(--geel)') : '#777' }}
              aria-pressed={actief}
              onClick={() => {
                setGekozen(true);
                setFilters(f => ({ ...f, rubriek: k.waarde }));
              }}
            >
              {k.label}
            </button>
          );
        })}
        <select
          id="filter-jaar"
          value={filters.jaar}
          onChange={e => setFilters(f => ({ ...f, jaar: e.target.value }))}
          className="rubriek-tag ml-2"
          style={{
            background: 'rgba(245,196,0,0.06)',
            color: '#777',
            border: '1px solid rgba(245,196,0,0.15)',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: 999,
            fontSize: '0.75rem',
            appearance: 'auto',
          }}
          aria-label="Filter op jaar"
        >
          <option value="alle">Alle jaren</option>
          {jaren.map(j => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
      </div>

      {/* Bezoekers begrepen de rubrieknamen niet altijd; deze link wijst naar
          de uitleg van de 5 rubrieken op de Over-pagina. */}
      <p className="text-sm -mt-8 mb-10">
        <Link href="/over#de-rubrieken" className="rubriek-uitleg-link">
          Wat betekenen deze rubrieken?
        </Link>
      </p>

      {/* Grid */}
      <div id="verhalen-grid" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
        {zichtbaar.map(({ v }) => (
          <VerhaalKaartItem key={v.urlSlug} verhaal={v} onOpen={onthoudHerkomst} />
        ))}
      </div>

      {/* Geen resultaten */}
      <div
        id="geen-resultaten"
        className={zichtbaar.length === 0 ? 'text-center py-20 text-gray-600' : 'hidden text-center py-20 text-gray-600'}
        aria-live="polite"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#333" width="48" height="48" className="mx-auto mb-4" aria-hidden="true">
          <path d="M12 3C8 3 5 6 5 10c0 2.4 1.1 4.6 2.9 6L6 21h12l-1.9-5c1.8-1.4 2.9-3.6 2.9-6 0-4-3-7-7-7zm0 2c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5z" />
        </svg>
        <p>
          Geen verhalen gevonden voor &quot;<span id="zoek-term-display">{zoek}</span>&quot;
        </p>
      </div>
    </div>
  );
}
