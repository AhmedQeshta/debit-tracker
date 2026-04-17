import Header from '@/components/ui/Header';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

export default function Privacy() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <ScreenContainer>
        <Header
          openDrawer={() => router.push('/(drawer)/(tabs)/settings')}
          title={t('legal.privacy.title')}
          subtitle={t('legal.privacy.subtitle')}
          isGoBack
        />

        <View style={styles.card}>
          <Text style={styles.paragraph}>{t('legal.privacy.paragraph1')}</Text>
          <Text style={styles.paragraph}>{t('legal.privacy.paragraph2')}</Text>
          <Text style={styles.note}>{t('legal.lastUpdated')}</Text>
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  card: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
  note: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
