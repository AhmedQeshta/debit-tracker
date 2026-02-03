import { View, Text, StyleSheet, TouchableOpacity, Pressable, Modal, Dimensions } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { MoreVertical } from 'lucide-react-native';
import { IActionsProps } from '@/types/common';
import { useState, useRef } from 'react';




export const Actions = ({ menuVisible, setMenuVisible, menuItems }: IActionsProps) =>
{
  const buttonRef = useRef<View>(null);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const screenWidth = Dimensions.get('window').width;

  const handleButtonLayout = () =>
  {
    buttonRef.current?.measureInWindow((x: number, y: number, width: number, height: number) =>
    {
      setButtonPosition({ x, y, width, height });
    });
  };

  const handleButtonPress = (e: any) =>
  {
    e.stopPropagation();
    handleButtonLayout();
    setMenuVisible(true);
  };

  const menuTop = buttonPosition.y + buttonPosition.height + 5;
  const menuRight = screenWidth - buttonPosition.x - buttonPosition.width;

  return (
    <View style={styles.actionsContainer}>
      <View ref={buttonRef} onLayout={handleButtonLayout}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={handleButtonPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}>
          <MoreVertical size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}>
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuWrapper, { top: menuTop, right: menuRight }]}>
            <View style={styles.menuContainer}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    item.danger && styles.menuItemDanger,
                    index === menuItems.length - 1 && styles.menuItemLast,
                  ]}
                  onPress={() =>
                  {
                    setMenuVisible(false);
                    item.onPress();
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
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    position: 'relative',
  },
  menuButton: {
    padding: Spacing.xs,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuWrapper: {
    position: 'absolute',
    alignItems: 'flex-end',
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
    elevation: 10,
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