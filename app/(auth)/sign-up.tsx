import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { useSignUpScreen } from '@/hooks/auth/useSignUpScreen';

export default function SignUpScreen()
{
  const {
    control,
    handleSubmit,
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
          <Text style={styles.title}>Create Account</Text>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          {pendingVerification ? 'Verify your email' : 'Start syncing your data'}
        </Text>

        {!pendingVerification ? (
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
                  placeholder="Create a password"
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
                title={loading ? 'Creating account...' : 'Sign Up'}
                onPress={handleSubmit(onSignUpPress)}
                disabled={loading}
              />
            </View>
          </>
        ) : (
          <>
            <Controller
              control={control}
              rules={{ required: 'Verification code is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Verification Code"
                  placeholder="Enter code"
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
                title={loading ? 'Verifying...' : 'Verify Email'}
                onPress={handleSubmit(onPressVerify)}
                disabled={loading}
              />
            </View>
          </>
        )}

        {!pendingVerification && <OAuthButtons />}

        {!pendingVerification && (
          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-in')}
            style={styles.linkContainer}>
            <Text style={styles.linkText}>Already have an account? Sign in</Text>
          </TouchableOpacity>
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

