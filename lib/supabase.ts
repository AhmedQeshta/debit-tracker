import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export type SupabaseAccessTokenGetter = () => Promise<string | null | undefined>;

let accessTokenGetter: SupabaseAccessTokenGetter | null = null;

/**
 * Registers the Clerk token getter for Supabase requests.
 * Supabase will call this getter on each request to obtain a fresh token.
 */
export const setSupabaseAccessTokenGetter = (getter: SupabaseAccessTokenGetter | null): void => {
  accessTokenGetter = getter;
};

/**
 * Returns a fresh Clerk JWT token for Supabase requests.
 */
const getSupabaseAccessToken = async (): Promise<string | null> => {
  if (!accessTokenGetter) {
    return null;
  }

  try {
    return (await accessTokenGetter()) ?? null;
  } catch (error) {
    console.error('[Supabase] Failed to get access token:', error);
    return null;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  accessToken: async () => (await getSupabaseAccessToken()) ?? null,
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
