import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function FriendDetailsLayout() {
  const { t } = useTranslation();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: t('friend.routes.detailsTitle') }} />
      <Stack.Screen name="edit" options={{ title: t('friend.routes.editTitle') }} />
    </Stack>
  );
}
