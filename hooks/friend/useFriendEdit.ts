import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFriendsStore } from '@/store/friendsStore';
import { safeId } from '@/lib/utils';
import { useNavigation } from '@/hooks/useNavigation';
import { useForm } from 'react-hook-form';
import { IFriendFormData } from '@/types/friend';
import { useSyncMutation } from '@/hooks/sync/useSyncMutation';

export const useFriendEdit = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const friendId = safeId(id);
  const friend = useFriendsStore((state) => state.friends.find((f) => f.id === friendId));
  const { updateFriend } = useFriendsStore();
  const { navigateBack } = useNavigation();
  const { mutate } = useSyncMutation();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<IFriendFormData>({
    defaultValues: {
      name: '',
      bio: '',
      currency: '$',
    },
  });

  useEffect(() => {
    if (friend) {
      reset({
        name: friend.name,
        bio: friend.bio,
        currency: friend.currency || '$',
      });
    }
  }, [friend, reset]);

  const name = watch('name');
  const bio = watch('bio');
  const currency = watch('currency');

  const onSubmit = async (data: IFriendFormData): Promise<void> => {
    if (!friend || !friendId) return;

    setLoading(true);
    try {
      const updatedFriend = {
        ...friend,
        name: data.name.trim(),
        bio: data.bio,
        currency: data.currency,
        synced: false,
      };

      updateFriend(updatedFriend);
      await mutate('friend', 'update', updatedFriend);

      navigateBack();
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
    friend,
    loading,
    router,
  };
};
