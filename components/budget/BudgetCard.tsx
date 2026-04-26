import { Actions } from '@/components/ui/Actions';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency } from '@/lib/utils';
import { Spacing } from '@/theme/spacing';
import { IBudgetCardProps } from '@/types/budget';
import { IMenuItem } from '@/types/common';
import { useRouter } from 'expo-router';
import { Copy, Download, Pencil, Pin, PinOff, RotateCcw, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const BudgetCard = ({
  item,
  handlePinToggle,
  handleDelete,
  handleResetPeriod,
  getTotalSpent,
  getRemainingBudget,
  onCopyAmount,
  onExportBudget,
}: IBudgetCardProps) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const totalSpent = getTotalSpent(item.id);
  const remaining = getRemainingBudget(item.id);
  const percentUsed = item.totalBudget > 0 ? (totalSpent / item.totalBudget) * 100 : 0;
  const shownPercentUsed = Math.max(0, percentUsed);
  const progress = Math.min(Math.max(percentUsed, 0), 100);
  const formatAmount = (amount: number) => formatCurrency(amount, item.currency);
  const transactionsCount = item.items.filter((entry) => !entry.deletedAt).length;

  const budgetState =
    percentUsed > 100 ? 'overspent' : percentUsed >= 90 ? 'near-limit' : 'healthy';

  const statusText =
    budgetState === 'overspent'
      ? t('budgetCard.status.overspentBy', { amount: formatAmount(Math.abs(remaining)) })
      : budgetState === 'near-limit'
        ? t('budgetCard.status.nearLimit')
        : t('budgetCard.status.left', { amount: formatAmount(Math.max(remaining, 0)) });

  const statusColor =
    budgetState === 'overspent'
      ? colors.danger
      : budgetState === 'near-limit'
        ? colors.warning
        : colors.success;

  const progressColor = budgetState === 'overspent' ? colors.danger : colors.accent;

  const menuItems: IMenuItem[] = [
    {
      icon: <Copy size={18} color={colors.text} />,
      label: t('budgetCard.menu.copyRemainingAmount'),
      onPress: () => onCopyAmount(item.id),
    },
    {
      icon: item.pinned ? (
        <PinOff size={18} color={colors.text} />
      ) : (
        <Pin size={18} color={colors.text} />
      ),
      label: item.pinned ? t('budgetCard.menu.unpinBudget') : t('budgetCard.menu.pinBudget'),
      onPress: () => handlePinToggle(item.id),
    },
    {
      icon: <RotateCcw size={18} color={colors.text} />,
      label: t('budgetCard.menu.resetPeriod'),
      onPress: () => handleResetPeriod(item.id, item.title),
    },
    {
      icon: <Download size={18} color={colors.text} />,
      label: t('budgetCard.menu.exportBudgets'),
      onPress: () => onExportBudget?.(item.id),
    },
    {
      icon: <Pencil size={18} color={colors.text} />,
      label: t('budgetCard.menu.editBudget'),
      onPress: () => router.push(`/(drawer)/budget/${item.id}/edit`),
    },
    {
      icon: <Trash2 size={18} color={colors.danger} />,
      label: t('budgetCard.menu.deleteBudget'),
      onPress: () => handleDelete(item.id, item.title),
      danger: true,
    },
  ];

  return (
    <TouchableOpacity
      style={styles.budgetCard}
      onPress={() => router.push(`/(drawer)/budget/${item.id}`)}
      activeOpacity={0.7}>
      <View style={styles.budgetHeader}>
        <View style={styles.titleRow}>
          {item.pinned && <Pin size={14} color={colors.accent} fill={colors.accent} />}
          <Text style={styles.budgetTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.archivedAt ? (
            <Text style={styles.archivedBadge}>{t('budgetCard.labels.archived')}</Text>
          ) : null}
        </View>
        <Actions menuVisible={menuVisible} setMenuVisible={setMenuVisible} menuItems={menuItems} />
      </View>

      <Text style={styles.amountLine}>
        {t('budgetCard.labels.netSpent')}{' '}
        <Text style={styles.amountValue}>{formatAmount(totalSpent)}</Text>{' '}
        {t('budgetDetail.overview.of')}{' '}
        <Text style={styles.amountValue}>{formatAmount(item.totalBudget)}</Text>
      </Text>

      <View
        style={styles.progressTrack}
        accessibilityLabel={t('budgetCard.accessibility.usagePercent', {
          percent: Math.round(shownPercentUsed),
        })}>
        <View
          style={[styles.progressFill, { width: `${progress}%`, backgroundColor: progressColor }]}
        />
      </View>

      <View style={styles.budgetFooter}>
        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
        <View style={styles.rightMeta}>
          <Text style={styles.percentUsed}>
            {t('dashboard.budget.percentUsed', { percent: Math.round(shownPercentUsed) })}
          </Text>
          <Text style={styles.transactionsCount}>
            {t('budgetCard.labels.transactionsCount', { count: transactionsCount })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: {
  surface: string;
  border: string;
  text: string;
  textMuted: string;
}) =>
  StyleSheet.create({
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      flex: 1,
    },
    budgetCard: {
      backgroundColor: colors.surface,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 4,
      borderRadius: Spacing.borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 116,
    },
    budgetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    budgetTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    archivedBadge: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '600',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Spacing.borderRadius.round,
      paddingHorizontal: Spacing.xs,
      paddingVertical: 2,
    },
    amountLine: {
      color: colors.textMuted,
      fontSize: 13,
      marginBottom: Spacing.sm,
    },
    amountValue: {
      color: colors.text,
      fontWeight: '600',
    },
    progressTrack: {
      height: 8,
      borderRadius: Spacing.borderRadius.round,
      backgroundColor: colors.border,
      overflow: 'hidden',
      marginBottom: Spacing.sm,
    },
    progressFill: {
      height: '100%',
      borderRadius: Spacing.borderRadius.round,
    },
    budgetFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: Spacing.sm,
    },
    statusText: {
      fontSize: 13,
      fontWeight: '600',
      flex: 1,
    },
    rightMeta: {
      alignItems: 'flex-end',
    },
    percentUsed: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    transactionsCount: {
      color: colors.textMuted,
      fontSize: 12,
    },
  });
