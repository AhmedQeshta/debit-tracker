import { checkOfflineAndThrow, formatClerkError } from '@/lib/clerkUtils';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export const useSignInScreen = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
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
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [needsFirstFactor, setNeedsFirstFactor] = useState(false);
  const [needsSecondFactor, setNeedsSecondFactor] = useState(false);
  const [firstFactorStrategy, setFirstFactorStrategy] = useState<'email_code' | null>(null);
  const [secondFactorStrategy, setSecondFactorStrategy] = useState<'email_code' | null>(null);
  const [secondFactorEmailAddressId, setSecondFactorEmailAddressId] = useState<string | null>(null);

  const getEmailCodeFactor = (factors: any[]) =>
    factors.find((factor: any) => factor.strategy === 'email_code');

  const getAuthErrorMessage = (err: any, fallback?: string) => {
    const code = err?.errors?.[0]?.code;

    switch (code) {
      case 'form_code_incorrect':
        return 'The verification code is incorrect. Please try again.';
      case 'form_code_expired':
        return 'That verification code has expired. Please request a new one.';
      case 'rate_limit_exceeded':
      case 'too_many_requests':
        return 'Too many attempts. Please wait a moment and try again.';
      default:
        return fallback ?? formatClerkError(err);
    }
  };

  const onSignInPress = async (data: any) => {
    if (!isLoaded) return;

    setLoading(true);
    setAuthError(null);
    setNeedsFirstFactor(false);
    setNeedsSecondFactor(false);
    setFirstFactorStrategy(null);
    setSecondFactorStrategy(null);
    setSecondFactorEmailAddressId(null);

    try {
      await checkOfflineAndThrow();

      const signInAttempt = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/');
        return;
      }

      // Handle first factor verification (email code, etc.)
      if (signInAttempt.status === 'needs_first_factor') {
        const supportedStrategies = signInAttempt.supportedFirstFactors || [];
        const emailStrategy = supportedStrategies.find(
          (factor: any) => factor.strategy === 'email_code',
        );

        if (emailStrategy) {
          setFirstFactorStrategy('email_code');
          setNeedsFirstFactor(true);
          // Clerk should automatically send the code
        } else {
          setAuthError('Email verification is required but not available. Please contact support.');
        }
        return;
      }

      // Handle second factor (2FA)
      if (signInAttempt.status === 'needs_second_factor') {
        const supportedStrategies = signInAttempt.supportedSecondFactors || [];
        const emailStrategy = getEmailCodeFactor(supportedStrategies);

        if (!emailStrategy?.emailAddressId) {
          setAuthError(
            'Two-factor authentication is required but email verification is not available.',
          );
          return;
        }

        try {
          await signIn.prepareSecondFactor({
            strategy: 'email_code',
            emailAddressId: emailStrategy.emailAddressId,
          });
          setSecondFactorStrategy('email_code');
          setSecondFactorEmailAddressId(emailStrategy.emailAddressId);
          setNeedsSecondFactor(true);
        } catch (err: any) {
          setAuthError(getAuthErrorMessage(err));
        }
        return;
      }

      // Other statuses
      setAuthError(`Sign in incomplete. Status: ${signInAttempt.status}. Please try again.`);
      console.error('Unexpected sign in status:', signInAttempt.status);
    } catch (err: any) {
      setAuthError(err?.message ?? getAuthErrorMessage(err));
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyFirstFactor = async (data: any) => {
    if (!isLoaded || !firstFactorStrategy) return;

    setLoading(true);
    setAuthError(null);

    try {
      await checkOfflineAndThrow();

      const verification = await signIn.attemptFirstFactor({
        strategy: firstFactorStrategy,
        code: data.code,
      });

      if (verification.status === 'complete') {
        await setActive({ session: verification.createdSessionId });
        router.replace('/');
      } else if (verification.status === 'needs_second_factor') {
        // After first factor, might need second factor
        setNeedsFirstFactor(false);
        const supportedStrategies = verification.supportedSecondFactors || [];
        const emailStrategy = getEmailCodeFactor(supportedStrategies);
        if (!emailStrategy?.emailAddressId) {
          setAuthError(
            'Two-factor authentication is required but email verification is not available.',
          );
          return;
        }

        try {
          await signIn.prepareSecondFactor({
            strategy: 'email_code',
            emailAddressId: emailStrategy.emailAddressId,
          });
          setSecondFactorStrategy('email_code');
          setSecondFactorEmailAddressId(emailStrategy.emailAddressId);
          setNeedsSecondFactor(true);
        } catch (err: any) {
          setAuthError(getAuthErrorMessage(err));
        }
      } else {
        setAuthError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      setAuthError(err?.message ?? getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onVerifySecondFactor = async (data: any) => {
    if (!isLoaded || !secondFactorStrategy) return;

    setLoading(true);
    setAuthError(null);

    try {
      await checkOfflineAndThrow();

      const verification = signIn.attemptSecondFactor
        ? await signIn.attemptSecondFactor({
            strategy: secondFactorStrategy,
            code: data.code,
          })
        : await (signIn as any).attemptSecondFactorVerification({
            strategy: secondFactorStrategy,
            code: data.code,
          });

      if (verification.status === 'complete') {
        await setActive({ session: verification.createdSessionId });
        router.replace('/');
      } else {
        setAuthError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      setAuthError(err?.message ?? getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onResendSecondFactorCode = async () => {
    if (!isLoaded || !secondFactorEmailAddressId) return;

    setLoading(true);
    setAuthError(null);

    try {
      await checkOfflineAndThrow();

      await signIn.prepareSecondFactor({
        strategy: 'email_code',
        emailAddressId: secondFactorEmailAddressId,
      });
    } catch (err: any) {
      setAuthError(getAuthErrorMessage(err, 'Unable to resend code. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const resetVerification = () => {
    setNeedsFirstFactor(false);
    setNeedsSecondFactor(false);
    setFirstFactorStrategy(null);
    setSecondFactorStrategy(null);
    setSecondFactorEmailAddressId(null);
    setAuthError(null);
  };

  return {
    control,
    handleSubmit,
    errors,
    loading,
    authError,
    onSignInPress,
    onVerifyFirstFactor,
    onVerifySecondFactor,
    needsFirstFactor,
    needsSecondFactor,
    resetVerification,
    onResendSecondFactorCode,
    canResendSecondFactor: Boolean(secondFactorEmailAddressId),
    router,
  };
};
