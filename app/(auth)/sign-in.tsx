import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { OtpInput } from '@/components/auth/OtpInput';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/contexts/ThemeContext';
import { useSignInScreen } from '@/hooks/auth/useSignInScreen';
import { Spacing } from '@/theme/spacing';
import { X } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SignInScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    control,
    handleSubmit,
    errors,
    loading,
    authError,
    onSignInPress,
    onVerifyFirstFactor,
    onVerifySecondFactor,
    needsFirstFactor,
    needsSecondFactor,
    resetVerification,
    onResendSecondFactorCode,
    canResendSecondFactor,
    resendCooldown,
    router,
  } = useSignInScreen();

  const isVerificationStep = needsFirstFactor || needsSecondFactor;

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.title}>
              {isVerificationStep
                ? needsSecondFactor
                  ? t('auth.signIn.twoFactorTitle')
                  : t('auth.signIn.verifyEmailTitle')
                : t('auth.signIn.title')}
            </Text>
            <Text style={styles.subtitle}>
              {isVerificationStep ? t('auth.signIn.verifySubtitle') : t('auth.signIn.subtitle')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (isVerificationStep) {
                resetVerification();
              } else {
                router.replace('/');
              }
            }}
            style={styles.closeButton}>
            <X size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {isVerificationStep ? (
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
                onPress={handleSubmit(
                  needsFirstFactor ? onVerifyFirstFactor : onVerifySecondFactor,
                )}
                loading={loading}
                disabled={loading}
              />

              <View style={styles.secondaryActionsRow}>
                {needsSecondFactor && (
                  <TouchableOpacity
                    onPress={onResendSecondFactorCode}
                    disabled={loading || !canResendSecondFactor}
                    style={styles.inlineLinkContainer}>
                    <Text
                      style={[
                        styles.inlineLink,
                        (loading || !canResendSecondFactor) && styles.linkDisabled,
                      ]}>
                      {resendCooldown > 0
                        ? t('auth.signIn.resendCodeIn', { seconds: resendCooldown })
                        : t('auth.signIn.resendCode')}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={resetVerification} style={styles.inlineLinkContainer}>
                  <Text style={styles.inlineLink}>{t('auth.signIn.changeEmail')}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
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
                    label={t('auth.signIn.email')}
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
                    label={t('auth.signIn.password')}
                    placeholder="Enter your password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry
                    error={errors.password?.message}
                  />
                )}
                name="password"
              />

              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
                style={styles.forgotLinkContainer}>
                <Text style={styles.inlineLink}>{t('auth.signIn.forgotPassword')}</Text>
              </TouchableOpacity>

              {authError && <Text style={styles.errorText}>{authError}</Text>}

              <Button
                title={t('auth.signIn.title')}
                onPress={handleSubmit(onSignInPress)}
                loading={loading}
                disabled={loading}
              />

              <OAuthButtons />

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>{t('auth.signIn.noAccount')}</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
                  <Text style={styles.footerLink}>{t('auth.signIn.signUpCta')}</Text>
                </TouchableOpacity>
              </View>
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
    forgotLinkContainer: {
      alignSelf: 'flex-end',
      marginTop: -Spacing.md,
      marginBottom: Spacing.lg,
    },
    secondaryActionsRow: {
      marginTop: Spacing.md,
      alignItems: 'center',
      gap: Spacing.sm,
    },
    inlineLinkContainer: {
      minHeight: 44,
      justifyContent: 'center',
    },
    inlineLink: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: '600',
    },
    linkDisabled: {
      opacity: 0.6,
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
