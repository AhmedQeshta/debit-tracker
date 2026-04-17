import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function TransactionDetailsLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="edit"
        options={{ title: t('transaction.routes.editTitle'), headerShown: false }}
      />
    </Stack>
  );
}
