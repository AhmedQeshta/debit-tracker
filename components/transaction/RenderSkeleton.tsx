import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { StyleSheet, View } from 'react-native';

export const RenderSkeleton = () => (
  <View style={styles.skeletonList}>
    {Array.from({ length: 8 }).map((_, index) => (
      <View key={`tx-skeleton-${index}`} style={styles.skeletonRow} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeletonList: {
    paddingTop: Spacing.xs,
    gap: Spacing.sm,
  },
  skeletonRow: {
    minHeight: 80,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
});
