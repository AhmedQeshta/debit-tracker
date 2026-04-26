import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import { IStepItemProps } from '@/types/common';
import { StyleSheet, Text, View } from 'react-native';

export const StepItem = ({
  step,
  title,
  actionLabel,
  onPress,
  variant = 'outline',
}: IStepItemProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.stepRow}>
      <View style={styles.stepMeta}>
        <Text style={styles.stepLabel}>{step}</Text>
        <Text style={styles.stepTitle}>{title}</Text>
      </View>
      <View style={styles.stepButtonWrap}>
        <Button title={actionLabel} onPress={onPress} variant={variant} />
      </View>
    </View>
  );
};

const createStyles = (colors: { surface2: string; border: string; textMuted: string; text: string }) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface2,
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
    stepRow: {
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Spacing.borderRadius.md,
      padding: Spacing.sm,
      gap: Spacing.sm,
    },
    stepMeta: {
      gap: 2,
    },
    stepLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    stepTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    stepButtonWrap: {
      marginTop: -Spacing.xs,
    },
  });
