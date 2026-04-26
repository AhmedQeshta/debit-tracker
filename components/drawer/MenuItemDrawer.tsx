import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import { IMenuItemDrawerProps } from '@/types/common';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export const MenuItemDrawer = ({ item, isActive, navigateTo }: IMenuItemDrawerProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const active = isActive(item.path);
  const Icon = item.icon;
  return (
    <TouchableOpacity
      style={[styles.menuItem, active && styles.menuItemActive]}
      onPress={() => navigateTo(item.path)}>
      <Icon size={20} color={active ? colors.accent : colors.textMuted} />
      <Text style={[styles.menuItemText, active && styles.menuItemTextActive]}>{item.label}</Text>
    </TouchableOpacity>
  );
};

const createStyles = (colors: { accentSoft: string; accent: string; textMuted: string }) =>
  StyleSheet.create({
    menuItemActive: {
      backgroundColor: colors.accentSoft,
    },
    menuItemText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textMuted,
    },
    menuItemTextActive: {
      color: colors.accent,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.md,
      marginHorizontal: Spacing.sm,
      marginVertical: Spacing.xs,
      borderRadius: Spacing.borderRadius.md,
      gap: Spacing.md,
    },
  });
