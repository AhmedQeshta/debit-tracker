import { Button } from '@/components/ui/Button';
import { CurrencyPicker } from '@/components/ui/CurrencyPicker';
import { EmptySection } from '@/components/ui/EmptySection';
import Header from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useFriendEdit } from '@/hooks/friend/useFriendEdit';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditFriend() {
  const { t } = useTranslation();
  const { control, errors, handleSubmit, currency, setCurrency, friend, loading, router } =
    useFriendEdit();
  const insets = useSafeAreaInsets();

  if (!friend) {
    return (
      <EmptySection
        title={t('friendDetail.errors.notFoundTitle')}
        description={t('friendDetail.errors.notFoundDescription')}
        icon={'users'}
      />
    );
  }

  return (
    <ScreenContainer>
      <Header
        openDrawer={() => router.push(`/(drawer)/friend/${friend.id}`)}
        title={t('friendForm.edit.title')}
        isGoBack={true}
      />

      <View style={[styles.form, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Controller
          control={control}
          rules={{ required: t('friendForm.validation.nameRequired') }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('friendForm.fields.fullNameLabel')}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t('friendForm.fields.fullNamePlaceholder')}
              error={errors.name?.message}
            />
          )}
          name="name"
        />

        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('friendForm.fields.bioLabel')}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t('friendForm.fields.bioPlaceholder')}
              multiline
              error={errors.bio?.message}
            />
          )}
          name="bio"
        />

        <CurrencyPicker currency={currency} setCurrency={setCurrency} />

        <View style={styles.actionSection}>
          <Button title={t('friendForm.edit.submit')} onPress={handleSubmit} loading={loading} />
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
