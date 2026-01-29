import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { ArrowLeft, Trash2, Pin, PinOff, Pencil } from 'lucide-react-native';
import { IMenuItem } from '@/types/common';
import { useBudgetDetail } from '@/hooks/budget/useBudgetDetail';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { Actions } from '@/components/ui/Actions';


export default function BudgetDetail()
{
  const { budget, router, itemTitle, setItemTitle, itemAmount, setItemAmount, itemTitleError, setItemTitleError, itemAmountError, setItemAmountError, handleAddItem, handleDeleteItem, totalSpent, remaining, handlePinToggle, handleDeleteBudget, menuItems } = useBudgetDetail();
  const [menuVisible, setMenuVisible] = useState(false);



  if (!budget)
  {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Budget not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }


  return (
    <View style={styles.wrapper}>
      <ScreenContainer>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={25} color={Colors.text} />
            <Text style={styles.title}>{budget.title} Budget Details</Text>
          </TouchableOpacity>
        </View>

        {/* Budget Info Card */}
        <View style={styles.budgetInfoCard}>
          <View style={styles.budgetInfoHeader}>
            <View style={styles.budgetInfoTitleRow}>
              {budget.pinned && (
                <Pin size={18} color={Colors.primary} fill={Colors.primary} />
              )}
              <Text style={styles.budgetInfoTitle}>{budget.title}</Text>
            </View>
            <Actions
              menuVisible={menuVisible}
              setMenuVisible={setMenuVisible}
              menuItems={menuItems}
            />
          </View>
          <View style={styles.budgetInfoStats}>
            <View style={styles.budgetInfoStat}>
              <Text style={styles.budgetInfoStatLabel}>Total Budget</Text>
              <Text style={styles.budgetInfoStatValue}>
                {formatCurrency(budget.totalBudget, budget.currency)}
              </Text>
            </View>
            <View style={styles.budgetInfoStat}>
              <Text style={styles.budgetInfoStatLabel}>Total Spent</Text>
              <Text style={[styles.budgetInfoStatValue, { color: Colors.error }]}>
                {formatCurrency(totalSpent, budget.currency)}
              </Text>
            </View>
            <View style={styles.budgetInfoStat}>
              <Text style={styles.budgetInfoStatLabel}>Remaining</Text>
              <Text
                style={[
                  styles.budgetInfoStatValue,
                  remaining < 0 ? { color: Colors.error } : { color: Colors.success },
                ]}>
                {formatCurrency(remaining, budget.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Add Item Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Spending Item</Text>
          <Input
            label="Item Title"
            value={itemTitle}
            onChangeText={(text) =>
            {
              setItemTitle(text);
              setItemTitleError('');
            }}
            placeholder="e.g. Coffee"
            error={itemTitleError}
          />
          <Input
            label="Amount"
            value={itemAmount}
            onChangeText={(text) =>
            {
              setItemAmount(text);
              setItemAmountError('');
            }}
            placeholder="10"
            keyboardType="numeric"
            error={itemAmountError}
          />
          <Button title="Add Item" onPress={handleAddItem} />
        </View>


        {/* Items List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({budget.items.length})</Text>
          {budget.items.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No items yet. Add your first spending item above.</Text>
            </View>
          ) : (
            <View style={styles.itemsList}>
              {budget.items.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemAmount}>{formatCurrency(item.amount, budget.currency)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(item.id, item.title)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Trash2 size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  budgetInfoCard: {
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    borderRadius: Spacing.borderRadius.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  budgetInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  budgetInfoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  budgetActions: {
    position: 'relative',
    zIndex: 1000,
  },
  menuButton: {
    padding: Spacing.xs,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: Colors.card,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemDanger: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  menuItemTextDanger: {
    color: Colors.error,
  },
  budgetInfoTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  budgetInfoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  budgetInfoStat: {
    flex: 1,
  },
  budgetInfoStatLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  budgetInfoStatValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  currencyPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  currencyChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currencyChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  currencyChipText: {
    color: Colors.text,
    fontSize: 14,
  },
  currencyChipTextSelected: {
    color: '#000',
    fontWeight: 'bold',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  summaryCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemsList: {
    gap: Spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  itemAmount: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  deleteButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  emptyState: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Spacing.borderRadius.md,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
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

