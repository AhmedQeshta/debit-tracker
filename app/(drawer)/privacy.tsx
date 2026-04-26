import Header from '@/components/ui/Header';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

const createStyles = (colors: any) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
    },
    card: {
      marginTop: Spacing.sm,
      padding: Spacing.md,
      borderRadius: Spacing.borderRadius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: Spacing.md,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    paragraph: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.text,
    },
    note: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '500',
    },
  });

export default function Privacy() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

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
