import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const useLoginScreen = () => {
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
  const [needsSecondFactor, setNeedsSecondFactor] = useState(false);
  const [secondFactorStrategy, setSecondFactorStrategy] = useState<string | null>(null);

  const onSignInPress = async (data: any) => {
    if (!isLoaded) {
      return;
    }
    setLoading(true);
    setAuthError(null);

    try {
      const signInAttempt = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/');
      } else if (signInAttempt.status === 'needs_second_factor') {
        // User needs to complete 2FA
        setNeedsSecondFactor(true);
        
        // Determine which 2FA strategy to use (email_code is available based on error)
        const supportedStrategies = signInAttempt.supportedSecondFactors || [];
        const emailStrategy = supportedStrategies.find(
          (factor: any) => factor.strategy === 'email_code'
        );
        
        if (emailStrategy) {
          setSecondFactorStrategy('email_code');
          // Prepare email code verification
          await signIn.prepareSecondFactorVerification({
            strategy: 'email_code',
          });
        } else {
          setAuthError('Two-factor authentication is required but no supported method found.');
        }
      } else {
        setAuthError('Sign in incomplete. Please try again.');
        console.error('Sign in status:', signInAttempt.status);
      }
    } catch (err: any) {
      setAuthError(err.errors?.[0]?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const onVerifySecondFactor = async (data: any) => {
    if (!isLoaded || !secondFactorStrategy) {
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
      setAuthError(err.errors?.[0]?.message || 'Verification failed. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetSecondFactor = () => {
    setNeedsSecondFactor(false);
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
    onVerifySecondFactor,
    needsSecondFactor,
    secondFactorStrategy,
    resetSecondFactor,
    router
  };
};