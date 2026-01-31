import
{
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { useOAuthButtons } from '@/hooks/auth/useOAuthButtons';

// Preload the browser for Android to improve performance
WebBrowser.maybeCompleteAuthSession();

export const OAuthButtons = () =>
{
  const { onGoogleSignInPress, loading } = useOAuthButtons();
  return (
    <View style={styles.container}>
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or continue with</Text>
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
            <Text style={styles.googleButtonText}>Login with Google</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: Spacing.xl,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
  },
  googleButton: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  googleButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
