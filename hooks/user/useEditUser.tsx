import { syncData } from "@/services/sync";
import { useSyncStore } from "@/store/syncStore";
import { useUsersStore } from "@/store/usersStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export const useEditUser = () =>
{
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const user = useUsersStore((state) => state.users.find((u) => u.id === id));
  const { updateUser } = useUsersStore();
  const { addToQueue } = useSyncStore();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [currency, setCurrency] = useState('$');

  useEffect(() =>
  {
    if (user)
    {
      setName(user.name);
      setBio(user.bio);
      setCurrency(user.currency || '$');
    }
  }, [user]);

  const handleSave = async () =>
  {
    if (!user || !id) return;
    if (!name.trim())
    {
      Alert.alert('Error', 'Name is required');
      return;
    }

    const updatedUser = {
      ...user,
      name,
      bio,
      currency,
      synced: false,
    };

    updateUser(updatedUser);
    addToQueue({
      id: Math.random().toString(36).substring(2, 15),
      type: 'user',
      action: 'update',
      payload: updatedUser,
    });

    await syncData();
    router.back();
  };
  return {
    name,
    setName,
    bio,
    setBio,
    currency,
    setCurrency,
    handleSave,
    user,
    router
  };
};