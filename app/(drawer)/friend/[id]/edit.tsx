import { View, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { useFriendEdit } from '@/hooks/friend/useFriendEdit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CurrencyPicker } from '@/components/ui/CurrencyPicker';
import { EmptySection } from '@/components/ui/EmptySection';
import { Controller } from 'react-hook-form';
import Header from '@/components/ui/Header';

export default function EditFriend()
{
  const { control, errors, handleSubmit, currency, setCurrency, friend, loading, router } =
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
      <Header openDrawer={() => router.push(`/(drawer)/friend/${friend.id}`)} title="Edit Friend" isGoBack={true} />

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
          <Button title="Save Changes" onPress={handleSubmit} loading={loading} />
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
