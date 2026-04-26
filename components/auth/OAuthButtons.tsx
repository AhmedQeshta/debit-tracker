import { useTheme } from '@/contexts/ThemeContext';
import { useOAuthButtons } from '@/hooks/auth/useOAuthButtons';
import { Spacing } from '@/theme/spacing';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Preload the browser for Android to improve performance
WebBrowser.maybeCompleteAuthSession();

export const OAuthButtons = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { onGoogleSignInPress, loading } = useOAuthButtons();
  return (
    <View style={styles.container}>
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>{t('common.words.or')}</Text>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={onGoogleSignInPress}
        disabled={loading}
        activeOpacity={0.7}>
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <View style={styles.buttonContent}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleButtonText}>{t('auth.oauth.continueWithGoogle')}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: {
  border: string;
  textMuted: string;
  surface: string;
  surface2: string;
  text: string;
}) =>
  StyleSheet.create({
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
      backgroundColor: colors.border,
    },
    dividerText: {
      color: colors.textMuted,
      paddingHorizontal: Spacing.md,
      fontSize: 14,
      fontWeight: '500',
    },
    googleButton: {
      backgroundColor: colors.surface,
      minHeight: 52,
      borderRadius: Spacing.borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    googleIcon: {
      color: colors.text,
      fontSize: 15,
      fontWeight: 'bold',
      backgroundColor: colors.surface2,
      width: 24,
      height: 24,
      borderRadius: Spacing.borderRadius.round,
      textAlign: 'center',
      lineHeight: 24,
    },
    googleButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
  });
