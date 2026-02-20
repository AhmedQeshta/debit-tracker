import { Actions } from '@/components/ui/Actions';
import { createMenuItems } from '@/components/ui/CreateMenuItems';
import { getBalanceText } from '@/lib/utils';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { ITransactionItemProps } from '@/types/transaction';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const TransactionItem = ({
  transaction,
  currency,
  onDelete,
  onEdit,
}: ITransactionItemProps) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const menuItems = createMenuItems(
    'Transaction',
    () => onEdit(transaction.id),
    () => onDelete(transaction.id),
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{transaction.title}</Text>
        <Text style={styles.date}>{new Date(transaction.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.rightSide}>
        <Text style={[styles.amount, transaction.amount < 0 ? styles.negative : styles.positive]}>
          {getBalanceText(transaction.amount, currency)}
        </Text>
        {!transaction.synced && <Text style={styles.syncStatus}>Pending Sync</Text>}
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
    borderRadius: Spacing.borderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  content: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  date: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  rightSide: {
    alignItems: 'flex-end',
    marginRight: Spacing.sm,
  },
  amount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  positive: {
    color: Colors.success,
  },
  negative: {
    color: Colors.error,
  },
  syncStatus: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontStyle: 'italic',
  },
  actions: {
    alignItems: 'center',
  },
});
