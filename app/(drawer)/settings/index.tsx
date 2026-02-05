import { Button } from '@/components/ui/Button';
import Header from '@/components/ui/Header';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useSignOut } from '@/hooks/auth/useSignOut';
import { useSettings } from '@/hooks/settings/useSettings';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Settings as SettingsIcon, User } from 'lucide-react-native';
import { ActivityIndicator, Image, StyleSheet, Switch, Text, View } from 'react-native';

export default function Settings()
{
  const { isLoaded, isSignedIn, user, openDrawer, handleClearLocalData, handleSignIn, formatLastSync, getSyncStatusText, appVersion, syncEnabled, setSyncEnabled, lastSync, router } = useSettings();

  const { handleAuthAction } = useSignOut();

  if (!isLoaded)
  {
    return (
      <View style={styles.wrapper}>
        <ScreenContainer>
          <Header openDrawer={openDrawer} title="Settings" />
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
        <Header openDrawer={openDrawer} title="Settings" />

        {/* Account Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Account</Text>
          </View>
          <View style={styles.sectionContent}>
            {isSignedIn && user ? (
              <>
                <View style={styles.accountInfo}>
                  {user.imageUrl ? (
                    <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <User size={24} color={Colors.textSecondary} />
                    </View>
                  )}
                  <View style={styles.accountDetails}>
                    <Text style={styles.accountName}>
                      {user.fullName || user.primaryEmailAddress?.emailAddress || 'User'}
                    </Text>
                    <Text style={styles.accountEmail}>
                      {user.primaryEmailAddress?.emailAddress || 'No email'}
                    </Text>
                  </View>
                </View>
                <View style={styles.statusBadge}>
                  <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
                  <Text style={styles.statusText}>Signed in</Text>
                </View>
                <Button
                  title="Manage account"
                  onPress={() => router.push('/(drawer)/settings/account')}
                  variant="outline"
                />

                <Button
                  title="Sign out"
                  onPress={handleAuthAction}
                  variant="error"
                />
              </>
            ) : (
              <>
                <View style={styles.statusBadge}>
                  <View style={[styles.statusDot, { backgroundColor: Colors.textSecondary }]} />
                  <Text style={styles.statusText}>Not signed in</Text>
                </View>
                <Button
                  title="Sign in / Register"
                  onPress={handleSignIn}
                  variant="primary"
                />
              </>
            )}
          </View>
        </View>

        {/* Sync Section */}
        {isSignedIn && user
          ? <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SettingsIcon size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Sync</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.syncRow}>
                <Text style={styles.syncLabel}>Cloud Sync</Text>
                <Switch
                  value={syncEnabled}
                  onValueChange={setSyncEnabled}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor="#fff"
                />
              </View>
              {syncEnabled && (
                <>
                  <View style={styles.syncInfo}>
                    <Text style={styles.syncInfoLabel}>Status:</Text>
                    <Text style={styles.syncInfoValue}>{getSyncStatusText()}</Text>
                  </View>
                  {lastSync && (
                    <View style={styles.syncInfo}>
                      <Text style={styles.syncInfoLabel}>Last sync:</Text>
                      <Text style={styles.syncInfoValue}>{formatLastSync(lastSync)}</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
          : <View style={styles.section}>
            <Text style={styles.note}>To use the sync feature, please sign in to your account.</Text>
          </View>
        }

        {/* App Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SettingsIcon size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>App</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.appInfo}>
              <Text style={styles.appInfoLabel}>Version</Text>
              <Text style={styles.appInfoValue}>{appVersion}</Text>
            </View>
            <Button
              title="Clear local data"
              onPress={handleClearLocalData}
              variant="error"
            />
          </View>
        </View>
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
  section: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.borderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  accountEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  syncInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncInfoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  syncInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  syncHint: {
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  syncHintText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  appInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  appInfoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  appInfoValue: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  note: {
    fontWeight: '600',
    color: Colors.text,
    padding: Spacing.sm,
    marginVertical: Spacing.sm
  }
});

