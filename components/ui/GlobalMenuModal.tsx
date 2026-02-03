import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useMenuModal } from '@/contexts/MenuModalContext';
import { PositionedMenu } from '@/components/ui/PositionedMenu';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';

export const GlobalMenuModal = () => {
  const { menuState, closeMenu } = useMenuModal();

  return (
    <PositionedMenu
      visible={menuState.visible}
      onClose={closeMenu}
      position={menuState.position}>
      <View style={styles.menuContainer}>
        {menuState.menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              item.danger && styles.menuItemDanger,
              index === menuState.menuItems.length - 1 && styles.menuItemLast,
            ]}
            onPress={() => {
              // Close menu first
              closeMenu();
              // Then execute the action after a small delay to ensure modal closes
              setTimeout(() => {
                item.onPress();
              }, 100);
            }}
            activeOpacity={0.7}>
            {item.icon}
            <Text style={[
              styles.menuItemText,
              item.danger && styles.menuItemTextDanger,
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </PositionedMenu>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10001,
    zIndex: 10001,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemDanger: {
    // Danger styling is handled by text color
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  menuItemTextDanger: {
    color: Colors.error,
  },
});

