import { useOAuthButtons } from '@/hooks/auth/useOAuthButtons';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Preload the browser for Android to improve performance
WebBrowser.maybeCompleteAuthSession();

export const OAuthButtons = () => {
  const { onGoogleSignInPress, loading } = useOAuthButtons();
  return (
    <View style={styles.container}>
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={onGoogleSignInPress}
        disabled={loading}
        activeOpacity={0.7}>
        {loading ? (
          <ActivityIndicator color={Colors.text} />
        ) : (
          <View style={styles.buttonContent}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: Spacing.lg,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: Colors.surface,
    minHeight: 52,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  googleIcon: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: 'bold',
    backgroundColor: Colors.background,
    width: 24,
    height: 24,
    borderRadius: Spacing.borderRadius.round,
    textAlign: 'center',
    lineHeight: 24,
  },
  googleButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
