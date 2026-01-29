import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { useTransaction } from '@/hooks/transaction/useTransaction';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function AddTransaction() {
  const {users, userId, setUserId, isNegative, setIsNegative, amount, setAmount, description, setDescription, handleSave} = useTransaction();
  return (
    <ScreenContainer>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={25} style={styles.ArrowLeft}  color={Colors.text} />
          <Text style={styles.title}>Add Transaction</Text>
        </TouchableOpacity> 
      <View style={styles.form}>
        <Text style={styles.label}>Select User</Text>
        <View style={styles.userPicker}>
          {users.length === 0 ? <Text style={styles.errorText}>No users available. Create one first.</Text> : users.map((u) => (
            <TouchableOpacity key={u.id} style={[styles.userChip, userId === u.id && styles.userChipSelected]} onPress={() => setUserId(u.id)}>
              <Text style={[styles.userChipText, userId === u.id && styles.userChipTextSelected]}>{u.name}</Text>
            </TouchableOpacity>
          ))}

        </View>

        <View style={styles.amountHeader}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.signToggle}>
            <TouchableOpacity
              style={[styles.signButton, !isNegative && styles.signButtonActivePositive]}
              onPress={() => setIsNegative(false)}>
              <Text style={styles.signText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.signButton, isNegative && styles.signButtonActiveNegative]}
              onPress={() => setIsNegative(true)}>
              <Text style={styles.signText}>-</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Input value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. Lunch, Borrowed cash..."
          multiline
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            {isNegative ? 'This user owes you this amount.' : 'You owe this user this amount.'}
          </Text>
        </View>

        <Button title="Add Transaction" onPress={handleSave} disabled={users.length === 0} />
      </View>
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
  form: {
    paddingVertical: Spacing.md,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  userPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  userChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  userChipText: {
    color: Colors.text,
    fontSize: 14,
  },
  userChipTextSelected: {
    color: '#000',
    fontWeight: 'bold',
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
  infoBox: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
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
