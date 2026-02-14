import { useConfirmDialog } from '@/contexts/ConfirmDialogContext';
import { useToast } from '@/contexts/ToastContext';
import { clearSupabaseToken } from '@/lib/supabase';
import { useSyncStore } from '@/store/syncStore';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export const useSignOut = (closeDrawer?: () => void) => {
  const { isSignedIn, signOut } = useAuth();
  const { showConfirm } = useConfirmDialog();
  const { toastError } = useToast();
  const router = useRouter();
  const handleAuthAction = () => {
    if (!isSignedIn) {
      router.push('/(auth)/sign-in');
      return;
    }

    showConfirm(
      'Sign Out',
      'Are you sure you want to sign out?',
      async () => {
        try {
          const syncState = useSyncStore.getState();
          syncState.setIsSigningOut(true);

          // Disable sync first to avoid race conditions during logout
          syncState.setSyncEnabled(false);
          syncState.setSyncing(false);
          syncState.setIsSyncRunning(false);
          syncState.setCloudUserId(null);
          syncState.setSyncStatus(null);
          clearSupabaseToken();

          // Sign out from Clerk
          await signOut();

          // Navigate to login - use replace to prevent going back
          router.push('/(auth)/sign-in');
          closeDrawer && closeDrawer();
        } catch (error: any) {
          console.error('Sign out error:', error);
          const errorMessage =
            error?.errors?.[0]?.message ||
            error?.message ||
            'Failed to sign out. Please try again.';
          toastError(errorMessage);
        } finally {
          useSyncStore.getState().setIsSigningOut(false);
        }
      },
      { confirmText: 'Sign Out' },
    );
  };

  return {
    handleAuthAction,
  };
};
