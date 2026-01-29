import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Menu, Plus } from 'lucide-react-native';
import { EmptySection } from '@/components/ui/EmptySection';
import { useBudgetList } from '@/hooks/budget/useBudgetList';
import { BudgetCard } from '@/components/BudgetCard';
export default function BudgetList() {

  const { sortedBudgets, handlePinToggle, handleDelete, router, openDrawer,getTotalSpent,getRemainingBudget } = useBudgetList();

  return (
    <View style={styles.wrapper}>
      <ScreenContainer scrollable={false}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={openDrawer}
            style={styles.menuButton}
            activeOpacity={0.7}>
            <Menu size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Budgets</Text>
          <TouchableOpacity
            onPress={() => router.push('/(drawer)/budget/new')}
            style={styles.addButton}
            activeOpacity={0.7}>
            <Plus size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={sortedBudgets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            return <BudgetCard item={item} handlePinToggle={handlePinToggle} handleDelete={handleDelete} router={router} getTotalSpent={getTotalSpent} getRemainingBudget={getRemainingBudget} />
           
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
  },
  budgetCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.borderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  budgetContent: {
    padding: Spacing.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  pinButton: {
    padding: Spacing.xs,
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
});
