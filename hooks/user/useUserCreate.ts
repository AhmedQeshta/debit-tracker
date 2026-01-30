import { useState } from "react";
import { useRouter } from "expo-router";
import { useUsersStore } from "@/store/usersStore";
import { validateUserName, showError } from "@/lib/utils";
import { useNavigation } from "@/hooks/useNavigation";
import { useUserSync } from "@/hooks/user/useUserSync";



export const useUserCreate = () =>
{
  const router = useRouter();
  const { addUser } = useUsersStore();
  const { navigateBack } = useNavigation();
  const { addToSyncQueue, triggerSync } = useUserSync();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [currency, setCurrency] = useState("$");

  const handleSave = async (): Promise<void> =>
  {
    const nameError = validateUserName(name);
    if (nameError)
    {
      showError("Error", nameError);
      return;
    }

    const newUser = {
      id: Math.random().toString(36).substring(2, 15),
      name: name.trim(),
      bio,
      imageUri: null,
      currency,
      createdAt: Date.now(),
      synced: false,
      pinned: false,
    };

    addUser(newUser);
    addToSyncQueue("user", "create", newUser);

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

