// ═══════════════════════════════════════════════════════════
// Dieptemeter scroll animatie (GSAP ScrollTrigger)
// ═══════════════════════════════════════════════════════════
(function() {
  gsap.registerPlugin(ScrollTrigger);

  // Max diepte = 600m (aan het einde van de pagina)
  const MAX_DIEPTE = 600;
  const meter = document.getElementById('dieptemeter');
  const getal = document.getElementById('depth-getal');

  // Huidige diepte bijhouden
  let huidigeDepth = 0;
  let doelDepth = 0;

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

  // ScrollTrigger: koppel scroll positie aan diepte
  ScrollTrigger.create({
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      doelDepth = Math.round(self.progress * MAX_DIEPTE);
    }
  });
})();
