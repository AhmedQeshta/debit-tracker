import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { StyleSheet, View } from 'react-native';

export const RenderBudgetSkeleton = () => (
  <View style={styles.skeletonList}>
    {Array.from({ length: 6 }).map((_, index) => (
      <View key={`budget-skeleton-${index}`} style={styles.skeletonRow} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeletonList: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  skeletonRow: {
    height: 116,
    borderRadius: Spacing.borderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
