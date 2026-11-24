interface PaginaKopProps {
  label: string;
  titel: string;
  intro?: string;
  /** Juridische pagina's hebben een kleinere kop en een update-datum. */
  klein?: boolean;
  bijgewerkt?: string;
}

/** Gedeelde paginakop (label, titel, intro), letterlijk zoals in de oude secties. */
export function PaginaKop({ label, titel, intro, klein = false, bijgewerkt }: PaginaKopProps) {
  return (
    <div className="text-center mb-16 pt-8">
      <div className="mono text-xs tracking-widest uppercase mb-3" style={{ color: 'rgba(245,196,0,0.7)' }}>
        {label}
      </div>
      <h1
        style={{
          fontFamily: "'Poiret One',sans-serif",
          fontSize: klein ? 'clamp(2rem,5vw,3.5rem)' : 'clamp(2.5rem,6vw,4rem)',
          fontWeight: 400,
        }}
        className="mb-4"
      >
        {titel}
      </h1>
      {intro && <p className="text-gray-500 max-w-xl mx-auto">{intro}</p>}
      {bijgewerkt && <p className="text-gray-500 text-sm">Laatste update: {bijgewerkt}</p>}
    </div>
  );
}
