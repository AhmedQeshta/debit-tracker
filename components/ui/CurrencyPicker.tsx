import { CURRENCIES } from '@/lib/utils';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { ICurrencyPickerProps } from '@/types/budget';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const CurrencyPicker = ({ currency, setCurrency }: ICurrencyPickerProps) => {
  const { t } = useTranslation();
  if (CURRENCIES.length === 0) return null;
  return (
    <>
      <Text style={styles.label}>{t('budgetDetail.info.currency')}</Text>
      <View style={styles.currencyPicker}>
        {CURRENCIES.map((curr) => (
          <TouchableOpacity
            key={curr.symbol}
            style={[styles.currencyChip, currency === curr.symbol && styles.currencyChipSelected]}
            onPress={() => setCurrency(curr.symbol)}
            accessibilityRole="button"
            accessibilityLabel={t('currencyPicker.accessibility.selectCurrency', {
              symbol: curr.symbol,
              label: curr.label,
            })}>
            <Text
              style={[
                styles.currencyChipText,
                currency === curr.symbol && styles.currencyChipTextSelected,
              ]}>
              {curr.symbol} {curr.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
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
});
