interface SectieKopProps {
  bovenregel: string;
  titel: string;
  tekst: string;
}

/** Kop bovenaan de secties Verhalen en Galerij (zelfde markup als legacy/index.html). */
export function SectieKop({ bovenregel, titel, tekst }: SectieKopProps) {
  return (
    <div className="text-center mb-16 pt-8">
      <div className="mono text-xs tracking-widest uppercase mb-3" style={{ color: 'rgba(245,196,0,0.7)' }}>
        {bovenregel}
      </div>
      <h1
        style={{ fontFamily: "'Poiret One',sans-serif", fontSize: 'clamp(2.5rem,6vw,4rem)', fontWeight: 400 }}
        className="mb-4"
      >
        {titel}
      </h1>
      <p className="text-gray-500 max-w-xl mx-auto">{tekst}</p>
    </div>
  );
}
