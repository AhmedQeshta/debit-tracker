import { ensureAppUser } from '@/services/userService';
import { getFreshSupabaseJwt } from '@/services/authSync';
import { useSyncStore } from '@/store/syncStore';
import { useSignUp, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { formatClerkError, checkOfflineAndThrow } from '@/lib/clerkUtils';

export const useSignUpScreen = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { getToken } = useAuth();
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      code: '',
    },
  });

  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const onSignUpPress = async (data: any) => {
    if (!isLoaded) return;

    try {
      await checkOfflineAndThrow();
    } catch (err: any) {
      setAuthError(err.message);
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setPendingVerification(true);
    } catch (err: any) {
      setAuthError(formatClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async (data: any) => {
    if (!isLoaded) return;

    try {
      await checkOfflineAndThrow();
    } catch (err: any) {
      setAuthError(err.message);
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: data.code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });

        // Ensure user record exists in Supabase (Phase 2 - async, non-blocking)
        const { syncEnabled } = useSyncStore.getState();
        if (syncEnabled) {
          // Bind token first, then ensure user
          const result = await getFreshSupabaseJwt(getToken);
          if (result.token && signUp) {
            // signUp object has the user data we need
            await ensureAppUser(signUp, getToken).catch((e) => {
              console.error('[Register] Failed to ensure app user:', e);
            });
          } else if (result.error === 'template_missing') {
            // Template missing - set sync status but don't block registration
            useSyncStore.getState().setSyncStatus('needs_config');
            console.warn('[Register] JWT template missing - sync will not work until configured');
          }
        }

        router.replace('/');
      } else {
        setAuthError(`Sign up incomplete. Status: ${completeSignUp.status}. Please try again.`);
        console.error('Unexpected sign up status:', completeSignUp.status);
      }
    } catch (err: any) {
      setAuthError(formatClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    control,
    handleSubmit,
    errors,
    loading,
    authError,
    onSignUpPress,
    onPressVerify,
    pendingVerification,
    router,
  };
};

