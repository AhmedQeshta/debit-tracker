import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useUsersStore } from '../../store/usersStore';
import { useTransactionsStore } from '../../store/transactionsStore';
import { useSyncStore } from '../../store/syncStore';
import { syncData } from '../../services/sync';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

import { useShallow } from 'zustand/react/shallow';

export default function AddTransaction() {
  const { userId: initialUserId } = useLocalSearchParams<{ userId: string }>();
  const [userId, setUserId] = useState(initialUserId || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isNegative, setIsNegative] = useState(true);

  const users = useUsersStore(useShallow((state) => state.users));
  const { addTransaction } = useTransactionsStore();
  const { addToQueue } = useSyncStore();
  const router = useRouter();

  const handleSave = () => {
    if (!userId) {
      Alert.alert('Error', 'Please select a user');
      return;
    }
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Description is required');
      return;
    }

    const finalAmount = isNegative ? -Math.abs(Number(amount)) : Math.abs(Number(amount));

    const newTransaction = {
      id: Math.random().toString(36).substring(7),
      userId,
      amount: finalAmount,
      description,
      createdAt: Date.now(),
      synced: false,
    };

    addTransaction(newTransaction);
    addToQueue({
      id: Math.random().toString(36).substring(7),
      type: 'transaction',
      action: 'create',
      payload: newTransaction,
    });

    syncData();
    router.back();
  };

  return (
    <ScreenContainer>
      <View style={styles.form}>
        <Text style={styles.label}>Select User</Text>
        <View style={styles.userPicker}>
          {users.map((u) => (
            <TouchableOpacity
              key={u.id}
              style={[styles.userChip, userId === u.id && styles.userChipSelected]}
              onPress={() => setUserId(u.id)}>
              <Text style={[styles.userChipText, userId === u.id && styles.userChipTextSelected]}>
                {u.name}
              </Text>
            </TouchableOpacity>
          ))}
          {users.length === 0 && (
            <Text style={styles.errorText}>No users available. Create one first.</Text>
          )}
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
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.md,
    overflow: 'hidden',
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
});
