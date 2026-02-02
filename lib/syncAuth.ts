import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useSplash } from '@/hooks/useSplash';

// Re-export types and functions from authSync service for backward compatibility
export type { GetTokenFunction } from '@/services/authSync';
export { getFreshSupabaseJwt as refreshSupabaseJwt, isJwtExpiredError } from '@/services/authSync';

export function SyncManager()
{
  useCloudSync();
  return null;
}


export function SplashManager()
{
  useSplash();
  return null;
}
