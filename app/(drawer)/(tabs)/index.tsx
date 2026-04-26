import { BudgetExportModal } from '@/components/export/BudgetExportModal';
import { HomeBudgetOverviewCard } from '@/components/home/HomeBudgetOverviewCard';
import { HomeGetStartedCard } from '@/components/home/HomeGetStartedCard';
import { HomeQuickActions } from '@/components/home/HomeQuickActions';
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader';
import { TransactionItem } from '@/components/transaction/TransactionItem';
import { Button } from '@/components/ui/Button';
import { EmptySection } from '@/components/ui/EmptySection';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/contexts/ThemeContext';
import { useBudgetExport } from '@/hooks/budget/useBudgetExport';
import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { useCopyAmount } from '@/hooks/useCopyAmount';
import { useHome } from '@/hooks/useHome';
import { useSummaryCurrency } from '@/hooks/useSummaryCurrency';
import { formatAbsoluteCurrency, formatCurrency } from '@/lib/utils';
import { Spacing } from '@/theme/spacing';
import { useRouter } from 'expo-router';
import { Menu, Pin, Settings } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Home() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { summaryCurrency, summaryCurrencyLabel, handleSummaryCurrencyToggle } =
    useSummaryCurrency();
  const {
    settleUpPeople,
    recentTransactions,
    budgetsOverview,
    isFreshState,
    navigateToTransactionEdit,
    handleTransactionDelete,
    handleBudgetPinToggle,
    handleBudgetDelete,
    navigateToBudgetEdit,
    handleBudgetResetPeriod,
    navigateToCreateBudget,
    navigateToCreateFriend,
    handleAddTransactionPress,
    handleSettleUp,
    isSettlingFriend,
    canSettleFriend,
    summaryStats,
  } = useHome(summaryCurrency);
  const { openDrawer } = useDrawerContext();
  const { handleCopyAmount } = useCopyAmount();
  const {
    visible,
    isExporting,
    format,
    setFormat,
    includeBudgetItems,
    setIncludeBudgetItems,
    scopeMode,
    setScopeMode,
    canUseSelectedScope,
    openBudgetExportModal,
    closeBudgetExportModal,
    exportBySaving,
    exportBySharing,
  } = useBudgetExport();

  const netTone =
    summaryStats.netBalance > 0
      ? styles.positive
      : summaryStats.netBalance < 0
        ? styles.negative
        : styles.neutral;

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Pressable onPress={openDrawer} style={styles.iconButton} hitSlop={8}>
            <Menu size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{t('home.title')}</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push('/(drawer)/(tabs)/settings')}
            style={styles.iconButton}
            hitSlop={8}>
            <Settings size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryHeaderText}>
            {t('home.summary.title', { currencyLabel: summaryCurrencyLabel })}
          </Text>
          <Pressable
            style={styles.currencyButton}
            onPress={handleSummaryCurrencyToggle}
            accessibilityRole="button"
            accessibilityLabel={t('home.summary.accessibility.changeCurrencyLabel')}
            accessibilityHint={t('home.summary.accessibility.changeCurrencyHint')}>
            <Text style={styles.currencyButtonText}>{summaryCurrency}</Text>
          </Pressable>
        </View>
        <View style={styles.summaryStatsWrap}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('home.summary.labels.friends')}</Text>
            <Text style={styles.summaryValue}>{summaryStats.totalFriends}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('money.labels.youOwe')}</Text>
            <Text style={[styles.summaryValue, styles.negative]}>
              {formatCurrency(summaryStats.youOweTotal, summaryCurrency)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('money.labels.owedToYou')}</Text>
            <Text style={[styles.summaryValue, styles.positive]}>
              {formatCurrency(summaryStats.owedToYouTotal, summaryCurrency)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('home.summary.labels.settled')}</Text>
            <Text style={styles.summaryValue}>{summaryStats.settledCount}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('home.summary.labels.net')}</Text>
            <Text style={[styles.summaryValue, netTone]}>
              {formatCurrency(summaryStats.netBalance, summaryCurrency)}
            </Text>
          </View>
        </View>
      </View>

      <HomeSectionHeader title={t('home.sections.quickActions')} />
      <HomeQuickActions
        onAddTransaction={handleAddTransactionPress}
        onAddFriend={navigateToCreateFriend}
        onCreateBudget={navigateToCreateBudget}
      />

      <HomeSectionHeader
        title={t('home.sections.budgetsOverview')}
        seeAllLabel={t('home.actions.seeAll')}
        onSeeAll={() => router.push('/budget')}
      />
      <View style={styles.sectionBody}>
        {budgetsOverview.length === 0 ? (
          <View style={styles.compactEmptyCard}>
            <EmptySection
              title={t('home.emptyStates.budgets.title')}
              description={t('home.emptyStates.budgets.description')}
              icon="budgets"
            />
            <Button title={t('home.actions.createBudget')} onPress={navigateToCreateBudget} />
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
              onEdit={navigateToBudgetEdit}
              onPinToggle={handleBudgetPinToggle}
              onDelete={handleBudgetDelete}
              onExportBudget={(id) => openBudgetExportModal({ budgetId: id })}
              onCopyRemaining={(remaining, currency) => handleCopyAmount(remaining, currency)}
              onResetPeriod={handleBudgetResetPeriod}
            />
          ))
        )}
      </View>

      <BudgetExportModal
        visible={visible}
        loading={isExporting}
        format={format}
        onChangeFormat={setFormat}
        includeBudgetItems={includeBudgetItems}
        onChangeIncludeBudgetItems={setIncludeBudgetItems}
        scopeMode={scopeMode}
        onChangeScopeMode={setScopeMode}
        canUseSelectedScope={canUseSelectedScope}
        onClose={closeBudgetExportModal}
        onSaveToDevice={exportBySaving}
        onShare={exportBySharing}
      />

      {isFreshState ? (
        <HomeGetStartedCard
          onAddFriend={navigateToCreateFriend}
          onAddTransaction={handleAddTransactionPress}
          onCreateBudget={navigateToCreateBudget}
        />
      ) : null}

      <HomeSectionHeader
        title={t('home.sections.settleUp')}
        seeAllLabel={t('home.actions.seeAll')}
        onSeeAll={() => router.push('/friends')}
      />
      <View style={styles.sectionBody}>
        {settleUpPeople.length === 0 ? (
          <View style={styles.compactEmptyCard}>
            <Text style={styles.compactEmptyTitle}>{t('home.emptyStates.settle.title')}</Text>
            <Text style={styles.compactEmptyText}>{t('home.emptyStates.settle.description')}</Text>
            <Button title={t('home.actions.addFriend')} onPress={navigateToCreateFriend} />
          </View>
        ) : (
          settleUpPeople.map((item) => {
            const isYouOwe = item.balance < 0;
            const badgeText = isYouOwe
              ? t('money.labels.youOwe')
              : t('home.settle.badges.theyOweYou');
            const isSettling = isSettlingFriend(item.friend.id);
            const canSettle = canSettleFriend(item.friend.id);

            return (
              <Pressable
                key={item.friend.id}
                style={styles.settleItem}
                onPress={() => router.push(`/(drawer)/friend/${item.friend.id}`)}>
                <View style={styles.settleAvatar}>
                  <Text style={styles.settleAvatarText}>
                    {item.friend.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.settleMain}>
                  <View style={styles.settleNameRow}>
                    {item.friend.pinned ? (
                      <Pin size={12} color={colors.accent} fill={colors.accent} />
                    ) : null}
                    <Text style={styles.settleName} numberOfLines={1}>
                      {item.friend.name}
                    </Text>
                  </View>
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
                    title={canSettle ? t('home.actions.settleUp') : t('home.actions.settled')}
                    variant="outline"
                    onPress={() => handleSettleUp(item.friend.id, item.friend.name)}
                    loading={isSettling}
                    disabled={!canSettle || isSettling}
                  />
                </View>
              </Pressable>
            );
          })
        )}
      </View>

      <HomeSectionHeader
        title={t('home.sections.recentTransactions')}
        seeAllLabel={t('home.actions.seeAll')}
        onSeeAll={() => router.push('/transactions')}
      />
      <View style={styles.sectionBody}>
        {recentTransactions.length === 0 ? (
          <View style={styles.compactEmptyCard}>
            <EmptySection
              title={t('home.emptyStates.transactions.title')}
              description={t('home.emptyStates.transactions.description')}
              icon={'transactions'}
            />
            <Button title={t('home.actions.addTransaction')} onPress={handleAddTransactionPress} />
          </View>
        ) : (
          recentTransactions.map(({ transaction, friend }) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              currency={friend?.currency || '$'}
              onEdit={navigateToTransactionEdit}
              onDelete={handleTransactionDelete}
              onCopyAmount={() => handleCopyAmount(transaction.amount, friend?.currency || '$')}
            />
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

const createStyles = (colors: {
  text: string;
  border: string;
  surface: string;
  surface2: string;
  accent: string;
  card: string;
  textMuted: string;
  success: string;
  danger: string;
}) =>
  StyleSheet.create({
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
      color: colors.text,
      fontSize: 32 / 1.2,
      fontWeight: '800',
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
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    summaryHeaderText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    currencyButton: {
      minHeight: 32,
      minWidth: 44,
      borderRadius: Spacing.borderRadius.round,
      borderWidth: 1,
      borderColor: colors.accent,
      backgroundColor: colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.sm,
    },
    currencyButtonText: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '700',
    },
    summaryRow: {
      marginBottom: Spacing.sm,
      borderRadius: Spacing.borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.sm,
      gap: Spacing.sm,
    },
    summaryStatsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: Spacing.sm,
    },
    summaryItem: {
      width: '32%',
      gap: 2,
    },
    summaryLabel: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '600',
    },
    summaryValue: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    positive: {
      color: colors.success,
    },
    negative: {
      color: colors.danger,
    },
    neutral: {
      color: colors.text,
    },
    sectionBody: {
      marginTop: Spacing.xs,
      gap: Spacing.sm,
    },
    compactEmptyCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Spacing.borderRadius.lg,
      padding: Spacing.sm,
    },
    compactEmptyTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
    },
    compactEmptyText: {
      color: colors.textMuted,
      fontSize: 14,
      marginBottom: Spacing.sm,
    },
    settleItem: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
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
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settleAvatarText: {
      color: colors.accent,
      fontSize: 16,
      fontWeight: '800',
    },
    settleMain: {
      flex: 1,
    },
    settleNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    settleName: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
      flexShrink: 1,
    },
    settleBadge: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: '600',
    },
    badgeOwe: {
      color: colors.danger,
    },
    badgeOwed: {
      color: colors.success,
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
      color: colors.danger,
    },
    amountOwed: {
      color: colors.success,
    },
  });
