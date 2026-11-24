const VERLOOP: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  height: '120px',
  zIndex: 2,
  pointerEvents: 'none',
};

/**
 * VIDEO TUSSENSTUK. preload="metadata": de browser haalt niet meteen de hele mp4
 * op. De poster (eerste seconde van de video) staat er direct.
 */
export function VideoTussenstuk() {
  return (
    <div style={{ position: 'relative', height: '380px', overflow: 'hidden', margin: 0 }}>
      <div style={{ ...VERLOOP, top: 0, background: 'linear-gradient(180deg,#000 0%,transparent 100%)' }} />
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/hero-koelpietje-poster.jpg"
        aria-hidden="true"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', opacity: 0.65 }}
      >
        <source src="/hero-koelpietje.mp4" type="video/mp4" />
      </video>
      <div style={{ ...VERLOOP, bottom: 0, background: 'linear-gradient(0deg,#000 0%,transparent 100%)' }} />
    </div>
  );
}
