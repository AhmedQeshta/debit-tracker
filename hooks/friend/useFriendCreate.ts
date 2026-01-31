import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useFriendsStore } from '@/store/friendsStore';
import { validateFriendName, generateId } from '@/lib/utils';
import { useNavigation } from '@/hooks/useNavigation';
import { useFriendSync } from '@/hooks/friend/useFriendSync';
import { showError } from '@/lib/alert';

export const useFriendCreate = () => {
  const router = useRouter();
  const { addFriend } = useFriendsStore();
  const { navigateBack } = useNavigation();
  const { addToSyncQueue, triggerSync } = useFriendSync();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [currency, setCurrency] = useState('$');

  const handleSave = async (): Promise<void> => {
    const nameError = validateFriendName(name);
    if (nameError) {
      showError('Error', nameError);
      return;
    }

    const newFriend = {
      id: generateId(),
      name: name.trim(),
      bio,
      imageUri: null,
      currency,
      createdAt: Date.now(),
      synced: false,
      pinned: false,
    };

    addFriend(newFriend);
    addToSyncQueue('friend', 'create', newFriend);

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
    router,
  };
};
