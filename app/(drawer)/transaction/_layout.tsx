import { Colors } from '@/theme/colors';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

const STACK_OPTIONS = {
  headerStyle: {
    backgroundColor: Colors.background,
  },
  headerTintColor: Colors.text,
  headerTitleStyle: {
    fontWeight: '700' as const,
  },
  contentStyle: {
    backgroundColor: Colors.background,
  },
};

export default function TransactionsLayout() {
  const { t } = useTranslation();

  return (
    <Stack screenOptions={STACK_OPTIONS}>
      <Stack.Screen
        name="new"
        options={{ title: t('transaction.routes.newTitle'), headerShown: false }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: t('transaction.routes.detailsTitle'), headerShown: false }}
      />
    </Stack>
  );
}
