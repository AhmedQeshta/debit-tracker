import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { useSplash } from '@/hooks/useSplash';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

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

export default function RootLayout() {
  useSplash();
  return (
    <SafeAreaProvider>
      <Stack screenOptions={STACK_OPTIONS}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
