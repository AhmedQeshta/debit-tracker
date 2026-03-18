import { Colors } from '@/theme/colors';
import { IMenuItem } from '@/types/common';
import { Budget, Friend } from '@/types/models';
import { Copy, Pencil, Pin, PinOff, Trash2 } from 'lucide-react-native';

export const createMenuItems = (
  type: string,
  onEdit?: () => void,
  onDelete?: () => void,
  item?: Friend | Budget,
  onPinToggle?: () => void,
  onCopyAmount?: () => void,
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

  if (onCopyAmount) {
    menuItems.push({
      icon: <Copy size={18} color={Colors.text} />,
      label: `Copy ${type} amount`,
      onPress: onCopyAmount,
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
