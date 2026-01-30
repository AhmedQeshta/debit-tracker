import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { useUserCreate } from '@/hooks/user/useUserCreate';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { CurrencyPicker } from '@/components/CurrencyPicker';

export default function AddUser()
{
  const { name, setName, bio, setBio, currency, setCurrency, handleSave, router } = useUserCreate();
  const insets = useSafeAreaInsets();
  return (
    <ScreenContainer>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={25} style={styles.ArrowLeft} color={Colors.text} />
        <Text style={styles.title}>Add User</Text>
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

        <CurrencyPicker currency={currency} setCurrency={setCurrency} />

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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  ArrowLeft: {
    marginBottom: Spacing.md,
  }
});

