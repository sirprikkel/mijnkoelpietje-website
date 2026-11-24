import Image from 'next/image';
import type { Sponsor } from '@/lib/types';
import { LABEL_GEEL, LINK_GEEL, POIRET, RAND_GEEL } from './stijl';

function SponsorKaart({ s }: { s: Sponsor }) {
  return (
    <div className="kaart p-6 reveal" style={RAND_GEEL}>
      <div className="flex items-center gap-4 mb-3">
        {s.logo && (
          <Image
            src={s.logo}
            alt={`${s.naam} logo`}
            width={64}
            height={64}
            sizes="64px"
            style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 8 }}
          />
        )}
        <div>
          <div className="mono text-xs tracking-widest uppercase mb-1" style={LABEL_GEEL}>
            Sponsor
          </div>
          <h3 style={POIRET} className="text-lg">
            {s.naam}
          </h3>
        </div>
      </div>
      {/* Omschrijving bevat HTML uit de CMS (span/br), net als in de oude site. */}
      {s.omschrijving && (
        <div className="text-gray-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: s.omschrijving }} />
      )}
      {s.website && (
        <a href={s.website} target="_blank" rel="noopener" className="mono text-xs mt-2 inline-block" style={LINK_GEEL}>
          Bezoek website →
        </a>
      )}
    </div>
  );
}

/** Port van renderSponsoren(): sponsorkaarten in CMS-volgorde plus de placeholderkaart. */
export function SponsorenGrid({ sponsoren }: { sponsoren: Sponsor[] }) {
  return (
    <div id="sponsoren-grid" className="grid md:grid-cols-2 gap-6 mb-10">
      {sponsoren.map(s => (
        <SponsorKaart key={s.slug} s={s} />
      ))}
      <div className="kaart p-6 reveal" style={{ borderStyle: 'dashed', borderColor: 'rgba(245,196,0,0.2)' }}>
        <div className="mono text-xs tracking-widest uppercase mb-3" style={{ color: 'rgba(245,196,0,0.4)' }}>
          Jouw naam hier
        </div>
        <p className="text-gray-600 text-sm">
          Word ook vriend of sponsor van MijnKoelPietje. Neem contact op via het contactformulier.
        </p>
      </div>
    </div>
  );
}
