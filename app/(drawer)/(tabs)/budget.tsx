import { BudgetCard } from '@/components/budget/BudgetCard';
import { RenderBudgetSkeleton } from '@/components/budget/RenderBudgetSkeleton';
import { BudgetExportModal } from '@/components/export/BudgetExportModal';
import { EmptySection } from '@/components/ui/EmptySection';
import NavigateTo from '@/components/ui/NavigateTo';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useBudgetExport } from '@/hooks/budget/useBudgetExport';
import { useBudgetList } from '@/hooks/budget/useBudgetList';
import { getNextSortKey, SORT_LABELS, WARNING_COLOR } from '@/lib/utils';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Menu, SlidersHorizontal } from 'lucide-react-native';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BudgetTab() {
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
            accessibilityLabel="Open menu">
            <Menu color={Colors.text} size={20} />
          </TouchableOpacity>

          <View style={styles.titleWrap}>
            <Text style={styles.title}>Budgets</Text>
          </View>

          <TouchableOpacity
            onPress={() => setSortKey((current) => getNextSortKey(current))}
            style={styles.topBarButton}
            accessibilityRole="button"
            accessibilityLabel="Change budget sorting">
            <SlidersHorizontal color={Colors.textSecondary} size={18} />
          </TouchableOpacity>
        </View>

        <View style={styles.controlsRow}>
          <View style={styles.monthChip}>
            <Text style={styles.monthChipText}>{monthLabel}</Text>
          </View>
          <Text style={styles.sortLabel}>Sort: {SORT_LABELS[sortKey]}</Text>
        </View>

        <View style={styles.summaryStrip}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Overview</Text>
            <Text style={styles.summaryUsed}>{summary.usedPercent}% used</Text>
          </View>

          <View style={styles.summaryStatsWrap}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total budget</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>
                {summary.totalBudget}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Net spent</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>
                {summary.totalSpent}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Remaining</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>
                {summary.remaining}
              </Text>
            </View>
          </View>

          <View style={styles.summaryFooter}>
            {summary.hasMixedCurrency ? (
              <Text style={styles.mixedCurrencyHint}>Totals include mixed currencies</Text>
            ) : (
              <Text style={styles.mixedCurrencyHint}>Based on your active budgets</Text>
            )}
            {summary.nearLimitCount > 0 ? (
              <View style={styles.nearLimitPill}>
                <Text style={styles.nearLimitText}>{summary.nearLimitCount} near limit</Text>
              </View>
            ) : null}
          </View>
        </View>

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
                tintColor={Colors.primary}
              />
            }
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptySection
                title="No budgets yet"
                description="Set monthly limits and track spending"
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

const styles = StyleSheet.create({
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
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
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
  },
  monthChipText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  sortLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  summaryStrip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.lg,
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
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  summaryUsed: {
    color: Colors.primary,
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
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  summaryValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  summaryFooter: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  mixedCurrencyHint: {
    color: Colors.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  nearLimitPill: {
    minHeight: 28,
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: WARNING_COLOR + '20',
    paddingHorizontal: Spacing.sm,
    justifyContent: 'center',
  },
  nearLimitText: {
    color: WARNING_COLOR,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    gap: Spacing.sm,
  },
});
