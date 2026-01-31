import { syncService } from "@/services/syncService";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const useRegisterScreen = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
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
      setAuthError(err.errors?.[0]?.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async (data: any) => {
    if (!isLoaded) return;
    setLoading(true);
    setAuthError(null);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: data.code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });

        // Ensure user record exists in Supabase
        await syncService.ensureUserRecord(signUp);

        router.replace('/');
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      setAuthError(err.errors?.[0]?.message || 'Verification failed');
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
    router
  };
};