import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const useLoginScreen = () =>
{
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

  const onSignInPress = async (data: any) =>
  {
    if (!isLoaded)
    {
      return;
    }
    setLoading(true);
    setAuthError(null);
    setNeedsSecondFactor(false); // Reset 2FA state

    try
    {
      const signInAttempt = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (signInAttempt.status === 'complete')
      {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/');
        return;
      }

      if (signInAttempt.status === 'needs_second_factor')
      {
        // User needs to complete 2FA
        // Determine which 2FA strategy to use
        const supportedStrategies = signInAttempt.supportedSecondFactors || [];
        const emailStrategy = supportedStrategies.find(
          (factor: any) => factor.strategy === 'email_code'
        );

        if (emailStrategy)
        {
          setSecondFactorStrategy('email_code');
          setNeedsSecondFactor(true); // Show 2FA screen

          // Clerk automatically sends the verification code when needs_second_factor is returned
          // Check the secondFactorVerification status to see if code was sent
          const secondFactorVerification = signInAttempt.secondFactorVerification;

          if (secondFactorVerification?.status)
          {
            // Code sending status is available
            setAuthError(null);
          } else
          {
            // Code should be sent automatically, but show a helpful message
            setAuthError(null);
            console.log('2FA required - verification code should be sent automatically to:', emailStrategy.safeIdentifier);
          }
        } else
        {
          // No email strategy available
          setAuthError('Two-factor authentication is required but email verification is not available.');
        }
      } else
      {
        // Other statuses
        setAuthError(`Sign in incomplete. Status: ${signInAttempt.status}. Please try again.`);
        console.error('Unexpected sign in status:', signInAttempt.status);
      }
    } catch (err: any)
    {
      // Handle sign-in errors
      const errorMessage = err?.errors?.[0]?.message || err?.message || 'Failed to sign in';
      setAuthError(errorMessage);
      console.error('Sign in error:', err);
    } finally
    {
      setLoading(false);
    }
  };

  const onVerifySecondFactor = async (data: any) =>
  {
    if (!isLoaded || !secondFactorStrategy)
    {
      return;
    }
    setLoading(true);
    setAuthError(null);

    try
    {
      const verification = await signIn.attemptSecondFactorVerification({
        strategy: secondFactorStrategy,
        code: data.code,
      });

      if (verification.status === 'complete')
      {
        await setActive({ session: verification.createdSessionId });
        router.replace('/');
      } else
      {
        setAuthError('Verification incomplete. Please try again.');
      }
    } catch (err: any)
    {
      setAuthError(err.errors?.[0]?.message || 'Verification failed. Please check your code and try again.');
    } finally
    {
      setLoading(false);
    }
  };

  const resetSecondFactor = () =>
  {
    setNeedsSecondFactor(false);
    setSecondFactorStrategy(null);
    setAuthError(null);
  };

  const resendVerificationCode = async () =>
  {
    if (!isLoaded || !secondFactorStrategy)
    {
      return;
    }

    setLoading(true);
    setAuthError(null);

    try
    {
      // In Clerk Expo, we need to recreate the sign-in attempt to resend the code
      // This will trigger a new verification code to be sent
      // Note: This requires the original email/password, which we don't have stored
      // For now, show a message directing user to try signing in again
      setAuthError('To resend the verification code, please go back and sign in again. The code will be sent automatically.');
    } catch (err: any)
    {
      setAuthError(err.errors?.[0]?.message || 'Failed to resend verification code. Please try signing in again.');
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
    onSignInPress,
    onVerifySecondFactor,
    needsSecondFactor,
    secondFactorStrategy,
    resetSecondFactor,
    resendVerificationCode,
    router
  };
};