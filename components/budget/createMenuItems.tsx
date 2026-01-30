import { Budget } from "@/types/models";
import { IMenuItem } from "@/types/common";
import { Colors } from "@/theme/colors";
import { Pencil, Pin, PinOff, Trash2 } from "lucide-react-native";

export const createMenuItems = (
  budget: Budget | undefined,
  onPinToggle: () => void,
  onEdit: () => void,
  onDelete: () => void
): IMenuItem[] =>
{
  if (!budget) return [];

  return [
    {
      icon: budget.pinned ? (
        <PinOff size={18} color={Colors.text} />
      ) : (
        <Pin size={18} color={Colors.text} />
      ),
      label: budget.pinned ? "Unpin Budget" : "Pin Budget",
      onPress: onPinToggle,
    },
    {
      icon: <Pencil size={18} color={Colors.text} />,
      label: "Edit Budget",
      onPress: onEdit,
    },
    {
      icon: <Trash2 size={18} color={Colors.error} />,
      label: "Delete Budget",
      onPress: onDelete,
      danger: true,
    },
  ];
};
