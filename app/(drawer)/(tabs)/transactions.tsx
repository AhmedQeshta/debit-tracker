import { TransactionScreenItem } from '@/components/transaction/TransactionScreenItem';
import { EmptySection } from '@/components/ui/EmptySection';
import Header from '@/components/ui/Header';
import NavigateTo from '@/components/ui/NavigateTo';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useTransaction } from '@/hooks/transaction/useTransaction';
import { sortedTransactions } from '@/lib/utils';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { FlatList, StyleSheet } from 'react-native';

export default function TransactionsScreen() {
  const { openDrawer, transactions, handleEdit, handleNavigateToNewTransaction, handleDelete } =
    useTransaction();

  return (
    <ScreenContainer scrollable={false}>
      <Header openDrawer={openDrawer} title="Transactions" />

      <FlatList
        data={sortedTransactions(transactions)}
        renderItem={({ item }) => (
          <TransactionScreenItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptySection
            title="No Transactions"
            description="You haven't added any transactions yet."
            icon="transactions"
          />
        }
      />

      <NavigateTo
        navigatePath="/(drawer)/transaction/new"
        onPress={handleNavigateToNewTransaction}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  menuButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  listContent: {
    padding: Spacing.sm,
    paddingBottom: 100,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  transactionFriend: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  positive: {
    color: Colors.success,
  },
  negative: {
    color: Colors.error,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
