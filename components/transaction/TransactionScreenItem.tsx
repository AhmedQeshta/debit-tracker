import { Actions } from '@/components/ui/Actions';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { ITransactionScreenItemProps } from '@/types/transaction';
import { Pencil, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

export const TransactionScreenItem = ({
  row,
  onEdit,
  onDelete,
  onPress,
}: ITransactionScreenItemProps) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const menuItems = [];
  if (onEdit) {
    menuItems.push({
      icon: <Pencil size={18} color={Colors.text} />,
      label: 'Edit Transaction',
      onPress: () => onEdit(row.transaction.id),
    });
  }

  if (onDelete) {
    menuItems.push({
      icon: <Trash2 size={18} color={Colors.error} />,
      label: 'Delete Transaction',
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
        accessibilityLabel={`Edit ${row.title}`}>
        <Pencil size={16} color={Colors.text} />
        <Text style={styles.swipeActionText}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.swipeActionButton, styles.swipeActionDelete]}
        onPress={() => onDelete?.(row.transaction.id, row.title)}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${row.title}`}>
        <Trash2 size={16} color={Colors.error} />
        <Text style={[styles.swipeActionText, styles.swipeDeleteText]}>Delete</Text>
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
        accessibilityHint="Opens transaction details"
        accessibilityLabel={`${row.title}, ${row.amountDirectionLabel} ${row.amountText}`}>
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
                {isFailed ? 'Failed' : 'Pending sync'}
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

const styles = StyleSheet.create({
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  avatarText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: '700',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  transactionFriend: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
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
    color: Colors.success,
  },
  negative: {
    color: Colors.error,
  },
  statusPill: {
    marginTop: 6,
    borderRadius: Spacing.borderRadius.round,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pendingPill: {
    backgroundColor: Colors.surface,
  },
  failedPill: {
    backgroundColor: Colors.surface,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  pendingText: {
    color: Colors.primary,
  },
  failedText: {
    color: Colors.error,
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
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    minHeight: 80,
  },
  swipeActionDelete: {
    borderColor: Colors.error,
  },
  swipeActionText: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  swipeDeleteText: {
    color: Colors.error,
  },
});
