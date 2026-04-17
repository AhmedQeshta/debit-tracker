import { Actions } from '@/components/ui/Actions';
import { formatCurrency } from '@/lib/utils';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { HomeBudgetOverviewCardProps } from '@/types/budget';
import { IMenuItem } from '@/types/common';
import { CalendarDays, Copy, Download, Pencil, Pin, PinOff, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const HomeBudgetOverviewCard = ({
  budget,
  spent,
  progress,
  warningLabel,
  onOpen,
  onEdit,
  onPinToggle,
  onDelete,
  onExportBudget,
  onCopyRemaining,
  onResetPeriod,
}: HomeBudgetOverviewCardProps) => {
  const { t } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);
  const remaining = budget.totalBudget - spent;
  const progressColor = progress >= 1 ? Colors.error : Colors.primary;

  const menuItems = useMemo<IMenuItem[]>(
    () => [
      {
        icon: <Copy size={18} color={Colors.text} />,
        label: t('budgetCard.menu.copyRemainingAmount'),
        onPress: () => onCopyRemaining(remaining, budget.currency),
      },

      {
        icon: budget.pinned ? (
          <PinOff size={18} color={Colors.text} />
        ) : (
          <Pin size={18} color={Colors.text} />
        ),
        label: budget.pinned ? t('budgetCard.menu.unpinBudget') : t('budgetCard.menu.pinBudget'),
        onPress: () => onPinToggle(budget.id),
      },

      {
        icon: <CalendarDays size={18} color={Colors.text} />,
        label: t('budgetCard.menu.resetPeriod'),
        onPress: () => onResetPeriod(budget.id, budget.title),
      },
      {
        icon: <Download size={18} color={Colors.text} />,
        label: t('budgetCard.menu.exportBudgets'),
        onPress: () => onExportBudget?.(budget.id),
      },
      {
        icon: <Pencil size={18} color={Colors.text} />,
        label: t('budgetCard.menu.editBudget'),
        onPress: () => onEdit(budget.id),
      },
      {
        icon: <Trash2 size={18} color={Colors.error} />,
        label: t('budgetCard.menu.deleteBudget'),
        onPress: () => onDelete(budget.id, budget.title),
        danger: true,
      },
    ],
    [
      budget,
      onResetPeriod,
      onExportBudget,
      onCopyRemaining,
      onDelete,
      onEdit,
      onPinToggle,
      remaining,
    ],
  );

  return (
    <Pressable style={styles.budgetCardCompact} onPress={() => onOpen(budget.id)}>
      <View style={styles.budgetCompactTopRow}>
        <View style={styles.budgetTitleWrap}>
          {budget.pinned ? <Pin size={12} color={Colors.primary} fill={Colors.primary} /> : null}
          <Text style={styles.budgetCompactTitle} numberOfLines={1}>
            {budget.title}
          </Text>
        </View>
        <Actions menuVisible={menuVisible} setMenuVisible={setMenuVisible} menuItems={menuItems} />
      </View>

      <Text style={styles.budgetCompactAmounts} numberOfLines={1}>
        {formatCurrency(spent, budget.currency)} /{' '}
        {formatCurrency(budget.totalBudget, budget.currency)}
      </Text>

      <View style={styles.progressTrackCompact}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: progressColor },
          ]}
        />
      </View>

      <View style={styles.budgetCompactFooter}>
        {warningLabel ? <Text style={styles.warningLabel}>{warningLabel}</Text> : <View />}
        <Text style={styles.budgetCompactMeta}>
          {remaining >= 0
            ? t('budgetCard.status.left', { amount: formatCurrency(remaining, budget.currency) })
            : t('budgetDetail.overview.overAmount', {
                amount: formatCurrency(Math.abs(remaining), budget.currency),
              })}
        </Text>
      </View>
    </Pressable>
  );
};

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
