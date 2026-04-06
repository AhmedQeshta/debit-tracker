import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { SelectChipProps } from '@/types/common';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function SelectChip({ label, active, onPress }: SelectChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && styles.chipPressed,
      ]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '18',
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.primary,
  },
  optionRow: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
  },
});
