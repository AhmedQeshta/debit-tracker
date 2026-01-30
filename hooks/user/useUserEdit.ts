import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUsersStore } from "@/store/usersStore";
import { safeId, validateUserName, showError } from "@/lib/utils";
import { useNavigation } from "@/hooks/useNavigation";
import { useUserSync } from "@/hooks/user/useUserSync";


export const useUserEdit = () =>
{
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = safeId(id);
  const user = useUsersStore((state) => state.users.find((u) => u.id === userId));
  const { updateUser } = useUsersStore();
  const { navigateBack } = useNavigation();
  const { addToSyncQueue, triggerSync } = useUserSync();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [currency, setCurrency] = useState("$");

  useEffect(() =>
  {
    if (user)
    {
      setName(user.name);
      setBio(user.bio);
      setCurrency(user.currency || "$");
    }
  }, [user]);

  const handleSave = async (): Promise<void> =>
  {
    if (!user || !userId) return;

    const nameError = validateUserName(name);
    if (nameError)
    {
      showError("Error", nameError);
      return;
    }

    const updatedUser = {
      ...user,
      name: name.trim(),
      bio,
      currency,
      synced: false,
    };

    updateUser(updatedUser);
    addToSyncQueue("user", "update", updatedUser);

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
    user,
    router,
  };
};

