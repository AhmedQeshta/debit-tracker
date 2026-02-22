import { Colors } from '@/theme/colors';
import { IMenuItem } from '@/types/common';
import { Budget, Friend } from '@/types/models';
import { Pencil, Pin, PinOff, Trash2 } from 'lucide-react-native';

export const createMenuItems = (
  type: string,
  onEdit?: () => void,
  onDelete?: () => void,
  item?: Friend | Budget,
  onPinToggle?: () => void,
): IMenuItem[] => {
  const menuItems = [];

  if (item && onPinToggle) {
    menuItems.push({
      icon: item.pinned ? (
        <PinOff size={18} color={Colors.text} />
      ) : (
        <Pin size={18} color={Colors.text} />
      ),
      label: item.pinned ? `Unpin ${type}` : `Pin ${type}`,
      onPress: onPinToggle,
    });
  }

  if (onEdit) {
    menuItems.push({
      icon: <Pencil size={18} color={Colors.text} />,
      label: `Edit ${type}`,
      onPress: onEdit,
    });
  }

  if (onDelete) {
    menuItems.push({
      icon: <Trash2 size={18} color={Colors.error} />,
      label: `Delete ${type}`,
      onPress: onDelete,
      danger: true,
    });
  }

  return menuItems;
};
