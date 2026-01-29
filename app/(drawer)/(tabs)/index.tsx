import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ActionCard } from '@/components/ActionCard';
import { UserCard } from '@/components/UserCard';
import { TransactionItem } from '@/components/TransactionItem';
import { useRouter } from 'expo-router';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { UserPlus, PlusCircle, Users, Menu, Users as UsersIcon, Receipt } from 'lucide-react-native';
import { useHome } from '@/hooks/useHome';
import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { EmptySection } from '@/components/ui/EmptySection';

export default function Home() {
  const router = useRouter();
  const { openDrawer } = useDrawerContext();
  // Get latest transactions sorted by date (most recent first), limit to 5
  const { latestTransactions, getUserBalance, latestUsers, handlePinToggle } = useHome();

  return (
    <View style={styles.wrapper}>
      <ScreenContainer>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={openDrawer}
            style={styles.menuButton}
            activeOpacity={0.7}>
            <Menu size={24} color={Colors.text} />
          </TouchableOpacity>
      <Text style={styles.actionsTitle}>Actions</Text>
        </View>
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
             <EmptySection title={'No Users Yet'}
             description={'Start tracking your debts by adding your first user'}
             icon={'users'}/>
          ) : (
            latestUsers.map((user) => (
              <UserCard 
                key={user.id} 
                user={user} 
                balance={getUserBalance(user.id)} 
                onPinToggle={handlePinToggle}
              />
            ))
          )}
        </View>

       

        <Text style={styles.transactionsTitle}>Latest Transactions</Text>
        <View style={styles.transactionsList}>
          {latestTransactions.length === 0 ? (
            <EmptySection title={'No Transactions Yet'}
            description={'Add your first transaction to start tracking debts'}
            icon={'transactions'}/>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  menuButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  actionsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
});

