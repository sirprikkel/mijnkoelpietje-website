import type { Metadata } from 'next';
import Link from 'next/link';
import { getSponsoren } from '@/lib/content';
import { PaginaKop } from '@/components/paginas/PaginaKop';
import { SponsorenGrid } from '@/components/paginas/SponsorenGrid';
import { LABEL_GEEL, RAND_GEEL } from '@/components/paginas/stijl';

export const metadata: Metadata = {
  title: 'Vrienden & Sponsoren | MijnKoelPietje',
  description: 'Met dank aan de vrienden en sponsoren die MijnKoelPietje een hart onder de riem steken.',
};

export default function SponsorenPage() {
  const sponsoren = getSponsoren();
  return (
    <div id="sectie-sponsoren">
      <div className="pt-24 pb-32 max-w-4xl mx-auto px-4 sm:px-6">
        <PaginaKop
          label="Met dank aan"
          titel="Vrienden & Sponsoren"
          intro="MijnKoelPietje is een liefdevolle project — geen commercieel initiatief. Maar er zijn mensen die ons een hart onder de riem steken. Dat verdient een eervolle vermelding."
        />

        <div className="kaart p-8 mb-10 reveal" style={RAND_GEEL}>
          <div className="mono text-xs tracking-widest uppercase mb-4" style={LABEL_GEEL}>
            Waarom sponsoren?
          </div>
          <p className="text-gray-400 leading-relaxed">
            We verdienen geen geld met deze website. Maar de verhalen, de beelden en de techniek kosten wel tijd en
            energie. Wil je dit project steunen als blijk van waardering? Dan plaatsen we jouw naam of die van jouw
            organisatie hier, met veel plezier.
          </p>
        </div>

        <SponsorenGrid sponsoren={sponsoren} />

        <div className="text-center reveal">
          <Link href="/contact" className="btn-outline">
            Contact opnemen
          </Link>
        </div>
      </div>
    </div>
  );
}
