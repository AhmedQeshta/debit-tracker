import { SettingsRow } from '@/components/settings/SettingsRow';import { SettingsSection } from '@/components/settings/SettingsSection';
import { SettingsToggleRow } from '@/components/settings/SettingsToggleRow';
import { StatusPill } from '@/components/settings/StatusPill';
import Header from '@/components/ui/Header';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/contexts/ThemeContext';
import { useSignOut } from '@/hooks/auth/useSignOut';
import { useSettings } from '@/hooks/settings/useSettings';
import { Spacing } from '@/theme/spacing';
import { ThemeMode } from '@/theme/types';
import {
  Cloud,
  Download,
  FileText,
  Globe,
  Info,
  LogOut,
  Palette,
  RefreshCw,
  Shield,
  Trash2,
  User,
} from 'lucide-react-native';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function Settings() {
  const {
    isLoaded,
    isSignedIn,
    user,
    openDrawer,
    handleClearLocalData,
    handleSignIn,
    formatLastSync,
    getSyncStatusText,
    appVersion,
    syncEnabled,
    setSyncEnabled,
    syncStatus,
    lastSync,
    isSyncing,
    pullProgress,
    lastError,
    handleSync,
    router,
    loadTimedOut,
    showAuthSkeleton,
    currentLanguage,
    handleLanguageChange,
    themeMode,
    handleThemeChange,
    t,
  } = useSettings();
  const { handleAuthAction, isSigningOut } = useSignOut();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return t('settings.themeOptions.light');
      case 'dark':
        return t('settings.themeOptions.dark');
      default:
        return t('settings.themeOptions.system');
    }
  };

  const handleThemePicker = () => {
    const options: ThemeMode[] = ['system', 'light', 'dark'];
    const actionList = options.map((mode) => ({
      text: `${themeMode === mode ? '✓ ' : ''}${getThemeLabel(mode)}`,
      onPress: () => handleThemeChange(mode),
    }));

    Alert.alert(t('settings.themeOptions.pickerTitle'), t('settings.themeOptions.pickerMessage'), [
      ...actionList,
      {
        text: t('common.actions.cancel'),
        style: 'cancel',
      },
    ]);
  };

  return (
    <View style={styles.wrapper}>
      <ScreenContainer>
        <Header
          openDrawer={openDrawer}
          title={t('settings.title')}
          subtitle={t('settings.subtitle')}
        />

        {showAuthSkeleton ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>{t('settings.descriptions.loadingAccount')}</Text>
          </View>
        ) : null}

        {!isLoaded && loadTimedOut ? (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>{t('settings.descriptions.accountFallback')}</Text>
          </View>
        ) : null}

        <SettingsSection title={t('settings.sections.account')}>
          {showAuthSkeleton ? (
            <View style={styles.placeholderRow}>
              <View style={styles.placeholderAvatar} />
              <View style={styles.placeholderTextWrap}>
                <View style={styles.placeholderLineLarge} />
                <View style={styles.placeholderLineSmall} />
              </View>
            </View>
          ) : isSignedIn && user ? (
            <Pressable
              style={({ pressed }) => [styles.profileRow, pressed && styles.rowPressed]}
              onPress={() => router.push('/(drawer)/settings/account')}
              accessibilityRole="button"
              accessibilityLabel={t('settings.rows.manageAccount')}>
              <View style={styles.profileLeft}>
                {user.imageUrl ? (
                  <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
                ) : (
                  <View
                    style={styles.avatarPlaceholder}
                    accessibilityRole="image"
                    accessibilityLabel="Profile avatar">
                    <User size={20} color={colors.textSecondary} />
                  </View>
                )}
                <View style={styles.profileTextWrap}>
                  <Text style={styles.profileName} numberOfLines={1}>
                    {user.fullName || 'Signed in user'}
                  </Text>
                  <Text style={styles.profileMeta} numberOfLines={1}>
                    {user.primaryEmailAddress?.emailAddress || 'No email'}
                  </Text>
                </View>
              </View>
              <StatusPill label={t('settings.statusValues.signedIn')} tone="success" />
              <View style={styles.divider} />
            </Pressable>
          ) : (
            <SettingsRow
              icon={User}
              title={t('settings.rows.signIn')}
              subtitle={t('settings.descriptions.signInSub')}
              onPress={handleSignIn}
              showDivider={false}
            />
          )}

          {isSignedIn ? (
            <>
              <SettingsRow
                icon={User}
                title={t('settings.rows.manageAccount')}
                subtitle={t('settings.descriptions.manageAccountSub')}
                onPress={() => router.push('/(drawer)/settings/account')}
              />
              <SettingsRow
                icon={Shield}
                title={t('settings.rows.security')}
                subtitle={t('settings.descriptions.securitySub')}
                onPress={() => router.push('/(drawer)/settings/change-password')}
              />
              <SettingsRow
                icon={LogOut}
                title={t('settings.rows.signOut')}
                subtitle={
                  isSigningOut
                    ? t('settings.descriptions.signOutLoading')
                    : t('settings.descriptions.signOutSub')
                }
                onPress={handleAuthAction}
                disabled={isSigningOut}
                destructive
                showChevron={false}
                showDivider={false}
              />
            </>
          ) : null}
        </SettingsSection>

        <SettingsSection title={t('settings.sections.sync')}>
          <SettingsToggleRow
            icon={Cloud}
            title={t('settings.rows.cloudSync')}
            subtitle={
              isSignedIn
                ? t('settings.descriptions.syncEnabled')
                : t('settings.descriptions.syncDisabled')
            }
            value={isSignedIn ? syncEnabled : false}
            onValueChange={setSyncEnabled}
            disabled={!isSignedIn}
            showDivider={isSignedIn && syncEnabled}
          />

          {isSignedIn && syncEnabled ? (
            <>
              <SettingsRow
                icon={Cloud}
                title={t('settings.rows.status')}
                value={getSyncStatusText()}
                subtitle={
                  syncStatus === 'error' ? t('settings.descriptions.syncErrorSub') : undefined
                }
                showChevron={false}
                showDivider
                rightSlot={
                  syncStatus === 'error' || lastError ? (
                    <StatusPill label={t('settings.statusValues.error')} tone="error" />
                  ) : undefined
                }
              />
              <SettingsRow
                icon={RefreshCw}
                title={t('settings.rows.lastSynced')}
                value={formatLastSync(lastSync)}
                showChevron={false}
                showDivider
              />
              <SettingsRow
                icon={RefreshCw}
                title={t('settings.rows.syncNow')}
                subtitle={
                  isSyncing
                    ? pullProgress || t('settings.descriptions.syncNowLoading')
                    : t('settings.descriptions.syncNowSub')
                }
                onPress={handleSync}
                showDivider={false}
              />
            </>
          ) : null}
        </SettingsSection>

        <SettingsSection title={t('settings.sections.appearance')}>
          <SettingsRow
            icon={Palette}
            title={t('settings.rows.theme')}
            value={getThemeLabel(themeMode)}
            subtitle={t('settings.descriptions.themeSub')}
            onPress={handleThemePicker}
          />
        </SettingsSection>

        <SettingsSection title={t('settings.sections.app')}>
          <SettingsRow
            icon={Download}
            title={t('settings.rows.exportData')}
            subtitle={t('settings.descriptions.exportDataSub')}
            onPress={() => router.push('/(drawer)/settings/export-data' as any)}
          />
          <SettingsRow
            icon={Info}
            title={t('settings.rows.version')}
            value={appVersion}
            showChevron={false}
          />
          <SettingsRow
            icon={Globe}
            title={t('settings.rows.language')}
            value={
              currentLanguage === 'ar'
                ? t('settings.languageOptions.arabic')
                : t('settings.languageOptions.english')
            }
            subtitle={t('settings.languageOptions.pickerMessage')}
            onPress={handleLanguageChange}
          />
          <SettingsRow
            icon={Info}
            title={t('settings.rows.about')}
            subtitle={t('settings.descriptions.aboutSub')}
            onPress={() => router.push('/(drawer)/about')}
          />
          <SettingsRow
            icon={Shield}
            title={t('settings.rows.privacy')}
            subtitle={t('settings.descriptions.privacySub')}
            onPress={() => router.push('/(drawer)/privacy')}
          />
          <SettingsRow
            icon={FileText}
            title={t('settings.rows.terms')}
            subtitle={t('settings.descriptions.termsSub')}
            onPress={() => router.push('/(drawer)/terms')}
            showDivider={false}
          />
        </SettingsSection>

        <SettingsSection title={t('settings.sections.danger')}>
          <SettingsRow
            icon={Trash2}
            title={t('settings.rows.clearLocalData')}
            subtitle={t('settings.descriptions.clearLocalDataSub')}
            onPress={handleClearLocalData}
            destructive
            showChevron={false}
            showDivider={false}
          />
        </SettingsSection>
      </ScreenContainer>
    </View>
  );
}

const createStyles = (colors: {
  primary: string;
  textSecondary: string;
  border: string;
  surface: string;
  text: string;
}) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
    },
    loadingContainer: {
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingVertical: Spacing.md,
    },
    loadingText: {
      marginTop: Spacing.xs,
      fontSize: 13,
      color: colors.textSecondary,
    },
    warningContainer: {
      marginBottom: Spacing.md,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: Spacing.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    warningText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    placeholderRow: {
      minHeight: 64,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2,
      flexDirection: 'row',
      alignItems: 'center',
    },
    placeholderAvatar: {
      width: 40,
      height: 40,
      borderRadius: Spacing.borderRadius.round,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    placeholderTextWrap: {
      flex: 1,
      marginLeft: Spacing.sm,
      gap: Spacing.xs,
    },
    placeholderLineLarge: {
      width: '65%',
      height: 12,
      borderRadius: Spacing.borderRadius.sm,
      backgroundColor: colors.surface,
    },
    placeholderLineSmall: {
      width: '45%',
      height: 10,
      borderRadius: Spacing.borderRadius.sm,
      backgroundColor: colors.surface,
    },
    profileRow: {
      minHeight: 64,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowPressed: {
      backgroundColor: colors.surface,
    },
    profileLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      paddingRight: Spacing.md,
      gap: Spacing.sm + 2,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.surface,
    },
    avatarPlaceholder: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    profileTextWrap: {
      flex: 1,
    },
    profileName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    profileMeta: {
      marginTop: 2,
      fontSize: 13,
      color: colors.textSecondary,
    },
    divider: {
      position: 'absolute',
      left: Spacing.md,
      right: Spacing.md,
      bottom: 0,
      height: 1,
      backgroundColor: colors.border,
    },
  });
