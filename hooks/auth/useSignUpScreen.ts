import i18n from '@/i18n';
import { checkOfflineAndThrow, formatClerkError } from '@/lib/clerkUtils';
import { getFreshSupabaseJwt } from '@/services/authSync';
import { ensureAppUser } from '@/services/userService';
import { useSyncStore } from '@/store/syncStore';
import { useAuth, useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

type SignUpFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
};

export const useSignUpScreen = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { getToken } = useAuth();
  const router = useRouter();
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignUpFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      code: '',
    },
  });

  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const onSignUpPress = async (data: SignUpFormData) => {
    if (!isLoaded) return;

    if (data.password !== data.confirmPassword) {
      setAuthError(i18n.t('auth.validation.passwordsNoMatch'));
      return;
    }

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

  const onPressVerify = async (data: SignUpFormData) => {
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
        setAuthError(i18n.t('auth.errors.signUpIncomplete', { status: completeSignUp.status }));
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
    getValues,
    errors,
    loading,
    authError,
    onSignUpPress,
    onPressVerify,
    pendingVerification,
    router,
  };
};
