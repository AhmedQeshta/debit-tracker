import 'react-native-reanimated';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '../theme/colors';
import { useSplash } from '@/hooks/useSplash';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { publishableKey, tokenCache } from '@/lib/token';
import { ErrorScreen } from '@/components/ui/ErrorScreen';
import { SplashManager, SyncManager } from '@/lib/syncAuth';


if (!publishableKey)
{
  console.warn(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
  );
}

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
  headerShown: false,
};



export default function RootLayout()
{
  // useSplash();

  if (!publishableKey)
  {
    return (
      <ErrorScreen
        title="Missing Configuration"
        message="Missing Publishable Key. Please set CLERK  PUBLISHABLE  KEY in your .env file to continue."
      />
    );
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <SyncManager />
        <SplashManager />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <Stack screenOptions={STACK_OPTIONS}>
              <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            </Stack>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
