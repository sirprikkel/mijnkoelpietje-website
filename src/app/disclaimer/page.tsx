import type { Metadata } from 'next';
import { PaginaKop } from '@/components/paginas/PaginaKop';
import { Alinea, Bedrijfsgegevens, JuridischKaart, MailKnop, MailLink } from '@/components/paginas/Juridisch';

export const metadata: Metadata = {
  title: 'Disclaimer & Privacy | MijnKoelPietje',
  description: 'Disclaimer en privacyverklaring van MijnKoelPietje: historische context, gebruik van AI, auteursrecht en persoonsgegevens.',
};

export default function DisclaimerPage() {
  return (
    <div id="sectie-disclaimer">
      <div className="pt-24 pb-32 max-w-3xl mx-auto px-4 sm:px-6">
        <PaginaKop label="Juridisch & Privacy" titel="Disclaimer & Privacy" klein bijgewerkt="20 augustus 2026" />

        <div className="flex flex-col gap-6 prose">
          <JuridischKaart titel="1. Informatie en Historische Context">
            <Alinea>De verhalen op deze website zijn geworteld in de rijke geschiedenis van de mijnbouw. Wij maken gebruik van diverse bronnen, waaronder geschiedenisboeken, archieven en persoonlijke getuigenissen van (oud-)mijnwerkers.</Alinea>
            <Alinea label="Narratieve vertellingen:">Hoewel wij streven naar een getrouwe weergave, zijn de verhalen bedoeld als narratieve (verhalende) impressies. Wij garanderen niet dat alle feiten te allen tijde volledig, actueel of foutloos zijn.</Alinea>
            <Alinea label="Geen rechten:" mb="">Aan de inhoud van deze website kunnen geen rechten worden ontleend. Het gebruik van de informatie is geheel voor eigen risico.</Alinea>
          </JuridischKaart>

          <JuridischKaart titel="2. Gebruik van Kunstmatige Intelligentie (AI)">
            <Alinea>Om de geschiedenis op een vernieuwende wijze tot leven te wekken, maken wij gebruik van geavanceerde AI-technologie.</Alinea>
            <Alinea label="Teksten:">De verhalen zijn tot stand gekomen met hulp van AI, waarbij bronmateriaal is verwerkt tot leesbare vertellingen. AI kan soms feiten interpreteren op een wijze die afwijkt van de strikt historische werkelijkheid (&quot;hallucinaties&quot;). Hoewel wij de output controleren, blijft het een artistieke verwerking.</Alinea>
            <Alinea label="Afbeeldingen:" mb="">Alle getoonde beelden zijn gegenereerd met AI. Dit zijn artistieke impressies en nadrukkelijk geen authentieke historische foto&apos;s of documenten, tenzij expliciet anders vermeld.</Alinea>
          </JuridischKaart>

          <JuridischKaart titel="3. Personage 'MijnKoelPietje' & Artistieke Vrijheid">
            <Alinea>Het personage MijnKoelPietje is een unieke digitale creatie, ontwikkeld voor deze website. Hij staat symbool voor de kanarie die vroeger de veiligheid in de mijnen bewaakte en fungeert als gids tussen historie en toekomst.</Alinea>
            <Alinea label="Toevallige gelijkenissen:" mb="">Eventuele visuele gelijkenissen met bestaande karakters, mascottes of personen berusten op louter toeval. MijnKoelPietje is een origineel concept en staat los van andere (historische) commerciële figuren.</Alinea>
          </JuridischKaart>

          <JuridischKaart titel="4. Intellectueel Eigendom">
            <Alinea>Wij respecteren het intellectueel eigendom van anderen. De input voor onze verhalen komt uit openbare bronnen of persoonlijke verslagen.</Alinea>
            <Alinea label="Auteursrecht:" mb="">Zonder uitdrukkelijke schriftelijke toestemming is het niet toegestaan om teksten, het karakter MijnKoelPietje of de AI-gegenereerde afbeeldingen van deze website te kopiëren of te verspreiden voor commerciële doeleinden. Mocht u menen dat er onterecht gebruik wordt gemaakt van bepaalde informatie of beeldmateriaal, neem dan direct contact met ons op.</Alinea>
          </JuridischKaart>

          <JuridischKaart titel="5. Privacy en Persoonsgegevens (AVG)">
            <Alinea>Wij hechten grote waarde aan uw privacy. Wanneer u ons een bericht stuurt via het contactformulier of zich aanmeldt voor de nieuwsbrief, verwerken wij de gegevens die u zelf invult.</Alinea>
            <Alinea label="Doel:">Deze gegevens worden uitsluitend gebruikt om uw bericht te beantwoorden of u de nieuwsbrief te sturen. Wij verkopen uw gegevens nooit aan derden.</Alinea>
            <Alinea label="Uw rechten:">U heeft het recht op inzage, correctie of verwijdering van uw gegevens. Verzoeken hiertoe kunnen worden ingediend via <MailLink />.</Alinea>
            <Alinea label="Cookies:">Onze website kan gebruikmaken van functionele cookies om de gebruikerservaring te verbeteren.</Alinea>
            <Alinea label="Bezoekersstatistieken:" mb="">Wij tellen anoniem hoe vaak pagina's worden bekeken en op welke links in de shop wordt geklikt, met GoatCounter. Daarbij worden geen cookies geplaatst en geen persoonsgegevens of IP-adressen bewaard; wij zien alleen totalen.</Alinea>
          </JuridischKaart>

          <JuridischKaart titel="6. Externe Links en Techniek">
            <Alinea label="Links:">Wij zijn niet verantwoordelijk voor de inhoud of het privacybeleid van websites waarnaar wij linken.</Alinea>
            <Alinea label="Beschikbaarheid:" mb="">Wij garanderen niet dat de website foutloos of ononderbroken zal functioneren en zijn niet aansprakelijk voor schade door technische storingen.</Alinea>
          </JuridischKaart>

          <JuridischKaart titel="7. Contact en Correcties" accent>
            <Alinea mb="mb-4">Heeft u een aanvulling, een feitelijke correctie of een bezwaar tegen geplaatste content? Wij horen het graag. Wij waarderen de input van de (oud-)mijnwerkersgemeenschap om de verhalen zo waardevol mogelijk te maken.</Alinea>
            <MailKnop />
          </JuridischKaart>

          <JuridischKaart titel="Bedrijfsgegevens">
            <Bedrijfsgegevens />
          </JuridischKaart>
        </div>
      </div>
    </div>
  );
}
