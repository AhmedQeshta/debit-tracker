import { OtpInput } from '@/components/auth/OtpInput';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useForgotPassword } from '@/hooks/auth/useForgotPassword';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { X } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ForgotPasswordScreen() {
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

  if (!isLoaded) {
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
          <View style={styles.headerTextBlock}>
            <Text style={styles.title}>
              {step === 'code' ? 'Reset Password' : 'Forgot Password'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'code'
                ? 'Enter the reset code and your new password'
                : 'We’ll email you a reset code'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {step === 'email' ? (
            <>
              <Input
                label="Email"
                placeholder="you@example.com"
                onChangeText={setEmail}
                value={email}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Button
                title="Send reset code"
                onPress={requestResetCode}
                loading={loading}
                disabled={loading}
              />

              <TouchableOpacity
                onPress={() => router.push('/(auth)/sign-in')}
                style={styles.inlineLinkContainer}>
                <Text style={styles.inlineLink}>Back to Sign in</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <OtpInput
                label="Reset Code"
                value={code}
                onChangeText={setCode}
                helperText="Enter the 6-digit code"
              />

              <Input
                label="New Password"
                placeholder="Create a new password"
                onChangeText={setNewPassword}
                value={newPassword}
                secureTextEntry
                helperText="Use at least 8 characters"
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your new password"
                onChangeText={setConfirmPassword}
                value={confirmPassword}
                secureTextEntry
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Button title="Verify" onPress={submitReset} loading={loading} disabled={loading} />

              <TouchableOpacity onPress={resetFlow} style={styles.inlineLinkContainer}>
                <Text style={styles.inlineLink}>Change email</Text>
              </TouchableOpacity>
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
  headerTextBlock: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: Colors.text,
    letterSpacing: 0.2,
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
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  inlineLinkContainer: {
    marginTop: Spacing.md,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  inlineLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
