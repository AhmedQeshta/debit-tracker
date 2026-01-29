import { Stack } from 'expo-router';
import { Colors } from '@/theme/colors';

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
  return (
    <Stack screenOptions={STACK_OPTIONS}>
      <Stack.Screen name="index" options={{ title: 'Budgets', headerShown: false }} />
      <Stack.Screen name="new" options={{ title: 'New Budget', headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: 'Budget Details', headerShown: false }} />
    </Stack>
  );
}

