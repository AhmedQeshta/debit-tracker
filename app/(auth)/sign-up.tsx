import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { OtpInput } from '@/components/auth/OtpInput';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/contexts/ThemeContext';
import { useSignUpScreen } from '@/hooks/auth/useSignUpScreen';
import { Spacing } from '@/theme/spacing';
import { X } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    control,
    handleSubmit,
    getValues,
    errors,
    loading,
    authError,
    onSignUpPress,
    onPressVerify,
    pendingVerification,
    router,
  } = useSignUpScreen();

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.title}>
              {pendingVerification ? t('auth.signUp.verifyEmailTitle') : t('auth.signUp.title')}
            </Text>
            <Text style={styles.subtitle}>
              {pendingVerification ? t('auth.signUp.verifySubtitle') : t('auth.signUp.subtitle')}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.closeButton}>
            <X size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {!pendingVerification ? (
            <>
              <Controller
                control={control}
                rules={{
                  required: t('auth.validation.emailRequired'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('auth.validation.validEmail'),
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('auth.signUp.email')}
                    placeholder="you@example.com"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    error={errors.email?.message}
                  />
                )}
                name="email"
              />

              <Controller
                control={control}
                rules={{
                  required: t('auth.validation.passwordRequired'),
                  minLength: {
                    value: 8,
                    message: t('auth.validation.passwordMin'),
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('auth.signUp.password')}
                    placeholder={t('auth.signUp.createPasswordPlaceholder')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry
                    error={errors.password?.message}
                    helperText={t('auth.signUp.helperPassword')}
                  />
                )}
                name="password"
              />

              <Controller
                control={control}
                rules={{
                  required: t('auth.validation.confirmPasswordRequired'),
                  validate: (value) =>
                    value === getValues('password') || t('auth.validation.passwordsNoMatch'),
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('auth.signUp.confirmPassword')}
                    placeholder={t('auth.signUp.confirmPasswordPlaceholder')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry
                    error={errors.confirmPassword?.message}
                  />
                )}
                name="confirmPassword"
              />

              {authError && <Text style={styles.errorText}>{authError}</Text>}

              <Button
                title={t('auth.signUp.createAccount')}
                onPress={handleSubmit(onSignUpPress)}
                loading={loading}
                disabled={loading}
              />

              <OAuthButtons />

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>{t('auth.signUp.alreadyHave')}</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
                  <Text style={styles.footerLink}>{t('auth.signIn.title')}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Controller
                control={control}
                rules={{
                  required: t('auth.validation.codeRequired'),
                  minLength: {
                    value: 6,
                    message: t('auth.validation.codeMustBeSix'),
                  },
                  pattern: {
                    value: /^\d{6}$/,
                    message: t('auth.validation.codeMustBeSix'),
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <OtpInput
                    label={t('auth.signIn.code')}
                    value={value}
                    onChangeText={onChange}
                    error={errors.code?.message}
                    helperText={t('auth.validation.enterSixDigitCode')}
                  />
                )}
                name="code"
              />

              {authError && <Text style={styles.errorText}>{authError}</Text>}

              <Button
                title={t('common.actions.verify')}
                onPress={handleSubmit(onPressVerify)}
                loading={loading}
                disabled={loading}
              />

              <TouchableOpacity
                onPress={() => router.push('/(auth)/sign-in')}
                style={styles.inlineLinkContainer}>
                <Text style={styles.inlineLink}>{t('auth.signUp.backToSignIn')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const createStyles = (colors: {
  text: string;
  textMuted: string;
  danger: string;
  surface: string;
  surface2: string;
  border: string;
  accent: string;
}) =>
  StyleSheet.create({
    container: {
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.xl,
    },
    headerTextBlock: {
      flex: 1,
      paddingRight: Spacing.md,
    },
    title: {
      fontSize: 30,
      fontWeight: 'bold',
      color: colors.text,
      letterSpacing: 0.2,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textMuted,
      marginTop: Spacing.sm,
      lineHeight: 21,
    },
    errorText: {
      color: colors.danger,
      marginBottom: Spacing.md,
      fontSize: 13,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: Spacing.lg,
    },
    closeButton: {
      marginTop: 2,
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Spacing.borderRadius.round,
      justifyContent: 'center',
      alignItems: 'center',
      width: 30,
      height: 30,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: Spacing.lg,
    },
    inlineLinkContainer: {
      marginTop: Spacing.md,
      alignItems: 'center',
      minHeight: 44,
      justifyContent: 'center',
    },
    inlineLink: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: '600',
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: Spacing.sm,
      marginTop: Spacing.lg,
    },
    footerText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    footerLink: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: '700',
    },
  });
