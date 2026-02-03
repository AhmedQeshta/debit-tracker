import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { MoreVertical } from 'lucide-react-native';
import { IActionsProps } from '@/types/common';
import { useRef } from 'react';
import type { AnchorRect } from '@/contexts/MenuModalContext';

export const Actions = ({ menuItems, openMenu }: IActionsProps) =>
{
  const buttonRef = useRef<View>(null);

  const handleButtonPress = () =>
  {
    buttonRef.current?.measureInWindow((x: number, y: number, width: number, height: number) =>
    {
      if (x > 0 && y > 0)
      {
        const anchorRect: AnchorRect = {
          x,
          y,
          width,
          height,
        };
        openMenu(anchorRect, menuItems);
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