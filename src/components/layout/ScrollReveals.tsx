'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Port van initScrollReveals(): elementen met .reveal krijgen .zichtbaar zodra
 * ze in beeld komen. Draait opnieuw na elke navigatie en houdt via een
 * MutationObserver ook later toegevoegde .reveal-elementen bij.
 */
export function ScrollReveals() {
  const pathname = usePathname();

  useEffect(() => {
    const reveals = () => Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.zichtbaar)'));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reveals().forEach(el => el.classList.add('zichtbaar'));
      return;
    }

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

    const observeer = () =>
      reveals().forEach((el, i) => {
        if (el.dataset.kpObserved) return;
        el.dataset.kpObserved = '1';
        if (!el.style.transitionDelay) el.style.transitionDelay = `${Math.min(i, 8) * 80}ms`;
        io.observe(el);
      });

    observeer();
    const mo = new MutationObserver(observeer);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
