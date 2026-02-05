import { useAppBootstrap } from '@/hooks/app/useAppBootstrap';

// Re-export types and functions from authSync service for backward compatibility
export { isJwtExpiredError, getFreshSupabaseJwt as refreshSupabaseJwt } from '@/services/authSync';
export type { GetTokenFunction } from '@/services/authSync';

/**
 * AppBootstrap component that orchestrates:
 * - Store hydration
 * - Splash screen management
 * - Network monitoring
 * - Background sync
 */
export function AppBootstrap()
{
  useAppBootstrap();
  return null;
}
