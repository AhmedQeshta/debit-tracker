import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { FriendCard } from '@/components/friend/FriendCard';
import { TransactionItem } from '@/components/transaction/TransactionItem';
import { BudgetCard } from '@/components/budget/BudgetCard';
import { useRouter } from 'expo-router';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { UserPlus, PlusCircle, Users } from 'lucide-react-native';
import { useHome } from '@/hooks/useHome';
import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { EmptySection } from '@/components/ui/EmptySection';
import { useFriendsStore } from '@/store/friendsStore';
import { useShallow } from 'zustand/react/shallow';
import { ActionCard } from '@/components/ui/ActionCard';
import Header from '@/components/ui/Header';

export default function Home() {
  const router = useRouter();
  const { openDrawer } = useDrawerContext();
  // Get latest transactions sorted by date (most recent first), limit to 5
  const {
    latestTransactions,
    getFriendBalance,
    latestFriends,
    handlePinToggle,
    latestBudgets,
    getBudgetTotalSpent,
    getBudgetRemaining,
    handleBudgetPinToggle,
    handleBudgetDelete,
    handleFriendDelete,
    handleTransactionEdit,
    handleTransactionDelete,
  } = useHome();
  const friends = useFriendsStore(useShallow((state) => state.friends));

  return (
    <View style={styles.wrapper}>
      <ScreenContainer>
        <Header openDrawer={openDrawer} title="Actions" />
        <View style={styles.actions}>
          <ActionCard
            icon={UserPlus}
            title="Add Friend"
            onPress={() => router.push('/(drawer)/friend/new')}
          />
          <ActionCard
            icon={PlusCircle}
            title="Add Transaction"
            onPress={() => router.push('/(drawer)/transaction/new')}
            disabled={latestFriends.length === 0}
          />
          <ActionCard
            icon={Users}
            title="Show All Friends"
            onPress={() => router.push('/friends')}
            disabled={latestFriends.length === 0}
          />
        </View>

        <Text style={styles.title}>Latest Friends</Text>
        <View style={styles.userList}>
          {latestFriends.length === 0 ? (
            <EmptySection
              title={'No Friends Yet'}
              description={'Start tracking your debts by adding your first friend'}
              icon={'users'}
            />
          ) : (
            latestFriends.map((friend) => {
              return (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  balance={getFriendBalance(friend.id)}
                  showActions={true}
                  handleFriendDelete={handleFriendDelete}
                  handlePinToggle={handlePinToggle}
                />
              );
            })
          )}
        </View>

        <Text style={styles.title}>Latest Budgets</Text>
        <View style={styles.budgetsList}>
          {latestBudgets.length === 0 ? (
            <EmptySection
              title="No Budgets"
              description="Create your first budget to start tracking your spending"
              icon="budgets"
            />
          ) : (
            latestBudgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                item={budget}
                handlePinToggle={handleBudgetPinToggle}
                handleDelete={handleBudgetDelete}
                getTotalSpent={getBudgetTotalSpent}
                getRemainingBudget={getBudgetRemaining}
              />
            ))
          )}
        </View>

        <Text style={styles.transactionsTitle}>Latest Transactions</Text>
        <View style={styles.transactionsList}>
          {latestTransactions.length === 0 ? (
            <EmptySection
              title={'No Transactions Yet'}
              description={'Add your first transaction to start tracking debts'}
              icon={'transactions'}
            />
          ) : (
            latestTransactions.map((transaction) => {
              const friend = friends.find((f) => f.id === transaction.friendId);
              return (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  currency={friend?.currency || '$'}
                  onEdit={handleTransactionEdit}
                  onDelete={handleTransactionDelete}
                />
              );
            })
          )}
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  userList: {
    marginBottom: Spacing.sm,
  },
  budgetsList: {
    marginBottom: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  transactionsList: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  transactionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
});
