import { SyncLoadingOverlay } from '@/components/sync/SyncLoadingOverlay';
import { GlobalMenuModal } from '@/components/ui/GlobalMenuModal';
import { Toast } from '@/components/ui/Toast';
import { ConfirmDialogProvider } from '@/contexts/ConfirmDialogContext';
import { MenuModalProvider } from '@/contexts/MenuModalContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AppBootstrap } from '@/lib/syncAuth';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const ThemedRoot = ({ publishableKey }: { publishableKey: string }) => {
  const { colors, activeTheme, isThemeReady } = useTheme();

  if (!isThemeReady) {
    return null;
  }

  const stackOptions = {
    headerStyle: {
      backgroundColor: colors.background,
    },
    headerTintColor: colors.text,
    headerTitleStyle: {
      fontWeight: '700' as const,
    },
    contentStyle: {
      backgroundColor: colors.background,
    },
    headerShown: false,
  };

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <StatusBar
        barStyle={activeTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <ToastProvider>
        <ConfirmDialogProvider>
          <MenuModalProvider>
            <AppBootstrap />
            <SyncLoadingOverlay />
            <GestureHandlerRootView style={{ flex: 1 }}>
              <SafeAreaProvider>
                <Stack screenOptions={stackOptions}>
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                </Stack>
              </SafeAreaProvider>
            </GestureHandlerRootView>
            <GlobalMenuModal />
            <Toast />
          </MenuModalProvider>
        </ConfirmDialogProvider>
      </ToastProvider>
    </ClerkProvider>
  );
};
