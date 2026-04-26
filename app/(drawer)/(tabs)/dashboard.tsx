import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useTheme } from '@/contexts/ThemeContext';
import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { useDashboard } from '@/hooks/useDashboard';
import { useSummaryCurrency } from '@/hooks/useSummaryCurrency';
import { formatCurrency, RANGE_OPTIONS } from '@/lib/utils';
import { Spacing } from '@/theme/spacing';
import { useRouter } from 'expo-router';
import { Menu, Settings, Wifi, WifiOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Dashboard() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { summaryCurrency, summaryCurrencyLabel, handleSummaryCurrencyToggle } =
    useSummaryCurrency();
  const {
    isOnline,
    summaryStats,
    selectedRange,
    setSelectedRange,
    peopleYouOwe,
    peopleWhoOweYou,
    budgetSnapshot,
    activeBudgetCount,
    isFreshState,
    insightItems,
    handleRangeChipPress,
  } = useDashboard(summaryCurrency);
  const { openDrawer } = useDrawerContext();
  const router = useRouter();

  const netTone =
    summaryStats.netBalance > 0
      ? styles.positive
      : summaryStats.netBalance < 0
        ? styles.negative
        : styles.neutral;

  return (
    <ScreenContainer>
      <View style={styles.appBar}>
        <View style={styles.titleRow}>
          {openDrawer ? (
            <Pressable
              onPress={openDrawer}
              style={styles.iconButton}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('dashboard.accessibility.openMenu')}>
              <Menu size={20} color={colors.text} />
            </Pressable>
          ) : null}
          <Text style={styles.title}>{t('dashboard.title')}</Text>
        </View>

        <View style={styles.appBarActions}>
          <Pressable
            style={styles.rangeChip}
            onPress={handleRangeChipPress}
            accessibilityRole="button"
            accessibilityLabel={t('dashboard.accessibility.cycleRange')}>
            <Text style={styles.rangeChipText}>{t(`dashboard.rangeOptions.${selectedRange}`)}</Text>
          </Pressable>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.push('/(drawer)/(tabs)/settings')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('dashboard.accessibility.openSettings')}>
            <Settings size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.topMetaRow}>
        <View style={styles.statusPill}>
          {isOnline ? (
            <Wifi size={13} color={colors.textMuted} />
          ) : (
            <WifiOff size={13} color={colors.textMuted} />
          )}
          <Text style={styles.statusText}>
            {isOnline ? t('dashboard.status.online') : t('dashboard.status.offline')}
          </Text>
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
                {t(`dashboard.rangeOptions.${range.key}`)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryHeaderText}>
            {t('dashboard.summary.title', { currencyLabel: summaryCurrencyLabel })}
          </Text>
          <Pressable
            style={styles.currencyButton}
            onPress={handleSummaryCurrencyToggle}
            accessibilityRole="button"
            accessibilityLabel={t('dashboard.summary.accessibility.changeCurrencyLabel')}
            accessibilityHint={t('dashboard.summary.accessibility.changeCurrencyHint')}>
            <Text style={styles.currencyButtonText}>{summaryCurrency}</Text>
          </Pressable>
        </View>

        <View style={styles.summaryStatsWrap}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('dashboard.summary.labels.friends')}</Text>
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
            <Text style={styles.summaryLabel}>{t('dashboard.summary.labels.settled')}</Text>
            <Text style={styles.summaryValue}>{summaryStats.settledCount}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('dashboard.summary.labels.net')}</Text>
            <Text style={[styles.summaryValue, netTone]}>
              {formatCurrency(summaryStats.netBalance, summaryCurrency)}
            </Text>
          </View>
        </View>
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
          <Text style={styles.getStartedTitle}>{t('dashboard.getStarted.title')}</Text>
          <Text style={styles.getStartedText}>{t('dashboard.getStarted.description')}</Text>

          <View style={styles.getStartedActions}>
            <TouchableOpacity
              style={styles.getStartedAction}
              onPress={() => router.push('/(drawer)/friend/new')}
              activeOpacity={0.8}>
              <Text style={styles.getStartedActionText}>{t('dashboard.getStarted.step1')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.getStartedAction}
              onPress={() => router.push('/(drawer)/transaction/new')}
              activeOpacity={0.8}>
              <Text style={styles.getStartedActionText}>{t('dashboard.getStarted.step2')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.getStartedAction}
              onPress={() => router.push('/(drawer)/budget/new')}
              activeOpacity={0.8}>
              <Text style={styles.getStartedActionText}>{t('dashboard.getStarted.step3')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <SectionHeader
        title={t('dashboard.sections.settleUp')}
        actionLabel={t('dashboard.actions.seeAll')}
        onActionPress={() => router.push('/friends')}
      />

      <View style={styles.sectionCard}>
        <Text style={styles.listTitle}>{t('dashboard.settle.peopleYouOwe')}</Text>
        {peopleYouOwe.length === 0 ? (
          <Text style={styles.emptyText}>{t('dashboard.settle.noDebts')}</Text>
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
                <Text style={[styles.settleAmount, { color: colors.danger }]}>
                  {formatCurrency(Math.abs(item.balance), item.friend.currency || '$')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.rowActionButton}
                onPress={() => router.push(`/(drawer)/transaction/new?friendId=${item.friend.id}`)}
                activeOpacity={0.8}>
                <Text style={styles.rowActionLabel}>{t('dashboard.actions.settle')}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={styles.listDivider} />

        <Text style={styles.listTitle}>{t('dashboard.settle.peopleWhoOweYou')}</Text>
        {peopleWhoOweYou.length === 0 ? (
          <Text style={styles.emptyText}>{t('dashboard.settle.noIncoming')}</Text>
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
                <Text style={[styles.settleAmount, { color: colors.success }]}>
                  {formatCurrency(item.balance, item.friend.currency || '$')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.rowActionButton}
                onPress={() => router.push(`/(drawer)/friend/${item.friend.id}`)}
                activeOpacity={0.8}>
                <Text style={styles.rowActionLabel}>{t('dashboard.actions.view')}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {activeBudgetCount > 0 ? (
        <>
          <SectionHeader
            title={t('dashboard.sections.budgetSnapshot')}
            actionLabel={t('dashboard.actions.seeAllBudgets')}
            onActionPress={() => router.push('/budget')}
          />

          <View style={styles.sectionCard}>
            {budgetSnapshot.map((item) => {
              const shownPercentUsed = Math.max(item.percentUsed, 0);
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
                    <Text style={styles.budgetUsage}>
                      {t('dashboard.budget.percentUsed', { percent: Math.round(shownPercentUsed) })}
                    </Text>
                  </View>

                  <Text style={styles.budgetAmountLine}>
                    {t('dashboard.budget.netSpentOf', {
                      spent: formatCurrency(item.spent, item.budget.currency),
                    })}{' '}
                    {formatCurrency(item.budget.totalBudget, item.budget.currency)}
                  </Text>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${progress}%`,
                          backgroundColor: item.percentUsed >= 100 ? colors.danger : colors.accent,
                        },
                      ]}
                    />
                  </View>

                  <Text
                    style={[
                      styles.remainingText,
                      { color: item.remaining < 0 ? colors.danger : colors.textMuted },
                    ]}>
                    {item.remaining < 0
                      ? t('dashboard.budget.overspentBy', {
                          amount: formatCurrency(Math.abs(item.remaining), item.budget.currency),
                        })
                      : t('dashboard.budget.remaining', {
                          amount: formatCurrency(item.remaining, item.budget.currency),
                        })}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      <View style={styles.insightInlineNotice}>
        <Text style={styles.insightInlineText}>{t('dashboard.insightsComingSoon')}</Text>
      </View>
    </ScreenContainer>
  );
}

const createStyles = (colors: {
  text: string;
  textMuted: string;
  surface: string;
  surface2: string;
  border: string;
  accent: string;
  accentSoft: string;
  success: string;
  danger: string;
}) =>
  StyleSheet.create({
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
      color: colors.text,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: Spacing.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rangeChip: {
      minHeight: 44,
      borderRadius: Spacing.borderRadius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      paddingHorizontal: Spacing.md,
    },
    rangeChipText: {
      color: colors.text,
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
      borderColor: colors.border,
      paddingHorizontal: Spacing.sm,
      gap: 4,
      backgroundColor: colors.surface2,
    },
    statusText: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    rangeSelectorRow: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
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
      backgroundColor: colors.accent,
    },
    rangeSelectorText: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    rangeSelectorTextActive: {
      color: colors.surface,
    },
    summaryCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Spacing.borderRadius.lg,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.sm,
      marginBottom: Spacing.md,
      gap: Spacing.sm,
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
    positive: {
      color: colors.success,
    },
    negative: {
      color: colors.danger,
    },
    neutral: {
      color: colors.text,
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Spacing.borderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
    },
    insightLabel: {
      color: colors.textMuted,
      fontSize: 12,
    },
    insightValue: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
      marginTop: 2,
    },
    insightValueEmphasized: {
      color: colors.accent,
    },
    getStartedCard: {
      backgroundColor: colors.surface,
      borderRadius: Spacing.borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
    },
    getStartedTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
    },
    getStartedText: {
      color: colors.textMuted,
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
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.md,
    },
    getStartedActionText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    sectionCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Spacing.borderRadius.lg,
      padding: Spacing.md,
    },
    listTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: Spacing.sm,
    },
    emptyText: {
      color: colors.textMuted,
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
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: Spacing.sm,
    },
    avatarText: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 14,
    },
    settleMain: {
      flex: 1,
    },
    settleName: {
      color: colors.text,
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
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    rowActionLabel: {
      color: colors.accent,
      fontSize: 13,
      fontWeight: '700',
    },
    listDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
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
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
      flex: 1,
      marginRight: Spacing.sm,
    },
    budgetUsage: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    budgetAmountLine: {
      color: colors.textMuted,
      fontSize: 13,
      marginBottom: Spacing.sm,
    },
    progressTrack: {
      height: 8,
      borderRadius: Spacing.borderRadius.round,
      backgroundColor: colors.surface2,
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
      borderTopColor: colors.border,
      paddingTop: Spacing.md,
    },
    insightInlineText: {
      color: colors.textMuted,
      fontSize: 12,
    },
  });
