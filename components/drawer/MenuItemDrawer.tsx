import { Colors } from "@/theme/colors";
import { Spacing } from "@/theme/spacing";
import { IMenuItemDrawerProps } from "@/types/common";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export const MenuItemDrawer = ({
  item,
  isActive,
  navigateTo,
}: IMenuItemDrawerProps) =>
{
  const active = isActive(item.path);
  const Icon = item.icon;
  return (
    <TouchableOpacity
      style={[styles.menuItem, active && styles.menuItemActive]}
      onPress={() => navigateTo(item.path)}>
      <Icon size={20} color={active ? Colors.primary : Colors.textSecondary} />
      <Text style={[styles.menuItemText, active && styles.menuItemTextActive]}>{item.label}</Text>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  menuItemActive: {
    backgroundColor: Colors.card,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  menuItemTextActive: {
    color: Colors.primary,
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
