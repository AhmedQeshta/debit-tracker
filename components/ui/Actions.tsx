import { useMenuModal } from '@/hooks/useMenuModal';
import i18n from '@/i18n';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { IActionsProps } from '@/types/common';
import { MoreVertical } from 'lucide-react-native';
import { useRef } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

export const Actions = ({ menuVisible, setMenuVisible, menuItems }: IActionsProps) => {
  const buttonRef = useRef<View>(null);
  const { openMenu } = useMenuModal();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const menuWidth = 220;
  const menuHeight = menuItems.length * 56 + 16; // Approximate menu height (item height * count + padding)

  const handleButtonPress = () => {
    buttonRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
      if (x > 0 && y > 0) {
        // Anchor to trigger and keep menu fully visible within screen bounds.
        const calculatedTop = y + height + 5;
        const calculatedRight = screenWidth - x - width;

        const menuTop = Math.min(calculatedTop, screenHeight - menuHeight - 8);
        const maxHorizontal = Math.max(8, screenWidth - menuWidth - 8);
        const menuRight = Math.min(Math.max(calculatedRight, 8), maxHorizontal);
        const isRTL = i18n.dir(i18n.language) === 'rtl';

        // Convert menuItems to the format expected by the context
        const formattedMenuItems = menuItems.map((item) => ({
          icon: item.icon,
          label: item.label,
          onPress: item.onPress,
          danger: item.danger,
        }));

        openMenu(
          isRTL ? { top: menuTop, left: menuRight } : { top: menuTop, right: menuRight },
          formattedMenuItems,
        );
        // Update parent state for compatibility
        if (setMenuVisible) {
          setMenuVisible(true);
        }
      }
    });
  };

  return (
    <View style={styles.actionsContainer}>
      <View ref={buttonRef}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={handleButtonPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}>
          <MoreVertical size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>
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
});
