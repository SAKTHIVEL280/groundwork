// ============================================
// Groundwork - Auth Store (Supabase)
// ============================================

import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;

  initialize: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Track subscription to prevent duplicates
let authSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  session: null,
  loading: true,

  initialize: async () => {
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      set({ user: session?.user ?? null, session, loading: false });

      // Unsubscribe previous listener if initialize is called again (e.g., StrictMode)
      if (authSubscription) {
        authSubscription.unsubscribe();
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        set({ user: session?.user ?? null, session, loading: false });
      });
      authSubscription = subscription;
    } catch {
      // If Supabase is unreachable, just mark loading as done
      set({ loading: false });
    }
  },

  signInWithGitHub: async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: window.location.origin },
      });
    } catch (e) {
      console.error('GitHub sign-in failed:', e);
    }
  },

  signInWithGoogle: async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
    } catch (e) {
      console.error('Google sign-in failed:', e);
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
