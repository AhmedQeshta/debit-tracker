import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Transaction } from '../types/models';
import { Trash2 } from 'lucide-react-native';

interface Props {
  transaction: Transaction;
  onDelete?: (id: string) => void;
}

export const TransactionItem = ({ transaction, onDelete }: Props) => {
  const isNegative = transaction.amount < 0;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.description}>{transaction.description}</Text>
        <Text style={styles.date}>{new Date(transaction.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.rightSide}>
        <Text style={[styles.amount, isNegative ? styles.negative : styles.positive]}>
          {isNegative ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
        </Text>
        {!transaction.synced && <Text style={styles.syncStatus}>Pending Sync</Text>}
      </View>
      {onDelete && (
        <TouchableOpacity onPress={() => onDelete(transaction.id)} style={styles.deleteButton}>
          <Trash2 size={20} stroke={Colors.error} />
        </TouchableOpacity>
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
  deleteButton: {
    padding: Spacing.sm,
  },
});
