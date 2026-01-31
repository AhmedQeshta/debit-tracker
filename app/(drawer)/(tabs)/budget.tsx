import { View, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { EmptySection } from '@/components/ui/EmptySection';
import { useBudgetList } from '@/hooks/budget/useBudgetList';
import { BudgetCard } from '@/components/budget/BudgetCard';
import Header from '@/components/ui/Header';
import NavigateTo from '@/components/ui/NavigateTo';

export default function BudgetTab()
{
  const {
    sortedBudgets,
    handlePinToggle,
    handleDelete,
    openDrawer,
    getTotalSpent,
    getRemainingBudget,
  } = useBudgetList();

  return (
    <View style={styles.wrapper}>
      <ScreenContainer scrollable={false}>
        <Header openDrawer={openDrawer} title="Budgets" />

        <FlatList
          data={sortedBudgets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
          {
            return (
              <BudgetCard
                item={item}
                handlePinToggle={handlePinToggle}
                handleDelete={handleDelete}
                getTotalSpent={getTotalSpent}
                getRemainingBudget={getRemainingBudget}
              />
            );
          }}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptySection
              title="No Budgets"
              description="Create your first budget to start tracking your spending"
              icon="budgets"
            />
          }
        />

        <NavigateTo navigatePath="/(drawer)/budget/new" />
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
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  menuButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  addButton: {
    padding: Spacing.xs,
  },
  listContent: {
    paddingBottom: 100,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
});
