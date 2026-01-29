import { getBalance } from "@/lib/utils";
import { IMenuItem } from "@/types/common";
import { Pencil, Pin, PinOff, Trash2 } from "lucide-react-native";
import { GridUserCard } from "./GridUserCard";
import { UserCard } from "./UserCard";
import { StyleSheet, View } from "react-native";
import { Colors } from '@/theme/colors';
import { Spacing } from "@/theme/spacing";
import { IFilteredUsersProps } from "@/types/user";
import { useTransactionsStore } from "@/store/transactionsStore";
import { useShallow } from "zustand/react/shallow";

export const FilteredUsers = ({ item, isGrid, handleUserEdit, handleUserDelete, handlePinToggle = () => { } }: IFilteredUsersProps) =>
{

  const transactions = useTransactionsStore(useShallow((state) => state.transactions));
  const balance = getBalance(item.id, transactions);

  const menuItems: IMenuItem[] = [
    {
      icon: item.pinned ? <PinOff size={18} color={Colors.text} /> : <Pin size={18} color={Colors.text} />,
      label: item.pinned ? 'Unpin User' : 'Pin User',
      onPress: () => handlePinToggle(item.id),
    },
    {
      icon: <Pencil size={18} color={Colors.text} />,
      label: 'Edit User',
      onPress: () => handleUserEdit(item.id),
    },
    {
      icon: <Trash2 size={18} color={Colors.error} />,
      label: 'Delete User',
      onPress: () => handleUserDelete(item.id, item.name),
      danger: true,
    }
  ];

  return (isGrid ? <GridUserCard
    user={item}
    balance={balance}
    menuItems={menuItems}
  /> : <View style={styles.listItem}><UserCard
    user={item}
    balance={balance}
    showActions={true}
    handlePinToggle={handlePinToggle}
    handleUserDelete={handleUserDelete}
  /></View>

  );
};

const styles = StyleSheet.create({
  listItem: {
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },

  imageContainer: {
    marginRight: Spacing.md,
    position: 'relative',
  },

  placeholderImage: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },


  info: {
    flex: 1,
  },

  pinIcon: {
    marginLeft: Spacing.xs,
  },

  balanceContainer: {
    alignItems: 'flex-end',
    marginRight: Spacing.sm,
  },

});
