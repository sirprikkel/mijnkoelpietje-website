'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';

interface LikeKnopProps {
  /** Supabase-sleutel: v.id || v.titel (NIET de slug). */
  likeId: string;
}

const opslagSleutel = (likeId: string) => 'like_' + likeId;

function leesGestemd(likeId: string): boolean {
  try {
    return Boolean(window.localStorage.getItem(opslagSleutel(likeId)));
  } catch {
    return false;
  }
}

async function laadLikes(likeId: string): Promise<number | null> {
  const sb = await getSupabase();
  const { count, error } = await sb.from('likes').select('*', { count: 'exact', head: true }).eq('verhaal_id', likeId);
  if (!error && count !== null) return count;
  // Terugval zoals in de oude laadLikes(): rijen ophalen en tellen.
  const { data, error: fout } = await sb.from('likes').select('*').eq('verhaal_id', likeId);
  if (fout) return null;
  return (data ?? []).length;
}

/** Port van renderLikeKnop()/stemLike() uit de oude main.js. */
export function LikeKnop({ likeId }: LikeKnopProps) {
  const [totaal, setTotaal] = useState<number | null>(null);
  const [gestemd, setGestemd] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    let actief = true;
    setGestemd(leesGestemd(likeId));
    laadLikes(likeId)
      .then(n => { if (actief) setTotaal(n ?? 0); })
      .catch(() => { if (actief) setTotaal(0); });
    return () => { actief = false; };
  }, [likeId]);

  const stem = async () => {
    if (gestemd || bezig) return;
    setBezig(true);
    setFout(null);
    try {
      const sb = await getSupabase();
      const { error } = await sb.from('likes').insert({ verhaal_id: likeId, type: 'groen' });
      if (error) throw error;
      try {
        window.localStorage.setItem(opslagSleutel(likeId), 'like');
      } catch {
        // geen localStorage: de stem is wel opgeslagen
      }
      setGestemd(true);
      const n = await laadLikes(likeId).catch(() => null);
      setTotaal(t => n ?? (t ?? 0) + 1);
    } catch {
      setFout('Je like kon niet worden opgeslagen. Probeer het later opnieuw.');
    } finally {
      setBezig(false);
    }
  };

  return (
    <div
      style={{
        marginTop: '2.5rem',
        padding: '1rem 1.5rem',
        background: 'var(--grijs)',
        borderRadius: 12,
        border: '1px solid rgba(245,196,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <button
        type="button"
        onClick={stem}
        disabled={bezig}
        aria-pressed={gestemd}
        aria-label={gestemd ? 'Je hebt dit verhaal geliked' : 'Like dit verhaal'}
        className={gestemd ? '' : 'hover:opacity-70'}
        style={{
          background: 'none',
          border: 'none',
          cursor: gestemd ? 'default' : 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          minHeight: 44,
        }}
      >
        <span style={{ fontSize: '1.4rem' }} aria-hidden="true">
          {gestemd ? '❤️' : '♡'}
        </span>
        <span className="mono text-lg" style={{ color: 'var(--geel)' }}>
          {totaal ?? ''}
        </span>
      </button>
      <span className="mono text-xs text-gray-600" role="status" aria-live="polite">
        {fout ?? (gestemd ? 'Bedankt voor je stem!' : 'Vond je dit verhaal mooi? Geef een like!')}
      </span>
    </div>
  );
}
