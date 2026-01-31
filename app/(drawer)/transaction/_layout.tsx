import { Stack } from 'expo-router';
import { Colors } from '@/theme/colors';

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
  return (
    <Stack screenOptions={STACK_OPTIONS}>
      <Stack.Screen name="new" options={{ title: 'Add Transaction', headerShown: false }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit Transaction', headerShown: false }} />
    </Stack>
  );
}

