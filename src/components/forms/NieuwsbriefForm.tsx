'use client';

import type { CSSProperties, FormEvent } from 'react';
import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useKnopStatus } from './useKnopStatus';

type Status = 'rust' | 'bezig' | 'aangemeld' | 'dubbel' | 'fout';

/** Postgres unique_violation: dit e-mailadres staat al in de tabel. */
const AL_AANGEMELD_CODE = '23505';

const KNOP: Record<Status, { tekst: string; stijl?: CSSProperties }> = {
  rust: { tekst: 'Aanmelden' },
  bezig: { tekst: 'Bezig...' },
  aangemeld: { tekst: '✓ Aangemeld!', stijl: { background: '#10b981', color: '#fff' } },
  dubbel: { tekst: 'Al aangemeld!', stijl: { background: '#f97316', color: '#fff' } },
  fout: { tekst: 'Fout opgetreden', stijl: { background: '#ef4444', color: '#fff' } },
};

const MELDING: Partial<Record<Status, string>> = {
  aangemeld: 'Je bent aangemeld voor de nieuwsbrief.',
  dubbel: 'Dit e-mailadres is al aangemeld.',
  fout: 'Aanmelden is niet gelukt. Probeer het later opnieuw.',
};

/** Port van aanmeldenNieuwsbrief() uit de oude main.js (zelfde Supabase-insert en meldingen). */
export function NieuwsbriefForm() {
  const [email, setEmail] = useState('');
  const { status, setStatus, zetTijdelijk } = useKnopStatus<Status>('rust');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const adres = email.trim();
    if (!adres || status === 'bezig') return;

    setStatus('bezig');
    try {
      const sb = await getSupabase();
      const { error } = await sb.from('nieuwsbrief').insert({ email: adres });
      if (error) {
        zetTijdelijk(error.code === AL_AANGEMELD_CODE ? 'dubbel' : 'fout', 3000);
        return;
      }
    } catch {
      zetTijdelijk('fout', 3000);
      return;
    }
    setEmail('');
    zetTijdelijk('aangemeld', 4000);
  }

  const knop = KNOP[status];
  const melding = MELDING[status];

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        id="nieuwsbrief-email"
        type="email"
        placeholder="jouw@email.nl"
        className="zoek-input flex-1"
        aria-label="E-mailadres"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button type="submit" id="nieuwsbrief-btn" className="btn-geel" disabled={status === 'bezig'} style={knop.stijl}>
        {knop.tekst}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {melding ?? ''}
      </span>
    </form>
  );
}

/** Ook als default, voor wie hem zo importeert. */
export default NieuwsbriefForm;
