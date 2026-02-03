import { Alert, Platform } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AccountFormData } from '@/types/common';


export const useAccount = () =>
{
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const router = useRouter();
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
      Alert.alert('Success', 'Your name has been updated successfully.');
    } catch (error: any)
    {
      console.error('Failed to update name:', error);
      Alert.alert('Error', error.errors?.[0]?.message || 'Failed to update name. Please try again.');
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

      Alert.alert(
        'Verification Required',
        'We sent a verification code to your new email address. Please check your inbox and verify the email.',
        [
          {
            text: 'OK',
            onPress: () =>
            {
              // In a real app, you'd navigate to a verification screen
              // For now, we'll just show a message
              Alert.alert(
                'Email Verification',
                'To complete email verification, please check your email and use the verification code in the Clerk dashboard or web portal.'
              );
            },
          },
        ]
      );
    } catch (error: any)
    {
      console.error('Failed to update email:', error);
      Alert.alert('Error', error.errors?.[0]?.message || 'Failed to update email. Please try again.');
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
      // Use Alert.prompt on iOS
      Alert.prompt(
        'Update Email',
        'Enter your new email address:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Update',
            onPress: (email: string | undefined = '') =>
            {
              if (email && email !== currentEmail)
              {
                updateEmail(email);
              } else if (email === currentEmail)
              {
                Alert.alert('Info', 'This is already your current email address.');
              }
            },
          },
        ],
        'plain-text',
        currentEmail
      );
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
      Alert.alert('Info', 'This is already your current email address.');
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

