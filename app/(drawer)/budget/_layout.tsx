import { Colors } from '@/theme/colors';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

const STACK_OPTIONS = {
  headerStyle: {
    backgroundColor: Colors.background,
  },
  headerTintColor: Colors.text,
  contentStyle: {
    backgroundColor: Colors.background,
  },
};

export default function BudgetLayout() {
  const { t } = useTranslation();

  return (
    <Stack screenOptions={STACK_OPTIONS}>
      <Stack.Screen
        name="new"
        options={{ title: t('budget.routes.newTitle'), headerShown: false }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: t('budget.routes.detailsTitle'), headerShown: false }}
      />
    </Stack>
  );
}
