import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import { QuickActionItemProps } from '@/types/common';
import { Pressable, StyleSheet, Text } from 'react-native';

export const QuickActionItem = ({ icon: Icon, label, onPress, primary }: QuickActionItemProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const iconColor = primary ? colors.surface : colors.accent;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionItem,
        primary ? styles.primaryAction : {},
        pressed && styles.pressed,
      ]}
      onPress={onPress}>
      <Icon size={16} color={iconColor} />
      <Text style={[styles.actionLabel, primary ? styles.primaryLabel : {}]}>{label}</Text>
    </Pressable>
  );
};

const createStyles = (colors: {
  surface: string;
  border: string;
  text: string;
  accent: string;
}) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    actionItem: {
      flex: 1,
      minHeight: 44,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Spacing.borderRadius.md,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    primaryAction: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    actionLabel: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
      textAlign: 'center',
    },
    primaryLabel: {
      color: colors.surface,
    },
    pressed: {
      opacity: 0.85,
    },
  });
