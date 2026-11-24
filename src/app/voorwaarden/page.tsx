import type { Metadata } from 'next';
import { PaginaKop } from '@/components/paginas/PaginaKop';
import { Alinea, Bedrijfsgegevens, JuridischKaart, MailKnop, MailLink } from '@/components/paginas/Juridisch';
import { LIJST_BOLLETJES, LIJST_NUMMERS } from '@/components/paginas/stijl';

export const metadata: Metadata = {
  title: 'Algemene Voorwaarden | MijnKoelPietje',
  description: 'Algemene voorwaarden van de webshop van MijnKoelPietje: bestellen, prijzen, retourneren, garantie, klachten en privacy.',
};

export default function VoorwaardenPage() {
  return (
    <div id="sectie-voorwaarden">
      <div className="pt-24 pb-32 max-w-3xl mx-auto px-4 sm:px-6">
        <PaginaKop label="Webshop & Bestellen" titel="Algemene Voorwaarden" klein bijgewerkt="24 augustus 2026" />

        <div className="flex flex-col gap-6 prose">
          <JuridischKaart titel="1. Wie zijn wij?">
            <Alinea>MijnKoelPietje is een kleine webshop met producten die aansluiten bij de geschiedenis, cultuur en mijnbouwtraditie van Zuid-Limburg.</Alinea>
            <Alinea>Deze algemene voorwaarden zijn van toepassing op alle bestellingen die via de webshop van MijnKoelPietje worden geplaatst.</Alinea>
            <Bedrijfsgegevens mb="mb-3" />
          </JuridischKaart>

          <JuridischKaart titel="2. Bestellen">
            <Alinea>Wanneer je een bestelling plaatst, ontvang je hiervan een bevestiging per e-mail.</Alinea>
            <Alinea>Wij doen ons best om bestellingen zo snel mogelijk te verwerken en te verzenden. De verwachte levertijd wordt tijdens het bestelproces vermeld.</Alinea>
            <Alinea mb="">Als een bestelling onverhoopt vertraging oploopt, informeren wij je hierover zo snel mogelijk.</Alinea>
          </JuridischKaart>

          <JuridischKaart titel="3. Prijzen">
            <Alinea>Alle prijzen die in de webshop worden vermeld zijn de prijzen die je betaalt.</Alinea>
            <Alinea mb="">Eventuele verzendkosten worden duidelijk vermeld voordat je de bestelling definitief plaatst.</Alinea>
          </JuridischKaart>

          <JuridischKaart titel="4. Retourneren en herroepingsrecht">
            <Alinea>Als consument heb je het recht om je aankoop binnen <strong className="text-gray-300">14 dagen na ontvangst</strong> zonder opgave van reden te annuleren.</Alinea>
            <Alinea label="Zo werkt retourneren:" mb="mb-2" />
            <ol className="text-gray-400 leading-relaxed mb-3" style={LIJST_NUMMERS}>
              <li>Meld je retour binnen 14 dagen na ontvangst via <MailLink />.</li>
              <li>Na je melding heb je nog 14 dagen om het product terug te sturen.</li>
              <li>Stuur het product zorgvuldig en, voor zover redelijkerwijs mogelijk, compleet terug.</li>
              <li>De kosten voor het terugsturen zijn voor eigen rekening.</li>
            </ol>
            <Alinea>Na ontvangst van de retour betalen wij het aankoopbedrag terug. Ook de eventueel betaalde standaard verzendkosten van de oorspronkelijke bestelling worden terugbetaald.</Alinea>
            <Alinea>De terugbetaling vindt plaats binnen 14 dagen nadat je de aankoop hebt herroepen. Wij mogen wachten met terugbetalen totdat wij het product hebben ontvangen of totdat je hebt aangetoond dat het product is teruggestuurd.</Alinea>
            <Alinea label="Gebruik van het product:">Je mag een product bekijken en beoordelen zoals je dat ook in een winkel zou mogen doen. Wanneer een product verdergaand is gebruikt dan nodig is om het te beoordelen, kan sprake zijn van waardevermindering.</Alinea>
            <Alinea label="Uitzonderingen:" mb="">Het herroepingsrecht geldt niet voor producten die speciaal voor jou zijn gemaakt of gepersonaliseerd, voor zover de wet hiervoor een uitzondering op het herroepingsrecht toestaat. Als een product speciaal voor jou wordt gemaakt of aangepast, wordt dit vooraf duidelijk aangegeven.</Alinea>
          </JuridischKaart>

          <JuridischKaart titel="5. Garantie en problemen met een bestelling">
            <Alinea>Wij leveren producten die moeten voldoen aan de redelijke verwachtingen die je daarvan mag hebben.</Alinea>
            <Alinea>Is een product bij ontvangst beschadigd, werkt het niet goed of is er iets anders niet in orde? Neem dan zo snel mogelijk contact met ons op via <MailLink />. Vermeld daarbij indien mogelijk je ordernummer en voeg eventueel een foto van het probleem toe.</Alinea>
            <Alinea>We bekijken de situatie en zoeken samen naar een passende oplossing, bijvoorbeeld reparatie, vervanging of terugbetaling.</Alinea>
            <Alinea mb="">Je wettelijke rechten als consument blijven hierbij altijd van toepassing.</Alinea>
          </JuridischKaart>

          <JuridischKaart titel="6. Klachten">
            <Alinea>Het kan natuurlijk gebeuren dat iets niet helemaal naar wens verloopt. We vinden het belangrijk om klachten goed en persoonlijk op te lossen.</Alinea>
            <Alinea label="Onze klachtenprocedure:" mb="mb-2" />
            <ol className="text-gray-400 leading-relaxed" style={LIJST_NUMMERS}>
              <li><strong className="text-gray-300">Neem contact met ons op.</strong> Stuur je klacht naar <MailLink />. Beschrijf duidelijk wat er aan de hand is en vermeld indien mogelijk je ordernummer.</li>
              <li><strong className="text-gray-300">Wij reageren.</strong> Wij proberen je klacht zo snel mogelijk te behandelen en streven ernaar om binnen 14 dagen inhoudelijk te reageren.</li>
              <li><strong className="text-gray-300">Samen naar een oplossing.</strong> We doen ons best om klachten altijd in goed overleg op te lossen.</li>
            </ol>
          </JuridischKaart>

          <JuridischKaart titel="7. Privacyverklaring">
            <Alinea>MijnKoelPietje gaat zorgvuldig om met jouw persoonsgegevens.</Alinea>
            <Alinea label="Welke gegevens gebruiken wij?" mb="mb-2">Wanneer je een bestelling plaatst of contact met ons opneemt, kunnen wij onder andere de volgende gegevens verwerken:</Alinea>
            <ul className="text-gray-400 leading-relaxed mb-3" style={LIJST_BOLLETJES}>
              <li>Voor- en achternaam</li>
              <li>Adresgegevens</li>
              <li>E-mailadres</li>
              <li>Telefoonnummer, wanneer je dit verstrekt</li>
              <li>Bestelgegevens</li>
              <li>Betaalgegevens</li>
              <li>Gegevens die nodig zijn voor de administratie</li>
            </ul>
            <Alinea label="Waarvoor gebruiken wij deze gegevens?" mb="mb-2">Wij gebruiken je gegevens uitsluitend wanneer dat nodig is, bijvoorbeeld voor:</Alinea>
            <ul className="text-gray-400 leading-relaxed mb-3" style={LIJST_BOLLETJES}>
              <li>het verwerken en bezorgen van je bestelling;</li>
              <li>het verwerken van je betaling;</li>
              <li>het beantwoorden van vragen;</li>
              <li>het behandelen van retouren en klachten;</li>
              <li>onze administratie;</li>
              <li>het voldoen aan wettelijke verplichtingen.</li>
            </ul>
            <Alinea>Wij verkopen jouw persoonsgegevens <strong className="text-gray-300">niet aan derden</strong>.</Alinea>
            <Alinea label="Met wie kunnen gegevens worden gedeeld?">Wanneer dit noodzakelijk is voor het uitvoeren van je bestelling, kunnen gegevens worden gedeeld met bijvoorbeeld de webwinkelsoftware of hostingpartij, de betaalprovider, de pakketbezorger en de boekhouder of boekhoudsoftware. Deze partijen krijgen alleen de gegevens die noodzakelijk zijn voor hun werkzaamheden.</Alinea>
            <Alinea label="Hoe lang bewaren wij gegevens?">Wij bewaren persoonsgegevens niet langer dan noodzakelijk is. Gegevens die onderdeel zijn van onze financiële administratie bewaren wij zolang dit wettelijk verplicht is, waaronder de fiscale bewaartermijn van 7 jaar.</Alinea>
            <Alinea label="Jouw rechten." mb="mb-2">Je hebt het recht om:</Alinea>
            <ul className="text-gray-400 leading-relaxed mb-3" style={LIJST_BOLLETJES}>
              <li>je persoonsgegevens in te zien;</li>
              <li>onjuiste gegevens te laten corrigeren;</li>
              <li>in bepaalde situaties gegevens te laten verwijderen;</li>
              <li>bezwaar te maken tegen bepaalde vormen van verwerking.</li>
            </ul>
            <Alinea mb="">Een verzoek kun je sturen naar <MailLink />. Om er zeker van te zijn dat een verzoek door de juiste persoon wordt gedaan, kunnen wij vragen om je identiteit te bevestigen.</Alinea>
          </JuridischKaart>

          <JuridischKaart titel="8. Cookies">
            <Alinea>De webshop van MijnKoelPietje kan cookies gebruiken die noodzakelijk zijn om de website en webshop goed te laten functioneren, bijvoorbeeld voor het winkelmandje en het bestelproces.</Alinea>
            <Alinea mb="">Wanneer wij gebruikmaken van analytische of andere cookies waarvoor toestemming nodig is, vragen wij hiervoor vooraf toestemming.</Alinea>
          </JuridischKaart>

          <JuridischKaart titel="9. Contact" accent>
            <Alinea>Heb je een vraag over een bestelling, product, retour, klacht of iets anders? Neem gerust contact met ons op. Wij proberen vragen zo snel mogelijk te beantwoorden.</Alinea>
            <Alinea mb="mb-4">MijnKoelPietje · Eijmaelstraat 17 · 6412 AL Heerlen · Nederland</Alinea>
            <MailKnop />
          </JuridischKaart>
        </div>
      </div>
    </div>
  );
}
