import { Actions } from '@/components/ui/Actions';
import { createMenuItems } from '@/components/ui/CreateMenuItems';
import { formatAbsoluteCurrency } from '@/lib/utils';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { ITransactionItemProps } from '@/types/transaction';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const TransactionItem = ({
  transaction,
  currency,
  onDelete,
  onEdit,
  onCopyAmount,
}: ITransactionItemProps) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const menuItems = createMenuItems(
    'Transaction',
    () => onEdit(transaction.id),
    () => onDelete(transaction.id),
    undefined,
    undefined,
    onCopyAmount,
  );

  const isPositive = transaction.amount > 0;

  return (
    <View style={styles.container}>
      <View style={[styles.iconBadge, isPositive ? styles.iconPositive : styles.iconNegative]}>
        {isPositive ? (
          <ArrowUpRight size={14} color={Colors.success} />
        ) : (
          <ArrowDownLeft size={14} color={Colors.error} />
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{transaction.title}</Text>
        <Text style={styles.meta}>
          {transaction.note || 'No note'} • {new Date(transaction.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.rightSide}>
        <Text style={[styles.amount, isPositive ? styles.positive : styles.negative]}>
          {formatAbsoluteCurrency(transaction.amount, currency)}
        </Text>
        <View
          style={[styles.statusPill, transaction.synced ? styles.syncedPill : styles.pendingPill]}>
          <Text
            style={[
              styles.statusText,
              transaction.synced ? styles.syncedText : styles.pendingText,
            ]}>
            {transaction.synced ? 'Synced' : 'Pending sync'}
          </Text>
        </View>
      </View>
      {menuItems.length > 0 && (
        <View style={styles.actions}>
          <Actions
            menuVisible={menuVisible}
            setMenuVisible={setMenuVisible}
            menuItems={menuItems}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: Spacing.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  iconPositive: {
    backgroundColor: Colors.surface,
  },
  iconNegative: {
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  meta: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  rightSide: {
    alignItems: 'flex-end',
    marginRight: Spacing.sm,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  positive: {
    color: Colors.success,
  },
  negative: {
    color: Colors.error,
  },
  statusPill: {
    marginTop: Spacing.xs,
    borderRadius: Spacing.borderRadius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  pendingPill: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  syncedPill: {
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  pendingText: {
    color: Colors.primary,
  },
  syncedText: {
    color: Colors.textSecondary,
  },
  actions: {
    alignItems: 'center',
  },
});
