import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { useFriendEdit } from '@/hooks/friend/useFriendEdit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { CurrencyPicker } from '@/components/ui/CurrencyPicker';
import { EmptySection } from '@/components/ui/EmptySection';

export default function EditFriend()
{
  const { name, setName, bio, setBio, currency, setCurrency, handleSave, friend, router } =
    useFriendEdit();
  const insets = useSafeAreaInsets();

  if (!friend)
  {
    return (
      <EmptySection
        title={'Friend Not Found'}
        description={'The friend you are looking for does not exist'}
        icon={'users'}
      />
    );
  }

  return (
    <ScreenContainer>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={25} style={styles.arrowLeft} color={Colors.text} />
        <Text style={styles.title}>Edit Friend</Text>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  arrowLeft: {
    marginBottom: Spacing.md,
  },
});
