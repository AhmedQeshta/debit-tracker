import { syncData } from "@/services/sync";
import { useSyncStore } from "@/store/syncStore";
import { useUsersStore } from "@/store/usersStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export const useNewUser = () => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [currency, setCurrency] = useState('$');
  const { addUser } = useUsersStore();
  const { addToQueue } = useSyncStore();
  const router = useRouter();

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    const newUser = {
      id: Math.random().toString(36).substring(2, 15),
      name,
      bio,
      imageUri: null,
      currency,
      createdAt: Date.now(),
      synced: false,
      pinned: false,
    };

    addUser(newUser);
    addToQueue({
      id: Math.random().toString(36).substring(2, 15),
      type: 'user',
      action: 'create',
      payload: newUser,
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
    router
  };
};