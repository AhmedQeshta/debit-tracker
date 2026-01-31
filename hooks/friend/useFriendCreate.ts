import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useFriendsStore } from '@/store/friendsStore';
import { generateId } from '@/lib/utils';
import { useNavigation } from '@/hooks/useNavigation';
import { useFriendSync } from '@/hooks/friend/useFriendSync';
import { useForm } from 'react-hook-form';
import { IFriendFormData } from '@/types/friend';


export const useFriendCreate = () => {
  const router = useRouter();
  const { addFriend } = useFriendsStore();
  const { navigateBack } = useNavigation();
  const { addToSyncQueue, triggerSync } = useFriendSync();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IFriendFormData>({
    defaultValues: {
      name: '',
      bio: '',
      currency: '$',
    },
  });

  const name = watch('name');
  const bio = watch('bio');
  const currency = watch('currency');

  const onSubmit = async (data: IFriendFormData): Promise<void> => {
    setLoading(true);
    try {
      const newFriend = {
        id: generateId(),
        name: data.name.trim(),
        bio: data.bio,
        imageUri: null,
        currency: data.currency,
        createdAt: Date.now(),
        synced: false,
        pinned: false,
      };

      addFriend(newFriend);
      addToSyncQueue('friend', 'create', newFriend);

      await triggerSync();
      router.push(`/(drawer)/transaction/new`);
    } finally {
      setLoading(false);
    }
  };

  return {
    control,
    errors,
    handleSubmit: handleSubmit(onSubmit),
    name,
    bio,
    currency,
    setCurrency: (val: string) => setValue('currency', val),
    loading,
    router,
  };
};
