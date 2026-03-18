import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { IFilteredFriendsProps } from '@/types/friend';
import { CircleDollarSign, Copy, Pencil, Pin, PinOff, Trash2 } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { FriendCard } from './FriendCard';
import { GridFriendCard } from './GridFriendCard';

export const FilteredFriends = ({
  row,
  isGrid,
  handleFriendEdit,
  handleFriendDelete,
  handlePinToggle = () => {},
  onCopyAmount,
  onSettle,
}: IFilteredFriendsProps) => {
  const menuItems = [
    {
      icon: <Copy size={18} color={Colors.text} />,
      label: 'Copy Transaction Amount',
      onPress: () => onCopyAmount(row.friend.id),
    },
    {
      icon: <CircleDollarSign size={18} color={Colors.text} />,
      label: 'Settle up',
      onPress: () => onSettle(row.friend.id),
    },
    {
      icon: row.friend.pinned ? (
        <PinOff size={18} color={Colors.text} />
      ) : (
        <Pin size={18} color={Colors.text} />
      ),
      label: row.friend.pinned ? 'Unpin friend' : 'Pin friend',
      onPress: () => handlePinToggle(row.friend.id),
    },
    {
      icon: <Pencil size={18} color={Colors.text} />,
      label: 'Edit friend',
      onPress: () => handleFriendEdit(row.friend.id),
    },
    {
      icon: <Trash2 size={18} color={Colors.error} />,
      label: 'Delete friend',
      onPress: () => handleFriendDelete(row.friend.id, row.friend.name),
      danger: true,
    },
  ];

  return isGrid ? (
    <GridFriendCard row={row} menuItems={menuItems} />
  ) : (
    <View style={styles.listItem}>
      <FriendCard
        row={row}
        menuItems={menuItems}
        showActions={true}
        handlePinToggle={handlePinToggle}
        handleFriendDelete={handleFriendDelete}
        onCopyAmount={onCopyAmount}
        onSettle={onSettle}
      />
    </View>
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
