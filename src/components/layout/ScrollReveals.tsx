'use client';

import { useEffect } from 'react';

/**
 * Port van initScrollReveals(): elementen met .reveal krijgen .zichtbaar zodra
 * ze in beeld komen.
 *
 * Eén observer voor de hele sessie. Een MutationObserver pikt de .reveal-
 * elementen van elke nieuwe pagina op, ook na navigeren via het menu. Eerder
 * draaide dit per route en markeerde het elementen op de DOM; bij client-side
 * navigatie markeerde de oude observer de nieuwe elementen vlak voordat hij werd
 * afgesloten, waardoor de nieuwe ze oversloeg en ze onzichtbaar bleven.
 */
export function ScrollReveals() {
  useEffect(() => {
    const alle = () => Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.zichtbaar)'));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const toon = () => alle().forEach(el => el.classList.add('zichtbaar'));
      toon();
      const mo = new MutationObserver(toon);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const bekeken = new WeakSet<Element>();
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('zichtbaar');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );

    const observeer = () => {
      let i = 0;
      for (const el of alle()) {
        if (bekeken.has(el)) continue;
        bekeken.add(el);
        if (!el.style.transitionDelay) el.style.transitionDelay = `${Math.min(i++, 8) * 80}ms`;
        io.observe(el);
      }
    };

    observeer();
    const mo = new MutationObserver(observeer);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
