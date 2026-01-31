import { getFriendName } from "@/lib/utils";
import { useFriendsStore } from "@/store/friendsStore";
import { Colors } from "@/theme/colors";
import { Spacing } from "@/theme/spacing";
import { StyleSheet, Text, View } from "react-native";
import { useShallow } from "zustand/react/shallow";


export const TransactionScreenItem = ({ item }: { item: any }) =>
{
  const friends = useFriendsStore(useShallow((state) => state.friends));

  return <View style={styles.transactionCard}>
    <view style={styles.transactionInfo}>
      <Text style={styles.transactionTitle}>{item.title}</Text>
      <Text style={styles.transactionFriend}>with {getFriendName(friends, item.friendId)}</Text>
      <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>
    </view>
    <View style={styles.transactionAmount}>
      <Text style={[styles.amountText, item.amount < 0 ? styles.negative : styles.positive]}>
        {item.amount < 0 ? '-' : '+'}${Math.abs(item.amount).toFixed(2)}
      </Text>
      <Text style={styles.categoryText}>{item.category}</Text>
    </View>
  </View>
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  menuButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
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
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});