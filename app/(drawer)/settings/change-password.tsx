import { Button } from '@/components/ui/Button';
import Header from '@/components/ui/Header';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useChangePassword } from '@/hooks/settings/useChangePassword';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { AlertCircle, Check, Shield } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Switch, Text, View } from 'react-native';

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    errors,
    loading,
    authError,
    setAuthError,
    onChangePassword,
    isLoaded,
    isSignedIn,
    router,
    signOutOtherSessions,
    setSignOutOtherSessions,
    newPasswordRef,
    confirmPasswordRef,
    strength,
    isFormReady,
    hasMinLength,
    hasNumberOrSymbol,
    hasUppercase,
  } = useChangePassword();

  const strengthText =
    strength === 'Weak'
      ? t('changePassword.strength.weak')
      : strength === 'OK'
        ? t('changePassword.strength.ok')
        : t('changePassword.strength.strong');

  if (!isLoaded) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t('common.states.loading')}</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!isSignedIn) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('changePassword.errors.signInRequired')}</Text>
          <Button
            title={t('changePassword.actions.goToSignIn')}
            onPress={() => router.push('/(auth)/sign-in')}
            variant="primary"
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Header
          title={t('changePassword.title')}
          subtitle={t('changePassword.subtitle')}
          isGoBack
          openDrawer={() => router.push('/(drawer)/(tabs)/settings')}
        />

        <View style={styles.formCard}>
          <Controller
            control={control}
            rules={{ required: t('changePassword.validation.currentPasswordRequired') }}
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordInput
                label={t('changePassword.fields.currentPasswordLabel')}
                placeholder={t('changePassword.fields.currentPasswordPlaceholder')}
                onBlur={onBlur}
                onChangeText={(text) => {
                  setAuthError(null);
                  onChange(text);
                }}
                value={value}
                error={errors.currentPassword?.message}
                returnKeyType="next"
                autoComplete="current-password"
                textContentType="password"
                onSubmitEditing={() => newPasswordRef.current?.focus()}
                blurOnSubmit={false}
              />
            )}
            name="currentPassword"
          />

          <Controller
            control={control}
            rules={{
              required: t('changePassword.validation.newPasswordRequired'),
              minLength: {
                value: 8,
                message: t('auth.validation.passwordMin'),
              },
              validate: {
                hasNumberOrSymbol: (value: string) =>
                  /[0-9\W_]/.test(value) || t('changePassword.validation.numberOrSymbolRequired'),
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordInput
                inputRef={newPasswordRef}
                label={t('changePassword.fields.newPasswordLabel')}
                placeholder={t('changePassword.fields.newPasswordPlaceholder')}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.newPassword?.message}
                helperText={t('changePassword.fields.newPasswordHelper')}
                returnKeyType="next"
                autoComplete="new-password"
                textContentType="newPassword"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                blurOnSubmit={false}
              />
            )}
            name="newPassword"
          />

          <View style={styles.rulesBlock}>
            <RuleItem label={t('changePassword.rules.minLength')} isMet={hasMinLength} />
            <RuleItem label={t('changePassword.rules.numberOrSymbol')} isMet={hasNumberOrSymbol} />
            <RuleItem label={t('changePassword.rules.uppercaseRecommended')} isMet={hasUppercase} />

            <View style={styles.strengthRow}>
              <Text style={styles.strengthLabel}>{t('changePassword.strength.label')}</Text>
              <View style={styles.strengthTrack}>
                <View
                  style={[
                    styles.strengthSegment,
                    strength !== 'Weak' && styles.strengthSegmentActive,
                  ]}
                />
                <View
                  style={[
                    styles.strengthSegment,
                    (strength === 'OK' || strength === 'Strong') && styles.strengthSegmentActive,
                  ]}
                />
                <View
                  style={[
                    styles.strengthSegment,
                    strength === 'Strong' && styles.strengthSegmentActive,
                  ]}
                />
              </View>
              <Text style={styles.strengthValue}>{strengthText}</Text>
            </View>
          </View>

          <Controller
            control={control}
            rules={{
              required: t('auth.validation.confirmPasswordRequired'),
              validate: (value, formValues) => {
                if (value !== formValues.newPassword) {
                  return t('auth.validation.passwordsNoMatch');
                }
                return true;
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordInput
                inputRef={confirmPasswordRef}
                label={t('changePassword.fields.confirmPasswordLabel')}
                placeholder={t('changePassword.fields.confirmPasswordPlaceholder')}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.confirmPassword?.message}
                returnKeyType="done"
                autoComplete="new-password"
                textContentType="newPassword"
                blurOnSubmit
              />
            )}
            name="confirmPassword"
          />

          <View style={styles.sessionRow}>
            <View style={styles.sessionCopyWrap}>
              <View style={styles.sessionLabelRow}>
                <Shield size={16} color={Colors.primary} />
                <Text style={styles.sessionTitle}>{t('changePassword.signOutOthers.title')}</Text>
              </View>
              <Text style={styles.sessionSubtitle}>
                {t('changePassword.signOutOthers.subtitle')}
              </Text>
            </View>
            <Switch
              value={signOutOtherSessions}
              onValueChange={setSignOutOtherSessions}
              disabled={loading}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.text}
              accessibilityLabel={t('changePassword.signOutOthers.title')}
            />
          </View>
        </View>

        {authError ? (
          <View style={styles.formErrorRow}>
            <AlertCircle size={16} color={Colors.error} />
            <Text style={styles.formErrorText}>{authError}</Text>
          </View>
        ) : null}

        <View style={styles.buttonContainer}>
          <Button
            title={
              loading
                ? t('changePassword.actions.updating')
                : t('changePassword.actions.updatePassword')
            }
            onPress={handleSubmit(onChangePassword)}
            disabled={loading || !isFormReady}
            loading={loading}
            variant="primary"
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

function RuleItem({ label, isMet }: { label: string; isMet: boolean }) {
  return (
    <View style={styles.ruleItem}>
      <View style={[styles.ruleIcon, isMet && styles.ruleIconActive]}>
        {isMet ? <Check size={10} color={Colors.primary} /> : null}
      </View>
      <Text style={[styles.ruleLabel, isMet && styles.ruleLabelActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.sm,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
    color: Colors.error,
    marginTop: Spacing.sm,
    fontSize: 14,
  },
  formCard: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.lg,
    backgroundColor: Colors.card,
  },
  rulesBlock: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  ruleIcon: {
    width: 14,
    height: 14,
    borderRadius: Spacing.borderRadius.round,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  ruleIconActive: {
    borderColor: Colors.primary,
  },
  ruleLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  ruleLabelActive: {
    color: Colors.text,
  },
  strengthRow: {
    marginTop: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  strengthLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    minWidth: 52,
  },
  strengthTrack: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  strengthSegment: {
    flex: 1,
    height: 6,
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: Colors.surface,
  },
  strengthSegmentActive: {
    backgroundColor: Colors.primary,
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    minWidth: 40,
    textAlign: 'right',
  },
  sessionRow: {
    minHeight: 56,
    borderTopWidth: 1,
    borderColor: Colors.border,
    paddingTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionCopyWrap: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  sessionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  sessionSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  formErrorRow: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  formErrorText: {
    flex: 1,
    fontSize: 13,
    color: Colors.error,
  },
  buttonContainer: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
});
