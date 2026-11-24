import type { Metadata } from 'next';
import { getVerhaalKaarten } from '@/lib/content';
import { SectieKop } from '@/components/verhalen/SectieKop';
import { VerhalenOverzicht } from '@/components/verhalen/VerhalenOverzicht';

export const metadata: Metadata = {
  title: 'Verhalen — MijnKoelPietje',
  description: 'Herinneringen, geschiedenis, nostalgie en meer - elk verhaal een rimpeling in de tijd.',
  alternates: { canonical: '/verhalen' },
};

export default function VerhalenPage() {
  return (
    <div id="sectie-verhalen" className="sectie actief">
      <div className="pt-24 pb-32 max-w-6xl mx-auto px-4 sm:px-6">
        <SectieKop
          bovenregel="Tussen donker en licht"
          titel="Verhalen"
          tekst="Herinneringen, geschiedenis, nostalgie en meer - elk verhaal een rimpeling in de tijd."
        />
        <VerhalenOverzicht verhalen={getVerhaalKaarten()} />
      </div>
    </div>
  );
}
