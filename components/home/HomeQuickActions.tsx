import { QuickActionItem } from '@/components/home/QuickActionItem';
import { Spacing } from '@/theme/spacing';
import { HomeQuickActionsProps } from '@/types/common';
import { Plus, UserPlus, Wallet } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

export const HomeQuickActions = ({
  onAddTransaction,
  onAddFriend,
  onCreateBudget,
}: HomeQuickActionsProps) => {
  return (
    <View style={styles.row}>
      <QuickActionItem icon={UserPlus} label="Add Friend" onPress={onAddFriend} primary />
      <QuickActionItem icon={Plus} label="Add Transaction" onPress={onAddTransaction} />
      <QuickActionItem icon={Wallet} label="Create Budget" onPress={onCreateBudget} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
