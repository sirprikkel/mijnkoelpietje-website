import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getKunstwerkBySegment, getKunstwerken, getShopInstellingen, ogAfbeelding } from '@/lib/content';
import { cleanTekst, externeHref, renderMarkdown } from '@/lib/markdown';
import { productUrl, SITE_URL } from '@/lib/slug';
import { ProductFotos } from '@/components/shop/ProductFotos';
import { DeelKnoppen } from '@/components/shop/DeelKnoppen';
import { KoopKnop, contactKopenHref } from '@/components/shop/KoopKnop';
import { ActieBalk, Voordelen } from '@/components/shop/Voordelen';
import { formatPrijs } from '@/lib/prijs';

type Props = { params: Promise<{ slug: string }> };

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
  const prijs = k.prijs && formatPrijs(k.prijs) !== 'Gratis' ? ` — ${formatPrijs(k.prijs)}` : '';
  const oms = omschrijving(k.beschrijving);
  const url = SITE_URL + productUrl(k.slug);
  const beeld = ogAfbeelding(k.afbeelding);

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
  const instellingen = getShopInstellingen();
  // 'Veilig betalen' alleen tonen als dit product echt een Mollie-betaallink heeft.
  const voordelen = instellingen.voordelen.filter(v => v.icoon !== 'betalen' || k.mollieLink);
  const actie = instellingen.actie;

  return (
    <div id="sectie-shop">
      <div className="pt-24 pb-32 max-w-6xl mx-auto px-4 sm:px-6">
        <div id="product-detail" className="product-detail open mb-12 pt-8" role="article">
          <nav aria-label="Kruimelpad" className="mono text-xs text-gray-500 mb-8">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li><Link href="/" className="kruimel-link">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/shop" className="kruimel-link">Shop</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-gray-400 truncate max-w-[60vw]">{k.titel}</li>
            </ol>
          </nav>

          <div id="product-content">
            <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-start">
              <div className="md:sticky md:top-24">
                <ProductFotos fotos={k.fotos} titel={k.titel} />
              </div>

              {/* Op mobiel staat de koopknop direct onder de prijs (order), op desktop onder de beschrijving. */}
              <div className="flex flex-col">
                <div className="order-1">
                {k.collectie && (
                  <div className="mono text-xs uppercase mb-2" style={{ color: 'rgba(245,196,0,0.7)', letterSpacing: '0.1em' }}>
                    {k.collectie}
                  </div>
                )}
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
                  {k.prijs && (
                    <span className="text-2xl font-bold" style={{ color: 'var(--geel)' }}>
                      {formatPrijs(k.prijs)}
                    </span>
                  )}
                  {k.editie && <span className="mono text-xs text-gray-500">Editie {k.editie}</span>}
                </div>
                </div>

                <div
                  className="prose leading-relaxed mb-8 order-3 md:order-2"
                  style={{ maxWidth: '60ch' }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(k.beschrijving) }}
                />

                <div className="order-2 md:order-3 mb-8 md:mb-0">
                <KoopKnop
                  titel={k.titel}
                  mollieLink={k.mollieLink}
                  tekst={k.mollieLink ? 'Direct kopen' : 'Bestellen via contact'}
                  className="product-koopknop"
                />
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
                  {k.mollieLink && (
                    <Link href={contactKopenHref(k.titel)} className="mono text-xs kruimel-link">
                      Vraag over dit product? →
                    </Link>
                  )}
                  {meerInfo && (
                    <a href={meerInfo} target="_blank" rel="noopener" className="mono text-xs kruimel-link">
                      Meer info →
                    </a>
                  )}
                </div>

                <ActieBalk actie={actie} />
                </div>

                <div className="order-4">
                <Voordelen voordelen={voordelen} />
                {k.collectie && (
                  <p className="mono text-[0.7rem] uppercase tracking-widest text-gray-600 mt-6">
                    Collectie: <span className="text-gray-400">{k.collectie}</span>
                  </p>
                )}
                </div>
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
