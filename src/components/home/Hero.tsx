import Link from 'next/link';

/** HERO — Chapter 1: Intro Hook */
export function Hero() {
  return (
    <section className="tunnel-bg min-h-[55vh] flex flex-col items-center justify-center relative pt-44 pb-14 px-4 sm:px-6 overflow-hidden">
      {/* Achtergrond decoratie */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: '15%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle,rgba(245,196,0,0.05),transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '55%',
            right: '10%',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle,rgba(245,196,0,0.03),transparent 70%)',
            borderRadius: '50%',
          }}
        />
      </div>

      <div className="relative z-10 text-center max-w-4xl">
        <div className="mono text-xs tracking-widest mb-6 uppercase" style={{ color: 'rgba(245,196,0,0.7)' }}>
          Glück Auf &nbsp;·&nbsp; Verhalen &nbsp;·&nbsp; Mijnerfgoed
        </div>

        <h1
          style={{
            fontFamily: "'Poiret One',sans-serif",
            fontSize: 'clamp(2.8rem,8vw,7rem)',
            lineHeight: 1.05,
            fontWeight: 400,
            marginBottom: '1.5rem',
          }}
        >
          In het donker
          <br />
          <span style={{ color: 'var(--geel)' }} className="kanarie-glow">
            zingt de kanarie
          </span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          Een reis door de steenkolenmijn — Het leven in de kolonie - Verhalen en herinneringen - MijnKoelPietje als gids
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/verhalen" className="btn-geel">
            Lees de verhalen
          </Link>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 shaft-glow" aria-hidden="true" />
      <div className="mijn-decor" aria-hidden="true" />
    </section>
  );
}
