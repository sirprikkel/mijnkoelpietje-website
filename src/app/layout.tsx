import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { CookieBanner } from '@/components/layout/CookieBanner';
import { ScrollReveals } from '@/components/layout/ScrollReveals';
import { GoatCounter } from '@/components/layout/GoatCounter';
import { SITE_URL } from '@/lib/slug';

// Absolute og-afbeeldingen: op een Vercel-preview naar de preview zelf, zodat
// je deelkaarten kunt testen voordat de site live gaat. Productie: het echte domein.
const METADATA_BASE =
  process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(METADATA_BASE),
  title: 'Echo van de Mijnen, Oude Archieven, Nieuwe Herinneringen',
  description:
    'Wie kan er beter vertellen over het leven in de kolonie dan MijnKoelPietje. Duik in de stoffige archieven en ontdek de echte historie in een modern jasje met leuke afbeeldingen. Ga je mee ondergronds? Ga je mee nieuwe herinneringen maken?',
  openGraph: {
    title: 'Echo van de Mijnen, Oude Archieven, Nieuwe Herinneringen',
    description:
      'Op deze website mijnkoelpietje.nl brengen we het verleden, het heden en de toekomst van de mijnbouw in Limburg samen op een manier die je nog niet eerder hebt gezien.',
    type: 'website',
    url: SITE_URL,
    locale: 'nl_NL',
    siteName: 'MijnKoelPietje',
  },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Didact+Gothic&family=Poiret+One&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CookieBanner />
        <Nav />
        <main>{children}</main>
        <Footer />
        <ScrollReveals />
        <GoatCounter />
      </body>
    </html>
  );
}
