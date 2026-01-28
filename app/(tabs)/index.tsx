import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ActionCard } from '@/components/ActionCard';
import { UserCard } from '@/components/UserCard';
import { TransactionItem } from '@/components/TransactionItem';
import { useRouter } from 'expo-router';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { UserPlus, PlusCircle, Users } from 'lucide-react-native';
import { useHome } from '@/hooks/useHome';

export default function Home() {
  const router = useRouter();
  // Get latest transactions sorted by date (most recent first), limit to 5
  const { latestTransactions, getUserBalance, latestUsers } = useHome();
  
  return (
    <View style={styles.wrapper}>
      <ScreenContainer>

      <Text style={styles.actionsTitle}>Actions</Text>
        <View style={styles.actions}>
          <ActionCard
            icon={UserPlus}
            title="Add New User"
            onPress={() => router.push('/user/new')}
          />
          <ActionCard
            icon={PlusCircle}
            title="Add Transaction"
            onPress={() => router.push('/transaction/new')}
            disabled={latestUsers.length === 0}
          />
          <ActionCard icon={Users} title="Show All Users" onPress={() => router.push('/users')} disabled={latestUsers.length === 0} />
        </View>


        <Text style={styles.title}>Latest Users</Text>
        <View style={styles.userList}>
          {latestUsers.length === 0 ? (
            <Text style={styles.emptyText}>No users yet. Add one to get started!</Text>
          ) : (
            latestUsers.map((user) => (
              <UserCard key={user.id} user={user} balance={getUserBalance(user.id)} />
            ))
          )}
        </View>

       

        <Text style={styles.transactionsTitle}>Latest Transactions</Text>
        <View style={styles.transactionsList}>
          {latestTransactions.length === 0 ? (
            <Text style={styles.emptyText}>No transactions yet.</Text>
          ) : (
            latestTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
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
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: Spacing.xl,
    fontSize: 14,
  },
  actions: {
    marginTop: Spacing.md,
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
  actionsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
});

