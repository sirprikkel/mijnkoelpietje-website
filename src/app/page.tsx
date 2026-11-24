import { getKunstwerken, getVerhaalKaarten } from '@/lib/content';
import { Hero } from '@/components/home/Hero';
import { VerhalenPreview } from '@/components/home/VerhalenPreview';
import { VideoTussenstuk } from '@/components/home/VideoTussenstuk';
import { ShopPreview } from '@/components/home/ShopPreview';
import { NieuwsbriefBlok } from '@/components/home/NieuwsbriefBlok';

export default function HomePagina() {
  // Alleen de eerste 3 kaarten gaan de pagina in (nieuwste eerst, al gesorteerd).
  const verhalen = getVerhaalKaarten().slice(0, 3);
  const kunstwerken = getKunstwerken().slice(0, 3);

  return (
    <div id="sectie-home">
      <Hero />
      <div className="hr-geel" />
      <VerhalenPreview verhalen={verhalen} />
      <VideoTussenstuk />
      <ShopPreview kunstwerken={kunstwerken} />
      <NieuwsbriefBlok />
    </div>
  );
}
