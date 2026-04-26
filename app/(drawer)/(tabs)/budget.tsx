import { BudgetCard } from '@/components/budget/BudgetCard';
import { RenderBudgetSkeleton } from '@/components/budget/RenderBudgetSkeleton';
import { BudgetExportModal } from '@/components/export/BudgetExportModal';
import { AppCard } from '@/components/ui/AppCard';
import { EmptySection } from '@/components/ui/EmptySection';
import NavigateTo from '@/components/ui/NavigateTo';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/contexts/ThemeContext';
import { useBudgetExport } from '@/hooks/budget/useBudgetExport';
import { useBudgetList } from '@/hooks/budget/useBudgetList';
import { getNextSortKey } from '@/lib/utils';
import { Spacing } from '@/theme/spacing';
import { Menu, SlidersHorizontal } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BudgetTab() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    handlePinToggle,
    handleDelete,
    handleResetPeriod,
    handleRefresh,
    refreshing,
    openDrawer,
    getTotalSpent,
    getRemainingBudget,
    setSortKey,
    sortKey,
    monthLabel,
    summary,
    hydrated,
    displayedBudgets,
    handleBudgetAmountCopy,
  } = useBudgetList();

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

  return (
    <View style={styles.wrapper}>
      <ScreenContainer scrollable={false}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={openDrawer}
            style={styles.topBarButton}
            accessibilityRole="button"
            accessibilityLabel={t('budget.accessibility.openMenu')}>
            <Menu color={colors.text} size={20} />
          </TouchableOpacity>

          <View style={styles.titleWrap}>
            <Text style={styles.title}>{t('budget.title')}</Text>
          </View>

          <TouchableOpacity
            onPress={() => setSortKey((current) => getNextSortKey(current))}
            style={styles.topBarButton}
            accessibilityRole="button"
            accessibilityLabel={t('budget.accessibility.changeSorting')}>
            <SlidersHorizontal color={colors.textMuted} size={18} />
          </TouchableOpacity>
        </View>

        <View style={styles.controlsRow}>
          <View style={styles.monthChip}>
            <Text style={styles.monthChipText}>{monthLabel}</Text>
          </View>
          <Text style={styles.sortLabel}>
            {t('budget.sort.label', { sort: t(`budget.sort.options.${sortKey}`) })}
          </Text>
        </View>

        <AppCard style={styles.summaryStrip}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>{t('budget.summary.overview')}</Text>
            <Text style={styles.summaryUsed}>
              {t('budget.summary.usedPercent', { percent: summary.usedPercent })}
            </Text>
          </View>

          <View style={styles.summaryStatsWrap}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('budget.summary.labels.totalBudget')}</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>
                {summary.totalBudget}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('budget.summary.labels.netSpent')}</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>
                {summary.totalSpent}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('money.labels.remaining')}</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>
                {summary.remaining}
              </Text>
            </View>
          </View>

          <View style={styles.summaryFooter}>
            {summary.hasMixedCurrency ? (
              <Text style={styles.mixedCurrencyHint}>{t('budget.summary.mixedCurrency')}</Text>
            ) : (
              <Text style={styles.mixedCurrencyHint}>{t('budget.summary.activeBudgets')}</Text>
            )}
            {summary.nearLimitCount > 0 ? (
              <View style={styles.nearLimitPill}>
                <Text style={styles.nearLimitText}>
                  {t('budget.summary.nearLimit', { count: summary.nearLimitCount })}
                </Text>
              </View>
            ) : null}
          </View>
        </AppCard>

        {!hydrated ? (
          <RenderBudgetSkeleton />
        ) : (
          <FlatList
            data={displayedBudgets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              return (
                <BudgetCard
                  item={item}
                  handlePinToggle={handlePinToggle}
                  handleDelete={handleDelete}
                  handleResetPeriod={handleResetPeriod}
                  getTotalSpent={getTotalSpent}
                  getRemainingBudget={getRemainingBudget}
                  onCopyAmount={handleBudgetAmountCopy}
                  onExportBudget={(budgetId) => openBudgetExportModal({ budgetId })}
                />
              );
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.accent}
              />
            }
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptySection
                title={t('budget.empty.title')}
                description={t('budget.empty.description')}
                icon="budgets"
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        <NavigateTo navigatePath="/(drawer)/budget/new" />

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
      </ScreenContainer>
    </View>
  );
}

const createStyles = (colors: {
  text: string;
  textMuted: string;
  surface: string;
  surface2: string;
  border: string;
  accent: string;
  warning: string;
  warningSoft: string;
}) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.xs,
      marginBottom: Spacing.sm,
    },
    topBarButton: {
      width: 44,
      height: 44,
      borderRadius: Spacing.borderRadius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleWrap: {
      flex: 1,
      marginLeft: Spacing.sm,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.sm,
    },
    monthChip: {
      minHeight: 36,
      paddingHorizontal: Spacing.md,
      borderRadius: Spacing.borderRadius.round,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface2,
      justifyContent: 'center',
    },
    monthChipText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    sortLabel: {
      color: colors.textMuted,
      fontSize: 12,
    },
    summaryStrip: {
      padding: Spacing.md,
      marginBottom: Spacing.sm,
    },
    summaryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    summaryTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    summaryUsed: {
      color: colors.accent,
      fontSize: 13,
      fontWeight: '700',
    },
    summaryStatsWrap: {
      gap: Spacing.sm,
    },
    summaryItem: {
      minHeight: 44,
      justifyContent: 'center',
    },
    summaryLabel: {
      color: colors.textMuted,
      fontSize: 12,
      marginBottom: 2,
    },
    summaryValue: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    summaryFooter: {
      marginTop: Spacing.sm,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    mixedCurrencyHint: {
      color: colors.textMuted,
      fontSize: 12,
      flex: 1,
    },
    nearLimitPill: {
      minHeight: 28,
      borderRadius: Spacing.borderRadius.round,
      backgroundColor: colors.warningSoft,
      paddingHorizontal: Spacing.sm,
      justifyContent: 'center',
    },
    nearLimitText: {
      color: colors.warning,
      fontSize: 12,
      fontWeight: '600',
    },
    skeletonList: {
      gap: Spacing.sm,
      marginTop: Spacing.sm,
    },
    skeletonRow: {
      height: 116,
      borderRadius: Spacing.borderRadius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    listContent: {
      paddingBottom: 100,
      paddingTop: Spacing.sm,
      paddingHorizontal: Spacing.xs,
      gap: Spacing.sm,
    },
  });
