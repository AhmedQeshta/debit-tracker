import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function SsoCallbackScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace('/');
      return;
    }

    router.replace('/(auth)/sign-in');
  }, [isLoaded, isSignedIn, router]);

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.text}>Completing sign-in...</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
});
