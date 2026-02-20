import { Button } from '@/components/ui/Button';
import { EmptySection } from '@/components/ui/EmptySection';
import Header from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useEditTransaction } from '@/hooks/transaction/useEditTransaction';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Controller } from 'react-hook-form';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
});
