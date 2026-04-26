import { StepItem } from '@/components/home/StepItem';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import { HomeGetStartedCardProps } from '@/types/common';
import { CircleCheckBig } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

export const HomeGetStartedCard = ({
  onAddFriend,
  onAddTransaction,
  onCreateBudget,
}: HomeGetStartedCardProps) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <CircleCheckBig size={20} color={colors.accent} />
        <Text style={styles.title}>{t('dashboard.getStarted.title')}</Text>
      </View>
      <Text style={styles.description}>{t('homeSummary.getStartedDescription')}</Text>

      <View style={styles.steps}>
        <StepItem
          step={t('homeSummary.steps.step1')}
          title={t('home.actions.addFriend')}
          actionLabel={t('home.actions.addFriend')}
          onPress={onAddFriend}
          variant="primary"
        />
        <StepItem
          step={t('homeSummary.steps.step2')}
          title={t('home.actions.addTransaction')}
          actionLabel={t('home.actions.addTransaction')}
          onPress={onAddTransaction}
        />
        <StepItem
          step={t('homeSummary.steps.step3Optional')}
          title={t('home.actions.createBudget')}
          actionLabel={t('home.actions.createBudget')}
          onPress={onCreateBudget}
        />
      </View>
    </View>
  );
};

const createStyles = (colors: { surface: string; border: string; text: string; textMuted: string }) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Spacing.borderRadius.lg,
      padding: Spacing.md,
      marginTop: Spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    title: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
    },
    description: {
      color: colors.textMuted,
      marginTop: Spacing.xs,
      fontSize: 14,
    },
    steps: {
      marginTop: Spacing.md,
      gap: Spacing.sm,
    },
  });
