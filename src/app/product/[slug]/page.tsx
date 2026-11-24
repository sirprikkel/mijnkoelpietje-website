import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getKunstwerkBySegment, getKunstwerken, ogAfbeelding } from '@/lib/content';
import { cleanTekst, externeHref, renderMarkdown } from '@/lib/markdown';
import { productUrl, SITE_URL } from '@/lib/slug';
import { ProductFotos } from '@/components/shop/ProductFotos';
import { DeelKnoppen } from '@/components/shop/DeelKnoppen';
import { KoopKnop } from '@/components/shop/KoopKnop';

type Props = { params: Promise<{ slug: string }> };

const OG_FALLBACK = '/logo-rond.png';

export function generateStaticParams() {
  return getKunstwerken().map((k) => ({ slug: k.urlSlug }));
}

/** Platte omschrijving voor og/meta (omschrijving() uit de oude build-index.js). */
function omschrijving(tekst: string, max = 200): string {
  const plat = cleanTekst(tekst)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_~`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plat.length > max ? plat.slice(0, max - 1).trimEnd() + '…' : plat;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const k = getKunstwerkBySegment(slug);
  if (!k) return {};

  const titel = k.titel || 'MijnKoelPietje';
  const prijs = k.prijs && k.prijs !== '0' ? ` — € ${k.prijs},-` : '';
  const oms = omschrijving(k.beschrijving);
  const url = SITE_URL + productUrl(k.slug);
  const beeld = ogAfbeelding(k.afbeelding) ?? OG_FALLBACK;

  return {
    title: `${titel} — MijnKoelPietje`,
    description: oms,
    alternates: { canonical: url },
    openGraph: {
      title: titel + prijs,
      description: oms,
      type: 'article',
      siteName: 'MijnKoelPietje',
      locale: 'nl_NL',
      url,
      images: [{ url: beeld, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: titel + prijs,
      description: oms,
      images: [beeld],
    },
  };
}

export default async function ProductPagina({ params }: Props) {
  const { slug } = await params;
  const k = getKunstwerkBySegment(slug);
  if (!k) notFound();

  const meerInfo = externeHref(k.link);

  return (
    <div id="sectie-shop">
      <div className="pt-24 pb-32 max-w-6xl mx-auto px-4 sm:px-6">
        <div id="product-detail" className="product-detail open mb-12 pt-8" role="article">
          <Link
            href="/shop"
            className="flex items-center gap-2 mb-8 transition-colors text-sm mono cursor-pointer bg-transparent border-none min-h-[44px]"
            style={{ color: 'rgba(245,196,0,0.8)' }}
            aria-label="Terug naar de shop"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="16" height="16" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Terug naar de shop
          </Link>

          <div id="product-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              <ProductFotos fotos={k.fotos} titel={k.titel} />

              <div>
                <div className="mono text-xs uppercase mb-2" style={{ color: 'rgba(245,196,0,0.7)', letterSpacing: '0.1em' }}>
                  {k.collectie}
                </div>
                <h1
                  style={{
                    fontFamily: "'Poiret One',sans-serif",
                    fontWeight: 400,
                    fontSize: 'clamp(1.6rem,3.5vw,2.4rem)',
                    lineHeight: 1.2,
                    marginBottom: '0.75rem',
                  }}
                >
                  {k.titel}
                </h1>
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                  <span className="text-2xl font-bold" style={{ color: 'var(--geel)' }}>
                    € {k.prijs},–
                  </span>
                  {k.editie && <span className="mono text-xs text-gray-500">Editie {k.editie}</span>}
                </div>
                <div
                  className="prose leading-relaxed mb-6"
                  style={{ maxWidth: '60ch' }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(k.beschrijving) }}
                />
                {meerInfo && (
                  <div className="mb-6">
                    <a
                      href={meerInfo}
                      target="_blank"
                      rel="noopener"
                      className="mono text-xs mt-2 inline-block"
                      style={{ color: 'var(--geel)' }}
                    >
                      Meer info →
                    </a>
                  </div>
                )}
                <KoopKnop titel={k.titel} mollieLink={k.mollieLink} groot />
              </div>
            </div>
          </div>

          <div id="deel-sectie-product">
            <DeelKnoppen titel={k.titel} pad={productUrl(k.slug)} />
          </div>
        </div>
      </div>
    </div>
  );
}
