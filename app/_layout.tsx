import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { subscribeToNetwork } from '../services/net';
import { syncData } from '../services/sync';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';

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
  useEffect(() => {
    // Initial sync attempt
    syncData();

    // Subscribe to network changes to trigger sync
    const unsubscribe = subscribeToNetwork((isConnected) => {
      if (isConnected) {
        syncData();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={STACK_OPTIONS}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
