import { QuickActionItem } from '@/components/home/QuickActionItem';
import { Spacing } from '@/theme/spacing';
import { HomeQuickActionsProps } from '@/types/common';
import { Plus, UserPlus, Wallet } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

export const HomeQuickActions = ({
  onAddTransaction,
  onAddFriend,
  onCreateBudget,
}: HomeQuickActionsProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      <QuickActionItem
        icon={UserPlus}
        label={t('home.actions.addFriend')}
        onPress={onAddFriend}
        primary
      />
      <QuickActionItem
        icon={Plus}
        label={t('home.actions.addTransaction')}
        onPress={onAddTransaction}
      />
      <QuickActionItem
        icon={Wallet}
        label={t('home.actions.createBudget')}
        onPress={onCreateBudget}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
