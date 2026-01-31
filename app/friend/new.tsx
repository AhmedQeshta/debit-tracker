import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { useFriendCreate } from '@/hooks/friend/useFriendCreate';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { CurrencyPicker } from '@/components/ui/CurrencyPicker';
import { Controller } from 'react-hook-form';

export default function AddFriend() {
  const { control, errors, handleSubmit, currency, setCurrency, loading, router } =
    useFriendCreate();
  const insets = useSafeAreaInsets();
  return (
    <ScreenContainer>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={25} style={styles.arrowLeft} color={Colors.text} />
        <Text style={styles.title}>Add Friend</Text>
      </TouchableOpacity>
      <View style={[styles.form, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Controller
          control={control}
          rules={{ required: 'Full name is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Full Name"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="e.g. John Doe"
              error={errors.name?.message}
            />
          )}
          name="name"
        />

        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Bio / Notes"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Brief description or relationship..."
              multiline
              error={errors.bio?.message}
            />
          )}
          name="bio"
        />

        <CurrencyPicker currency={currency} setCurrency={setCurrency} />

        <View style={styles.actionSection}>
          <Button title="Save Friend" onPress={handleSubmit} loading={loading} />
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
  arrowLeft: {
    marginBottom: Spacing.md,
  },
});
