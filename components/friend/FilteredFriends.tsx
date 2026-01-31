import { getBalance } from '@/lib/utils';
import { GridFriendCard } from './GridFriendCard';
import { FriendCard } from './FriendCard';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { IFilteredFriendsProps } from '@/types/friend';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useShallow } from 'zustand/react/shallow';
import { createMenuItems } from '@/components/friend/createMenuItems';

export const FilteredFriends = ({
  item,
  isGrid,
  handleFriendEdit,
  handleFriendDelete,
  handlePinToggle = () => { },
}: IFilteredFriendsProps) =>
{
  const transactions = useTransactionsStore(useShallow((state) => state.transactions));
  const balance = getBalance(item.id, transactions);

  const menuItems = createMenuItems(item, () => handlePinToggle(item.id), () => handleFriendEdit(item.id), () => handleFriendDelete(item.id, item.name));

  return isGrid ? (
    <GridFriendCard friend={item} balance={balance} menuItems={menuItems} />
  ) : (
    <View style={styles.listItem}>
      <FriendCard
        friend={item}
        balance={balance}
        showActions={true}
        handlePinToggle={handlePinToggle}
        handleFriendDelete={handleFriendDelete}
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
