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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      label: isSigningOut ? t('account.actions.signingOut') : t('settings.rows.signOut'),
      onPress: handleAuthAction,
    },
    {
      icon: <Trash2 size={18} color={Colors.error} />,
      label: t('account.actions.deleteAccount'),
      onPress: requestDeleteAccount,
      danger: true,
    },
  ];

  if (!isLoaded && !loadTimedOut) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>{t('settings.descriptions.loadingAccount')}</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!isLoaded && loadTimedOut) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('account.errors.loadFailed')}</Text>
          <Button
            title={t('account.actions.backToSettings')}
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
          <Text style={styles.errorText}>{t('account.errors.signInRequired')}</Text>
          <Button
            title={t('account.actions.goToLogin')}
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
          accessibilityLabel={t('account.accessibility.backToSettings')}>
          <Text style={styles.backText}>
            <ArrowLeft size={25} color={Colors.text} />
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t('settings.rows.manageAccount')}</Text>

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
            {user.fullName || user.primaryEmailAddress?.emailAddress || t('account.fallbacks.user')}
          </Text>
          <Text style={styles.profileEmail} numberOfLines={1}>
            {user.primaryEmailAddress?.emailAddress || t('account.fallbacks.noEmail')}
          </Text>
        </View>
      </View>

      <SettingsSection title={t('account.sections.profile')}>
        <View style={styles.sectionContent}>
          <Controller
            control={control}
            rules={{ required: t('account.validation.firstNameRequired') }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('account.fields.firstNameLabel')}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder={t('account.fields.firstNamePlaceholder')}
                error={errors.firstName?.message}
                autoCapitalize="words"
              />
            )}
            name="firstName"
          />

          <Controller
            control={control}
            rules={{ required: t('account.validation.lastNameRequired') }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('account.fields.lastNameLabel')}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder={t('account.fields.lastNamePlaceholder')}
                error={errors.lastName?.message}
                autoCapitalize="words"
              />
            )}
            name="lastName"
          />

          <View style={styles.saveButtonWrap}>
            <Button
              title={loading ? t('account.actions.saving') : t('account.actions.saveChanges')}
              onPress={handleSubmit(updateName)}
              loading={loading}
              disabled={!canSaveProfile}
              variant="primary"
            />
          </View>
        </View>
      </SettingsSection>

      <SettingsSection title={t('account.sections.email')}>
        <SettingsRow
          icon={Mail}
          title={t('account.rows.emailAddress')}
          subtitle={user.primaryEmailAddress?.emailAddress || t('account.fallbacks.noEmail')}
          value={t('account.actions.change')}
          onPress={openEmailModal}
          accessibilityLabel={t('account.accessibility.changeEmail')}
          showDivider={false}
        />
      </SettingsSection>

      <SettingsSection title={t('account.sections.security')}>
        <SettingsRow
          icon={Shield}
          title={t('account.rows.changePassword')}
          subtitle={t('account.rows.changePasswordSub')}
          onPress={() => router.push('/(drawer)/settings/change-password')}
          accessibilityLabel={t('account.accessibility.goToChangePassword')}
          showDivider={false}
        />
      </SettingsSection>

      <SettingsSection title={t('settings.sections.danger')}>
        <SettingsRow
          icon={Trash2}
          title={t('account.actions.deleteAccount')}
          subtitle={t('account.rows.deleteAccountSub')}
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
            <Text style={styles.modalTitle}>{t('account.modal.changeEmailTitle')}</Text>
            <Text style={styles.modalSubtitle}>{t('account.modal.changeEmailSubtitle')}</Text>

            {emailStep === 'email' ? (
              <View style={styles.modalBody}>
                <Input
                  label={t('account.modal.newEmailLabel')}
                  value={newEmail}
                  onChangeText={(text) => {
                    setNewEmail(text);
                    setEmailError('');
                  }}
                  placeholder={t('account.modal.newEmailPlaceholder')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={emailError || undefined}
                />

                <Button
                  title={t('account.modal.sendVerification')}
                  onPress={submitNewEmail}
                  loading={emailLoading}
                  disabled={emailLoading}
                  variant="primary"
                />
              </View>
            ) : (
              <View style={styles.modalBody}>
                <Input
                  label={t('account.modal.verificationCodeLabel')}
                  value={verificationCode}
                  onChangeText={(text) => {
                    setVerificationCode(text);
                    setEmailError('');
                  }}
                  placeholder={t('account.modal.verificationCodePlaceholder')}
                  keyboardType="numeric"
                  error={emailError || undefined}
                />

                <Button
                  title={t('account.modal.verifyEmail')}
                  onPress={verifyEmailCode}
                  loading={emailLoading}
                  disabled={emailLoading}
                  variant="primary"
                />

                <Button
                  title={t('account.modal.resendCode')}
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
              <Text style={styles.closeActionText}>{t('common.actions.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {deleteLoading ? (
        <View style={styles.deleteOverlay}>
          <ActivityIndicator size="small" color={Colors.error} />
          <Text style={styles.deleteOverlayText}>{t('account.actions.deletingAccount')}</Text>
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
