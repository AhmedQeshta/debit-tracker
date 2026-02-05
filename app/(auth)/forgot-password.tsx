import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { X, ArrowLeft } from 'lucide-react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { useForgotPassword } from '@/hooks/auth/useForgotPassword';

export default function ForgotPasswordScreen()
{
  const {
    step,
    email,
    setEmail,
    code,
    setCode,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    requestResetCode,
    submitReset,
    resetFlow,
    isLoaded,
    router,
  } = useForgotPassword();

  if (!isLoaded)
  {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
            {
              if (step === 'code')
              {
                resetFlow();
              } else
              {
                router.back();
              }
            }}
            style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {step === 'code' ? 'Reset Password' : 'Forgot Password'}
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          {step === 'code'
            ? 'Enter the verification code and your new password'
            : 'Enter your email address and we\'ll send you a reset code'}
        </Text>

        {step === 'email' ? (
          <>
            <Input
              label="Email"
              placeholder="Enter your email"
              onChangeText={setEmail}
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.buttonContainer}>
              <Button
                title={loading ? 'Sending code...' : 'Send Reset Code'}
                onPress={requestResetCode}
                disabled={loading}
              />
            </View>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/sign-in')}
              style={styles.linkContainer}>
              <Text style={styles.linkText}>Remember your password? Sign in</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Input
              label="Verification Code"
              placeholder="Enter 6-digit code"
              onChangeText={setCode}
              value={code}
              keyboardType="numeric"
            />

            <Input
              label="New Password"
              placeholder="Enter new password"
              onChangeText={setNewPassword}
              value={newPassword}
              secureTextEntry
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm new password"
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              secureTextEntry
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.buttonContainer}>
              <Button
                title={loading ? 'Resetting password...' : 'Reset Password'}
                onPress={submitReset}
                disabled={loading}
              />
            </View>

            <TouchableOpacity onPress={resetFlow} style={styles.linkContainer}>
              <Text style={styles.linkText}>Back to email</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  backButton: {
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
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
});
