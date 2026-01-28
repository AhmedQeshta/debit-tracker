import {  StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { useEditTransaction } from '@/hooks/transaction/useEditTransaction';
import { ArrowLeft } from 'lucide-react-native';

export default function EditTransaction() {
  const { amount, setAmount, description, setDescription, handleSave, transaction ,router } = useEditTransaction();

  if (!transaction) {
    return (
      <ScreenContainer>
        <Button title="Go Back" onPress={() => router.back()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={25} style={styles.ArrowLeft}  color={Colors.text} />
          <Text style={styles.title}>Edit Transaction</Text>
        </TouchableOpacity> 
      <Input label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <Input label="Description" value={description} onChangeText={setDescription} />
      <Button title="Update Transaction" onPress={handleSave} />
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
  backButton:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ArrowLeft:{
    marginBottom: Spacing.md,
  }
});
