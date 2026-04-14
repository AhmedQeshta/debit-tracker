import { SettingsRow } from '@/components/settings/SettingsRow';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { SettingsToggleRow } from '@/components/settings/SettingsToggleRow';
import { StatusPill } from '@/components/settings/StatusPill';
import Header from '@/components/ui/Header';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useSignOut } from '@/hooks/auth/useSignOut';
import { useSettings } from '@/hooks/settings/useSettings';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import {
  Cloud,
  Download,
  FileText,
  Info,
  LogOut,
  Palette,
  RefreshCw,
  Shield,
  Trash2,
  User,
} from 'lucide-react-native';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

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
    lastError,
    handleSync,
    router,
  } = useSettings();

  const { handleAuthAction } = useSignOut();

  if (!isLoaded) {
    return (
      <View style={styles.wrapper}>
        <ScreenContainer>
          <Header openDrawer={openDrawer} title="Settings" subtitle="Account & app preferences" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </ScreenContainer>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScreenContainer>
        <Header openDrawer={openDrawer} title="Settings" subtitle="Account & app preferences" />

        <SettingsSection title="Account">
          {isSignedIn && user ? (
            <Pressable
              style={({ pressed }) => [styles.profileRow, pressed && styles.rowPressed]}
              onPress={() => router.push('/(drawer)/settings/account')}
              accessibilityRole="button"
              accessibilityLabel="Open account settings">
              <View style={styles.profileLeft}>
                {user.imageUrl ? (
                  <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
                ) : (
                  <View
                    style={styles.avatarPlaceholder}
                    accessibilityRole="image"
                    accessibilityLabel="Profile avatar">
                    <User size={20} color={Colors.textSecondary} />
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
              <StatusPill label="Signed in" tone="success" />
              <View style={styles.divider} />
            </Pressable>
          ) : (
            <SettingsRow
              icon={User}
              title="Sign in"
              subtitle="Sign in to manage your account and cloud sync"
              onPress={handleSignIn}
              showDivider={false}
            />
          )}

          {isSignedIn ? (
            <>
              <SettingsRow
                icon={User}
                title="Manage account"
                subtitle="Profile details and email"
                onPress={() => router.push('/(drawer)/settings/account')}
              />
              <SettingsRow
                icon={Shield}
                title="Security"
                subtitle="Change your password"
                onPress={() => router.push('/(drawer)/settings/change-password')}
              />
              <SettingsRow
                icon={LogOut}
                title="Sign out"
                subtitle="Sign out from this device"
                onPress={handleAuthAction}
                destructive
                showChevron={false}
                showDivider={false}
              />
            </>
          ) : null}
        </SettingsSection>

        <SettingsSection title="Sync">
          <SettingsToggleRow
            icon={Cloud}
            title="Cloud Sync"
            subtitle={
              isSignedIn ? 'Keep data synced across devices' : 'Sign in to enable cloud sync'
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
                title="Status"
                value={getSyncStatusText()}
                subtitle={syncStatus === 'error' ? 'Tap Sync now to retry' : undefined}
                showChevron={false}
                showDivider
                rightSlot={
                  syncStatus === 'error' || lastError ? (
                    <StatusPill label="Error" tone="error" />
                  ) : undefined
                }
              />
              <SettingsRow
                icon={RefreshCw}
                title="Last synced"
                value={formatLastSync(lastSync)}
                showChevron={false}
                showDivider
              />
              <SettingsRow
                icon={RefreshCw}
                title="Sync now"
                subtitle={isSyncing ? 'Sync in progress' : 'Force a sync now'}
                onPress={handleSync}
                showDivider={false}
              />
            </>
          ) : null}
        </SettingsSection>

        <SettingsSection title="App">
          <SettingsRow
            icon={Download}
            title="Export data"
            subtitle="Save or share friends and budgets as CSV or JSON"
            onPress={() => router.push('/(drawer)/settings/export-data' as any)}
          />
          <SettingsRow icon={Info} title="Version" value={appVersion} showChevron={false} />
          <SettingsRow
            icon={Palette}
            title="Theme"
            value="Dark"
            subtitle="Dark mode is currently active"
            showChevron={false}
          />
          <SettingsRow
            icon={Info}
            title="About"
            subtitle="App details and developer info"
            onPress={() => router.push('/(drawer)/about')}
          />
          <SettingsRow
            icon={Shield}
            title="Privacy"
            subtitle="How your data is handled"
            onPress={() => router.push('/(drawer)/privacy')}
          />
          <SettingsRow
            icon={FileText}
            title="Terms"
            subtitle="Terms and conditions"
            onPress={() => router.push('/(drawer)/terms')}
            showDivider={false}
          />
        </SettingsSection>

        <SettingsSection title="Danger Zone">
          <SettingsRow
            icon={Trash2}
            title="Clear local data"
            subtitle="Remove local budgets, friends, and transactions"
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

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
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
  profileRow: {
    minHeight: 64,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowPressed: {
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.surface,
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileTextWrap: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  profileMeta: {
    marginTop: 2,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  divider: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    bottom: 0,
    height: 1,
    backgroundColor: Colors.border,
  },
});
