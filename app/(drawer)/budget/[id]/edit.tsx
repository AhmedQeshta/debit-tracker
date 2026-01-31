import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { ArrowLeft } from 'lucide-react-native';
import { useBudgetEdit } from '@/hooks/budget/useBudgetEdit';
import { CurrencyPicker } from '@/components/ui/CurrencyPicker';
import { Controller } from 'react-hook-form';

export default function EditBudget() {
  const { control, errors, handleSubmit, currency, setCurrency, budget, loading, router } =
    useBudgetEdit();

  if (!budget) {
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
        <Controller
          control={control}
          rules={{ required: 'Budget title is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Budget Title"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="e.g. Monthly Groceries"
              error={errors.title?.message}
            />
          )}
          name="title"
        />
        <CurrencyPicker currency={currency} setCurrency={setCurrency} />
        <Controller
          control={control}
          rules={{ required: 'Total budget is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Total Budget"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="300"
              keyboardType="numeric"
              error={errors.totalBudget?.message}
            />
          )}
          name="totalBudget"
        />

        <View style={styles.actionSection}>
          <Button title="Save Changes" onPress={handleSubmit} loading={loading} />
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
