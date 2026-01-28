import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useUsersStore } from '@/store/usersStore';
import { useSyncStore } from '@/store/syncStore';
import { syncData } from '@/services/sync';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';

export default function AddUser() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const { addUser } = useUsersStore();
  const { addToQueue } = useSyncStore();
  const router = useRouter();

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    const userId = Math.random().toString(36).substring(2, 15);
    const newUser = {
      id: userId,
      name,
      bio,
      imageUri: null,
      createdAt: Date.now(),
      synced: false,
    };

    addUser(newUser);
    addToQueue({
      id: Math.random().toString(36).substring(2, 15),
      type: 'user',
      action: 'create',
      payload: newUser,
    });

    await syncData();
    router.back();
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Add User</Text>
      <View style={styles.form}>
        <Input label="Full Name" value={name} onChangeText={setName} placeholder="e.g. John Doe" />
        <Input
          label="Bio / Notes"
          value={bio}
          onChangeText={setBio}
          placeholder="Brief description or relationship..."
          multiline
        />

        <View style={styles.actionSection}>
          <Button title="Save User" onPress={handleSave} />
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
    marginBottom: Spacing.md,
  },
  form: {
    paddingVertical: Spacing.md,
  },
  actionSection: {
    marginTop: Spacing.md,
  },
});

