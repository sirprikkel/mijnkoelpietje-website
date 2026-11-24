'use client';

import type { CSSProperties, FormEvent } from 'react';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { useKnopStatus } from './useKnopStatus';

type Status = 'rust' | 'bezig' | 'verstuurd';

const LABEL = 'block mono text-xs text-gray-500 uppercase tracking-wide mb-2';
const VERSTUURD_STIJL: CSSProperties = { background: '#10b981', color: '#fff' };

interface Props {
  onderwerp?: string;
  bericht?: string;
}

function lees(data: FormData, veld: string): string {
  const waarde = data.get(veld);
  return typeof waarde === 'string' ? waarde : '';
}

/** Port van verstuurContact() uit de oude main.js (zelfde insert in contact_berichten). */
function ContactFormulier({ onderwerp = '', bericht = '' }: Props) {
  const { status, setStatus, zetTijdelijk } = useKnopStatus<Status>('rust');
  const [fout, setFout] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'bezig') return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const rij = {
      naam: lees(data, 'naam').trim(),
      email: lees(data, 'email').trim(),
      onderwerp: lees(data, 'onderwerp'),
      bericht: lees(data, 'bericht').trim(),
    };

    if (!rij.naam || !rij.bericht) {
      setFout('Vul minimaal je naam en bericht in.');
      return;
    }

    setFout(null);
    setStatus('bezig');
    try {
      const sb = await getSupabase();
      const { error } = await sb.from('contact_berichten').insert(rij);
      if (error) throw error;
    } catch {
      setStatus('rust');
      setFout('Er ging iets mis. Probeer het later opnieuw.');
      return;
    }
    zetTijdelijk('verstuurd', 3000, () => form.reset());
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="contact-naam" className={LABEL}>Naam</label>
          <input id="contact-naam" name="naam" type="text" placeholder="Je naam" className="zoek-input" required autoComplete="name" />
        </div>
        <div>
          <label htmlFor="contact-email" className={LABEL}>E-mail</label>
          <input id="contact-email" name="email" type="email" placeholder="jouw@email.nl" className="zoek-input" required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="contact-onderwerp" className={LABEL}>Onderwerp</label>
          <input
            id="contact-onderwerp"
            name="onderwerp"
            type="text"
            placeholder="Waar gaat het over?"
            className="zoek-input"
            autoComplete="off"
            defaultValue={onderwerp}
          />
        </div>
        <div>
          <label htmlFor="contact-bericht" className={LABEL}>Bericht</label>
          <textarea
            id="contact-bericht"
            name="bericht"
            placeholder="Jouw bericht..."
            className="zoek-input"
            rows={5}
            required
            style={{ resize: 'vertical' }}
            defaultValue={bericht}
          />
        </div>
        {fout && (
          <p role="alert" className="text-sm" style={{ color: '#ef4444' }}>
            {fout}
          </p>
        )}
        <button
          type="submit"
          className="btn-geel w-full text-center"
          disabled={status === 'bezig'}
          style={status === 'verstuurd' ? VERSTUURD_STIJL : undefined}
        >
          {status === 'bezig' ? 'Bezig met versturen...' : status === 'verstuurd' ? '✓ Verstuurd!' : 'Verstuur bericht'}
        </button>
        <span className="sr-only" role="status" aria-live="polite">
          {status === 'verstuurd' ? 'Je bericht is verstuurd.' : ''}
        </span>
      </div>
    </form>
  );
}

/** Leest ?onderwerp= (en optioneel ?bericht=), bijv. vanuit contactKopen() in de shop. */
function ContactFormulierMetParams() {
  const params = useSearchParams();
  const onderwerp = params.get('onderwerp') ?? '';
  const bericht = params.get('bericht') ?? '';
  return <ContactFormulier key={`${onderwerp}|${bericht}`} onderwerp={onderwerp} bericht={bericht} />;
}

/**
 * Contactformulier. De statische HTML bevat het lege formulier (Suspense-fallback);
 * in de browser wordt het onderwerp uit de URL ingevuld.
 */
export function ContactForm() {
  return (
    <Suspense fallback={<ContactFormulier />}>
      <ContactFormulierMetParams />
    </Suspense>
  );
}
