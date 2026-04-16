import { Button } from '@/components/ui/Button';
import { CurrencyPicker } from '@/components/ui/CurrencyPicker';
import Header from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useBudgetEdit } from '@/hooks/budget/useBudgetEdit';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Controller } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

export default function EditBudget() {
  const {
    control,
    errors,
    handleSubmit,
    currency,
    setCurrency,
    budget,
    loading,
    canSave,
    hasPendingSync,
    router,
  } = useBudgetEdit();

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
      <Header
        openDrawer={() => router.push(`/(drawer)/budget/${budget.id}`)}
        title="Edit Budget"
        isGoBack={true}
      />
      <View style={styles.form}>
        {hasPendingSync ? (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>Pending sync</Text>
          </View>
        ) : null}

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
          <Button
            title="Save Changes"
            onPress={handleSubmit}
            loading={loading}
            disabled={!canSave}
          />
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
  pendingBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.round,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginBottom: Spacing.sm,
  },
  pendingBadgeText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
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
