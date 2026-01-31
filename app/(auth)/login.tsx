import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'; // Standard imports since UI components might need adaptation
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
  const { control, handleSubmit, errors, loading, authError, onSignInPress, router } = useLoginScreen();


  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to sync your data</Text>

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

        <TouchableOpacity onPress={() => router.push('/register')} style={styles.linkContainer}>
          <Text style={styles.linkText}>Don&apos;t have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.xl,
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
});
