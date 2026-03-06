import { Actions } from '@/components/ui/Actions';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, WARNING_COLOR } from '@/lib/utils';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { IBudgetCardProps } from '@/types/budget';
import { IMenuItem } from '@/types/common';
import { useRouter } from 'expo-router';
import { Archive, Pencil, Pin, PinOff, RotateCcw, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const BudgetCard = ({
  item,
  handlePinToggle,
  handleDelete,
  handleResetPeriod,
  getTotalSpent,
  getRemainingBudget,
}: IBudgetCardProps) => {
  const router = useRouter();
  const { toastInfo } = useToast();
  const [menuVisible, setMenuVisible] = useState(false);
  const totalSpent = getTotalSpent(item.id);
  const remaining = getRemainingBudget(item.id);
  const percentUsed = item.totalBudget > 0 ? (totalSpent / item.totalBudget) * 100 : 0;
  const progress = Math.min(Math.max(percentUsed, 0), 100);
  const formatAmount = (amount: number) => formatCurrency(amount, item.currency);
  const transactionsCount = item.items.filter((entry) => !entry.deletedAt).length;

  const budgetState =
    percentUsed > 100 ? 'overspent' : percentUsed >= 90 ? 'near-limit' : 'healthy';

  const statusText =
    budgetState === 'overspent'
      ? `Overspent by ${formatAmount(Math.abs(remaining))}`
      : budgetState === 'near-limit'
        ? 'Near limit'
        : `${formatAmount(Math.max(remaining, 0))} left`;

  const statusColor =
    budgetState === 'overspent'
      ? Colors.error
      : budgetState === 'near-limit'
        ? WARNING_COLOR
        : Colors.success;

  const progressColor = budgetState === 'overspent' ? Colors.error : Colors.primary;

  const menuItems: IMenuItem[] = [
    {
      icon: <Pencil size={18} color={Colors.text} />,
      label: 'Edit Budget',
      onPress: () => router.push(`/(drawer)/budget/${item.id}/edit`),
    },
    {
      icon: <RotateCcw size={18} color={Colors.text} />,
      label: 'Reset period',
      onPress: () => handleResetPeriod(item.id, item.title),
    },
    {
      icon: <Archive size={18} color={Colors.text} />,
      label: 'Archive Budget',
      onPress: () => toastInfo('Archive will be available in the next update'),
    },
    {
      icon: item.pinned ? (
        <PinOff size={18} color={Colors.text} />
      ) : (
        <Pin size={18} color={Colors.text} />
      ),
      label: item.pinned ? 'Unpin Budget' : 'Pin Budget',
      onPress: () => handlePinToggle(item.id),
    },
    {
      icon: <Trash2 size={18} color={Colors.error} />,
      label: 'Delete Budget',
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
          {item.pinned && <Pin size={14} color={Colors.primary} fill={Colors.primary} />}
          <Text style={styles.budgetTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <Actions menuVisible={menuVisible} setMenuVisible={setMenuVisible} menuItems={menuItems} />
      </View>

      <Text style={styles.amountLine}>
        Spent <Text style={styles.amountValue}>{formatAmount(totalSpent)}</Text> of{' '}
        <Text style={styles.amountValue}>{formatAmount(item.totalBudget)}</Text>
      </Text>

      <View
        style={styles.progressTrack}
        accessibilityLabel={`Budget usage ${Math.round(percentUsed)} percent`}>
        <View
          style={[styles.progressFill, { width: `${progress}%`, backgroundColor: progressColor }]}
        />
      </View>

      <View style={styles.budgetFooter}>
        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
        <View style={styles.rightMeta}>
          <Text style={styles.percentUsed}>{Math.round(percentUsed)}% used</Text>
          <Text style={styles.transactionsCount}>
            {transactionsCount} transaction{transactionsCount === 1 ? '' : 's'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  budgetCard: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
  },
  amountLine: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
  amountValue: {
    color: Colors.text,
    fontWeight: '600',
  },
  progressTrack: {
    height: 8,
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: Colors.surface,
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
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  transactionsCount: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});
