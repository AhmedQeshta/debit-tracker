import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { useEditTransaction } from '@/hooks/transaction/useEditTransaction';
import { ArrowLeft } from 'lucide-react-native';
import { EmptySection } from '@/components/ui/EmptySection';
import { Controller } from 'react-hook-form';

export default function EditTransaction() {
  const { control, errors, handleSubmit, transaction, loading, router } = useEditTransaction();

  if (!transaction) {
    return (
      <EmptySection
        title={'Transaction Not Found'}
        description={'The transaction you are looking for does not exist'}
        icon={'transactions'}
      />
    );
  }

  return (
    <ScreenContainer>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={25} style={styles.ArrowLeft} color={Colors.text} />
        <Text style={styles.title}>Edit Transaction</Text>
      </TouchableOpacity>

      <Controller
        control={control}
        rules={{ required: 'Amount is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Amount"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            keyboardType="numeric"
            error={errors.amount?.message}
          />
        )}
        name="amount"
      />

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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ArrowLeft: {
    marginBottom: Spacing.md,
  },
});
