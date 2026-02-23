import { StepItem } from '@/components/home/StepItem';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { HomeGetStartedCardProps } from '@/types/common';
import { CircleCheckBig } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

export const HomeGetStartedCard = ({
  onAddFriend,
  onAddTransaction,
  onCreateBudget,
}: HomeGetStartedCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <CircleCheckBig size={20} color={Colors.primary} />
        <Text style={styles.title}>Get Started</Text>
      </View>
      <Text style={styles.description}>Set up your tracking in a few quick steps.</Text>

      <View style={styles.steps}>
        <StepItem
          step="Step 1"
          title="Add Friend"
          actionLabel="Add Friend"
          onPress={onAddFriend}
          variant="primary"
        />
        <StepItem
          step="Step 2"
          title="Add Transaction"
          actionLabel="Add Transaction"
          onPress={onAddTransaction}
        />
        <StepItem
          step="Step 3 (Optional)"
          title="Create Budget"
          actionLabel="Create Budget"
          onPress={onCreateBudget}
        />
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
});
