import { Actions } from '@/components/ui/Actions';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import { ITransactionScreenItemProps } from '@/types/transaction';
import { Pencil, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

export const TransactionScreenItem = ({
  row,
  onEdit,
  onDelete,
  onPress,
}: ITransactionScreenItemProps) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [menuVisible, setMenuVisible] = useState(false);

  const menuItems = [];
  if (onEdit) {
    menuItems.push({
      icon: <Pencil size={18} color={colors.text} />,
      label: t('transactionItem.menu.editTransaction'),
      onPress: () => onEdit(row.transaction.id),
    });
  }

  if (onDelete) {
    menuItems.push({
      icon: <Trash2 size={18} color={colors.danger} />,
      label: t('transactionItem.menu.deleteTransaction'),
      onPress: () => onDelete(row.transaction.id, row.title),
      danger: true,
    });
  }

  const renderRightActions = () => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={styles.swipeActionButton}
        onPress={() => onEdit?.(row.transaction.id)}
        accessibilityRole="button"
        accessibilityLabel={t('transactionItem.accessibility.editTransaction', {
          title: row.title,
        })}>
        <Pencil size={16} color={colors.text} />
        <Text style={styles.swipeActionText}>{t('common.actions.edit')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.swipeActionButton, styles.swipeActionDelete]}
        onPress={() => onDelete?.(row.transaction.id, row.title)}
        accessibilityRole="button"
        accessibilityLabel={t('transactionItem.accessibility.deleteTransaction', {
          title: row.title,
        })}>
        <Trash2 size={16} color={colors.danger} />
        <Text style={[styles.swipeActionText, styles.swipeDeleteText]}>
          {t('common.actions.delete')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const initials = row.friendName
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const amountToneStyle = row.amountTone === 'positive' ? styles.positive : styles.negative;
  const showSyncPill = row.syncStatus !== 'synced';
  const isFailed = row.syncStatus === 'failed';

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false} rightThreshold={36}>
      <Pressable
        style={({ pressed }) => [styles.transactionCard, pressed && styles.transactionCardPressed]}
        onPress={() => onPress?.(row.transaction.id)}
        accessibilityRole="button"
        accessibilityHint={t('transactionItem.accessibility.openDetailsHint')}
        accessibilityLabel={t('transactionItem.accessibility.transactionSummary', {
          title: row.title,
          direction: row.amountDirectionLabel,
          amount: row.amountText,
        })}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle} numberOfLines={1}>
            {row.title}
          </Text>
          <Text style={styles.transactionFriend} numberOfLines={1}>
            {row.subtitle}
          </Text>
          {row.budgetName ? (
            <Text style={styles.transactionBudget} numberOfLines={1}>
              {t('transactionItem.labels.budgetPrefix')}: {row.budgetName}
              {row.budgetRemainingText
                ? ` • ${t('budgetCard.status.left', { amount: row.budgetRemainingText })}`
                : ''}
            </Text>
          ) : null}
          <Text style={styles.transactionDate}>
            {row.timeText} • {row.dateText}
          </Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text style={[styles.amountText, amountToneStyle]}>{row.amountText}</Text>
          <Text style={[styles.amountLabel, amountToneStyle]}>{row.amountDirectionLabel}</Text>
          {showSyncPill ? (
            <View style={[styles.statusPill, isFailed ? styles.failedPill : styles.pendingPill]}>
              <Text style={[styles.statusText, isFailed ? styles.failedText : styles.pendingText]}>
                {isFailed
                  ? t('transactionItem.status.failed')
                  : t('transactionItem.status.pendingSync')}
              </Text>
            </View>
          ) : null}
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
      </Pressable>
    </Swipeable>
  );
};

const createStyles = (colors: {
  surface: string;
  border: string;
  accent: string;
  text: string;
  textMuted: string;
  success: string;
  danger: string;
  warning: string;
  warningSoft: string;
  dangerSoft: string;
}) =>
  StyleSheet.create({
    transactionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingVertical: 12,
      paddingHorizontal: Spacing.md,
      borderRadius: Spacing.borderRadius.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 80,
    },
    transactionCardPressed: {
      opacity: 0.85,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      marginRight: Spacing.sm,
    },
    avatarText: {
      color: colors.surface,
      fontSize: 12,
      fontWeight: '700',
    },
    transactionInfo: {
      flex: 1,
    },
    transactionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    transactionFriend: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    transactionDate: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 4,
    },
    transactionBudget: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    transactionAmount: {
      alignItems: 'flex-end',
      marginRight: Spacing.xs,
      minWidth: 88,
    },
    amountText: {
      fontSize: 15,
      fontWeight: '700',
    },
    amountLabel: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
    },
    positive: {
      color: colors.success,
    },
    negative: {
      color: colors.danger,
    },
    statusPill: {
      marginTop: 6,
      borderRadius: Spacing.borderRadius.round,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    pendingPill: {
      backgroundColor: colors.warningSoft,
    },
    failedPill: {
      backgroundColor: colors.dangerSoft,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '600',
    },
    pendingText: {
      color: colors.warning,
    },
    failedText: {
      color: colors.danger,
    },
    actions: {
      marginLeft: Spacing.xs,
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
    },
    swipeActions: {
      width: 210,
      flexDirection: 'row',
      marginBottom: Spacing.sm,
    },
    swipeActionButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      minHeight: 80,
    },
    swipeActionDelete: {
      borderColor: colors.danger,
    },
    swipeActionText: {
      color: colors.text,
      fontSize: 11,
      fontWeight: '600',
    },
    swipeDeleteText: {
      color: colors.danger,
    },
  });
