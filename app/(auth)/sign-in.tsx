import { OAuthButtons } from '@/components/auth/OAuthButtons';
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
    router,
  } = useSignInScreen();

  const isVerificationStep = needsFirstFactor || needsSecondFactor;

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isVerificationStep
              ? needsSecondFactor
                ? 'Two-Factor Authentication'
                : 'Verify Your Email'
              : 'Welcome Back'}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (isVerificationStep) {
                resetVerification();
              } else {
                router.replace('/');
              }
            }}
            style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          {isVerificationStep
            ? 'Enter the verification code sent to your email'
            : 'Sign in to sync your data'}
        </Text>

        {isVerificationStep ? (
          <>
            <Controller
              control={control}
              rules={{ required: 'Verification code is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Verification Code"
                  placeholder="Enter 6-digit code"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="numeric"
                  error={errors.code?.message}
                />
              )}
              name="code"
            />

            {authError && <Text style={styles.errorText}>{authError}</Text>}

            <View style={styles.buttonContainer}>
              <Button
                title={loading ? 'Verifying...' : 'Verify Code'}
                onPress={handleSubmit(
                  needsFirstFactor ? onVerifyFirstFactor : onVerifySecondFactor,
                )}
                disabled={loading}
              />
            </View>

            {needsSecondFactor && (
              <TouchableOpacity
                onPress={onResendSecondFactorCode}
                disabled={loading || !canResendSecondFactor}
                style={styles.linkContainer}>
                <Text
                  style={[
                    styles.linkText,
                    (loading || !canResendSecondFactor) && styles.linkTextDisabled,
                  ]}>
                  {loading ? 'Sending...' : 'Resend code'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={resetVerification} style={styles.linkContainer}>
              <Text style={styles.linkText}>Back to sign in</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Controller
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="Enter your email"
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
              rules={{ required: 'Password is required' }}
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

            {authError && <Text style={styles.errorText}>{authError}</Text>}

            <View style={styles.buttonContainer}>
              <Button
                title={loading ? 'Signing in...' : 'Sign In'}
                onPress={handleSubmit(onSignInPress)}
                disabled={loading}
              />
            </View>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.linkContainer}>
              <Text style={styles.linkText}>Forgot password?</Text>
            </TouchableOpacity>

            <OAuthButtons />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/sign-up')}
              style={styles.linkContainer}>
              <Text style={styles.linkText}>Don&apos;t have an account? Sign up</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    marginTop: Spacing.lg,
  },
  errorText: {
    color: Colors.error,
    marginTop: Spacing.sm,
    fontSize: 14,
  },
  linkContainer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    color: Colors.primary,
    fontSize: 16,
  },
  linkTextDisabled: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  closeButton: {
    padding: Spacing.xs,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
  },
});
