import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { ArrowLeft } from 'lucide-react-native';
import { useBudgetEdit } from '@/hooks/budget/useBudgetEdit';
import { CurrencyPicker } from '@/components/ui/CurrencyPicker';


export default function EditBudget()
{
  const { title, setTitle, currency, setCurrency, totalBudget, setTotalBudget, titleError, budgetError, handleSave, router, setTitleError, setBudgetError, budget } = useBudgetEdit();

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
    <ScreenContainer>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={25} color={Colors.text} />
        <Text style={styles.title}>Edit Budget</Text>
      </TouchableOpacity>
      <View style={styles.form}>
        <Input
          label="Budget Title"
          value={title}
          onChangeText={(text) =>
          {
            setTitle(text);
            setTitleError('');
          }}
          placeholder="e.g. Monthly Groceries"
          error={titleError}
        />
        <CurrencyPicker currency={currency} setCurrency={setCurrency} />
        <Input
          label="Total Budget"
          value={totalBudget}
          onChangeText={(text) =>
          {
            setTotalBudget(text);
            setBudgetError('');
          }}
          placeholder="300"
          keyboardType="numeric"
          error={budgetError}
        />

        <View style={styles.actionSection}>
          <Button title="Save Changes" onPress={handleSave} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  form: {
    paddingVertical: Spacing.md,
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
  actionSection: {
    marginTop: Spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
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

