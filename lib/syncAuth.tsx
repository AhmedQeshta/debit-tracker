import { SyncInitializer } from '@/components/sync/SyncInitializer';
import { useAppBootstrap } from '@/hooks/app/useAppBootstrap';

// Re-export types and functions from authSync service for backward compatibility
export { isJwtExpiredError, getFreshSupabaseJwt as refreshSupabaseJwt } from '@/services/authSync';
export type { GetTokenFunction } from '@/services/authSync';

/**
 * AppBootstrap component that orchestrates:
 * - Splash screen management (via hook)
 * - Sync initialization (via component)
 */
export function AppBootstrap() {
  // Handle splash screen hiding
  useAppBootstrap();

  // Render sync initializer (logic-only component)
  return <SyncInitializer />;
}
