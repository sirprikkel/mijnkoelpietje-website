'use client';

import { useEffect, useRef } from 'react';

// Port van js/dieptemeter.js: onderaan de pagina staat de teller op MAX_DIEPTE meter.
const MAX_DIEPTE = 1058;

function kleurVoor(fractie: number): string {
  if (fractie > 0.83) return '#9d0208'; // pikdonker
  if (fractie > 0.66) return '#e63946'; // gevaar
  if (fractie > 0.5) return '#ff6b35'; // diep
  if (fractie > 0.33) return '#ff8c00'; // warmte
  if (fractie > 0.16) return '#ffd700'; // schemering
  return '#f5c400'; // daglicht
}

export function Dieptemeter() {
  const getalRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let huidig = 0;
    let doel = 0;
    let frame = 0;

    const updateDoel = () => {
      const scrollHoogte = document.documentElement.scrollHeight - window.innerHeight;
      doel = scrollHoogte > 0 ? Math.min(Math.round((window.scrollY * MAX_DIEPTE) / scrollHoogte), MAX_DIEPTE) : 0;
    };

    const tik = () => {
      huidig += (doel - huidig) * 0.12;
      const afgerond = Math.round(huidig);
      const el = getalRef.current;
      if (el) {
        el.textContent = String(afgerond);
        el.style.color = kleurVoor(afgerond / MAX_DIEPTE);
      }
      frame = requestAnimationFrame(tik);
    };

    updateDoel();
    frame = requestAnimationFrame(tik);
    window.addEventListener('scroll', updateDoel, { passive: true });
    window.addEventListener('resize', updateDoel);
    const ro = new ResizeObserver(updateDoel);
    ro.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateDoel);
      window.removeEventListener('resize', updateDoel);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="dieptemeter" id="dieptemeter">
      <span className="depth-label">Diepte</span>
      <div className="depth-row">
        <span className="depth-getal" id="depth-getal" ref={getalRef}>0</span>
        <span className="depth-eenheid">m</span>
      </div>
    </div>
  );
}
