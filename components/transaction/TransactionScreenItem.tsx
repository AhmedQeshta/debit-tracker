import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getFriendName } from '@/lib/utils';
import { useFriendsStore } from '@/store/friendsStore';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { useShallow } from 'zustand/react/shallow';
import { Trash2, Pencil } from 'lucide-react-native';
import { Actions } from '@/components/ui/Actions';
import { ITransactionScreenItemProps } from '@/types/transaction';
import { useActionMenu } from '@/hooks/common/useActionMenu';


export const TransactionScreenItem = ({ item, onEdit, onDelete }: ITransactionScreenItemProps) =>
{
  const { openMenu } = useActionMenu();
  const friends = useFriendsStore(useShallow((state) => state.friends));

  const menuItems = [];
  if (onEdit)
  {
    menuItems.push({
      icon: <Pencil size={18} color={Colors.text} />,
      label: 'Edit Transaction',
      onPress: () => onEdit(item.id),
    });
  }
  if (onDelete)
  {
    menuItems.push({
      icon: <Trash2 size={18} color={Colors.error} />,
      label: 'Delete Transaction',
      onPress: () => onDelete(item.id, item.title),
      danger: true,
    });
  }

  return (
    <View style={styles.transactionCard}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionFriend}>with {getFriendName(friends, item.friendId)}</Text>
        <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={[styles.amountText, item.amount < 0 ? styles.negative : styles.positive]}>
          {item.amount < 0 ? '-' : '+'}${Math.abs(item.amount).toFixed(2)}
        </Text>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
      {menuItems.length > 0 && (
        <View style={styles.actions}>
          <Actions
            menuItems={menuItems}
            openMenu={openMenu}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  transactionFriend: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  transactionAmount: {
    alignItems: 'flex-end',
    marginRight: Spacing.sm,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  positive: {
    color: Colors.success,
  },
  negative: {
    color: Colors.error,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  actions: {
    marginLeft: Spacing.xs,
  },
});
