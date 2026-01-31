import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { ArrowLeft } from 'lucide-react-native';
import { CurrencyPicker } from '@/components/ui/CurrencyPicker';
import { useBudgetCreate } from '@/hooks/budget/useBudgetCreate';
import { Controller } from 'react-hook-form';

export default function NewBudget() {
  const { control, errors, handleSubmit, currency, setCurrency, loading, router } =
    useBudgetCreate();

  return (
    <ScreenContainer>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={25} color={Colors.text} />
        <Text style={styles.title}>New Budget</Text>
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
          <Button title="Create Budget" onPress={handleSubmit} loading={loading} />
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
});
