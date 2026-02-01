import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useFriendsStore } from '@/store/friendsStore';
import { generateId } from '@/lib/utils';
import { useNavigation } from '@/hooks/useNavigation';
import { useForm } from 'react-hook-form';
import { IFriendFormData } from '@/types/friend';
import { useSyncMutation } from '@/hooks/sync/useSyncMutation';

export const useFriendCreate = () => {
  const router = useRouter();
  const { addFriend } = useFriendsStore();
  const { navigateBack } = useNavigation();
  const { mutate } = useSyncMutation();
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
      await mutate('friend', 'create', newFriend);

      router.push({ pathname: '/(drawer)/transaction/new', params: { friendId: newFriend.id } });
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
