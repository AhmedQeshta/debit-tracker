import { Actions } from '@/components/ui/Actions';
import { createMenuItems } from '@/components/ui/CreateMenuItems';
import { useTheme } from '@/contexts/ThemeContext';
import { formatAbsoluteCurrency } from '@/lib/utils';
import { useBudgetStore } from '@/store/budgetStore';
import { Spacing } from '@/theme/spacing';
import { ITransactionItemProps } from '@/types/transaction';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

export const TransactionItem = ({
  transaction,
  currency,
  onDelete,
  onEdit,
  onCopyAmount,
}: ITransactionItemProps) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [menuVisible, setMenuVisible] = useState(false);
  const linkedBudget = useBudgetStore((state) =>
    state.budgets.find((budget) => budget.id === transaction.budgetId && !budget.deletedAt),
  );

  const menuItems = createMenuItems(
    t('transactionItem.menu.typeLabel'),
    () => onEdit(transaction.id),
    () => onDelete(transaction.id),
    undefined,
    undefined,
    onCopyAmount,
  );

  const isPositive = transaction.amount > 0;

  return (
    <View style={styles.container}>
      <View style={[styles.iconBadge, isPositive ? styles.iconPositive : styles.iconNegative]}>
        {isPositive ? (
          <ArrowUpRight size={14} color={colors.success} />
        ) : (
          <ArrowDownLeft size={14} color={colors.danger} />
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{transaction.title}</Text>
        <Text style={styles.meta}>
          {transaction.note || t('transactionItem.labels.noNote')} •{' '}
          {new Date(transaction.createdAt).toLocaleDateString()}
        </Text>
        {linkedBudget ? (
          <Text style={styles.meta}>
            {t('transactionItem.labels.budgetPrefix')}: {linkedBudget.title}
          </Text>
        ) : null}
      </View>
      <View style={styles.rightSide}>
        <Text style={[styles.amount, isPositive ? styles.positive : styles.negative]}>
          {formatAbsoluteCurrency(transaction.amount, currency)}
        </Text>
        <View
          style={[styles.statusPill, transaction.synced ? styles.syncedPill : styles.pendingPill]}>
          <Text
            style={[
              styles.statusText,
              transaction.synced ? styles.syncedText : styles.pendingText,
            ]}>
            {transaction.synced
              ? t('transactionItem.status.synced')
              : t('transactionItem.status.pendingSync')}
          </Text>
        </View>
      </View>
      {menuItems.length > 0 && (
        <View style={styles.actions}>
          <Actions
            menuVisible={menuVisible}
            setMenuVisible={setMenuVisible}
            menuItems={menuItems}
          />
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: {
  card: string;
  border: string;
  surface2: string;
  text: string;
  textMuted: string;
  success: string;
  danger: string;
  accent: string;
}) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      padding: Spacing.md,
      borderRadius: Spacing.borderRadius.lg,
      alignItems: 'center',
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconBadge: {
      width: 32,
      height: 32,
      borderRadius: Spacing.borderRadius.round,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.sm,
    },
    iconPositive: {
      backgroundColor: colors.surface2,
    },
    iconNegative: {
      backgroundColor: colors.surface2,
    },
    content: {
      flex: 1,
    },
    title: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    meta: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 2,
    },
    rightSide: {
      alignItems: 'flex-end',
      marginRight: Spacing.sm,
    },
    amount: {
      fontSize: 15,
      fontWeight: '700',
    },
    positive: {
      color: colors.success,
    },
    negative: {
      color: colors.danger,
    },
    statusPill: {
      marginTop: Spacing.xs,
      borderRadius: Spacing.borderRadius.round,
      borderWidth: 1,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
    },
    pendingPill: {
      borderColor: colors.accent,
      backgroundColor: colors.surface2,
    },
    syncedPill: {
      borderColor: colors.border,
      backgroundColor: colors.surface2,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '600',
    },
    pendingText: {
      color: colors.accent,
    },
    syncedText: {
      color: colors.textMuted,
    },
    actions: {
      alignItems: 'center',
    },
  });
