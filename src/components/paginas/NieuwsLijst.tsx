import type { NieuwsItem } from '@/lib/types';
import { MeerInfoLink } from './MeerInfoLink';
import { LABEL_GEEL } from './stijl';

/**
 * Port van renderNieuws(). Volgorde (nieuwste eerst) komt uit getNieuws().
 * `tekst` bevat HTML uit de eigen CMS en werd ook in de oude site als HTML getoond;
 * daarom een <div> (geen <p>), zodat geneste <p>-tags geldig blijven.
 */
export function NieuwsLijst({ items }: { items: NieuwsItem[] }) {
  return (
    <div id="nieuws-container" className="flex flex-col gap-6">
      {items.map(n => (
        <article key={n.slug} className="kaart p-8 flex flex-col md:flex-row gap-6 items-start">
          <div className="mono text-xs whitespace-nowrap pt-1" style={LABEL_GEEL}>
            {n.datum}
          </div>
          <div>
            <div className="text-xs text-gray-600 mono mb-2 uppercase tracking-wide">{n.categorie}</div>
            <h2 className="font-bold text-xl mb-2">{n.titel}</h2>
            <div className="text-gray-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: n.tekst }} />
            <MeerInfoLink url={n.link} />
          </div>
        </article>
      ))}
    </div>
  );
}
