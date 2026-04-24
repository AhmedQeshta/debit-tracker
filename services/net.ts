import { supabase } from '@/lib/supabase';
import NetInfo from '@react-native-community/netinfo';

const SUPABASE_PING_TIMEOUT_MS = 4000;

export interface NetworkSnapshot {
  isConnected: boolean;
  isInternetReachable?: boolean;
  type?: string;
}

export type PingErrorType = 'network' | 'timeout' | 'other';

export interface PingResult {
  ok: boolean;
  errorType?: PingErrorType;
  message?: string;
}

const hasNetworkErrorSignal = (message: string): boolean => {
  return /(network request failed|failed to fetch|fetch failed|enotfound|econnrefused|ehostunreach|enetunreach|dns|offline|socket hang up)/i.test(
    message,
  );
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`ping_timeout_${timeoutMs}`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

export const getNetworkSnapshot = async (): Promise<NetworkSnapshot> => {
  const state = await NetInfo.fetch();
  return {
    isConnected: !!state.isConnected,
    isInternetReachable:
      typeof state.isInternetReachable === 'boolean' ? state.isInternetReachable : undefined,
    type: state.type,
  };
};

export const isNetworkReachable = (state: NetworkSnapshot): boolean => {
  if (typeof state.isInternetReachable === 'boolean') {
    return state.isInternetReachable;
  }
  return state.isConnected;
};

export const pingSupabase = async (
  timeoutMs: number = SUPABASE_PING_TIMEOUT_MS,
): Promise<PingResult> => {
  try {
    // Use a tiny query to validate real app backend reachability.
    const pingPromise = (async () => await supabase.from('budgets').select('id').limit(1))();
    const { error } = await withTimeout(pingPromise, timeoutMs);

    if (!error) {
      return { ok: true };
    }

    const message = String(error?.message || 'Supabase ping failed');

    if (hasNetworkErrorSignal(message)) {
      return { ok: false, errorType: 'network', message };
    }

    if (/timeout|timed out|aborted/i.test(message)) {
      return { ok: false, errorType: 'timeout', message };
    }

    // Auth/RLS/server responses prove connectivity, so they are not treated as offline.
    return { ok: true };
  } catch (error: any) {
    const message = String(error?.message || 'Supabase ping failed');

    if (message.startsWith('ping_timeout_') || /timeout|timed out|aborted/i.test(message)) {
      return { ok: false, errorType: 'timeout', message };
    }

    if (hasNetworkErrorSignal(message)) {
      return { ok: false, errorType: 'network', message };
    }

    return { ok: false, errorType: 'other', message };
  }
};

export const subscribeToNetwork = (callback: (isConnected: boolean) => void) => {
  return NetInfo.addEventListener((state) => {
    const connected =
      typeof state.isInternetReachable === 'boolean'
        ? state.isInternetReachable
        : !!state.isConnected;
    callback(connected);
  });
};
