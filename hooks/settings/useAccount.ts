import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { useSyncStore } from '@/store/syncStore';
import { AccountFormData } from '@/types/common';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

type EmailStep = 'email' | 'verify';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ASYNC_TIMEOUT_MS = 10000;

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, message: string) => {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
};

export const useAccount = () => {
  const { user, isLoaded } = useUser();
  const { isSignedIn, signOut } = useAuth();
  const router = useRouter();
  const { toastSuccess, toastError, toastInfo } = useToast();
  const { showConfirm } = useConfirmDialog();

  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailStep, setEmailStep] = useState<EmailStep>('email');
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [emailError, setEmailError] = useState('');
  const [pendingEmailId, setPendingEmailId] = useState('');
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AccountFormData>({
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  useEffect(() => {
    if (!user || !isLoaded) return;
    if (!isMountedRef.current) return;

    reset({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.primaryEmailAddress?.emailAddress || '',
    });
  }, [user, isLoaded, reset]);

  const firstName = watch('firstName') || '';
  const lastName = watch('lastName') || '';

  const hasProfileChanges =
    !!user &&
    (firstName.trim() !== (user.firstName || '').trim() ||
      lastName.trim() !== (user.lastName || '').trim());

  const canSaveProfile =
    hasProfileChanges &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    !loading &&
    !emailLoading &&
    !deleteLoading;

  const updateName = async (data: AccountFormData) => {
    if (!user || !canSaveProfile) return;

    setLoading(true);
    try {
      await withTimeout(
        user.update({
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
        }),
        ASYNC_TIMEOUT_MS,
        'Saving profile timed out. Please try again.',
      );

      if (!isMountedRef.current) return;

      reset({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: user.primaryEmailAddress?.emailAddress || '',
      });

      toastSuccess('Saved');
    } catch (error: any) {
      console.error('Failed to update name:', error);
      if (isMountedRef.current) {
        toastError(
          error?.errors?.[0]?.message ||
            error?.message ||
            'Failed to update name. Please try again.',
        );
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const openEmailModal = () => {
    setShowEmailModal(true);
    setEmailStep('email');
    setVerificationCode('');
    setEmailError('');
    setPendingEmailId('');
    setNewEmail('');
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setEmailStep('email');
    setVerificationCode('');
    setEmailError('');
    setPendingEmailId('');
    setNewEmail('');
  };

  const submitNewEmail = async () => {
    if (!user) return;

    const currentEmail = user.primaryEmailAddress?.emailAddress || '';
    const candidateEmail = newEmail.trim().toLowerCase();

    if (!candidateEmail) {
      setEmailError('Email is required.');
      return;
    }

    if (!EMAIL_REGEX.test(candidateEmail)) {
      setEmailError('Enter a valid email address.');
      return;
    }

    if (candidateEmail === currentEmail.toLowerCase()) {
      setEmailError('Enter a different email address.');
      return;
    }

    setEmailLoading(true);
    setEmailError('');

    try {
      const createdEmail = await withTimeout(
        user.createEmailAddress({ email: candidateEmail }),
        ASYNC_TIMEOUT_MS,
        'Creating email verification timed out. Please try again.',
      );
      await withTimeout(
        createdEmail.prepareVerification({ strategy: 'email_code' }),
        ASYNC_TIMEOUT_MS,
        'Sending verification code timed out. Please try again.',
      );

      if (!isMountedRef.current) return;

      setPendingEmailId(createdEmail.id);
      setEmailStep('verify');
      toastInfo("We'll send a code to confirm your email.");
    } catch (error: any) {
      console.error('Failed to create new email:', error);
      if (isMountedRef.current) {
        setEmailError(
          error?.errors?.[0]?.message || error?.message || 'Failed to send verification code.',
        );
      }
    } finally {
      if (isMountedRef.current) {
        setEmailLoading(false);
      }
    }
  };

  const verifyEmailCode = async () => {
    if (!user) return;

    const code = verificationCode.trim();
    if (!code) {
      setEmailError('Verification code is required.');
      return;
    }

    setEmailLoading(true);
    setEmailError('');

    try {
      let pendingAddress = user.emailAddresses.find((address) => address.id === pendingEmailId);

      if (!pendingAddress) {
        pendingAddress = user.emailAddresses.find(
          (address) => address.emailAddress.toLowerCase() === newEmail.trim().toLowerCase(),
        );
      }

      if (!pendingAddress) {
        throw new Error('Could not find pending email address. Please try again.');
      }

      await withTimeout(
        pendingAddress.attemptVerification({ code }),
        ASYNC_TIMEOUT_MS,
        'Email verification timed out. Please try again.',
      );

      if (typeof (pendingAddress as any).setAsPrimary === 'function') {
        await withTimeout(
          (pendingAddress as any).setAsPrimary(),
          ASYNC_TIMEOUT_MS,
          'Setting primary email timed out. Please try again.',
        );
      }

      await withTimeout(
        user.reload(),
        ASYNC_TIMEOUT_MS,
        'Refreshing account timed out. Please try again.',
      );

      if (!isMountedRef.current) return;

      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.primaryEmailAddress?.emailAddress || '',
      });

      toastSuccess('Email updated');
      closeEmailModal();
    } catch (error: any) {
      console.error('Failed to verify email:', error);
      if (isMountedRef.current) {
        setEmailError(error?.errors?.[0]?.message || error?.message || 'Invalid or expired code.');
      }
    } finally {
      if (isMountedRef.current) {
        setEmailLoading(false);
      }
    }
  };

  const resendEmailCode = async () => {
    if (!user) return;

    setEmailLoading(true);
    setEmailError('');

    try {
      const pendingAddress = user.emailAddresses.find(
        (address) =>
          address.id === pendingEmailId ||
          address.emailAddress.toLowerCase() === newEmail.trim().toLowerCase(),
      );

      if (!pendingAddress) {
        throw new Error('Could not find pending email address.');
      }

      await withTimeout(
        pendingAddress.prepareVerification({ strategy: 'email_code' }),
        ASYNC_TIMEOUT_MS,
        'Resending verification code timed out. Please try again.',
      );

      if (!isMountedRef.current) return;

      toastInfo('A new verification code has been sent.');
    } catch (error: any) {
      console.error('Failed to resend verification code:', error);
      if (isMountedRef.current) {
        setEmailError(error?.errors?.[0]?.message || error?.message || 'Failed to resend code.');
      }
    } finally {
      if (isMountedRef.current) {
        setEmailLoading(false);
      }
    }
  };

  const requestDeleteAccount = () => {
    if (!user || deleteLoading) return;

    showConfirm(
      'Delete account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      async () => {
        if (!isMountedRef.current) return;

        setDeleteLoading(true);
        try {
          const syncState = useSyncStore.getState();
          syncState.setIsSigningOut(true);
          syncState.setSyncEnabled(false);
          syncState.setSyncing(false);
          syncState.setIsSyncRunning(false);
          syncState.setCloudUserId(null);
          syncState.setSyncStatus(null);

          await withTimeout(
            user.delete(),
            ASYNC_TIMEOUT_MS,
            'Delete account timed out. Please try again.',
          );
          await withTimeout(signOut(), ASYNC_TIMEOUT_MS, 'Sign out timed out. Please try again.');

          if (!isMountedRef.current) return;

          toastSuccess('Account deleted');
          router.replace('/(auth)/sign-in');
        } catch (error: any) {
          console.error('Delete account failed:', error);
          if (isMountedRef.current) {
            toastError(
              error?.errors?.[0]?.message ||
                error?.message ||
                'Failed to delete account. Please try again.',
            );
          }
        } finally {
          if (isMountedRef.current) {
            setDeleteLoading(false);
          }
          useSyncStore.getState().setIsSigningOut(false);
        }
      },
      { confirmText: 'Delete' },
    );
  };

  return {
    control,
    handleSubmit,
    errors,
    loading,
    emailLoading,
    deleteLoading,
    hasProfileChanges,
    canSaveProfile,
    showEmailModal,
    emailStep,
    newEmail,
    verificationCode,
    emailError,
    openEmailModal,
    closeEmailModal,
    submitNewEmail,
    verifyEmailCode,
    resendEmailCode,
    requestDeleteAccount,
    updateName,
    user,
    isLoaded,
    isSignedIn,
    router,
    setNewEmail,
    setVerificationCode,
    setEmailError,
  };
};
