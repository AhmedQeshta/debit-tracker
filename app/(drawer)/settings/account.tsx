import { SettingsRow } from '@/components/settings/SettingsRow';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { Actions } from '@/components/ui/Actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useSignOut } from '@/hooks/auth/useSignOut';
import { useAccount } from '@/hooks/settings/useAccount';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { ArrowLeft, LogOut, Mail, Shield, Trash2, User as UserIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ACCOUNT_LOAD_TIMEOUT_MS = 10000;

export default function AccountManagement() {
  const {
    control,
    handleSubmit,
    errors,
    loading,
    emailLoading,
    deleteLoading,
    canSaveProfile,
    showEmailModal,
    emailStep,
    newEmail,
    verificationCode,
    emailError,
    openEmailModal,
    closeEmailModal,
    submitNewEmail,
    verifyEmailCode,
    resendEmailCode,
    requestDeleteAccount,
    updateName,
    user,
    isLoaded,
    isSignedIn,
    router,
    setNewEmail,
    setVerificationCode,
    setEmailError,
  } = useAccount();
  const { handleAuthAction, isSigningOut } = useSignOut();
  const [loadTimedOut, setLoadTimedOut] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setLoadTimedOut(false);
      return;
    }

    const timeout = setTimeout(() => {
      setLoadTimedOut(true);
    }, ACCOUNT_LOAD_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [isLoaded]);

  const accountMenuItems = [
    {
      icon: <LogOut size={18} color={Colors.text} />,
      label: isSigningOut ? 'Signing out...' : 'Sign out',
      onPress: handleAuthAction,
    },
    {
      icon: <Trash2 size={18} color={Colors.error} />,
      label: 'Delete account',
      onPress: requestDeleteAccount,
      danger: true,
    },
  ];

  if (!isLoaded && !loadTimedOut) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading account...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!isLoaded && loadTimedOut) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Couldn&apos;t load account info. Please check your connection and try again.
          </Text>
          <Button
            title="Back to Settings"
            onPress={() => router.push('/(drawer)/(tabs)/settings')}
            variant="primary"
          />
        </View>
      </ScreenContainer>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please sign in to manage your account.</Text>
          <Button
            title="Go to Login"
            onPress={() => router.push('/(auth)/sign-in')}
            variant="primary"
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.appBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(drawer)/(tabs)/settings')}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Go back to settings">
          <Text style={styles.backText}>
            <ArrowLeft size={25} color={Colors.text} />
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>Manage account</Text>

        <View style={styles.menuButtonWrap}>
          <Actions menuVisible={false} setMenuVisible={() => {}} menuItems={accountMenuItems} />
        </View>
      </View>

      <View style={styles.profileSummary}>
        {user.imageUrl ? (
          <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <UserIcon size={20} color={Colors.textSecondary} />
          </View>
        )}

        <View style={styles.profileTextWrap}>
          <Text style={styles.profileName} numberOfLines={1}>
            {user.fullName || user.primaryEmailAddress?.emailAddress || 'User'}
          </Text>
          <Text style={styles.profileEmail} numberOfLines={1}>
            {user.primaryEmailAddress?.emailAddress || 'No email'}
          </Text>
        </View>
      </View>

      <SettingsSection title="Profile">
        <View style={styles.sectionContent}>
          <Controller
            control={control}
            rules={{ required: 'First name is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="First name"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Enter your first name"
                error={errors.firstName?.message}
                autoCapitalize="words"
              />
            )}
            name="firstName"
          />

          <Controller
            control={control}
            rules={{ required: 'Last name is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Last name"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Enter your last name"
                error={errors.lastName?.message}
                autoCapitalize="words"
              />
            )}
            name="lastName"
          />

          <View style={styles.saveButtonWrap}>
            <Button
              title={loading ? 'Saving...' : 'Save changes'}
              onPress={handleSubmit(updateName)}
              loading={loading}
              disabled={!canSaveProfile}
              variant="primary"
            />
          </View>
        </View>
      </SettingsSection>

      <SettingsSection title="Email">
        <SettingsRow
          icon={Mail}
          title="Email address"
          subtitle={user.primaryEmailAddress?.emailAddress || 'No email'}
          value="Change"
          onPress={openEmailModal}
          accessibilityLabel="Change email"
          showDivider={false}
        />
      </SettingsSection>

      <SettingsSection title="Security">
        <SettingsRow
          icon={Shield}
          title="Change password"
          subtitle="Update your password"
          onPress={() => router.push('/(drawer)/settings/change-password')}
          accessibilityLabel="Go to change password"
          showDivider={false}
        />
      </SettingsSection>

      <SettingsSection title="Danger zone">
        <SettingsRow
          icon={Trash2}
          title="Delete account"
          subtitle="Permanently remove your account"
          onPress={requestDeleteAccount}
          destructive
          showDivider={false}
        />
      </SettingsSection>

      <Modal
        visible={showEmailModal}
        transparent
        animationType="slide"
        onRequestClose={closeEmailModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change email</Text>
            <Text style={styles.modalSubtitle}>We&apos;ll send a code to confirm your email.</Text>

            {emailStep === 'email' ? (
              <View style={styles.modalBody}>
                <Input
                  label="New email"
                  value={newEmail}
                  onChangeText={(text) => {
                    setNewEmail(text);
                    setEmailError('');
                  }}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={emailError || undefined}
                />

                <Button
                  title="Send verification"
                  onPress={submitNewEmail}
                  loading={emailLoading}
                  disabled={emailLoading}
                  variant="primary"
                />
              </View>
            ) : (
              <View style={styles.modalBody}>
                <Input
                  label="Verification code"
                  value={verificationCode}
                  onChangeText={(text) => {
                    setVerificationCode(text);
                    setEmailError('');
                  }}
                  placeholder="Enter verification code"
                  keyboardType="numeric"
                  error={emailError || undefined}
                />

                <Button
                  title="Verify email"
                  onPress={verifyEmailCode}
                  loading={emailLoading}
                  disabled={emailLoading}
                  variant="primary"
                />

                <Button
                  title="Resend code"
                  onPress={resendEmailCode}
                  disabled={emailLoading}
                  variant="outline"
                />
              </View>
            )}

            <TouchableOpacity
              onPress={closeEmailModal}
              style={styles.closeAction}
              disabled={emailLoading}
              activeOpacity={0.75}>
              <Text style={styles.closeActionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {deleteLoading ? (
        <View style={styles.deleteOverlay}>
          <ActivityIndicator size="small" color={Colors.error} />
          <Text style={styles.deleteOverlayText}>Deleting account...</Text>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  title: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  menuButtonWrap: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.lg,
    backgroundColor: Colors.card,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: Colors.surface,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: Spacing.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  profileTextWrap: {
    flex: 1,
  },
  profileName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  profileEmail: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  sectionContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  saveButtonWrap: {
    marginTop: -Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Spacing.borderRadius.lg,
    borderTopRightRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomWidth: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  modalBody: {
    marginBottom: Spacing.sm,
  },
  closeAction: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  closeActionText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  deleteOverlayText: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
});
