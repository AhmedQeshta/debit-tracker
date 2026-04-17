import { useToast } from '@/hooks/useToast';
import { checkOfflineAndThrow, formatClerkError } from '@/lib/clerkUtils';
import { ChangePasswordFormData } from '@/types/common';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native';

export const useChangePassword = () => {
  const { t } = useTranslation();
  const { user, isLoaded: userLoaded } = useUser();
  const { isLoaded: authLoaded } = useAuth();
  const router = useRouter();
  const { toastSuccess } = useToast();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
    clearErrors,
  } = useForm<ChangePasswordFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signOutOtherSessions, setSignOutOtherSessions] = useState(false);

  const isLoaded = userLoaded && authLoaded;

  const onChangePassword = async (data: ChangePasswordFormData) => {
    if (!isLoaded || !user) {
      setAuthError(t('changePassword.hooks.errors.userNotLoaded'));
      return;
    }

    // Validate passwords match
    if (data.newPassword !== data.confirmPassword) {
      setError('confirmPassword', { message: t('auth.validation.passwordsNoMatch') });
      return;
    }

    clearErrors('confirmPassword');

    try {
      await checkOfflineAndThrow();
    } catch (err: any) {
      setAuthError(err.message);
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      await user.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        signOutOfOtherSessions: signOutOtherSessions,
      });

      // Success - show toast and reset form
      toastSuccess(t('changePassword.hooks.success'));
      reset();
      setSignOutOtherSessions(false);
      router.push('/(drawer)/settings/account');
    } catch (err: any) {
      // Enhanced error extraction for Clerk errors
      let errorMessage = t('changePassword.hooks.errors.unexpected');

      // Check for Clerk error structure with clerkError property
      if (err?.clerkError) {
        errorMessage = err.clerkError.message || err.clerkError.longMessage || errorMessage;
      }
      // Check for errors array structure
      else if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        const firstError = err.errors[0];
        errorMessage = firstError.message || firstError.longMessage || errorMessage;
      }
      // Check for direct message property
      else if (err?.message) {
        errorMessage = err.message;
      }
      // Check for status/statusCode with error details
      else if (err?.status || err?.statusCode) {
        errorMessage = err.message || `Error ${err.status || err.statusCode}. Please try again.`;
      }
      // Fall back to formatClerkError for standard Clerk error structure
      else {
        errorMessage = formatClerkError(err);
      }

      const normalizedError = errorMessage.toLowerCase();
      if (normalizedError.includes('current') && normalizedError.includes('password')) {
        setError('currentPassword', { message: t('changePassword.hooks.errors.currentIncorrect') });
        setAuthError(null);
      } else {
        setAuthError(errorMessage);
      }

      console.error('Change password error:', err);
    } finally {
      setLoading(false);
    }
  };

  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const currentPassword = watch('currentPassword');
  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  const hasMinLength = newPassword.length >= 8;
  const hasNumberOrSymbol = /[0-9\W_]/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);

  const strength = useMemo(() => {
    const score = [hasMinLength, hasNumberOrSymbol, hasUppercase, newPassword.length >= 12].filter(
      Boolean,
    ).length;

    if (!newPassword) return 'Weak';
    if (score <= 1) return 'Weak';
    if (score <= 3) return 'OK';
    return 'Strong';
  }, [hasMinLength, hasNumberOrSymbol, hasUppercase, newPassword]);

  const isFormReady =
    currentPassword.trim().length > 0 &&
    hasMinLength &&
    hasNumberOrSymbol &&
    confirmPassword.length > 0 &&
    confirmPassword === newPassword;

  return {
    control,
    handleSubmit,
    errors,
    watch,
    loading,
    authError,
    setAuthError,
    onChangePassword,
    isLoaded,
    isSignedIn: !!user,
    router,
    signOutOtherSessions,
    setSignOutOtherSessions,
    newPasswordRef,
    confirmPasswordRef,
    strength,
    isFormReady,
    hasMinLength,
    hasNumberOrSymbol,
    hasUppercase,
  };
};
