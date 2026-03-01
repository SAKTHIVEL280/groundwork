// ============================================
// Groundwork - Supabase Client
// ============================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = !!SUPABASE_URL && !!SUPABASE_ANON_KEY;

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials not configured. Cloud sync and auth will be unavailable.');
}

// Only create real client when configured — avoids DNS requests to placeholder URLs
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : (new Proxy({} as SupabaseClient, {
      get: (_target, prop) => {
        if (prop === 'auth') {
          return {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signInWithOAuth: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
            signOut: () => Promise.resolve({ error: null }),
          };
        }
        if (prop === 'from') {
          return () => ({
            upsert: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
            select: () => ({
              eq: () => ({
                order: () => Promise.resolve({ data: [], error: null }),
              }),
            }),
            delete: () => ({
              eq: () => ({
                eq: () => Promise.resolve({ error: null }),
              }),
            }),
          });
        }
        return () => {};
      },
    }) as SupabaseClient);
