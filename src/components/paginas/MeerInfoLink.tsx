import { externeHref } from '@/lib/markdown';

/** Port van linkHTML() uit de oude main.js. */
export function MeerInfoLink({ url, kleur }: { url: string | null; kleur?: string }) {
  const href = externeHref(url);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="mono text-xs mt-2 inline-block"
      style={{ color: kleur || 'var(--geel)' }}
    >
      Meer info →
    </a>
  );
}
