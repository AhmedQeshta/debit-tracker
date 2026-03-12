import { Colors } from '@/theme/colors';
import { Stack } from 'expo-router';

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
      <Stack.Screen name="new" options={{ title: 'New Budget', headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: 'Budget Details', headerShown: false }} />
    </Stack>
  );
}
