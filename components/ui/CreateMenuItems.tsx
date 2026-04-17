import i18n from '@/i18n';
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
  const normalizedType = (type || '').toLowerCase();
  const typeKey = normalizedType.includes('budget')
    ? 'budget'
    : normalizedType.includes('friend')
      ? 'friend'
      : normalizedType.includes('transaction')
        ? 'transaction'
        : 'item';
  const typeLabel = i18n.t(`menuItemTypes.${typeKey}`);

  if (item && onPinToggle) {
    menuItems.push({
      icon: item.pinned ? (
        <PinOff size={18} color={Colors.text} />
      ) : (
        <Pin size={18} color={Colors.text} />
      ),
      label: item.pinned
        ? i18n.t('menuActions.unpinItem', { type: typeLabel })
        : i18n.t('menuActions.pinItem', { type: typeLabel }),
      onPress: onPinToggle,
    });
  }

  if (onCopyAmount) {
    menuItems.push({
      icon: <Copy size={18} color={Colors.text} />,
      label: i18n.t('menuActions.copyItemAmount', { type: typeLabel }),
      onPress: onCopyAmount,
    });
  }

  if (onEdit) {
    menuItems.push({
      icon: <Pencil size={18} color={Colors.text} />,
      label: i18n.t('menuActions.editItem', { type: typeLabel }),
      onPress: onEdit,
    });
  }

  if (onDelete) {
    menuItems.push({
      icon: <Trash2 size={18} color={Colors.error} />,
      label: i18n.t('menuActions.deleteItem', { type: typeLabel }),
      onPress: onDelete,
      danger: true,
    });
  }

  return menuItems;
};
