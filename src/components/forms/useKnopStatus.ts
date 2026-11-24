'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Houdt een tijdelijke knopstatus bij (zoals "✓ Verstuurd!") die na een vaste tijd
 * terugvalt naar `rust`, met opruimen van de timer bij unmount.
 */
export function useKnopStatus<T extends string>(rust: T) {
  const [status, setStatus] = useState<T>(rust);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  /** Zet een blijvende status en annuleert een lopende terugval-timer. */
  const zet = useCallback((nieuw: T) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setStatus(nieuw);
  }, []);

  const zetTijdelijk = useCallback(
    (nieuw: T, ms: number, naAfloop?: () => void) => {
      if (timer.current) clearTimeout(timer.current);
      setStatus(nieuw);
      timer.current = setTimeout(() => {
        setStatus(rust);
        naAfloop?.();
      }, ms);
    },
    [rust],
  );

  return { status, setStatus: zet, zetTijdelijk };
}
