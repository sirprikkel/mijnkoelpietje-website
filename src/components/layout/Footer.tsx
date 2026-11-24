import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t py-12 px-4 sm:px-6" style={{ background: '#000', borderColor: 'rgba(245,196,0,0.1)' }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-rond.png" alt="MijnKoelPietje" width={36} height={36} style={{ borderRadius: '50%' }} loading="lazy" />
          <div>
            <div style={{ fontFamily: "'Poiret One',sans-serif" }} className="text-lg">
              Mijn<span style={{ color: 'var(--geel)' }}>KoelPietje</span>
            </div>
            <div className="mono text-gray-600 text-xs">Glück Auf · Verhalen · Mijnerfgoed</div>
          </div>
        </div>
        <nav aria-label="Footer navigatie">
          <div className="flex gap-6 flex-wrap justify-center">
            <Link href="/disclaimer" className="nav-link">Disclaimer &amp; Privacy</Link>
            <Link href="/voorwaarden" className="nav-link">Algemene Voorwaarden</Link>
          </div>
        </nav>
        <div className="mono text-gray-700 text-xs text-center">
          © 2026 MijnKoelPietje.nl<br />
          KVK 42156376<br />
          Gebouwd door{' '}
          <a href="https://www.code-lieshout.nl" className="transition-colors" style={{ color: 'rgba(245,196,0,0.5)' }} target="_blank" rel="noopener">
            Code Lieshout
          </a>
        </div>
      </div>
    </footer>
  );
}
