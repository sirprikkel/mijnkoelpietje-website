import type { ShopVoordeel, VoordeelIcoon } from '@/lib/types';

// Lijn-iconen (24x24, stroke). Bewust eenvoudig zodat ze in geel op zwart rustig ogen.
const PADEN: Record<VoordeelIcoon, string> = {
  betalen: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5z',
  retour: 'M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3',
  contact: 'M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zM2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.3 48.3 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.4 48.4 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z',
  verzending: 'M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.9 17.9 0 0 0-3.213-9.193 2.06 2.06 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.6 48.6 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12',
  levertijd: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  handgemaakt: 'M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a16 16 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42',
  ophalen: 'M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z',
};

function Icoon({ naam }: { naam: VoordeelIcoon }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={22} height={22} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={PADEN[naam]} />
    </svg>
  );
}

/** Vertrouwensblokken onder de koopknop (beheerd in CMS > Shop Instellingen > Shoppagina). */
export function Voordelen({ voordelen }: { voordelen: ShopVoordeel[] }) {
  if (voordelen.length === 0) return null;
  return (
    <ul className="product-voordelen" aria-label="Goed om te weten">
      {voordelen.map(v => (
        <li key={v.titel} className="product-voordeel">
          <span className="product-voordeel-icoon"><Icoon naam={v.icoon} /></span>
          <span>
            <span className="block text-sm text-gray-200">{v.titel}</span>
            {v.tekst && <span className="block text-xs text-gray-500 mt-0.5 leading-relaxed">{v.tekst}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Optionele actiebalk, bijv. een kortingscode. Staat standaard uit in het CMS. */
export function ActieBalk({ actie }: { actie: { tekst: string; code: string } | null }) {
  if (!actie) return null;
  return (
    <div className="product-actie">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={20} height={20} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.1 18.1 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3z M6 6h.008v.008H6V6z" />
      </svg>
      <span>
        {actie.tekst}
        {actie.code && <> <strong className="mono" style={{ color: 'var(--geel)' }}>{actie.code}</strong></>}
      </span>
    </div>
  );
}
