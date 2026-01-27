import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { UserCard } from '../components/UserCard';
import { BottomNav } from '../components/BottomNav';
import { useUsersStore } from '../store/usersStore';
import { useTransactionsStore } from '../store/transactionsStore';
import { useRouter } from 'expo-router';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';

import { useShallow } from 'zustand/react/shallow';

export default function Home() {
  const users = useUsersStore(useShallow((state) => state.users.slice(0, 5)));
  const transactions = useTransactionsStore((state) => state.transactions);
  const router = useRouter();

  const getBalance = (userId: string) => {
    return transactions.filter((t) => t.userId === userId).reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <View style={styles.wrapper}>
      <ScreenContainer>
        <Text style={styles.title}>Latest Users</Text>
        <View style={styles.userList}>
          {users.map((user) => (
            <UserCard key={user.id} user={user} balance={getBalance(user.id)} />
          ))}
          {users.length === 0 && (
            <Text style={styles.emptyText}>No users yet. Add one to get started!</Text>
          )}
        </View>

        <View style={styles.actions}>
          <Button title="Add New User" onPress={() => router.push('/users/new')} />
          <Button
            title="Add Transaction"
            variant="secondary"
            onPress={() => router.push('/transactions/new')}
            disabled={users.length === 0}
          />
          <Button title="Show All Users" variant="outline" onPress={() => router.push('/users')} />
        </View>
      </ScreenContainer>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  userList: {
    marginBottom: Spacing.lg,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: Spacing.xl,
    fontSize: 14,
  },
  actions: {
    marginTop: Spacing.xl,
  },
});
