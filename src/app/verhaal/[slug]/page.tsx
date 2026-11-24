import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getVerhaalBySegment, getVerhalen, ogAfbeelding } from '@/lib/content';
import { cleanTekst, externeHref, renderMarkdown } from '@/lib/markdown';
import { SITE_URL, verhaalUrl } from '@/lib/slug';
import { LightboxKnop } from '@/components/Lightbox';
import { SectieKop } from '@/components/verhalen/SectieKop';
import { TerugKnop } from '@/components/verhalen/TerugKnop';
import { DeelBlok } from '@/components/verhalen/DeelBlok';
import { LikeKnop } from '@/components/verhalen/LikeKnop';
import { rubriekStijl } from '@/components/verhalen/rubriek';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams(): Array<{ slug: string }> {
  return getVerhalen().map(v => ({ slug: v.urlSlug }));
}

/** Zelfde als omschrijving() in legacy/build-index.js (og/description, max 200 tekens). */
function omschrijving(intro: string, tekst: string, max = 200): string {
  const plat = (cleanTekst(intro) || cleanTekst(tekst))
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_~`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plat.length > max ? plat.slice(0, max - 1).trimEnd() + '…' : plat;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const v = getVerhaalBySegment(slug);
  if (!v) return {};

  const titel = v.titel || 'MijnKoelPietje';
  const oms = omschrijving(v.intro, v.tekst);
  const url = SITE_URL + verhaalUrl(v.slug);
  const beeld = ogAfbeelding(v.afbeelding);
  const images = beeld ? [{ url: beeld, width: 1200, height: 630 }] : undefined;

  return {
    title: `${titel} — MijnKoelPietje`,
    description: oms,
    alternates: { canonical: url },
    openGraph: {
      title: titel,
      description: oms,
      type: 'article',
      siteName: 'MijnKoelPietje',
      locale: 'nl_NL',
      url,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: titel,
      description: oms,
      images: beeld ? [beeld] : undefined,
    },
  };
}

/** Port van openVerhaal() uit de oude main.js, nu als eigen pagina. */
export default async function VerhaalPage({ params }: Props) {
  const { slug } = await params;
  const v = getVerhaalBySegment(slug);
  if (!v) notFound();

  const cfg = rubriekStijl(v.rubriek);
  const link = externeHref(v.link);

  return (
    <div id="sectie-verhalen" className="sectie actief">
      <div className="pt-24 pb-32 max-w-6xl mx-auto px-4 sm:px-6">
        <SectieKop
          bovenregel="Tussen donker en licht"
          titel="Verhalen"
          tekst="Herinneringen, geschiedenis, nostalgie en meer - elk verhaal een rimpeling in de tijd."
        />

        <article id="verhaal-detail" className="verhaal-detail open mb-12">
          <TerugKnop urlSlug={v.urlSlug} variant="boven" />

          <div id="verhaal-content" className="max-w-2xl">
            {v.afbeelding && (
              <div style={{ marginBottom: '2rem', borderRadius: 12, overflow: 'hidden' }}>
                <LightboxKnop
                  fotos={[v.afbeelding]}
                  alt={v.titel}
                  className="block w-full p-0 bg-transparent border-none cursor-zoom-in"
                  aria-label={'Vergroot afbeelding: ' + v.titel}
                >
                  <Image
                    src={v.afbeelding}
                    alt={v.titel}
                    width={1200}
                    height={900}
                    sizes="(min-width: 672px) 672px, 100vw"
                    priority
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '70vh',
                      objectFit: 'contain',
                      opacity: 0.85,
                      display: 'block',
                    }}
                  />
                </LightboxKnop>
              </div>
            )}

            <div style={{ borderLeft: `3px solid ${cfg.kleur}`, paddingLeft: '1.5rem', marginBottom: '2.5rem' }}>
              <div className="mono text-xs mb-2 uppercase" style={{ color: cfg.kleur, letterSpacing: '0.1em' }}>
                {cfg.label}
              </div>
              <h1
                style={{
                  fontFamily: "'Poiret One',sans-serif",
                  fontWeight: 400,
                  fontSize: 'clamp(1.8rem,4vw,2.8rem)',
                  lineHeight: 1.2,
                  marginBottom: '0.5rem',
                }}
              >
                {v.titel}
              </h1>
              <div className="mono text-xs text-gray-600">{v.datum}</div>
            </div>

            <div
              className="prose leading-relaxed"
              style={{ maxWidth: '65ch' }}
              // Content komt uit de eigen CMS-repo en werd ook in de oude site als HTML getoond.
              dangerouslySetInnerHTML={{ __html: renderMarkdown(v.tekst) }}
            />

            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener"
                className="mono text-xs mt-2 inline-block"
                style={{ color: cfg.kleur }}
              >
                Meer info {'→'}
              </a>
            )}

            <DeelBlok titel={v.titel} pad={verhaalUrl(v.slug)} />
            <LikeKnop likeId={v.likeId} />

            <div style={{ marginTop: '3rem' }}>
              <TerugKnop urlSlug={v.urlSlug} variant="onder" />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
