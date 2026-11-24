import type { Metadata } from 'next';
import { getVerhaalKaarten } from '@/lib/content';
import { SectieKop } from '@/components/verhalen/SectieKop';
import { GalerijTegel } from '@/components/verhalen/GalerijTegel';
import { ScrollHerstel } from '@/components/verhalen/ScrollHerstel';

export const metadata: Metadata = {
  title: 'Galerij — MijnKoelPietje',
  description: 'Een selectie van onze mooiste afbeeldingen. Klik op een beeld om het verhaal erachter te lezen.',
  alternates: { canonical: '/galerij' },
};

/** Port van renderGalerij(): uitgelichte verhalen met afbeelding, nieuwste eerst. */
export default function GalerijPage() {
  const items = getVerhaalKaarten().filter(v => v.uitgelicht && v.afbeelding);

  return (
    <div id="sectie-galerij" className="sectie actief">
      <div className="pt-24 pb-32 max-w-6xl mx-auto px-4 sm:px-6">
        <SectieKop
          bovenregel="Beeld uit de mijnstreek"
          titel="Galerij"
          tekst="Een selectie van onze mooiste afbeeldingen. Klik op een beeld om het verhaal erachter te lezen."
        />

        <div id="galerij-grid" className="galerij-masonry">
          {items.length === 0 ? (
            <p className="text-gray-500 w-full text-center py-12">
              Er zijn nog geen afbeeldingen uitgelicht voor de galerij.
            </p>
          ) : (
            items.map(v => (
              <GalerijTegel
                key={v.urlSlug}
                titel={v.titel}
                slug={v.slug}
                urlSlug={v.urlSlug}
                rubriek={v.rubriek}
                afbeelding={v.afbeelding as string}
              />
            ))
          )}
        </div>
        <ScrollHerstel pad="/galerij" />
      </div>
    </div>
  );
}
