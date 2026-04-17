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

export default function BudgetDetailLayout() {
  const { t } = useTranslation();

  return (
    <Stack screenOptions={STACK_OPTIONS}>
      <Stack.Screen
        name="index"
        options={{ title: t('budget.routes.detailsTitle'), headerShown: false }}
      />
      <Stack.Screen
        name="edit"
        options={{ title: t('budget.routes.editTitle'), headerShown: false }}
      />
    </Stack>
  );
}
