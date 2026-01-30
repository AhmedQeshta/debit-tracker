import { Colors } from "@/theme/colors";
import { IMenuItem } from "@/types/common";
import { User } from "@/types/models";
import { Pin, PinOff, Pencil, Trash2 } from "lucide-react-native";

export const createMenuItems = (
  user: User,
  onPinToggle: () => void,
  onEdit: () => void,
  onDelete: () => void
): IMenuItem[] =>
{
  if (!user) return [];

  return [
    {
      icon: user.pinned ? (
        <PinOff size={18} color={Colors.text} />
      ) : (
        <Pin size={18} color={Colors.text} />
      ),
      label: user.pinned ? "Unpin User" : "Pin User",
      onPress: onPinToggle,
    },
    {
      icon: <Pencil size={18} color={Colors.text} />,
      label: "Edit User",
      onPress: onEdit,
    },
    {
      icon: <Trash2 size={18} color={Colors.error} />,
      label: "Delete User",
      onPress: onDelete,
      danger: true,
    },
  ];
};