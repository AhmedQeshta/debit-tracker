import { Platform } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AccountFormData } from '@/types/common';
import { useConfirmDialog } from '@/contexts/ConfirmDialogContext';
import { useToast } from '@/contexts/ToastContext';


export const useAccount = () =>
{
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { toastSuccess, toastError, toastInfo } = useToast();
  const { showConfirm } = useConfirmDialog();
  const [loading, setLoading] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AccountFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  useEffect(() =>
  {
    if (user && isLoaded)
    {
      setValue('firstName', user.firstName || '');
      setValue('lastName', user.lastName || '');
      setValue('email', user.primaryEmailAddress?.emailAddress || '');
    }
  }, [user, isLoaded, setValue]);

  const updateName = async (data: AccountFormData) =>
  {
    if (!user) return;

    setLoading(true);
    try
    {
      await user.update({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
      });
      toastSuccess('Your name has been updated successfully.');
    } catch (error: any)
    {
      console.error('Failed to update name:', error);
      toastError(error.errors?.[0]?.message || 'Failed to update name. Please try again.');
    } finally
    {
      setLoading(false);
    }
  };

  const updateEmail = async (newEmail: string) =>
  {
    if (!user || !newEmail.trim()) return;

    setUpdatingEmail(true);
    try
    {
      // Create email address
      await user.createEmailAddress({ email: newEmail });

      // Prepare email verification
      await user.primaryEmailAddress?.prepareVerification({ strategy: 'email_code' });

      toastInfo('We sent a verification code to your new email address. Please check your inbox and verify the email. To complete email verification, please check your email and use the verification code in the Clerk dashboard or web portal.');
    } catch (error: any)
    {
      console.error('Failed to update email:', error);
      toastError(error.errors?.[0]?.message || 'Failed to update email. Please try again.');
    } finally
    {
      setUpdatingEmail(false);
    }
  };

  const handleEmailUpdate = () =>
  {
    const currentEmail = user?.primaryEmailAddress?.emailAddress || '';

    if (Platform.OS === 'ios')
    {
      // For iOS, we'll use the input field approach since Alert.prompt is deprecated
      setNewEmail(currentEmail);
      setShowEmailInput(true);
    } else
    {
      // Show input field for Android
      setNewEmail(currentEmail);
      setShowEmailInput(true);
    }
  };

  const handleEmailSubmit = () =>
  {
    const currentEmail = user?.primaryEmailAddress?.emailAddress || '';
    if (newEmail && newEmail !== currentEmail)
    {
      updateEmail(newEmail);
      setShowEmailInput(false);
    } else if (newEmail === currentEmail)
    {
      toastInfo('This is already your current email address.');
      setShowEmailInput(false);
    }
  };


  return {
    control,
    handleSubmit,
    setValue,
    errors,
    loading,
    updatingEmail,
    showEmailInput,
    newEmail,
    handleEmailUpdate,
    handleEmailSubmit,
    updateName,
    updateEmail,
    user,
    isLoaded,
    isSignedIn,
    router,
    setShowEmailInput,
    setNewEmail,
  };
};

