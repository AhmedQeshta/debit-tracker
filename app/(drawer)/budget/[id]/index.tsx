import { CalculatorModal } from '@/components/calculator/CalculatorModal';
import { BudgetExportModal } from '@/components/export/BudgetExportModal';
import { Actions } from '@/components/ui/Actions';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useBudgetDetail } from '@/hooks/budget/useBudgetDetail';
import { useBudgetExport } from '@/hooks/budget/useBudgetExport';
import { formatResult } from '@/lib/calc';
import { formatCurrency, getDayLabel, getMonthLabel, WARNING_COLOR } from '@/lib/utils';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import {
  ArrowLeft,
  Calculator,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Circle,
  Copy,
  Download,
  Pin,
  Trash2,
} from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

const NEAR_LIMIT_THRESHOLD = 0.8;

export default function BudgetDetail() {
  const {
    budget,
    router,
    itemTitle,
    setItemTitle,
    itemAmount,
    setItemAmount,
    itemType,
    setItemType,
    itemTitleError,
    setItemTitleError,
    itemAmountError,
    setItemAmountError,
    handleAddItem,
    handleDeleteItem,
    rawNetSpent,
    displayNetSpent,
    remaining,
    menuItems,
    menuVisible,
    setMenuVisible,
    showMoreFields,
    setShowMoreFields,
    titleInputRef,
    amountInputRef,
    sortedItems,
    daysUntilReset,
    handleBudgetResetPeriod,
    handleBudgetAmountCopy,
    syncStatus,
    handleRetrySync,
    showCalculator,
    setShowCalculator,
  } = useBudgetDetail();

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

  const displayedMenuItems = useMemo(() => {
    const items = [...menuItems];
    const destructiveIndex = items.findIndex((item) => item.danger);
    const copyItem = {
      icon: <Copy size={18} color={Colors.text} />,
      label: 'Copy Remaining Amount',
      onPress: () => handleBudgetAmountCopy(budget!.id),
    };
    const periodItem = {
      icon: <CalendarDays size={18} color={Colors.text} />,
      label: 'Reset period',
      onPress: () => handleBudgetResetPeriod(budget!.id, budget!.title),
    };
    const exportItem = {
      icon: <Download size={18} color={Colors.text} />,
      label: 'Export budgets',
      onPress: () => openBudgetExportModal({ budgetId: budget!.id }),
    };

    if (destructiveIndex >= 0) {
      items.splice(destructiveIndex, 0, copyItem, periodItem, exportItem);
      return items;
    }

    items.push(copyItem);
    items.push(periodItem);
    items.push(exportItem);
    return items;
  }, [budget, handleBudgetAmountCopy, handleBudgetResetPeriod, menuItems, openBudgetExportModal]);

  if (!budget) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Budget not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }

  // Display math clamps negative net spent to 0 so UI usage never appears negative.
  const usageRatio = budget.totalBudget > 0 ? displayNetSpent / budget.totalBudget : 0;
  const usedPercentage = Math.max(0, Math.round(usageRatio * 100));
  const progressRatio = Math.max(0, Math.min(usageRatio, 1));
  const isOverspent = remaining < 0;
  const isNearLimit = !isOverspent && usageRatio >= NEAR_LIMIT_THRESHOLD;
  const progressColor = isOverspent ? Colors.error : isNearLimit ? WARNING_COLOR : Colors.primary;
  const spentColor = isOverspent ? Colors.error : Colors.text;
  const spendingCount = sortedItems.length;
  const avgSpendPerItem = spendingCount > 0 ? rawNetSpent / spendingCount : 0;
  const lastUpdatedText =
    spendingCount > 0 ? getDayLabel(sortedItems[0].createdAt) : 'No spending yet';
  const getSignedAmountLabel = (amount: number, type?: 'expense' | 'income') => {
    const safeAmount = Math.abs(amount);
    const sign = type === 'income' ? '+' : '-';
    return `${sign} ${formatCurrency(safeAmount, budget.currency)}`;
  };

  return (
    <View style={styles.wrapper}>
      <ScreenContainer>
        <View style={styles.appBar}>
          <TouchableOpacity
            onPress={() => router.push('/(drawer)/(tabs)/budget')}
            style={styles.backButton}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <ArrowLeft size={22} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.appBarTitleWrap}>
            <View style={styles.titleRow}>
              {budget.pinned ? (
                <Pin size={14} color={Colors.primary} fill={Colors.primary} />
              ) : null}
              <Text style={styles.appBarTitle} numberOfLines={1}>
                {budget.title}
              </Text>
            </View>
            <Text style={styles.appBarSubtitle}>
              Monthly {String.fromCharCode(8226)} {getMonthLabel(Date.now())}
            </Text>
          </View>
        </View>

        <View style={styles.overviewCard}>
          <View style={styles.overviewHeaderRow}>
            <Text style={styles.overviewMainLine}>
              <Text style={[styles.overviewMainValue, { color: spentColor }]}>Net spent </Text>
              <Text style={[styles.overviewMainValue, { color: spentColor }]}>
                {formatCurrency(displayNetSpent, budget.currency)}
              </Text>
              <Text style={styles.overviewMainLineMuted}> of </Text>
              <Text style={styles.overviewMainValue}>
                {formatCurrency(budget.totalBudget, budget.currency)}
              </Text>
            </Text>

            <View style={styles.overviewActions}>
              <Actions
                menuVisible={menuVisible}
                setMenuVisible={setMenuVisible}
                menuItems={displayedMenuItems}
              />
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressRatio * 100}%`, backgroundColor: progressColor },
              ]}
            />
          </View>

          <View style={styles.overviewStatsRow}>
            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatLabel}>
                {isOverspent ? 'Overspent' : 'Remaining'}
              </Text>
              <Text
                style={[
                  styles.overviewStatValue,
                  isOverspent
                    ? styles.overspentValue
                    : isNearLimit
                      ? styles.warningValue
                      : styles.remainingValue,
                ]}>
                {isOverspent
                  ? `${formatCurrency(Math.abs(remaining), budget.currency)} over`
                  : `${formatCurrency(remaining, budget.currency)} left`}
              </Text>
            </View>

            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatLabel}>Used</Text>
              <Text style={styles.overviewStatValue}>{usedPercentage}%</Text>
            </View>

            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatLabel}>Resets in</Text>
              <Text style={styles.overviewStatValue}>{daysUntilReset} days</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailInfoCard}>
          <Text style={styles.detailInfoTitle}>Budget details</Text>

          <View style={styles.detailInfoRow}>
            <Text style={styles.detailInfoLabel}>Currency</Text>
            <Text style={styles.detailInfoValue}>{budget.currency}</Text>
          </View>

          <View style={styles.detailInfoRow}>
            <Text style={styles.detailInfoLabel}>Items tracked</Text>
            <Text style={styles.detailInfoValue}>{spendingCount}</Text>
          </View>

          <View style={styles.detailInfoRow}>
            <Text style={styles.detailInfoLabel}>Average per item</Text>
            <Text style={styles.detailInfoValue}>
              {formatCurrency(avgSpendPerItem, budget.currency)}
            </Text>
          </View>

          <View style={styles.detailInfoRow}>
            <Text style={styles.detailInfoLabel}>Last update</Text>
            <Text style={styles.detailInfoValue}>{lastUpdatedText}</Text>
          </View>
        </View>

        <View style={styles.quickAddCard}>
          <View style={styles.quickAddHeaderRow}>
            <Text style={styles.sectionTitle}>Quick Add</Text>
            <TouchableOpacity
              onPress={() => setShowMoreFields((prev) => !prev)}
              style={styles.moreButton}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={showMoreFields ? 'Hide more fields' : 'Show more fields'}>
              <Text style={styles.moreButtonText}>More</Text>
              {showMoreFields ? (
                <ChevronUp size={16} color={Colors.textSecondary} />
              ) : (
                <ChevronDown size={16} color={Colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.quickAddRow}>
            <View style={styles.typeToggleWrap}>
              <TouchableOpacity
                style={[
                  styles.typeToggleButton,
                  itemType === 'expense' ? styles.typeToggleButtonActive : null,
                ]}
                onPress={() => setItemType('expense')}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Expense minus type">
                <Text
                  style={[
                    styles.typeToggleButtonText,
                    itemType === 'expense' ? styles.typeToggleButtonTextActive : null,
                  ]}>
                  Expense (-)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeToggleButton,
                  itemType === 'income' ? styles.typeToggleButtonActive : null,
                ]}
                onPress={() => setItemType('income')}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Income plus type">
                <Text
                  style={[
                    styles.typeToggleButtonText,
                    itemType === 'income' ? styles.typeToggleButtonTextActive : null,
                  ]}>
                  Income (+)
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              ref={titleInputRef}
              style={[
                styles.quickInput,
                styles.quickTitleInput,
                itemTitleError ? styles.quickInputError : null,
              ]}
              value={itemTitle}
              onChangeText={(text) => {
                setItemTitle(text);
                setItemTitleError('');
              }}
              placeholder="Item title"
              placeholderTextColor={Colors.textSecondary}
              accessibilityLabel="Spending item title"
            />

            <View style={styles.amountInputRow}>
              <TextInput
                ref={amountInputRef}
                style={[
                  styles.quickInput,
                  styles.quickAmountInput,
                  itemAmountError ? styles.quickInputError : null,
                ]}
                value={itemAmount}
                onChangeText={(text) => {
                  setItemAmount(text);
                  setItemAmountError('');
                }}
                placeholder={`${budget.currency} 0.00`}
                placeholderTextColor={Colors.textSecondary}
                keyboardType="decimal-pad"
                accessibilityLabel="Spending amount"
              />

              <TouchableOpacity
                style={styles.calcButton}
                onPress={() => setShowCalculator(true)}
                accessibilityRole="button"
                accessibilityLabel="Open calculator">
                <Calculator size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddItem}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Add item">
              <Text style={styles.addButtonText}>Add item</Text>
            </TouchableOpacity>
          </View>

          {itemTitleError ? <Text style={styles.validationError}>{itemTitleError}</Text> : null}
          {!itemTitleError && itemAmountError ? (
            <Text style={styles.validationError}>{itemAmountError}</Text>
          ) : null}

          {showMoreFields ? (
            <View style={styles.moreFieldsPanel}>
              <Text style={styles.moreFieldsText}>Date: auto set to today</Text>
              <Text style={styles.moreFieldsText}>Category and note fields are coming soon.</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Budget items</Text>
            <Text style={styles.sectionCount}>{sortedItems.length}</Text>
          </View>

          {sortedItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No budget items added yet</Text>
              <Text style={styles.emptyText}>
                Track your first expense or income to start seeing progress.
              </Text>
              <TouchableOpacity
                style={styles.emptyCtaButton}
                onPress={() => titleInputRef.current?.focus()}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Add your first item">
                <Text style={styles.emptyCtaText}>Add your first item</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.spendingList}>
              {sortedItems.map((item) => {
                const showSyncFailed = item.synced === false && syncStatus === 'error';
                const showSyncPill = item.synced === false && !showSyncFailed;

                return (
                  <Swipeable
                    key={item.id}
                    renderRightActions={() => (
                      <TouchableOpacity
                        style={styles.swipeDeleteAction}
                        onPress={() => handleDeleteItem(item.id, item.title)}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel={`Delete ${item.title}`}>
                        <Trash2 size={16} color={Colors.error} />
                        <Text style={styles.swipeDeleteText}>Delete</Text>
                      </TouchableOpacity>
                    )}
                    overshootRight={false}
                    rightThreshold={28}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.spendingRow,
                        pressed && styles.spendingRowPressed,
                      ]}
                      onPress={() =>
                        item.transactionId
                          ? router.push(`/(drawer)/transaction/${item.transactionId}/edit`)
                          : undefined
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`${item.title}, ${formatCurrency(item.amount, budget.currency)}`}>
                      <View style={styles.rowDotWrap}>
                        <Circle size={10} color={Colors.primary} fill={Colors.primary} />
                      </View>

                      <View style={styles.rowMiddle}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.rowMeta} numberOfLines={1}>
                          {getDayLabel(item.createdAt)}
                        </Text>
                        {item.transactionId ? (
                          <Text style={styles.rowMeta} numberOfLines={1}>
                            From transaction
                          </Text>
                        ) : null}
                      </View>

                      <View style={styles.rowRight}>
                        <Text
                          style={[
                            styles.rowAmount,
                            item.type === 'income'
                              ? styles.rowAmountIncome
                              : styles.rowAmountExpense,
                          ]}>
                          {getSignedAmountLabel(item.amount, item.type)}
                        </Text>
                        {showSyncPill ? (
                          <View style={styles.pendingPill}>
                            <Text style={styles.pendingPillText}>Pending sync</Text>
                          </View>
                        ) : null}
                        {showSyncFailed ? (
                          <TouchableOpacity
                            style={styles.failedPill}
                            onPress={handleRetrySync}
                            activeOpacity={0.8}
                            accessibilityRole="button"
                            accessibilityLabel="Retry syncing this item">
                            <Text style={styles.failedPillText}>Sync failed • Retry</Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </Pressable>
                  </Swipeable>
                );
              })}
            </View>
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

        <CalculatorModal
          visible={showCalculator}
          initialValue={itemAmount}
          onClose={() => setShowCalculator(false)}
          onConfirm={(result) => {
            setItemAmount(formatResult(result));
            setItemAmountError('');
            requestAnimationFrame(() => amountInputRef.current?.focus());
          }}
        />
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  appBarTitleWrap: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  appBarTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
    flexShrink: 1,
  },
  appBarSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  overviewCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  overviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  overviewMainLine: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    flex: 1,
  },
  overviewActions: {
    width: 40,
    height: 40,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewMainValue: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  overviewMainLineMuted: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Spacing.borderRadius.round,
  },
  overviewStatsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  overviewStatItem: {
    flex: 1,
  },
  overviewStatLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  overviewStatValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  remainingValue: {
    color: Colors.success,
  },
  warningValue: {
    color: WARNING_COLOR,
  },
  overspentValue: {
    color: Colors.error,
  },
  detailInfoCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  detailInfoTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  detailInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  detailInfoLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  detailInfoValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  quickAddCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  quickAddHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: 36,
    paddingHorizontal: Spacing.sm,
  },
  moreButtonText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  quickAddRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeToggleWrap: {
    width: '100%',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  typeToggleButton: {
    flex: 1,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  typeToggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  typeToggleButtonText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  typeToggleButtonTextActive: {
    color: Colors.background,
  },
  quickInput: {
    minHeight: 44,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.input,
    color: Colors.text,
    paddingHorizontal: Spacing.sm,
    fontSize: 14,
  },
  quickTitleInput: {
    flex: 1,
  },
  quickAmountInput: {
    width: 108,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  calcButton: {
    width: 42,
    height: 42,
    borderRadius: Spacing.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  quickInputError: {
    borderColor: Colors.error,
  },
  addButton: {
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  addButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  validationError: {
    color: Colors.error,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  moreFieldsPanel: {
    marginTop: Spacing.sm,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    gap: 2,
  },
  moreFieldsText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionCount: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  spendingList: {
    gap: Spacing.xs,
  },
  spendingRow: {
    minHeight: 70,
    backgroundColor: Colors.card,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  spendingRowPressed: {
    opacity: 0.9,
  },
  rowDotWrap: {
    width: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  rowMiddle: {
    flex: 1,
  },
  rowTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  rowMeta: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },
  rowRight: {
    alignItems: 'flex-end',
    minWidth: 92,
    marginLeft: Spacing.sm,
  },
  rowAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowAmountIncome: {
    color: Colors.success,
  },
  rowAmountExpense: {
    color: Colors.text,
  },
  pendingPill: {
    marginTop: 5,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.round,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pendingPillText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  failedPill: {
    marginTop: 5,
    backgroundColor: Colors.error + '20',
    borderRadius: Spacing.borderRadius.round,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  failedPillText: {
    color: Colors.error,
    fontSize: 10,
    fontWeight: '700',
  },
  swipeDeleteAction: {
    marginVertical: 2,
    marginLeft: Spacing.sm,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: Colors.surface,
    minWidth: 92,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  swipeDeleteText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyCtaButton: {
    marginTop: Spacing.xs,
    minHeight: 44,
    borderRadius: Spacing.borderRadius.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCtaText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  errorText: {
    color: Colors.error,
    fontSize: 18,
    marginBottom: Spacing.lg,
  },
});
