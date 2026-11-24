import type { Metadata } from 'next';
import { getNieuws } from '@/lib/content';
import { PaginaKop } from '@/components/paginas/PaginaKop';
import { NieuwsLijst } from '@/components/paginas/NieuwsLijst';

export const metadata: Metadata = {
  title: 'Nieuws | MijnKoelPietje',
  description: 'Updates over nieuwtjes die kunnen uitgroeien tot verhalen.',
};

export default function NieuwsPage() {
  const nieuws = getNieuws();
  return (
    <div id="sectie-nieuws">
      <div className="pt-24 pb-32 max-w-4xl mx-auto px-4 sm:px-6">
        <PaginaKop label="Actueel" titel="Nieuws" intro="Updates over nieuwtjes die kunnen uitgroeien tot verhalen" />
        <NieuwsLijst items={nieuws} />
      </div>
    </div>
  );
}
