import { CalculatorModal } from '@/components/calculator/CalculatorModal';
import { Button } from '@/components/ui/Button';
import { EmptySection } from '@/components/ui/EmptySection';
import Header from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useEditTransaction } from '@/hooks/transaction/useEditTransaction';
import { formatResult } from '@/lib/calc';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Calculator } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditTransaction() {
  const {
    control,
    errors,
    handleSubmit,
    transaction,
    loading,
    router,
    budgets,
    getRemainingBudget,
    setValue,
  } = useEditTransaction();
  const amountInputRef = useRef<TextInput>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorInitialValue, setCalculatorInitialValue] = useState('');

  if (!transaction) {
    return (
      <EmptySection
        title={'Transaction Not Found'}
        description={'The transaction you are looking for does not exist'}
        icon={'transactions'}
      />
    );
  }

  const activeBudget = budgets.find((budget) => budget.id === transaction.budgetId);
  const activeBudgetRemaining = activeBudget ? getRemainingBudget(activeBudget.id) : null;

  return (
    <ScreenContainer>
      <Header
        openDrawer={() => router.push(`/(drawer)/friend/${transaction.friendId}`)}
        title="Edit Transaction"
        isGoBack={true}
      />

      <View style={styles.amountHeader}>
        <Text style={styles.label}>Amount</Text>
        <Controller
          control={control}
          name="isNegative"
          render={({ field: { value, onChange } }) => (
            <View style={styles.signToggle}>
              <TouchableOpacity
                style={[styles.signButton, !value && styles.signButtonActivePositive]}
                onPress={() => onChange(false)}>
                <Text style={styles.signText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.signButton, value && styles.signButtonActiveNegative]}
                onPress={() => onChange(true)}>
                <Text style={styles.signText}>-</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      <Controller
        control={control}
        rules={{ required: 'Amount is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            keyboardType="numeric"
            error={errors.amount?.message}
            inputRef={amountInputRef}
            rightAccessory={
              <TouchableOpacity
                onPress={() => {
                  setCalculatorInitialValue(value || '');
                  setShowCalculator(true);
                }}
                style={styles.calcButton}
                accessibilityRole="button"
                accessibilityLabel="Open calculator">
                <Calculator size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            }
          />
        )}
        name="amount"
      />

      <CalculatorModal
        visible={showCalculator}
        initialValue={calculatorInitialValue}
        onClose={() => setShowCalculator(false)}
        onConfirm={(result) => {
          setValue('amount', formatResult(result), { shouldValidate: true });
          requestAnimationFrame(() => amountInputRef.current?.focus());
        }}
      />

      <Text style={styles.label}>Budget (Optional)</Text>
      <Controller
        control={control}
        name="budgetId"
        render={({ field: { value, onChange } }) => (
          <View style={styles.budgetPicker}>
            <TouchableOpacity
              style={[styles.budgetChip, !value && styles.budgetChipActive]}
              onPress={() => onChange('')}>
              <Text style={[styles.budgetChipText, !value && styles.budgetChipTextActive]}>
                No budget
              </Text>
            </TouchableOpacity>
            {budgets.map((budget) => (
              <TouchableOpacity
                key={budget.id}
                style={[styles.budgetChip, value === budget.id && styles.budgetChipActive]}
                onPress={() => onChange(budget.id)}>
                <Text
                  style={[
                    styles.budgetChipText,
                    value === budget.id && styles.budgetChipTextActive,
                  ]}>
                  {budget.title} ({budget.currency || '$'}{' '}
                  {getRemainingBudget(budget.id).toFixed(2)} left)
                </Text>
              </TouchableOpacity>
            ))}
            {value ? (
              <View style={styles.selectedBudgetChip}>
                <Text style={styles.selectedBudgetText}>
                  Budget: {budgets.find((budget) => budget.id === value)?.title || 'Linked'}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      />

      {activeBudget ? (
        <View style={styles.linkedBudgetInfo}>
          <Text style={styles.linkedBudgetTitle}>Linked budget: {activeBudget.title}</Text>
          <Text style={styles.linkedBudgetRemaining}>
            Remaining: {(activeBudget.currency || '$') + ' ' + activeBudgetRemaining?.toFixed(2)}
          </Text>
        </View>
      ) : null}

      <Controller
        control={control}
        rules={{ required: 'Description is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Description"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.description?.message}
          />
        )}
        name="description"
      />

      <Button title="Update Transaction" onPress={handleSubmit} loading={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  signToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.input,
    borderRadius: Spacing.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  signButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signButtonActivePositive: {
    backgroundColor: Colors.success,
  },
  signButtonActiveNegative: {
    backgroundColor: Colors.error,
  },
  signText: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  budgetPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  budgetChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  budgetChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  budgetChipText: {
    color: Colors.text,
    fontSize: 12,
  },
  budgetChipTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  selectedBudgetChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  selectedBudgetText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  linkedBudgetInfo: {
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
  },
  linkedBudgetTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  linkedBudgetRemaining: {
    marginTop: 2,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  calcButton: {
    width: 36,
    height: 36,
    borderRadius: Spacing.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
});
