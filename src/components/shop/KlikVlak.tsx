'use client';

import { useRouter } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';

interface KlikVlakProps {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
  /** Voor HTML uit renderMarkdown (beschrijving). */
  html?: string;
  as?: 'div' | 'h3';
}

/**
 * Tekstvlak dat naar een pagina navigeert bij een klik, behalve als er op een
 * link of knop erin geklikt wordt (zelfde regel als renderShop in de oude main.js).
 * Geen <a>, zodat links in de markdown geen geneste interactieve elementen worden.
 * Toetsenbordgebruikers gebruiken de beeld-link of de titel-link van de kaart.
 */
export function KlikVlak({ href, className, style, children, html, as = 'div' }: KlikVlakProps) {
  const router = useRouter();
  const opKlik = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('a, button')) return;
    router.push(href);
  };
  const Tag = as;
  const stijl = { ...style, cursor: 'pointer' };
  if (html !== undefined) {
    return <Tag className={className} style={stijl} onClick={opKlik} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return (
    <Tag className={className} style={stijl} onClick={opKlik}>
      {children}
    </Tag>
  );
}
