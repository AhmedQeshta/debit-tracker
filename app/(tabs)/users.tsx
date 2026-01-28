import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Input } from '../../components/Input';
import { UserCard } from '../../components/UserCard';
import { useUsersStore } from '../../store/usersStore';
import { useTransactionsStore } from '../../store/transactionsStore';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { LayoutGrid, List } from 'lucide-react-native';

import { useShallow } from 'zustand/react/shallow';

export default function UsersList() {
  const [search, setSearch] = useState('');
  const [isGrid, setIsGrid] = useState(false);
  const users = useUsersStore(useShallow((state) => state.users));
  const transactions = useTransactionsStore(useShallow((state) => state.transactions));

  const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  const getBalance = (userId: string) => {
    return transactions.filter((t) => t.userId === userId).reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <View style={styles.wrapper}>
      <ScreenContainer scrollable={false}>
        <Text style={styles.title}>Users</Text>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Input value={search} onChangeText={setSearch} placeholder="Search users..." />
          </View>
          <TouchableOpacity onPress={() => setIsGrid(!isGrid)} style={styles.toggle}>
            {isGrid ? (
              <List color={Colors.text} size={24} />
            ) : (
              <LayoutGrid color={Colors.text} size={24} />
            )}
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          numColumns={isGrid ? 2 : 1}
          key={isGrid ? 'grid' : 'list'}
          renderItem={({ item }) => {
            const balance = getBalance(item.id);

            if (isGrid) {
              return (
                <View style={styles.gridItem}>
                  <View style={styles.gridCard}>
                    <View style={styles.gridAvatar}>
                      <Text style={styles.gridAvatarText}>{item.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.gridName}>{item.name}</Text>
                    <Text
                      style={[
                        styles.gridAmount,
                        balance < 0 ? styles.negative : styles.positive,
                      ]}>
                      ${Math.abs(balance).toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            }

            return (
              <View style={styles.listItem}>
                <UserCard user={item} balance={balance} />
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No users found.</Text>}
        />
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggle: {
    width: 58,
    height: 58,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  listContent: {
    paddingBottom: 100,
  },
  gridItem: {
    flex: 0.5,
    marginHorizontal: 4,
    marginBottom: Spacing.sm,
  },
  listItem: {
    marginBottom: Spacing.sm,
  },
  gridCard: {
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gridAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  gridAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  gridName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  gridAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  positive: {
    color: Colors.success,
  },
  negative: {
    color: Colors.error,
  },
});

