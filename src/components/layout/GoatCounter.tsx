'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Cookieloze bezoekersteller (GoatCounter). Dashboard: https://mijnkoelpietje.goatcounter.com
 *
 * - Telt elke paginaweergave, ook bij doorklikken binnen de site (Next.js laadt
 *   dan geen nieuwe pagina, dus count.js zou alleen de eerste pagina tellen).
 * - Telt klikken op elementen met data-kp-klik="<naam>" als event. Bewust een
 *   eigen attribuut: count.js bindt data-goatcounter-click alleen bij het laden,
 *   waardoor knoppen op later geopende pagina's niet geteld zouden worden.
 * - Telt alleen op het echte domein, zodat previews en lokaal testen de cijfers
 *   niet vervuilen.
 */

const ENDPOINT = 'https://mijnkoelpietje.goatcounter.com/count';
const PRODUCTIE_HOSTS = ['mijnkoelpietje.nl', 'www.mijnkoelpietje.nl'];

interface GoatCounterApi {
  count: (vars: { path: string; title?: string; event?: boolean }) => void;
}

declare global {
  interface Window {
    goatcounter?: Partial<GoatCounterApi>;
  }
}

function isProductie(): boolean {
  return PRODUCTIE_HOSTS.includes(window.location.hostname);
}

/** Leesbaar pad in het dashboard: emoji en accenten in verhaal-URL's niet als %F0%9F... tonen. */
function leesbaarPad(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

/** Wacht kort tot count.js geladen is (async script); daarna tellen. */
function tel(vars: { path: string; title?: string; event?: boolean }, poging = 0): void {
  const gc = window.goatcounter;
  if (gc && typeof gc.count === 'function') {
    gc.count(vars);
    return;
  }
  if (poging < 40) window.setTimeout(() => tel(vars, poging + 1), 250);
}

export function GoatCounter() {
  const pathname = usePathname();

  // Paginaweergave bij elke route. Next.js zet de nieuwe <title> net ná de route-
  // wissel; we wachten tot die er is (of maximaal 1 s) zodat het dashboard de titel toont.
  useEffect(() => {
    if (!pathname || !isProductie()) return;
    const vorigeTitel = document.title;
    const start = Date.now();
    let t = 0;
    const probeer = () => {
      const titel = document.title;
      if ((titel && titel !== vorigeTitel) || Date.now() - start > 1000) {
        tel({ path: leesbaarPad(pathname), title: titel || undefined });
        return;
      }
      t = window.setTimeout(probeer, 50);
    };
    t = window.setTimeout(probeer, 0);
    return () => window.clearTimeout(t);
  }, [pathname]);

  // Klik-events via één gedelegeerde listener: werkt ook voor knoppen die later verschijnen.
  useEffect(() => {
    if (!isProductie()) return;
    const opKlik = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.('[data-kp-klik]');
      const naam = el?.getAttribute('data-kp-klik');
      if (naam) tel({ path: naam, title: naam, event: true });
    };
    document.addEventListener('click', opKlik, { capture: true });
    return () => document.removeEventListener('click', opKlik, { capture: true });
  }, []);

  return (
    <>
      {/* no_onload: wij tellen zelf per route, anders telt count.js de eerste pagina dubbel. */}
      <Script
        data-goatcounter={ENDPOINT}
        data-goatcounter-settings='{"no_onload": true}'
        src="https://gc.zgo.at/count.js"
        strategy="afterInteractive"
      />
    </>
  );
}
