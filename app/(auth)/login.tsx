import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'; // Standard imports since UI components might need adaptation
import { X } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button'; // Assuming we have this
import { Input } from '@/components/ui/Input'; // Assuming we have this
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { useLoginScreen } from '@/hooks/auth/useLoginScreen';

export default function LoginScreen()
{
  const {
    control,
    handleSubmit,
    errors,
    loading,
    authError,
    onSignInPress,
    onVerifySecondFactor,
    needsSecondFactor,
    resetSecondFactor,
    router
  } = useLoginScreen();

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {needsSecondFactor ? 'Two-Factor Authentication' : 'Welcome Back'}
          </Text>
          <TouchableOpacity
            onPress={() =>
            {
              if (needsSecondFactor)
              {
                resetSecondFactor();
              } else
              {
                router.replace('/');
              }
            }}
            style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          {needsSecondFactor
            ? 'Enter the verification code sent to your email'
            : 'Sign in to sync your data'}
        </Text>

        {needsSecondFactor ? (
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
                onPress={handleSubmit(onVerifySecondFactor)}
                disabled={loading}
              />
            </View>

            <TouchableOpacity
              onPress={resetSecondFactor}
              style={styles.linkContainer}>
              <Text style={styles.linkText}>Back to sign in</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  error={errors.email ? 'Email is required' : undefined}
                />
              )}
              name="email"
            />

            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry
                  error={errors.password ? 'Password is required' : undefined}
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

            <OAuthButtons />

            <TouchableOpacity
              onPress={() => router.push('/register')}
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
  },
  linkContainer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    color: Colors.primary,
    fontSize: 16,
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
