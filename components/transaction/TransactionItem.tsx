import { Actions } from '@/components/ui/Actions';
import { getBalanceText, getBalanceWithSign } from '@/lib/utils';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { ITransactionItemProps } from '@/types/transaction';
import { Pencil, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const TransactionItem = ({
  transaction,
  currency,
  onDelete,
  onEdit,
}: ITransactionItemProps) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const menuItems = [];
  if (onEdit) {
    menuItems.push({
      icon: <Pencil size={18} color={Colors.text} />,
      label: 'Edit Transaction',
      onPress: () => onEdit(transaction.id),
    });
  }
  if (onDelete) {
    menuItems.push({
      icon: <Trash2 size={18} color={Colors.error} />,
      label: 'Delete Transaction',
      onPress: () => onDelete(transaction.id),
      danger: true,
    });
  }

  const balance = getBalanceWithSign(transaction.amount, transaction.sign);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{transaction.title}</Text>
        <Text style={styles.date}>{new Date(transaction.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.rightSide}>
        <Text style={[styles.amount, balance < 0 ? styles.negative : styles.positive]}>
          {getBalanceText(balance, currency)}
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
