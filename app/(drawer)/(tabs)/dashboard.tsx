import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Wifi, WifiOff, Menu, Calculator } from 'lucide-react-native';
import { useDashboard } from '@/hooks/useDashboard';
import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { formatCurrency } from '@/lib/utils';
import { PinnedCards } from '@/components/dashboard/PinnedCards';
import { Text as RNText } from 'react-native';

export default function Dashboard()
{
  const {
    users,
    queueSize,
    isOnline,
    globalDebit,
    totalPaidBack,
    pinnedUsers,
    pinnedCount,
    pinnedBudgets,
    pinnedBudgetCount,
    getUserBalance,
    getBudgetTotalSpent,
    getBudgetRemaining,
    router,
    handleUnpin,
    handleUnpinBudget
  } = useDashboard();
  const { openDrawer } = useDrawerContext();

  return (
    <View style={styles.wrapper}>
      <ScreenContainer>
        <View style={styles.statusHeader}>
          <View style={styles.titleRow}>
            <TouchableOpacity
              onPress={openDrawer}
              style={styles.menuButton}
              activeOpacity={0.7}>
              <Menu size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Dashboard</Text>
          </View>
          <View style={[styles.badge, isOnline ? styles.onlineBadge : styles.offlineBadge]}>
            {isOnline ? <Wifi size={14} stroke="#000" /> : <WifiOff size={14} stroke="#fff" />}
            <Text style={[styles.badgeText, isOnline ? {} : { color: '#fff' }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Users</Text>
            <Text style={styles.statValue}>{users.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pinned Users</Text>
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {pinnedCount}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pending Syncs</Text>
            <Text style={[styles.statValue, queueSize > 0 ? { color: Colors.primary } : {}]}>
              {queueSize}
            </Text>
          </View>
        </View>

        <View style={styles.mainStats}>
          <View style={[styles.mainStatCard, { borderLeftColor: Colors.error }]}>
            <Text style={styles.mainStatLabel}>Total They Owe You</Text>
            <Text style={[styles.mainStatValue, { color: Colors.error }]}>
              ${globalDebit.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.mainStatCard, { borderLeftColor: Colors.success }]}>
            <Text style={styles.mainStatLabel}>Total You Owe Them</Text>
            <Text style={[styles.mainStatValue, { color: Colors.success }]}>
              ${totalPaidBack.toFixed(2)}
            </Text>
          </View>
        </View>

        <PinnedCards
          title="Pinned Users"
          count={pinnedCount}
          items={pinnedUsers}
          renderAvatar={(user) => (
            <RNText style={styles.avatarText}>{user.name.charAt(0)}</RNText>
          )}
          getTitle={(user) => user.name}
          getAmount={(user) => getUserBalance(user.id)}
          formatAmount={(amount) => `$${amount.toFixed(2)}`}
          getNavigationPath={(user) => `/user/${user.id}`}
          onUnpin={handleUnpin}
        />

        <PinnedCards
          title="Pinned Budgets"
          count={pinnedBudgetCount}
          items={pinnedBudgets}
          renderAvatar={() => <Calculator size={24} color="#000" />}
          getTitle={(budget) => budget.title}
          getAmount={(budget) => getBudgetRemaining(budget.id)}
          formatAmount={(amount, budget) => formatCurrency(amount, budget.currency)}
          getNavigationPath={(budget) => `/(drawer)/budget/${budget.id}`}
          onUnpin={handleUnpinBudget}
        />

        <View style={styles.chartPlaceholder}>
          <Text style={styles.placeholderText}>Charts & Insights Coming Soon</Text>
          <View style={styles.barPlaceholder} />
          <View
            style={[styles.barPlaceholder, { width: '70%', backgroundColor: Colors.surface }]}
          />
          <View style={[styles.barPlaceholder, { width: '40%' }]} />
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  onlineBadge: {
    backgroundColor: Colors.secondary,
  },
  offlineBadge: {
    backgroundColor: Colors.error,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  mainStats: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  mainStatCard: {
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    borderRadius: Spacing.borderRadius.lg,
    borderLeftWidth: 6,
  },
  mainStatLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  mainStatValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 4,
  },
  chartPlaceholder: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Spacing.borderRadius.lg,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  placeholderText: {
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  barPlaceholder: {
    height: 12,
    width: '100%',
    backgroundColor: Colors.border,
    borderRadius: 6,
    marginBottom: Spacing.sm,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
});

