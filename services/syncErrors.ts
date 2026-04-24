export type SyncErrorCategory =
  | 'offline'
  | 'timeout'
  | 'rate_limited'
  | 'auth'
  | 'server'
  | 'validation/conflict'
  | 'unknown';

const toMessage = (error: unknown): string => {
  if (!error) return '';
  if (typeof error === 'string') return error;

  const err = error as any;
  return String(err?.message || err?.error_description || err?.hint || err?.details || '');
};

const extractStatusCode = (error: unknown): number | undefined => {
  const err = error as any;
  const status = err?.status ?? err?.statusCode ?? err?.response?.status;
  return typeof status === 'number' ? status : undefined;
};

const hasCode = (error: unknown, pattern: RegExp): boolean => {
  const err = error as any;
  const code = String(err?.code || err?.name || err?.error || '');
  return pattern.test(code);
};

export const classifySyncError = (error: unknown): SyncErrorCategory => {
  const message = toMessage(error);
  const status = extractStatusCode(error);

  if (status === 401 || status === 403) {
    return 'auth';
  }

  if (status === 429) {
    return 'rate_limited';
  }

  if (typeof status === 'number' && status >= 500) {
    return 'server';
  }

  if (typeof status === 'number' && status >= 400) {
    return 'validation/conflict';
  }

  if (
    /timeout|timed out|request timeout|abort|aborted|deadline exceeded/i.test(message) ||
    hasCode(error, /etimedout|aborterror/i)
  ) {
    return 'timeout';
  }

  if (
    /(network request failed|failed to fetch|fetch failed|offline|no internet|enotfound|econnrefused|ehostunreach|enetunreach|dns|socket hang up)/i.test(
      message,
    ) ||
    hasCode(error, /enotfound|econnrefused|enetunreach|ehostunreach|eai_again/i)
  ) {
    return 'offline';
  }

  if (/jwt|token|session expired|auth/i.test(message)) {
    return 'auth';
  }

  return 'unknown';
};

export const isRetryableSyncError = (category: SyncErrorCategory): boolean => {
  return (
    category === 'offline' ||
    category === 'timeout' ||
    category === 'rate_limited' ||
    category === 'server'
  );
};

export const getSyncErrorCode = (category: SyncErrorCategory): string => {
  if (category === 'validation/conflict') {
    return 'VALIDATION_CONFLICT';
  }

  return category.toUpperCase();
};
