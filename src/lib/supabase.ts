'use client';

import type { SupabaseClient } from '@supabase/supabase-js';

// Publieke anon key (stond ook al in de oude js/main.js). Rechten worden in
// Supabase via RLS geregeld. Te overschrijven via env voor een andere omgeving.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nwufmlayvaofmjetacfd.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dWZtbGF5dmFvZm1qZXRhY2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5ODYzMjksImV4cCI6MjA5MDU2MjMyOX0._TUyvaHByhC0BeOpwt9Z9pFLEN0o0yi3c13lsvd76Kg';

let client: Promise<SupabaseClient> | null = null;

/**
 * Lazy Supabase-client: de bibliotheek wordt pas geladen als een component hem
 * echt nodig heeft (likes, formulieren), niet bij elke paginaweergave.
 */
export function getSupabase(): Promise<SupabaseClient> {
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(SUPABASE_URL, SUPABASE_ANON_KEY),
  );
  return client;
}
