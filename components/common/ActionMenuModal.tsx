import { View, Text, StyleSheet, TouchableOpacity, Pressable, Dimensions } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import type { AnchorRect, MenuItem } from '@/contexts/MenuModalContext';

interface ActionMenuModalProps {
  visible: boolean;
  anchorRect: AnchorRect | null;
  items: MenuItem[];
  onClose: () => void;
}

export const ActionMenuModal = ({ visible, anchorRect, items, onClose }: ActionMenuModalProps) => {
  if (!visible || !anchorRect) return null;

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const menuWidth = 180;
  const menuHeight = items.length * 56 + 16; // Approximate: item height * count + padding
  const margin = 8;

  // Calculate position: default below anchor
  let top = anchorRect.y + anchorRect.height + 5;
  let left = anchorRect.x;

  // Clamp to screen bounds
  top = Math.min(top, screenHeight - menuHeight - margin);
  // Ensure menu doesn't go off right edge
  if (left + menuWidth > screenWidth - margin) {
    left = screenWidth - menuWidth - margin;
  }
  // Ensure menu doesn't go off left edge
  left = Math.max(margin, left);

  return (
    <View style={styles.rootContainer} pointerEvents="box-none">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.overlayContent} />
      </Pressable>
      <View
        style={[styles.menuWrapper, { top, left }]}
        pointerEvents="box-none"
        onStartShouldSetResponder={() => true}>
        <View style={styles.menuContainer} pointerEvents="auto">
          {items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                item.danger && styles.menuItemDanger,
                index === items.length - 1 && styles.menuItemLast,
              ]}
              onPress={() => {
                // Store the action function before closing
                const action = item.onPress;
                // Close menu first to ensure Alert appears on top
                onClose();
                // Execute action after a delay to ensure menu is fully closed
                // This allows the Alert to appear on top of everything
                setTimeout(() => {
                  action();
                }, 150);
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayContent: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuWrapper: {
    position: 'absolute',
    zIndex: 10000,
    elevation: 10000,
  },
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

