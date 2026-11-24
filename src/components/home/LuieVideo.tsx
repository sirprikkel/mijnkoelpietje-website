'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  src: string;
  poster: string;
  style?: React.CSSProperties;
}

/**
 * Autoplay-video die pas downloadt als hij bijna in beeld is. Een autoplay-video
 * negeert preload en haalt anders direct de hele mp4 (1,2 MB) op, ook bij
 * bezoekers die nooit zo ver scrollen. Tot dan staat de poster er.
 * Bij 'minder beweging' blijft het bij de poster.
 */
export function LuieVideo({ src, poster, style }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [laden, setLaden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setLaden(true);
          io.disconnect();
        }
      },
      { rootMargin: '300px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!laden || !ref.current) return;
    ref.current.load();
    ref.current.play().catch(() => {
      // Autoplay geweigerd (bijv. energiebesparing): de poster blijft staan.
    });
  }, [laden]);

  return (
    <video ref={ref} muted loop playsInline preload="none" poster={poster} aria-hidden="true" style={style}>
      {laden && <source src={src} type="video/mp4" />}
    </video>
  );
}
