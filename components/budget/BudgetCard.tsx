import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/theme/colors';
import { Pin, PinOff, Trash2, Pencil } from 'lucide-react-native';
import { formatCurrency } from '@/lib/utils';
import { Spacing } from '@/theme/spacing';
import { IBudgetCardProps } from '@/types/budget';
import { useRouter } from 'expo-router';
import { Actions } from '@/components/ui/Actions';
import { IMenuItem } from '@/types/common';
import { useActionMenu } from '@/hooks/common/useActionMenu';

export const BudgetCard = ({ item, handlePinToggle, handleDelete, getTotalSpent, getRemainingBudget }: IBudgetCardProps) =>
{
  const router = useRouter();
  const { openMenu } = useActionMenu();
  const totalSpent = getTotalSpent(item.id);
  const remaining = getRemainingBudget(item.id);
  const formatAmount = (amount: number) => formatCurrency(amount, item.currency);

  const menuItems: IMenuItem[] = [
    {
      icon: item.pinned ? (
        <PinOff size={18} color={Colors.text} />
      ) : (
        <Pin size={18} color={Colors.text} />
      ),
      label: item.pinned ? 'Unpin Budget' : 'Pin Budget',
      onPress: () => handlePinToggle(item.id),
    }, {
      icon: <Pencil size={18} color={Colors.text} />,
      label: 'Edit Budget',
      onPress: () => router.push(`/(drawer)/budget/${item.id}/edit`),
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
      <View style={styles.budgetContent}>
        <View style={styles.budgetHeader}>
          <View style={styles.titleRow}>
            {item.pinned && (
              <Pin size={16} color={Colors.primary} fill={Colors.primary} />
            )}
            <Text style={styles.budgetTitle} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <Actions
            menuItems={menuItems}
            openMenu={openMenu}
          />
        </View>

        <View style={styles.budgetStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Budget</Text>
            <Text style={styles.statValue}>{formatAmount(item.totalBudget)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Spent</Text>
            <Text style={[styles.statValue, { color: Colors.error }]}>
              {formatAmount(totalSpent)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Remaining</Text>
            <Text
              style={[
                styles.statValue,
                remaining < 0 ? { color: Colors.error } : { color: Colors.success },
              ]}>
              {formatAmount(remaining)}
            </Text>
          </View>
        </View>

        <View style={styles.budgetFooter}>
          <Text style={styles.itemsCount}>{item.items.length} items</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}


const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  budgetCard: {
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  budgetContent: {
    padding: Spacing.xs,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  itemsCount: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  editButton: {
    padding: Spacing.xs,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
});