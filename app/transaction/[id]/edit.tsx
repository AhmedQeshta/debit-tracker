import React, { useState, useEffect } from 'react';
import {  StyleSheet, Alert, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { useTransactionsStore } from '../../../store/transactionsStore';
import { useSyncStore } from '../../../store/syncStore';
import { syncData } from '../../../services/sync';
import { Colors } from '../../../theme/colors';
import { Spacing } from '../../../theme/spacing';

import { useShallow } from 'zustand/react/shallow';

export default function EditTransaction() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const transaction = useTransactionsStore(
    useShallow((state) => state.transactions.find((t) => t.id === id)),
  );
  const { updateTransaction } = useTransactionsStore();
  const { addToQueue } = useSyncStore();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (transaction) {
      setAmount(Math.abs(transaction.amount).toString());
      setDescription(transaction.description);
    }
  }, [transaction]);

  const handleSave = () => {
    if (!transaction) return;
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const isNegative = transaction.amount < 0;
    const finalAmount = isNegative ? -Math.abs(Number(amount)) : Math.abs(Number(amount));

    const updatedTransaction = {
      ...transaction,
      amount: finalAmount,
      description,
      synced: false,
    };

    updateTransaction(updatedTransaction);
    addToQueue({
      id: Math.random().toString(36).substring(7),
      type: 'transaction',
      action: 'update',
      payload: updatedTransaction,
    });

    syncData();
    router.back();
  };

  if (!transaction) {
    return (
      <ScreenContainer>
        <Button title="Go Back" onPress={() => router.back()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Edit Transaction</Text>
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
});
