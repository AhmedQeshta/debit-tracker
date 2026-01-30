import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Colors } from '@/theme/colors';
import { Home, Info, X, Users, LayoutDashboard, Calculator, Cloud, CloudOff, RefreshCw } from 'lucide-react-native';
import { Spacing } from '@/theme/spacing';
import { DRAWER_WIDTH } from '@/hooks/drawer/useDrawer';
import { useUsersStore } from '@/store/usersStore';
import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useAuth } from '@clerk/clerk-expo';
import { useSyncStore } from '@/store/syncStore';
import { useBudgetStore } from '@/store/budgetStore';

export const DrawerContent = ({ insets, closeDrawer, isActive, navigateTo, }: any) =>
{
  const users = useUsersStore((state) => state.users);
  const hasUsers = users.length > 0;
  const { isOnline, hasPendingChanges, lastSync, syncNow, isSyncing, isSignedIn } = useCloudSync();
  const { user } = useAuth();
  const { queue } = useSyncStore();
  const budgets = useBudgetStore((state) => state.budgets);

  const unsyncedBudgets = budgets.filter(b => !b.synced || b.items.some(item => !item.synced)).length;
  const pendingCount = queue.length + unsyncedBudgets;

  const formatLastSync = (timestamp: number | null) =>
  {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <View style={[styles.drawerContent, { paddingTop: insets.top }]}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Menu</Text>
        <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.drawerMenu}>
        <TouchableOpacity
          style={[styles.menuItem, isActive('/(drawer)/(tabs)') && styles.menuItemActive]}
          onPress={() => navigateTo('/(drawer)/(tabs)')}>
          <Home size={20} color={isActive('/(drawer)/(tabs)') ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.menuItemText, isActive('/(drawer)/(tabs)') && styles.menuItemTextActive]}>
            Home
          </Text>
        </TouchableOpacity>
        {hasUsers && (
          <TouchableOpacity
            style={[styles.menuItem, isActive('/(drawer)/(tabs)/users') && styles.menuItemActive]}
            onPress={() => navigateTo('/(drawer)/(tabs)/users')}>
            <Users size={20} color={isActive('/(drawer)/(tabs)/users') ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.menuItemText, isActive('/(drawer)/(tabs)/users') && styles.menuItemTextActive]}>
              Users
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.menuItem, isActive('/(drawer)/(tabs)/budget') && styles.menuItemActive]}
          onPress={() => navigateTo('/(drawer)/(tabs)/budget')}>
          <Calculator size={20} color={isActive('/(drawer)/(tabs)/budget') ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.menuItemText, isActive('/(drawer)/(tabs)/budget') && styles.menuItemTextActive]}>
            Budget Calculator
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuItem, isActive('/(drawer)/(tabs)/dashboard') && styles.menuItemActive]}
          onPress={() => navigateTo('/(drawer)/(tabs)/dashboard')}>
          <LayoutDashboard size={20} color={isActive('/(drawer)/(tabs)/dashboard') ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.menuItemText, isActive('/(drawer)/(tabs)/dashboard') && styles.menuItemTextActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuItem, isActive('/(drawer)/about') && styles.menuItemActive]}
          onPress={() => navigateTo('/(drawer)/about')}>
          <Info size={20} color={isActive('/(drawer)/about') ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.menuItemText, isActive('/(drawer)/about') && styles.menuItemTextActive]}>
            About Me
          </Text>
        </TouchableOpacity>

        {/* Cloud Sync Status */}
        <View style={styles.syncSection}>
          <View style={styles.syncHeader}>
            <Text style={styles.syncTitle}>Cloud Sync Status</Text>
          </View>

          {isSignedIn && user ? (
            <>
              <View style={styles.syncInfo}>
                <View style={styles.syncRow}>
                  {isOnline ? (
                    <Cloud size={16} color={Colors.success} />
                  ) : (
                    <CloudOff size={16} color={Colors.error} />
                  )}
                  <Text style={styles.syncText}>
                    {isOnline ? 'Online' : 'Offline'}
                  </Text>
                </View>

                <View style={styles.syncRow}>
                  <Text style={styles.syncLabel}>Pending:</Text>
                  <Text style={[styles.syncValue, pendingCount > 0 && styles.syncValueWarning]}>
                    {pendingCount}
                  </Text>
                </View>

                <View style={styles.syncRow}>
                  <Text style={styles.syncLabel}>Last sync:</Text>
                  <Text style={styles.syncValue}>{formatLastSync(lastSync)}</Text>
                </View>

                <View style={styles.syncRow}>
                  <Text style={styles.syncLabel}>Logged in as:</Text>
                  <Text style={styles.syncEmail} numberOfLines={1}>
                    {user.primaryEmailAddress?.emailAddress || 'Unknown'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
                onPress={syncNow}
                disabled={isSyncing || !isOnline}>
                <RefreshCw size={16} color={Colors.text} />
                <Text style={styles.syncButtonText}>
                  {isSyncing ? 'Syncing...' : 'Manual Sync'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.syncInfo}>
              <Text style={styles.syncText}>Not signed in</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  overlayAnimated: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 1000,
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawerContent: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  drawerMenu: {
    flex: 1,
    paddingTop: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginHorizontal: Spacing.sm,
    marginVertical: Spacing.xs,
    borderRadius: Spacing.borderRadius.md,
    gap: Spacing.md,
  },
  menuItemActive: {
    backgroundColor: Colors.card,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  menuItemTextActive: {
    color: Colors.primary,
  },
  syncSection: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  syncHeader: {
    marginBottom: Spacing.sm,
  },
  syncTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  syncInfo: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  syncText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  syncLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  syncValue: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  syncValueWarning: {
    color: Colors.error,
  },
  syncEmail: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    flex: 1,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  syncButtonDisabled: {
    opacity: 0.5,
  },
  syncButtonText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
});
