import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { QuickActionItemProps } from '@/types/common';
import { Pressable, StyleSheet, Text } from 'react-native';

export const QuickActionItem = ({ icon: Icon, label, onPress, primary }: QuickActionItemProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionItem,
        primary ? styles.primaryAction : {},
        pressed && styles.pressed,
      ]}
      onPress={onPress}>
      <Icon size={16} color={primary ? '#000' : Colors.primary} />
      <Text style={[styles.actionLabel, primary ? styles.primaryLabel : {}]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionItem: {
    flex: 1,
    minHeight: 44,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryAction: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  actionLabel: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryLabel: {
    color: '#000',
  },
  pressed: {
    opacity: 0.85,
  },
});
