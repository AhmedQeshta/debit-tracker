import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TransactionItem } from '@/components/TransactionItem';
import { Button } from '@/components/Button';
import { useUsersStore } from '@/store/usersStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useSyncStore } from '@/store/syncStore';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Pencil, Trash2 } from 'lucide-react-native';

import { useShallow } from 'zustand/react/shallow';

export default function UserDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const user = useUsersStore((state) => state.users.find((u) => u.id === id));
  const { deleteUser } = useUsersStore();
  const transactions = useTransactionsStore(
    useShallow((state) => state.transactions.filter((t) => t.userId === id)),
  );
  const { deleteTransaction } = useTransactionsStore();
  const { addToQueue } = useSyncStore();

  if (!user) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }

  const balance = transactions.reduce((sum, t) => sum + t.amount, 0);

  const handleEditUser = () => {
    if (!id) return;
    router.push(`/user/${id}/edit`);
  };

  const handleDeleteUser = () => {
    if (!user || !id) return;

    Alert.alert('Delete User', 'Are you sure you want to delete this user and all records?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          // Delete all transactions for this user
          transactions.forEach((t) => {
            deleteTransaction(t.id);
            addToQueue({
              id: Math.random().toString(36).substring(7),
              type: 'transaction',
              action: 'delete',
              payload: { id: t.id },
            });
          });

          // Delete the user
          deleteUser(id);
          addToQueue({
            id: Math.random().toString(36).substring(7),
            type: 'user',
            action: 'delete',
            payload: { id },
          });

          router.back();
        },
      },
    ]);
  };

  const handleEditTransaction = (transactionId: string) => {
    router.push(`/transaction/${transactionId}/edit`);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTransaction(transactionId);
          addToQueue({
            id: Math.random().toString(36).substring(7),
            type: 'transaction',
            action: 'delete',
            payload: { id: transactionId },
          });
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <View style={styles.titleRow}>
        <Text style={styles.title}>User Details</Text>
        <View style={styles.userActions}>
          <TouchableOpacity onPress={handleEditUser} style={styles.iconButton}>
            <Pencil size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteUser} style={styles.iconButton}>
            <Trash2 size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.header}>
        <View style={styles.userRow}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.bio}>{user.bio}</Text>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={[styles.balance, balance < 0 ? styles.negative : styles.positive]}>
            {balance < 0 ? '-' : '+'}${Math.abs(balance).toFixed(2)}
          </Text>
          <Text style={styles.balanceStatus}>
            {balance < 0 ? 'They owe you' : balance > 0 ? 'You owe them' : 'Settled'}
          </Text>
        </View>
      </View>

      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>History</Text>
        <Button
          title="+ Add Record"
          variant="secondary"
          onPress={() => router.push({ pathname: '/transactions/new', params: { userId: id } })}
        />
      </View>

      <View style={styles.list}>
        {transactions.map((item) => (
          <TransactionItem
            key={item.id}
            transaction={item}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        ))}
        {transactions.length === 0 && (
          <Text style={styles.emptyText}>No transaction history found.</Text>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  header: {
    paddingVertical: Spacing.lg,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  name: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  bio: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'left',
    marginTop: Spacing.xs,
  },
  userActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  iconButton: {
    padding: Spacing.sm,
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: Colors.surface,
  },
  balanceCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Spacing.borderRadius.lg,
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  balanceLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balance: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: Spacing.xs,
  },
  balanceStatus: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  positive: {
    color: Colors.success,
  },
  negative: {
    color: Colors.error,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  historyTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  list: {
    marginBottom: Spacing.xl,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xl,
    fontStyle: 'italic',
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

