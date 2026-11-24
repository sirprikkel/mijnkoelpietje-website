'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Dieptemeter } from './Dieptemeter';
import { FACEBOOK_URL, NAV_ITEMS } from './navItems';

const FB_PAD = 'M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3';

function isActief(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === '/verhalen' && pathname.startsWith('/verhaal/')) return true;
  if (href === '/shop' && pathname.startsWith('/product/')) return true;
  return false;
}

/** Hover-animatie van het Facebook-icoon. GSAP wordt pas bij de eerste hover geladen. */
function useFacebookHover(ref: React.RefObject<HTMLAnchorElement | null>) {
  useEffect(() => {
    const link = ref.current;
    if (!link || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const pad = link.querySelector('.fb-path');
    const duim = link.querySelector('.fb-duim');
    if (!pad || !duim) return;
    let gsapMod: typeof import('gsap').gsap | null = null;
    const laad = async () => (gsapMod ??= (await import('gsap')).gsap);
    const enter = async () => {
      const gsap = await laad();
      gsap.fromTo(pad, { scale: 1 }, { keyframes: [{ scale: 0.9 }, { scale: 1.05 }, { scale: 1 }], duration: 0.5, ease: 'power1.inOut' });
      gsap.fromTo(duim, { y: -10, opacity: 0 }, { keyframes: [{ opacity: 1 }, { opacity: 0 }], y: 0, duration: 0.6, ease: 'power2.out' });
    };
    const leave = async () => {
      const gsap = await laad();
      gsap.to(pad, { scale: 1, duration: 0.2, ease: 'power1.inOut' });
      gsap.set(duim, { y: 0, opacity: 0 });
    };
    link.addEventListener('mouseenter', enter);
    link.addEventListener('mouseleave', leave);
    return () => {
      link.removeEventListener('mouseenter', enter);
      link.removeEventListener('mouseleave', leave);
    };
  }, [ref]);
}

export function Nav() {
  const pathname = usePathname() || '/';
  const [mobOpen, setMobOpen] = useState(false);
  const fbRef = useRef<HTMLAnchorElement>(null);
  useFacebookHover(fbRef);

  // Menu dicht na navigeren.
  useEffect(() => setMobOpen(false), [pathname]);

  return (
    <nav id="main-nav" aria-label="Hoofdnavigatie">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Naar homepage">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-rond.png" alt="MijnKoelPietje logo" width={44} height={44} style={{ borderRadius: '50%', filter: 'drop-shadow(0 0 8px rgba(245,196,0,0.4))' }} />
          <span style={{ fontFamily: "'Poiret One',sans-serif" }} className="text-xl tracking-wide text-white">
            Mijn<span style={{ color: 'var(--geel)' }}>KoelPietje</span>
          </span>
        </Link>

        {/* Desktop menu: onder 1060px vervangen door hamburger (.kp-desk / .kp-mob-btn in globals.css) */}
        <div id="desk-menu" className="kp-desk items-center gap-4 xl:gap-6 2xl:gap-8">
          <a ref={fbRef} href={FACEBOOK_URL} target="_blank" rel="noopener" id="fb-nav" className="fb-nav-link" aria-label="Volg MijnKoelPietje op Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={20} height={20} style={{ overflow: 'visible' }} aria-hidden="true">
              <path className="fb-path" d={FB_PAD} style={{ transformOrigin: 'center' }} />
              <text className="fb-duim" x="12" y="2" textAnchor="middle" fontSize="10" stroke="none" fill="currentColor" opacity="0">👍</text>
            </svg>
          </a>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} className={`nav-link${isActief(pathname, item.href) ? ' active' : ''}`}>
              {item.label}
            </Link>
          ))}
          <Dieptemeter />
        </div>

        <button
          id="mob-menu-btn"
          onClick={() => setMobOpen(o => !o)}
          style={{ color: 'var(--geel)' }}
          className="kp-mob-btn items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer bg-transparent border-none"
          aria-label="Menu openen/sluiten"
          aria-expanded={mobOpen}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width={24} height={24}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
        </button>
      </div>

      {mobOpen && (
        <div id="mob-menu" style={{ borderTop: '1px solid rgba(245,196,0,0.12)' }} className="kp-mob-menu px-6 pb-4">
          <div className="flex flex-col gap-4 pt-4">
            <a href={FACEBOOK_URL} target="_blank" rel="noopener" className="nav-link text-left min-h-[44px] flex items-center gap-2" onClick={() => setMobOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16} aria-hidden="true"><path d={FB_PAD} /></svg>
              Facebook
            </a>
            {NAV_ITEMS.map(item => (
              <Link key={item.href} href={item.href} className={`nav-link text-left min-h-[44px] flex items-center${isActief(pathname, item.href) ? ' active' : ''}`}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
