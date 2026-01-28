
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { useEditUser } from '@/hooks/user/useEditUser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

export default function EditUser() {
  const { name, setName, bio, setBio, handleSave, user, router } = useEditUser();
  const insets = useSafeAreaInsets();

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
      <TouchableOpacity  style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={25} style={styles.ArrowLeft} color={Colors.text} />
          <Text style={styles.title}>Edit User</Text>
        </TouchableOpacity> 
  
      <View style={[styles.form, { paddingBottom: insets.bottom + Spacing.md }]}>
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
  backButton:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  ArrowLeft:{
    marginBottom: Spacing.md,
  }
});


