import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Input } from '../../components/Input';
import { UserCard } from '../../components/UserCard';
import { BottomNav } from '../../components/BottomNav';
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
          renderItem={({ item }) => (
            <View style={isGrid ? styles.gridItem : styles.listItem}>
              <UserCard user={item} balance={getBalance(item.id)} />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No users found.</Text>}
        />
      </ScreenContainer>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  toggle: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.md,
    marginBottom: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    height: 58, // Match input height roughly
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  gridItem: {
    flex: 0.5,
    marginHorizontal: 4,
  },
  listItem: {
    marginBottom: Spacing.sm,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
