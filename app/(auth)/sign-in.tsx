import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { OtpInput } from '@/components/auth/OtpInput';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useSignInScreen } from '@/hooks/auth/useSignInScreen';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { X } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SignInScreen() {
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
                  ? 'Two-Factor Authentication'
                  : 'Verify your email'
                : 'Sign In'}
            </Text>
            <Text style={styles.subtitle}>
              {isVerificationStep
                ? 'Enter the 6-digit code sent to your email'
                : 'Sync your data across devices'}
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
            <X size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {isVerificationStep ? (
            <>
              <Controller
                control={control}
                rules={{
                  required: 'Code is required',
                  minLength: {
                    value: 6,
                    message: 'Code must be 6 digits',
                  },
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'Code must be 6 digits',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <OtpInput
                    label="Verification Code"
                    value={value}
                    onChangeText={onChange}
                    error={errors.code?.message}
                    helperText="Enter the 6-digit code"
                  />
                )}
                name="code"
              />

              {authError && <Text style={styles.errorText}>{authError}</Text>}

              <Button
                title="Verify"
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
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={resetVerification} style={styles.inlineLinkContainer}>
                  <Text style={styles.inlineLink}>Change email</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Controller
                control={control}
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Enter a valid email address',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email"
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
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
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
                <Text style={styles.inlineLink}>Forgot password?</Text>
              </TouchableOpacity>

              {authError && <Text style={styles.errorText}>{authError}</Text>}

              <Button
                title="Sign In"
                onPress={handleSubmit(onSignInPress)}
                loading={loading}
                disabled={loading}
              />

              <OAuthButtons />

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Don&apos;t have an account?</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
                  <Text style={styles.footerLink}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
    color: Colors.text,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 21,
  },
  errorText: {
    color: Colors.error,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.primary,
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
    color: Colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
