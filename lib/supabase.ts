import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// In-memory token storage
let currentToken: string | null = null;

/**
 * Sets the Clerk token for Supabase requests (stored in-memory)
 * @param token - The Clerk JWT token, or null to clear
 */
export const setSupabaseToken = (token: string | null): void => {
  currentToken = token;
  if (token) {
    console.warn(`[Supabase] Token bound (len: ${token.length}, last4: ${token.slice(-4)})`);
  } else {
    console.warn('[Supabase] Token cleared');
  }
};

/**
 * Checks if a token is currently set
 * @returns true if token exists, false otherwise
 */
export const hasSupabaseToken = (): boolean => {
  return currentToken !== null;
};

/**
 * Clears the Supabase token
 */
export const clearSupabaseToken = (): void => {
  currentToken = null;
};

/**
 * Custom fetch wrapper that adds Authorization header when token exists
 */
const customFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  const headers = new Headers(options?.headers);

  // Add Authorization header if token exists
  if (currentToken) {
    headers.set('Authorization', `Bearer ${currentToken}`);
  }

  // Merge with existing headers
  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  return fetch(url, fetchOptions);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    fetch: customFetch,
  },
});
