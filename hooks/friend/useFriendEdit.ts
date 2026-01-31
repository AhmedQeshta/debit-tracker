import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFriendsStore } from '@/store/friendsStore';
import { safeId, validateFriendName } from '@/lib/utils';
import { useNavigation } from '@/hooks/useNavigation';
import { useFriendSync } from '@/hooks/friend/useFriendSync';
import { showError } from '@/lib/alert';

export const useFriendEdit = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const friendId = safeId(id);
  const friend = useFriendsStore((state) => state.friends.find((f) => f.id === friendId));
  const { updateFriend } = useFriendsStore();
  const { navigateBack } = useNavigation();
  const { addToSyncQueue, triggerSync } = useFriendSync();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [currency, setCurrency] = useState('$');

  useEffect(() => {
    if (friend) {
      setName(friend.name);
      setBio(friend.bio);
      setCurrency(friend.currency || '$');
    }
  }, [friend]);

  const handleSave = async (): Promise<void> => {
    if (!friend || !friendId) return;

    const nameError = validateFriendName(name);
    if (nameError) {
      showError('Error', nameError);
      return;
    }

    const updatedFriend = {
      ...friend,
      name: name.trim(),
      bio,
      currency,
      synced: false,
    };

    updateFriend(updatedFriend);
    addToSyncQueue('friend', 'update', updatedFriend);

    await triggerSync();
    navigateBack();
  };

  return {
    name,
    setName,
    bio,
    setBio,
    currency,
    setCurrency,
    handleSave,
    friend,
    router,
  };
};
