import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useUsersStore } from '@/store/usersStore';
import { useSyncStore } from '@/store/syncStore';
import { syncData } from '@/services/sync';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';

export default function EditUser() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const user = useUsersStore((state) => state.users.find((u) => u.id === id));
  const { updateUser, deleteUser } = useUsersStore();
  const { addToQueue } = useSyncStore();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user || !id) return;
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    const updatedUser = {
      ...user,
      name,
      bio,
      synced: false,
    };

    updateUser(updatedUser);
    addToQueue({
      id: Math.random().toString(36).substring(2, 15),
      type: 'user',
      action: 'update',
      payload: updatedUser,
    });

    await syncData();
    router.back();
  };

  if (!user) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Edit User</Text>
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
          <Button title="Save Changes" onPress={handleSave} />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.error,
    fontSize: 18,
    marginBottom: Spacing.lg,
  },
});


