import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useEditTransaction } from '@/hooks/transaction/useEditTransaction';
import { EmptySection } from '@/components/ui/EmptySection';
import { Controller } from 'react-hook-form';
import Header from '@/components/ui/Header';

export default function EditTransaction()
{
  const { control, errors, handleSubmit, transaction, loading, router } = useEditTransaction();

  if (!transaction)
  {
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
      <Header openDrawer={() => router.push(`/(drawer)/friend/${transaction.friendId}`)} title="Edit Transaction" isGoBack={true} />

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
