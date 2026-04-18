import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useSyncMutation } from '@/hooks/sync/useSyncMutation';
import { useNavigation } from '@/hooks/useNavigation';
import { useToast } from '@/hooks/useToast';
import { safeId } from '@/lib/utils';
import { syncService } from '@/services/syncService';
import { useFriendsStore } from '@/store/friendsStore';
import { IFriendFormData } from '@/types/friend';
import { useAuth } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const useFriendEdit = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const friendId = safeId(id);
  const friend = useFriendsStore((state) => state.friends.find((f) => f.id === friendId));
  const { updateFriend, setFriends, markAsSynced } = useFriendsStore();
  const { navigateBack } = useNavigation();
  const { syncNow, isOnline, isLoggedIn } = useCloudSync();
  const { toastSuccess, toastError } = useToast();
  const { mutate } = useSyncMutation();
  const { getToken, userId } = useAuth();
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

    const trimmedCurrency = data.currency.trim();
    if (!trimmedCurrency) {
      toastError(t('friendHooks.edit.currencyUpdateFailed'));
      return;
    }

    setLoading(true);
    try {
      const nextName = data.name.trim();
      const nextBio = data.bio;
      const currencyChanged = trimmedCurrency !== (friend.currency || '$');
      const profileChanged = nextName !== friend.name || nextBio !== friend.bio;

      const updatedFriend = {
        ...friend,
        name: nextName,
        bio: nextBio,
        currency: trimmedCurrency,
        synced: false,
        updatedAt: Date.now(),
      };

      updateFriend(updatedFriend);

      if (currencyChanged) {
        if (isOnline && isLoggedIn && userId) {
          try {
            const persisted = await syncService.updateFriendCurrency(friendId, trimmedCurrency, {
              clerkUserId: userId,
              getToken,
            });

            const currentFriends = useFriendsStore.getState().friends;
            setFriends(
              currentFriends.map((item) =>
                item.id === friendId
                  ? {
                      ...item,
                      currency: persisted.currency,
                      updatedAt: persisted.updatedAt,
                      synced: profileChanged ? false : true,
                    }
                  : item,
              ),
            );

            if (!profileChanged) {
              markAsSynced(friendId);
            }

            toastSuccess(t('friendHooks.edit.currencyUpdated'));
          } catch (error: any) {
            console.error('[Sync] Failed to update currency:', error?.message || error);

            await mutate(
              'friend',
              'update',
              { friendId, currency: trimmedCurrency, updatedAt: updatedFriend.updatedAt },
              { operation: 'FRIEND_CURRENCY_UPDATE', entityId: friendId },
            );

            toastError(t('friendHooks.edit.currencyUpdateFailed'));
          }
        } else {
          await mutate(
            'friend',
            'update',
            { friendId, currency: trimmedCurrency, updatedAt: updatedFriend.updatedAt },
            { operation: 'FRIEND_CURRENCY_UPDATE', entityId: friendId },
          );
        }
      }

      if (profileChanged) {
        try {
          await syncNow();
          toastSuccess(t('friendHooks.edit.successSynced'));
        } catch (error) {
          console.error('[Sync] Failed to sync after edit:', error);
          toastSuccess(t('friendHooks.edit.successLocal'));
        }
      }

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
