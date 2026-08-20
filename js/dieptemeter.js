// ═══════════════════════════════════════════════════════════
// Dieptemeter scroll animatie (GSAP ScrollTrigger)
// ═══════════════════════════════════════════════════════════
(function() {
  gsap.registerPlugin(ScrollTrigger);

  // Max diepte: onderaan de pagina staat de teller op 1058 m.
  const MAX_DIEPTE = 1058;
  // Meters per pixel wordt zo berekend dat de volledige scrollhoogte
  // exact overeenkomt met MAX_DIEPTE.
  let metersPerPixel = 0;
  const meter = document.getElementById('dieptemeter');
  const getal = document.getElementById('depth-getal');

  // Huidige diepte bijhouden
  let huidigeDepth = 0;
  let doelDepth = 0;

  // Scrollhoogte wordt bij élke berekening opnieuw opgevraagd. Vaste caching
  // ging mis: bij het laden staat de content nog niet in de DOM (die komt via
  // fetch), waardoor de pagina korter leek en de meter te snel liep.
  function berekenSnelheid() {
    const scrollHoogte = document.documentElement.scrollHeight - window.innerHeight;
    metersPerPixel = scrollHoogte > 0 ? MAX_DIEPTE / scrollHoogte : 0;
    return scrollHoogte;
  }
  berekenSnelheid();
  window.addEventListener('resize', berekenSnelheid);

  // Smooth counter update
  function updateGetal() {
    huidigeDepth += (doelDepth - huidigeDepth) * 0.12;
    const afgerond = Math.round(huidigeDepth);
    getal.textContent = afgerond;

    // Getal kleur verandert naarmate dieper (mijnschacht-thema).
    // Drempels als fractie van MAX_DIEPTE, zodat het kleurverloop bij een
    // andere maximumdiepte hetzelfde aanvoelt.
    const fractie = afgerond / MAX_DIEPTE;
    if (fractie > 0.83) {
      getal.style.color = '#9d0208'; // pikdonker
    } else if (fractie > 0.66) {
      getal.style.color = '#e63946'; // gevaar
    } else if (fractie > 0.50) {
      getal.style.color = '#ff6b35'; // diep
    } else if (fractie > 0.33) {
      getal.style.color = '#ff8c00'; // warmte
    } else if (fractie > 0.16) {
      getal.style.color = '#ffd700'; // schemering
    } else {
      getal.style.color = '#f5c400'; // daglicht
    }

    requestAnimationFrame(updateGetal);
  }
  requestAnimationFrame(updateGetal);

  // Scroll listener: diepte als fractie van de actuele scrollhoogte, zodat
  // onderaan de pagina altijd exact MAX_DIEPTE staat — ook wanneer de
  // paginalengte verandert (content ingeladen, andere sectie, mobiel).
  function updateDoel() {
    const scrollHoogte = berekenSnelheid();
    doelDepth = scrollHoogte > 0
      ? Math.min(Math.round(window.scrollY * metersPerPixel), MAX_DIEPTE)
      : 0;
  }
  window.addEventListener('scroll', updateDoel, { passive: true });

  // De paginahoogte verandert ook zonder scrollen: content wordt via fetch
  // ingeladen en secties wisselen. Daarop meebewegen, anders blijft de teller
  // op een verouderde verhouding staan.
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(updateDoel).observe(document.body);
  } else {
    window.addEventListener('load', updateDoel);
  }
})();
