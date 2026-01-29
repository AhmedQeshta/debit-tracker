import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { ArrowLeft } from 'lucide-react-native';
import { CurrencyPicker } from '@/components/CurrencyPicker';
import { useNewBudget } from '@/hooks/budget/useNewBudget';

export default function NewBudget() {
  const { title, setTitle, currency, setCurrency, totalBudget, setTotalBudget, titleError, budgetError, handleSave,router, setTitleError,setBudgetError } = useNewBudget();
  return (
    <ScreenContainer>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={25} color={Colors.text} />
        <Text style={styles.title}>New Budget</Text>
      </TouchableOpacity>
      <View style={styles.form}>
        <Input
          label="Budget Title"
          value={title}
          onChangeText={(text) => {
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
          onChangeText={(text) => {
            setTotalBudget(text);
            setBudgetError('');
          }}
          placeholder="300"
          keyboardType="numeric"
          error={budgetError}
        />

        <View style={styles.actionSection}>
          <Button title="Create Budget" onPress={handleSave} />
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

