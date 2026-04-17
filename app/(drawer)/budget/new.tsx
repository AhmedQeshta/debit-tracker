import { Button } from '@/components/ui/Button';
import { CurrencyPicker } from '@/components/ui/CurrencyPicker';
import Header from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useBudgetCreate } from '@/hooks/budget/useBudgetCreate';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

export default function NewBudget() {
  const { t } = useTranslation();
  const { control, errors, handleSubmit, currency, setCurrency, loading, router } =
    useBudgetCreate();

  return (
    <ScreenContainer>
      <Header
        openDrawer={() => router.push('/(drawer)/(tabs)/budget')}
        title={t('budgetForm.create.title')}
        isGoBack={true}
      />
      <View style={styles.form}>
        <Controller
          control={control}
          rules={{ required: t('budgetForm.validation.titleRequired') }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('budgetForm.fields.titleLabel')}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t('budgetForm.fields.titlePlaceholder')}
              error={errors.title?.message}
            />
          )}
          name="title"
        />

        <CurrencyPicker currency={currency} setCurrency={setCurrency} />

        <Controller
          control={control}
          rules={{ required: t('budgetForm.validation.totalRequired') }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('budgetForm.fields.totalLabel')}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t('budgetForm.fields.totalPlaceholder')}
              keyboardType="numeric"
              error={errors.totalBudget?.message}
            />
          )}
          name="totalBudget"
        />

        <View style={styles.actionSection}>
          <Button title={t('budgetForm.create.submit')} onPress={handleSubmit} loading={loading} />
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
