import { checkOfflineAndThrow, formatClerkError } from '@/lib/clerkUtils';
import { useAuth, useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export const useForgotPassword = () => {
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const { isLoaded: authLoaded } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoaded = signInLoaded && authLoaded;

  const requestResetCode = async () => {
    if (!isLoaded || !signInLoaded) {
      setError('Authentication not ready. Please wait...');
      return;
    }

    // Validate email
    if (!email || !email.trim()) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await checkOfflineAndThrow();
    } catch (err: any) {
      setError(err.message);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create sign-in attempt with email (for password reset)
      await signIn.create({ identifier: email });

      const resetFactor = signIn.supportedFirstFactors?.find(
        (factor) => factor.strategy === 'reset_password_email_code',
      );

      if (!resetFactor || !('emailAddressId' in resetFactor)) {
        setError('Unable to start password reset. Please try again.');
        return;
      }

      // Prepare first factor with reset password email code strategy
      await signIn.prepareFirstFactor({
        strategy: 'reset_password_email_code',
        emailAddressId: resetFactor.emailAddressId,
      });

      setStep('code');
    } catch (err: any) {
      setError(formatClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async () => {
    if (!isLoaded || !signInLoaded) {
      setError('Authentication not ready. Please wait...');
      return;
    }

    // Validate code
    if (!code || !code.trim()) {
      setError('Verification code is required');
      return;
    }

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await checkOfflineAndThrow();
    } catch (err: any) {
      setError(err.message);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Attempt first factor with reset password strategy
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });

      if (result.status === 'complete' && result.createdSessionId) {
        // Sign the user in automatically
        await setActive({ session: result.createdSessionId });
        router.replace('/');
      } else {
        // No session created, redirect to sign-in
        setError('Password updated successfully. Please sign in.');
        setTimeout(() => {
          router.replace('/(auth)/sign-in');
        }, 2000);
      }
    } catch (err: any) {
      setError(formatClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('email');
    setError(null);
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return {
    step,
    email,
    setEmail,
    code,
    setCode,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    requestResetCode,
    submitReset,
    resetFlow,
    isLoaded,
    router,
  };
};
