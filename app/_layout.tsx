import { SyncLoadingOverlay } from '@/components/sync/SyncLoadingOverlay';
import { ErrorScreen } from '@/components/ui/ErrorScreen';
import { GlobalMenuModal } from '@/components/ui/GlobalMenuModal';
import { MenuModalProvider } from '@/contexts/MenuModalContext';
import { SplashManager, SyncManager } from '@/lib/syncAuth';
import { publishableKey, tokenCache } from '@/lib/token';
import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';

if (!publishableKey) {
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

export default function RootLayout() {
  // useSplash();

  if (!publishableKey) {
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
        <MenuModalProvider>
          <SyncManager />
          <SplashManager />
          <SyncLoadingOverlay />
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <Stack screenOptions={STACK_OPTIONS}>
                <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
              </Stack>
            </SafeAreaProvider>
          </GestureHandlerRootView>
          <GlobalMenuModal />
        </MenuModalProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
