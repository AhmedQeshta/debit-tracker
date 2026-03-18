import { HomeSectionHeader } from '@/components/home/HomeSectionHeader';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { useDashboard } from '@/hooks/useDashboard';
import { useSummaryCurrency } from '@/hooks/useSummaryCurrency';
import { formatCurrency, RANGE_OPTIONS } from '@/lib/utils';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { useRouter } from 'expo-router';
import { Menu, Settings, Wifi, WifiOff } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Dashboard() {
  const { summaryCurrency, summaryCurrencyLabel, handleSummaryCurrencyToggle } =
    useSummaryCurrency();
  const {
    friends,
    queueSize,
    isOnline,
    youOwe,
    owedToYou,
    netBalance,
    trendText,
    selectedRange,
    setSelectedRange,
    rangeLabel,
    peopleYouOwe,
    peopleWhoOweYou,
    budgetsNearLimit,
    budgetSnapshot,
    activeBudgetCount,
    isFreshState,
  } = useDashboard(summaryCurrency);
  const { openDrawer } = useDrawerContext();
  const router = useRouter();

  const insightItems: { label: string; value: string; emphasize?: boolean }[] = [
    { label: 'Total friends', value: String(friends.length) },
    { label: 'Pending syncs', value: String(queueSize), emphasize: queueSize > 0 },
  ];

  const handleRangeChipPress = () => {
    const currentIndex = RANGE_OPTIONS.findIndex((range) => range.key === selectedRange);
    const nextIndex = currentIndex === RANGE_OPTIONS.length - 1 ? 0 : currentIndex + 1;
    setSelectedRange(RANGE_OPTIONS[nextIndex].key);
  };

  if (activeBudgetCount > 0) {
    insightItems.push({
      label: 'Budgets near limit',
      value: String(budgetsNearLimit),
      emphasize: budgetsNearLimit > 0,
    });
  }

  return (
    <ScreenContainer>
      <View style={styles.appBar}>
        <View style={styles.titleRow}>
          {openDrawer ? (
            <Pressable onPress={openDrawer} style={styles.iconButton} hitSlop={8}>
              <Menu size={20} color={Colors.text} />
            </Pressable>
          ) : null}
          <Text style={styles.title}>Dashboard</Text>
        </View>

        <View style={styles.appBarActions}>
          <Pressable style={styles.rangeChip} onPress={handleRangeChipPress}>
            <Text style={styles.rangeChipText}>{rangeLabel}</Text>
          </Pressable>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.push('/(drawer)/(tabs)/settings')}
            hitSlop={8}>
            <Settings size={20} color={Colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.topMetaRow}>
        <View style={styles.statusPill}>
          {isOnline ? (
            <Wifi size={13} color={Colors.textSecondary} />
          ) : (
            <WifiOff size={13} color={Colors.textSecondary} />
          )}
          <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View>

        <View style={styles.rangeSelectorRow}>
          {RANGE_OPTIONS.map((range) => (
            <Pressable
              key={range.key}
              onPress={() => setSelectedRange(range.key)}
              style={[
                styles.rangeSelectorItem,
                selectedRange === range.key ? styles.rangeSelectorItemActive : null,
              ]}>
              <Text
                style={[
                  styles.rangeSelectorText,
                  selectedRange === range.key ? styles.rangeSelectorTextActive : null,
                ]}>
                {range.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.summaryCard}>
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

        <Text style={styles.summaryLabel}>Net balance</Text>
        <Text style={styles.summaryValue}>
          {formatCurrency(Math.abs(netBalance), summaryCurrency)}
        </Text>
        <Text style={styles.summaryDirection}>
          {netBalance > 0
            ? 'You are owed more overall'
            : netBalance < 0
              ? 'You owe more overall'
              : 'All settled'}
        </Text>

        <View style={styles.summaryBreakdownRow}>
          <View style={styles.summaryBreakdownItem}>
            <Text style={styles.breakdownLabel}>You owe</Text>
            <Text style={[styles.breakdownValue, { color: Colors.error }]}>
              {formatCurrency(youOwe, summaryCurrency)}
            </Text>
          </View>

          <View style={styles.summaryBreakdownDivider} />

          <View style={styles.summaryBreakdownItem}>
            <Text style={styles.breakdownLabel}>Owed to you</Text>
            <Text style={[styles.breakdownValue, { color: Colors.success }]}>
              {formatCurrency(owedToYou, summaryCurrency)}
            </Text>
          </View>
        </View>

        <Text style={styles.trendLabel}>{trendText}</Text>
      </View>

      <View style={styles.quickInsightsRow}>
        {insightItems.map((item) => (
          <View key={item.label} style={styles.insightChip}>
            <Text style={styles.insightLabel}>{item.label}</Text>
            <Text
              style={[styles.insightValue, item.emphasize ? styles.insightValueEmphasized : null]}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>

      {isFreshState ? (
        <View style={styles.getStartedCard}>
          <Text style={styles.getStartedTitle}>Get started</Text>
          <Text style={styles.getStartedText}>
            Track debt, transactions, and budgets in a few taps.
          </Text>

          <View style={styles.getStartedActions}>
            <TouchableOpacity
              style={styles.getStartedAction}
              onPress={() => router.push('/(drawer)/friend/new')}
              activeOpacity={0.8}>
              <Text style={styles.getStartedActionText}>1. Add friend</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.getStartedAction}
              onPress={() => router.push('/(drawer)/transaction/new')}
              activeOpacity={0.8}>
              <Text style={styles.getStartedActionText}>2. Add transaction</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.getStartedAction}
              onPress={() => router.push('/(drawer)/budget/new')}
              activeOpacity={0.8}>
              <Text style={styles.getStartedActionText}>3. Create budget (optional)</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <HomeSectionHeader
        title="Settle Up"
        seeAllLabel="See all"
        onSeeAll={() => router.push('/friends')}
      />

      <View style={styles.sectionCard}>
        <Text style={styles.listTitle}>People you owe</Text>
        {peopleYouOwe.length === 0 ? (
          <Text style={styles.emptyText}>No debts to settle.</Text>
        ) : (
          peopleYouOwe.map((item) => (
            <View key={`owe-${item.friend.id}`} style={styles.settleRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.friend.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.settleMain}>
                <Text style={styles.settleName} numberOfLines={1}>
                  {item.friend.name}
                </Text>
                <Text style={[styles.settleAmount, { color: Colors.error }]}>
                  {formatCurrency(Math.abs(item.balance), item.friend.currency || '$')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.rowActionButton}
                onPress={() => router.push(`/(drawer)/transaction/new?friendId=${item.friend.id}`)}
                activeOpacity={0.8}>
                <Text style={styles.rowActionLabel}>Settle</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={styles.listDivider} />

        <Text style={styles.listTitle}>People who owe you</Text>
        {peopleWhoOweYou.length === 0 ? (
          <Text style={styles.emptyText}>No incoming settlements right now.</Text>
        ) : (
          peopleWhoOweYou.map((item) => (
            <View key={`owed-${item.friend.id}`} style={styles.settleRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.friend.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.settleMain}>
                <Text style={styles.settleName} numberOfLines={1}>
                  {item.friend.name}
                </Text>
                <Text style={[styles.settleAmount, { color: Colors.success }]}>
                  {formatCurrency(item.balance, item.friend.currency || '$')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.rowActionButton}
                onPress={() => router.push(`/(drawer)/friend/${item.friend.id}`)}
                activeOpacity={0.8}>
                <Text style={styles.rowActionLabel}>View</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {activeBudgetCount > 0 ? (
        <>
          <HomeSectionHeader
            title="Budget Snapshot"
            seeAllLabel="See all budgets"
            onSeeAll={() => router.push('/budget')}
          />

          <View style={styles.sectionCard}>
            {budgetSnapshot.map((item) => {
              const progress = Math.min(Math.max(item.percentUsed, 0), 100);

              return (
                <Pressable
                  key={item.budget.id}
                  onPress={() => router.push(`/(drawer)/budget/${item.budget.id}`)}
                  style={styles.budgetRow}>
                  <View style={styles.budgetHeaderRow}>
                    <Text style={styles.budgetTitle} numberOfLines={1}>
                      {item.budget.title}
                    </Text>
                    <Text style={styles.budgetUsage}>{Math.round(item.percentUsed)}% used</Text>
                  </View>

                  <Text style={styles.budgetAmountLine}>
                    Spent {formatCurrency(item.spent, item.budget.currency)} of{' '}
                    {formatCurrency(item.budget.totalBudget, item.budget.currency)}
                  </Text>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${progress}%`,
                          backgroundColor: item.percentUsed >= 100 ? Colors.error : Colors.primary,
                        },
                      ]}
                    />
                  </View>

                  <Text
                    style={[
                      styles.remainingText,
                      { color: item.remaining < 0 ? Colors.error : Colors.textSecondary },
                    ]}>
                    {item.remaining < 0
                      ? `Overspent by ${formatCurrency(Math.abs(item.remaining), item.budget.currency)}`
                      : `${formatCurrency(item.remaining, item.budget.currency)} remaining`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      <View style={styles.insightInlineNotice}>
        <Text style={styles.insightInlineText}>Insights chart is coming soon.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: Spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rangeChip: {
    minHeight: 44,
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  rangeChipText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  topMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 30,
    borderRadius: Spacing.borderRadius.round,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    gap: 4,
    backgroundColor: Colors.surface,
  },
  statusText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  rangeSelectorRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.md,
    padding: 2,
  },
  rangeSelectorItem: {
    minHeight: 30,
    minWidth: 72,
    borderRadius: Spacing.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  rangeSelectorItemActive: {
    backgroundColor: Colors.primary,
  },
  rangeSelectorText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  rangeSelectorTextActive: {
    color: Colors.background,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
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
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  summaryValue: {
    color: Colors.text,
    fontSize: 34,
    fontWeight: '800',
    marginTop: 2,
  },
  summaryDirection: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  summaryBreakdownRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  summaryBreakdownItem: {
    flex: 1,
    padding: Spacing.sm,
  },
  summaryBreakdownDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  breakdownLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  trendLabel: {
    marginTop: Spacing.sm,
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  quickInsightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  insightChip: {
    flexGrow: 1,
    minWidth: '30%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  insightLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  insightValue: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  insightValueEmphasized: {
    color: Colors.primary,
  },
  getStartedCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  getStartedTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  getStartedText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  getStartedActions: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  getStartedAction: {
    minHeight: 44,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  getStartedActionText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.md,
  },
  listTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
  settleRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: Spacing.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  avatarText: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  settleMain: {
    flex: 1,
  },
  settleName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  settleAmount: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  rowActionButton: {
    minHeight: 44,
    minWidth: 70,
    paddingHorizontal: Spacing.sm,
    borderRadius: Spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  rowActionLabel: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  listDivider: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  budgetRow: {
    marginBottom: Spacing.md,
  },
  budgetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  budgetTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: Spacing.sm,
  },
  budgetUsage: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  budgetAmountLine: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
  progressTrack: {
    height: 8,
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: Spacing.borderRadius.round,
  },
  remainingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  insightInlineNotice: {
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  insightInlineText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});
