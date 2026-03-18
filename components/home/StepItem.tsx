import { Button } from '@/components/ui/Button';
import { Colors } from '@/theme/colors';
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontSize: 14,
  },
  steps: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  stepRow: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  stepMeta: {
    gap: 2,
  },
  stepLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  stepTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  stepButtonWrap: {
    marginTop: -Spacing.xs,
  },
});
