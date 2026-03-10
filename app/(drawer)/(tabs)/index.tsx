import { HomeBudgetOverviewCard } from '@/components/home/HomeBudgetOverviewCard';
import { HomeGetStartedCard } from '@/components/home/HomeGetStartedCard';
import { HomeQuickActions } from '@/components/home/HomeQuickActions';
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader';
import { HomeSummaryCard } from '@/components/home/HomeSummaryCard';
import { TransactionItem } from '@/components/transaction/TransactionItem';
import { Button } from '@/components/ui/Button';
import { EmptySection } from '@/components/ui/EmptySection';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { useCopyAmount } from '@/hooks/useCopyAmount';
import { useHome } from '@/hooks/useHome';
import { useSummaryCurrency } from '@/hooks/useSummaryCurrency';
import { formatAbsoluteCurrency, formatCurrency, getBalanceDirectionTone } from '@/lib/utils';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { useRouter } from 'expo-router';
import { Menu, Settings } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Home() {
  const router = useRouter();
  const { summaryCurrency, summaryCurrencyLabel, handleSummaryCurrencyToggle } =
    useSummaryCurrency();
  const {
    summary,
    settleUpPeople,
    recentTransactions,
    budgetsOverview,
    isFreshState,
    handleTransactionEdit,
    handleTransactionDelete,
    handleBudgetPinToggle,
    handleBudgetDelete,
    handleBudgetEdit,
    handleBudgetResetPeriod,
    handleAddFriend,
    handleCreateBudget,
    handleAddTransactionPress,
  } = useHome(summaryCurrency);
  const { openDrawer } = useDrawerContext();
  const { handleCopyAmount } = useCopyAmount();

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Pressable onPress={openDrawer} style={styles.iconButton} hitSlop={8}>
            <Menu size={20} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Home</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push('/(drawer)/settings')}
            style={styles.iconButton}
            hitSlop={8}>
            <Settings size={20} color={Colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.summaryHeader}>
        <Text style={styles.summaryHeaderText}>Summary ({summaryCurrencyLabel})</Text>
        <Pressable
          style={styles.currencyButton}
          onPress={handleSummaryCurrencyToggle}
          accessibilityRole="button"
          accessibilityLabel="Change summary currency"
          accessibilityHint="Cycles through USD, ILS, and EUR currencies">
          <Text style={styles.currencyButtonText}>{summaryCurrency}</Text>
        </Pressable>
      </View>

      <HomeSummaryCard
        netBalanceText={formatAbsoluteCurrency(summary.netBalance, summaryCurrency)}
        netBalanceDirectionText={
          summary.netBalance > 0
            ? 'They owe you'
            : summary.netBalance < 0
              ? 'You owe others'
              : 'All settled'
        }
        netBalanceTone={getBalanceDirectionTone(summary.netBalance)}
        youOweText={formatCurrency(summary.youOwe, summaryCurrency)}
        owedToYouText={formatCurrency(summary.owedToYou, summaryCurrency)}
        trend={summary.trend}
        trendText={summary.trendText}
      />

      <HomeSectionHeader title="Quick Actions" />
      <HomeQuickActions
        onAddTransaction={handleAddTransactionPress}
        onAddFriend={handleAddFriend}
        onCreateBudget={handleCreateBudget}
      />

      {isFreshState ? (
        <HomeGetStartedCard
          onAddFriend={handleAddFriend}
          onAddTransaction={handleAddTransactionPress}
          onCreateBudget={handleCreateBudget}
        />
      ) : null}

      <HomeSectionHeader
        title="Settle Up"
        seeAllLabel="See all"
        onSeeAll={() => router.push('/friends')}
      />
      <View style={styles.sectionBody}>
        {settleUpPeople.length === 0 ? (
          <View style={styles.compactEmptyCard}>
            <Text style={styles.compactEmptyTitle}>No balances to settle</Text>
            <Text style={styles.compactEmptyText}>Add a friend to get started.</Text>
            <Button title="Add Friend" onPress={handleAddFriend} />
          </View>
        ) : (
          settleUpPeople.map((item) => {
            const isYouOwe = item.balance < 0;
            const badgeText = isYouOwe ? 'You owe' : 'They owe you';

            return (
              <View key={item.friend.id} style={styles.settleItem}>
                <View style={styles.settleAvatar}>
                  <Text style={styles.settleAvatarText}>
                    {item.friend.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.settleMain}>
                  <Text style={styles.settleName} numberOfLines={1}>
                    {item.friend.name}
                  </Text>
                  <Text style={[styles.settleBadge, isYouOwe ? styles.badgeOwe : styles.badgeOwed]}>
                    {badgeText}
                  </Text>
                </View>

                <View style={styles.settleRight}>
                  <Text
                    style={[styles.settleAmount, isYouOwe ? styles.amountOwe : styles.amountOwed]}>
                    {formatAbsoluteCurrency(item.balance, item.friend.currency || '$')}
                  </Text>
                  <Button
                    title="Settle"
                    variant="outline"
                    onPress={() =>
                      router.push(`/(drawer)/transaction/new?friendId=${item.friend.id}`)
                    }
                  />
                </View>
              </View>
            );
          })
        )}
      </View>

      <HomeSectionHeader
        title="Recent Transactions"
        seeAllLabel="See all"
        onSeeAll={() => router.push('/transactions')}
      />
      <View style={styles.sectionBody}>
        {recentTransactions.length === 0 ? (
          <View style={styles.compactEmptyCard}>
            <EmptySection
              title={'No Transactions Yet'}
              description={'Add your first transaction to start tracking debts'}
              icon={'transactions'}
            />
            <Button title="Add Transaction" onPress={handleAddTransactionPress} />
          </View>
        ) : (
          recentTransactions.map(({ transaction, friend }) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              currency={friend?.currency || '$'}
              onEdit={handleTransactionEdit}
              onDelete={handleTransactionDelete}
              onCopyAmount={() => handleCopyAmount(transaction.amount, friend?.currency || '$')}
            />
          ))
        )}
      </View>

      <HomeSectionHeader
        title="Budgets Overview"
        seeAllLabel="See all"
        onSeeAll={() => router.push('/budget')}
      />
      <View style={styles.sectionBody}>
        {budgetsOverview.length === 0 ? (
          <View style={styles.compactEmptyCard}>
            <EmptySection
              title="No Budgets"
              description="Create your first budget to start tracking your spending"
              icon="budgets"
            />
            <Button title="Create Budget" onPress={handleCreateBudget} />
          </View>
        ) : (
          budgetsOverview.map(({ budget, spent, progress, warningLabel }) => (
            <HomeBudgetOverviewCard
              key={budget.id}
              budget={budget}
              spent={spent}
              progress={progress}
              warningLabel={warningLabel}
              onOpen={(id) => router.push(`/(drawer)/budget/${id}`)}
              onEdit={handleBudgetEdit}
              onPinToggle={handleBudgetPinToggle}
              onDelete={handleBudgetDelete}
              onCopyRemaining={(remaining, currency) => handleCopyAmount(remaining, currency)}
              onResetPeriod={handleBudgetResetPeriod}
            />
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    minHeight: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 32 / 1.2,
    fontWeight: '800',
  },
  menuIcon: {
    color: Colors.text,
    fontSize: 28,
    lineHeight: 28,
    marginTop: -2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryHeaderText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  currencyButton: {
    minHeight: 32,
    minWidth: 44,
    borderRadius: Spacing.borderRadius.round,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  currencyButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionBody: {
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  compactEmptyCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.sm,
  },
  compactEmptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  compactEmptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  settleItem: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  settleAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settleAvatarText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  settleMain: {
    flex: 1,
  },
  settleName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  settleBadge: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  badgeOwe: {
    color: Colors.error,
  },
  badgeOwed: {
    color: Colors.success,
  },
  settleRight: {
    alignItems: 'flex-end',
    width: 116,
    gap: 2,
  },
  settleAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  amountOwe: {
    color: Colors.error,
  },
  amountOwed: {
    color: Colors.success,
  },
  budgetCardCompact: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  budgetCompactTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  budgetCompactTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  warningLabel: {
    color: Colors.error,
    fontSize: 11,
    fontWeight: '600',
  },
  budgetCompactAmounts: {
    marginTop: Spacing.xs,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  progressTrackCompact: {
    marginTop: Spacing.sm,
    height: 6,
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  budgetCompactFooter: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  budgetCompactMeta: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
