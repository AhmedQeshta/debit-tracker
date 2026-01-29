import { CURRENCIES } from "@/lib/utils";
import { Colors } from "@/theme/colors";
import { Spacing } from "@/theme/spacing";
import { ICurrencyPickerProps } from "@/types/budget";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Text } from "react-native";


export const CurrencyPicker = ({ currency, setCurrency }: ICurrencyPickerProps) => {
  if (CURRENCIES.length === 0) return null;
  return (
    <>
      <Text style={styles.label}>Currency</Text>
        <View style={styles.currencyPicker}>
          { CURRENCIES.map((curr) => (
            <TouchableOpacity
              key={curr.symbol}
              style={[
                styles.currencyChip,
                currency === curr.symbol && styles.currencyChipSelected,
              ]}
              onPress={() => setCurrency(curr.symbol)}>
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