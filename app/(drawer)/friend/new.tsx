import { Button } from '@/components/ui/Button';
import { CurrencyPicker } from '@/components/ui/CurrencyPicker';
import Header from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useFriendCreate } from '@/hooks/friend/useFriendCreate';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddFriend() {
  const { t } = useTranslation();
  const { control, errors, handleSubmit, currency, setCurrency, loading, router } =
    useFriendCreate();
  const insets = useSafeAreaInsets();
  return (
    <ScreenContainer>
      <Header
        openDrawer={() => router.push('/(drawer)/(tabs)/friends')}
        title={t('friendForm.create.title')}
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
          <Button title={t('friendForm.create.submit')} onPress={handleSubmit} loading={loading} />
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
