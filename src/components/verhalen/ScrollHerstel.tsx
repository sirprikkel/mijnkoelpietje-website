'use client';

import { useEffect } from 'react';
import { herstelScroll, pakHerstel, type HerkomstPad } from './herkomst';

/** Herstelt de scrollpositie na 'Terug naar galerij' (terugNaarGalerij() in de oude main.js). */
export function ScrollHerstel({ pad }: { pad: HerkomstPad }) {
  useEffect(() => {
    const herstel = pakHerstel(pad);
    if (herstel) herstelScroll(herstel);
  }, [pad]);
  return null;
}
