import { useUser, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { formatClerkError, checkOfflineAndThrow } from '@/lib/clerkUtils';
import { useToast } from '@/contexts/ToastContext';

interface ChangePasswordFormData
{
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const useChangePassword = () =>
{
  const { user, isLoaded: userLoaded } = useUser();
  const { isLoaded: authLoaded } = useAuth();
  const router = useRouter();
  const { toastSuccess, toastError } = useToast();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isLoaded = userLoaded && authLoaded;

  const onChangePassword = async (data: ChangePasswordFormData) =>
  {
    if (!isLoaded || !user)
    {
      setAuthError('User not loaded. Please try again.');
      return;
    }

    // Validate passwords match
    if (data.newPassword !== data.confirmPassword)
    {
      setAuthError('New passwords do not match');
      return;
    }

    try
    {
      await checkOfflineAndThrow();
    } catch (err: any)
    {
      setAuthError(err.message);
      return;
    }

    setLoading(true);
    setAuthError(null);

    try
    {
      await user.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        signOutOfOtherSessions: false, // Keep other sessions active
      });

      // Success - show toast and reset form
      toastSuccess('Your password has been changed successfully.');
      reset();
      router.push('/(drawer)/settings/account');
    } catch (err: any)
    {
      // Enhanced error extraction for Clerk errors
      let errorMessage = 'An unexpected error occurred. Please try again.';

      // Check for Clerk error structure with clerkError property
      if (err?.clerkError)
      {
        errorMessage = err.clerkError.message || err.clerkError.longMessage || errorMessage;
      }
      // Check for errors array structure
      else if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0)
      {
        const firstError = err.errors[0];
        errorMessage = firstError.message || firstError.longMessage || errorMessage;
      }
      // Check for direct message property
      else if (err?.message)
      {
        errorMessage = err.message;
      }
      // Check for status/statusCode with error details
      else if (err?.status || err?.statusCode)
      {
        errorMessage = err.message || `Error ${err.status || err.statusCode}. Please try again.`;
      }
      // Fall back to formatClerkError for standard Clerk error structure
      else
      {
        errorMessage = formatClerkError(err);
      }

      setAuthError(errorMessage);
      console.error('Change password error:', err);
    } finally
    {
      setLoading(false);
    }
  };

  return {
    control,
    handleSubmit,
    errors,
    loading,
    authError,
    onChangePassword,
    isLoaded,
    isSignedIn: !!user,
    router,
  };
};

