import { Stack } from 'expo-router';
import { Colors } from '@/theme/colors';

const STACK_OPTIONS = {
  headerStyle: {
    backgroundColor: Colors.background,
  },
  headerTintColor: Colors.text,
  // hide header and back araw
  // headerShown: false,
  // headerBackVisible: false,
  contentStyle: {
    backgroundColor: Colors.background,
  },
};

export default function FriendLayout()
{
  return (
    <Stack screenOptions={STACK_OPTIONS}>
      <Stack.Screen name="new" options={{ title: 'Add Friend', headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: 'Friend Details', headerShown: false }} />
    </Stack>
  );
}
