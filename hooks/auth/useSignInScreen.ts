import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { formatClerkError, checkOfflineAndThrow } from "@/lib/clerkUtils";

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
  const [firstFactorStrategy, setFirstFactorStrategy] = useState<string | null>(null);
  const [secondFactorStrategy, setSecondFactorStrategy] = useState<string | null>(null);

  const onSignInPress = async (data: any) => {
    if (!isLoaded) {
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
    setNeedsFirstFactor(false);
    setNeedsSecondFactor(false);

    try {
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
          (factor: any) => factor.strategy === 'email_code'
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
        const emailStrategy = supportedStrategies.find(
          (factor: any) => factor.strategy === 'email_code'
        );

        if (emailStrategy) {
          setSecondFactorStrategy('email_code');
          setNeedsSecondFactor(true);
        } else {
          setAuthError('Two-factor authentication is required but email verification is not available.');
        }
        return;
      }

      // Other statuses
      setAuthError(`Sign in incomplete. Status: ${signInAttempt.status}. Please try again.`);
      console.error('Unexpected sign in status:', signInAttempt.status);
    } catch (err: any) {
      setAuthError(formatClerkError(err));
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyFirstFactor = async (data: any) => {
    if (!isLoaded || !firstFactorStrategy) {
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
      const verification = await signIn.attemptFirstFactorVerification({
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
        const emailStrategy = supportedStrategies.find(
          (factor: any) => factor.strategy === 'email_code'
        );
        if (emailStrategy) {
          setSecondFactorStrategy('email_code');
          setNeedsSecondFactor(true);
        } else {
          setAuthError('Two-factor authentication is required but email verification is not available.');
        }
      } else {
        setAuthError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      setAuthError(formatClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  const onVerifySecondFactor = async (data: any) => {
    if (!isLoaded || !secondFactorStrategy) {
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
      const verification = await signIn.attemptSecondFactorVerification({
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
      setAuthError(formatClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  const resetVerification = () => {
    setNeedsFirstFactor(false);
    setNeedsSecondFactor(false);
    setFirstFactorStrategy(null);
    setSecondFactorStrategy(null);
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
    router,
  };
};

