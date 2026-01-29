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

export default function BudgetDetailLayout() {
  return (
    <Stack screenOptions={STACK_OPTIONS}>
      <Stack.Screen name="index" options={{ title: 'Budget Details', headerShown: false }} />
      <Stack.Screen name="edit" options={{ title: 'Edit Budget', headerShown: false }} />
    </Stack>
  );
}

