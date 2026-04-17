// ═══════════════════════════════════════════════════════════
// Dieptemeter scroll animatie (GSAP ScrollTrigger)
// ═══════════════════════════════════════════════════════════
(function() {
  gsap.registerPlugin(ScrollTrigger);

  // Max diepte en telsnelheid
  const MAX_DIEPTE = 600;
  // Meters per pixel: behoud originele snelheid (300m over volledige pagina
  // bij de oorspronkelijke paginalengte). Bij langere pagina's telt hij door.
  let metersPerPixel = 0;
  const meter = document.getElementById('dieptemeter');
  const getal = document.getElementById('depth-getal');

  // Huidige diepte bijhouden
  let huidigeDepth = 0;
  let doelDepth = 0;

  // Bereken meters-per-pixel op basis van originele verhouding
  function berekenSnelheid() {
    const scrollHoogte = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHoogte > 0) {
      // Origineel: 300m over de gehele scrollhoogte
      metersPerPixel = 300 / scrollHoogte;
    }
  }
  berekenSnelheid();
  window.addEventListener('resize', berekenSnelheid);

  // Smooth counter update
  function updateGetal() {
    huidigeDepth += (doelDepth - huidigeDepth) * 0.12;
    const afgerond = Math.round(huidigeDepth);
    getal.textContent = afgerond;

    // Getal kleur verandert naarmate dieper (mijnschacht-thema)
    if (afgerond > 500) {
      getal.style.color = '#9d0208'; // pikdonker
    } else if (afgerond > 400) {
      getal.style.color = '#e63946'; // gevaar
    } else if (afgerond > 300) {
      getal.style.color = '#ff6b35'; // diep
    } else if (afgerond > 200) {
      getal.style.color = '#ff8c00'; // warmte
    } else if (afgerond > 100) {
      getal.style.color = '#ffd700'; // schemering
    } else {
      getal.style.color = '#f5c400'; // daglicht
    }

    requestAnimationFrame(updateGetal);
  }
  requestAnimationFrame(updateGetal);

  // Scroll listener: diepte op basis van gescrollde pixels
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    doelDepth = Math.min(Math.round(scrolled * metersPerPixel), MAX_DIEPTE);
  });
})();
