import { Colors } from '@/theme/colors';
import { IMenuItem } from '@/types/common';
import { Friend } from '@/types/models';
import { Pin, PinOff, Pencil, Trash2 } from 'lucide-react-native';

export const createMenuItems = (
  friend: Friend,
  onPinToggle: () => void,
  onEdit: () => void,
  onDelete: () => void,
): IMenuItem[] =>
{
  if (!friend) return [];

  return [
    {
      icon: friend.pinned ? (
        <PinOff size={18} color={Colors.text} />
      ) : (
        <Pin size={18} color={Colors.text} />
      ),
      label: friend.pinned ? 'Unpin Friend' : 'Pin Friend',
      onPress: onPinToggle,
    },
    {
      icon: <Pencil size={18} color={Colors.text} />,
      label: 'Edit Friend',
      onPress: onEdit,
    },
    {
      icon: <Trash2 size={18} color={Colors.error} />,
      label: 'Delete Friend',
      onPress: onDelete,
      danger: true,
    },
  ];
};