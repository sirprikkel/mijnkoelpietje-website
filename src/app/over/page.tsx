import type { Metadata } from 'next';
import Link from 'next/link';
import { PaginaKop } from '@/components/paginas/PaginaKop';
import { LABEL_GEEL, POIRET, RAND_GEEL } from '@/components/paginas/stijl';

export const metadata: Metadata = {
  title: 'Over MijnKoelPietje',
  description:
    'Wie is MijnKoelPietje? Over de geschiedenis in een nieuw jasje, het gebruik van AI en de 5 rubrieken.',
};

const RUBRIEKEN = [
  { kleur: '#f5c400', zintuig: 'VOELEN', titel: 'Ondergronds', tekst: 'Dit is de kern. Het staat voor het fysieke werk, de techniek, het gevaar en de kameraadschap in de duisternis. De functies, de gereedschappen.' },
  { kleur: '#3b82f6', zintuig: 'VOELEN', titel: 'Bovengronds', tekst: 'Een mooi contrast. Dit gaat over het leven in de mijnkolonies, de buurthuizen, de scholen, ontspanning, verenigingen, vrouwen en kinderen, sociaal maatschappelijk.' },
  { kleur: '#10b981', zintuig: 'ZIEN', titel: 'De Sporen', tekst: 'Het landschap, tastbare objecten (de Relikwieën), de sociale sporen (de cultuur), sporen in het lichaam of de geest (de tol), de herbestemming (nieuw leven).' },
  { kleur: '#f97316', zintuig: 'LACHEN', titel: 'Knipoog', tekst: 'Essentieel voor de balans. De mijnstreek staat bekend om haar specifieke humor. Maar ook voor verhalen zonder directe link met het koelverleden.' },
  { kleur: '#a855f7', zintuig: 'HOREN', titel: 'De Stem', tekst: 'Persoonlijke getuigenissen, boeken, schilderijen, liederen, of misschien wel de stem van de mijn zelf.', breed: true },
];

export default function OverPage() {
  return (
    <div id="sectie-over">
      <div className="pt-24 pb-32 max-w-4xl mx-auto px-4 sm:px-6">
        <PaginaKop label="Wie zijn wij?" titel="Over MijnKoelPietje" />

        <div className="flex flex-col gap-10">
          <div className="kaart p-8 reveal">
            <div className="mono text-xs tracking-widest uppercase mb-3" style={LABEL_GEEL}>Welkom</div>
            <p className="text-gray-400 leading-relaxed">
              Welkom in onze digitale mijnstreek! Op deze website brengen we het verleden, het heden en de toekomst van
              de mijnbouw samen op een manier die je nog niet eerder hebt gezien. Ik ben{' '}
              <strong className="text-gray-300">Edward Frederiks</strong>, initiatiefnemer en bedenker van de verhalen en
              afbeeldingen op deze site. Veel lees- en kijkplezier!
            </p>
          </div>

          <div className="kaart p-8 reveal">
            <h2 style={POIRET} className="text-2xl mb-4">De Geschiedenis in een Nieuw Jasje</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Onze verhalen zijn geworteld in de echte historie. We putten uit stoffige geschiedenisboeken, archieven en
              het allerbelangrijkst — de persoonlijke getuigenissen van de (oud-)mijnwerkers die de geschiedenis zelf
              hebben geschreven.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Om deze rijke historie toegankelijk en levend te houden voor nieuwe generaties, maken we gebruik van de
              modernste techniek: Kunstmatige Intelligentie (AI). We gebruiken AI om historische feiten te verweven tot
              meeslepende verhalen en om sfeervolle beelden te creëren die je mee terugnemen in de tijd.
            </p>
          </div>

          <div className="kaart p-8 reveal">
            <h2 style={POIRET} className="text-2xl mb-4">Wie is MijnKoelPietje?</h2>
            <p className="text-gray-400 leading-relaxed">
              MijnKoelPietje is een unieke AI-creatie die symbool staat voor de kanarie die vroeger in de mijnen de
              veiligheid bewaakte. Met zijn opvallende, moderne uiterlijk slaat hij de brug tussen de traditie van vroeger
              en de techniek van nu. Hij is geen historisch figuur, maar een artistieke vertolker die ons helpt de
              verhalen van de mijnstreek te blijven vertellen.
            </p>
          </div>

          {/* De 5 rubrieken: doel van de link /over#de-rubrieken (toonRubriekUitleg). */}
          <div className="reveal" id="de-rubrieken" style={{ scrollMarginTop: '6rem' }}>
            <div className="mono text-xs tracking-widest uppercase mb-6" style={LABEL_GEEL}>De 5 Rubrieken</div>
            <div className="grid md:grid-cols-2 gap-4">
              {RUBRIEKEN.map(r => (
                <div key={r.titel} className={r.breed ? 'kaart p-6 md:col-span-2' : 'kaart p-6'}>
                  <div style={{ height: 3, background: r.kleur, width: '100%', borderRadius: 2 }} className="mb-4" />
                  <div className="mono text-xs mb-1" style={{ color: r.kleur }}>{r.zintuig}</div>
                  <h3 style={POIRET} className="text-xl mb-3">{r.titel}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{r.tekst}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="kaart p-8 reveal" style={RAND_GEEL}>
            <h2 style={POIRET} className="text-2xl mb-4">Samen de geschiedenis bewaren</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Hoewel we AI gebruiken om onze verhalen vorm te geven, blijft de menselijke factor het belangrijkst. We
              streven naar historische nauwkeurigheid, maar we zien onze teksten en beelden vooral als eerbetoon en
              artistieke impressie.
            </p>
            <p className="text-gray-400 leading-relaxed mb-6">
              Heb je zelf een verhaal te vertellen? Zie je een detail dat niet klopt, of wil je een herinnering met ons
              delen? Je bent van harte uitgenodigd om te reageren of contact met ons op te nemen. Samen houden we de
              herinnering aan de koempels levend.
            </p>
            <Link href="/contact" className="btn-geel">Neem contact op</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
