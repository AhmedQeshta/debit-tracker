import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Trash2, Pencil } from 'lucide-react-native';
import { ITransactionItemProps } from '@/types/transaction';
import { getBalanceText } from '@/lib/utils';

export const TransactionItem = ({ transaction, currency, onDelete, onEdit }: ITransactionItemProps) =>
{
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.description}>{transaction.description}</Text>
        <Text style={styles.date}>{new Date(transaction.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.rightSide}>
        <Text style={[styles.amount, transaction.amount < 0 ? styles.negative : styles.positive]}>
          {getBalanceText(transaction.amount, currency)}
        </Text>
        {!transaction.synced && <Text style={styles.syncStatus}>Pending Sync</Text>}
      </View>
      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity onPress={() => onEdit(transaction.id)} style={styles.editButton}>
            <Pencil size={20} stroke={Colors.primary} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={() => onDelete(transaction.id)} style={styles.deleteButton}>
            <Trash2 size={20} stroke={Colors.error} />
          </TouchableOpacity>
        )}
      </View>
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
  description: {
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: Spacing.sm,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
});
