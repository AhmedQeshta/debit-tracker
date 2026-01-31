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
    },
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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
      } else {
        // Find out what to do next?
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      setAuthError(err.errors?.[0]?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

    return{
      control,
      handleSubmit,
      errors,
      loading,
      authError,
      onSignInPress,
      router
    }
};