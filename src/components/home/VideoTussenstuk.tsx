import { LuieVideo } from './LuieVideo';

const VERLOOP: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  height: '120px',
  zIndex: 2,
  pointerEvents: 'none',
};

/**
 * VIDEO TUSSENSTUK. De video laadt pas als hij bijna in beeld komt (LuieVideo);
 * tot die tijd staat de poster (eerste seconde van de video) er.
 */
export function VideoTussenstuk() {
  return (
    <div style={{ position: 'relative', height: '380px', overflow: 'hidden', margin: 0 }}>
      <div style={{ ...VERLOOP, top: 0, background: 'linear-gradient(180deg,#000 0%,transparent 100%)' }} />
      <LuieVideo
        src="/hero-koelpietje.mp4"
        poster="/hero-koelpietje-poster.jpg"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', opacity: 0.65 }}
      />
      <div style={{ ...VERLOOP, bottom: 0, background: 'linear-gradient(0deg,#000 0%,transparent 100%)' }} />
    </div>
  );
}
