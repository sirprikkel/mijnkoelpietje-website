// ═══════════════════════════════════════════════════════════
// Dieptemeter scroll animatie (GSAP ScrollTrigger)
// ═══════════════════════════════════════════════════════════
(function() {
  gsap.registerPlugin(ScrollTrigger);

  // Max diepte = 300m (aan het einde van de pagina)
  const MAX_DIEPTE = 300;
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

    // Getal kleur verandert naarmate dieper
    if (afgerond > 200) {
      getal.style.color = '#ff6b35'; // oranje-rood diep
    } else if (afgerond > 100) {
      getal.style.color = '#ffd700'; // goud middel
    } else {
      getal.style.color = 'var(--geel)';
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
