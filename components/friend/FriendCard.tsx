import { Actions } from '@/components/ui/Actions';
import { useNavigation } from '@/hooks/useNavigation';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { IFriendCardProps } from '@/types/friend';
import { CircleDollarSign, Copy, Pencil, Pin, PinOff, Trash2 } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

export const FriendCard = ({
  row,
  menuItems,
  showActions,
  handleFriendDelete,
  handlePinToggle,
  onCopyAmount,
  onSettle,
}: IFriendCardProps) => {
  const { t } = useTranslation();
  const { navigateToFriend, navigateToFriendEdit } = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const swipeableRef = useRef<Swipeable>(null);

  const toneStyle = useMemo(() => {
    if (row.status === 'owes-you') return styles.positive;
    if (row.status === 'you-owe') return styles.negative;
    return styles.neutral;
  }, [row.status]);

  const initials = row.friend.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const closeSwipeAndRun = (callback: () => void) => {
    swipeableRef.current?.close();
    callback();
  };

  const renderRightActions = () => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={styles.swipeActionButton}
        onPress={() => closeSwipeAndRun(() => onCopyAmount(row.friend.id))}
        accessibilityRole="button"
        accessibilityLabel={t('friendCard.accessibility.copyTransactionAmount', {
          name: row.friend.name,
        })}>
        <Copy size={16} color={Colors.text} />
        <Text style={styles.swipeActionText}>{t('friendDetail.actions.copy')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.swipeActionButton}
        onPress={() => closeSwipeAndRun(() => onSettle(row.friend.id))}
        accessibilityRole="button"
        accessibilityLabel={t('friendCard.accessibility.settleBalanceWith', {
          name: row.friend.name,
        })}>
        <CircleDollarSign size={16} color={Colors.text} />
        <Text style={styles.swipeActionText}>{t('dashboard.actions.settle')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.swipeActionButton}
        onPress={() => closeSwipeAndRun(() => navigateToFriendEdit(row.friend.id))}
        accessibilityRole="button"
        accessibilityLabel={t('friendCard.accessibility.edit', { name: row.friend.name })}>
        <Pencil size={16} color={Colors.text} />
        <Text style={styles.swipeActionText}>{t('common.actions.edit')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeActionButton, styles.swipeActionDelete]}
        onPress={() => closeSwipeAndRun(() => handleFriendDelete(row.friend.id, row.friend.name))}
        accessibilityRole="button"
        accessibilityLabel={t('friendCard.accessibility.delete', { name: row.friend.name })}>
        <Trash2 size={16} color={Colors.error} />
        <Text style={[styles.swipeActionText, styles.swipeActionDeleteText]}>
          {t('common.actions.delete')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        friction={2}
        overshootRight={false}
        rightThreshold={36}>
        <Pressable
          onPress={() => navigateToFriend(row.friend.id)}
          accessibilityRole="button"
          accessibilityLabel={t('friendCard.accessibility.openFriend', {
            name: row.friend.name,
            direction: row.directionLabel,
            amount: row.amountText,
          })}>
          <View style={styles.container}>
            <View style={styles.imageContainer}>
              {row.friend.imageUri ? (
                <Image source={{ uri: row.friend.imageUri }} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.placeholderImage]}>
                  <Text style={styles.placeholderText}>{initials}</Text>
                </View>
              )}
              {row.friend.pinned && (
                <View style={styles.pinIndicator}>
                  <Pin size={12} color={Colors.primary} fill={Colors.primary} />
                </View>
              )}
            </View>
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {row.friend.name}
                </Text>
                {row.friend.pinned && (
                  <Pin
                    size={14}
                    color={Colors.primary}
                    fill={Colors.primary}
                    style={styles.pinIcon}
                  />
                )}
              </View>
              <Text style={styles.bio} numberOfLines={1}>
                {row.subtitle}
              </Text>
            </View>
            <View style={styles.balanceContainer}>
              <Text style={[styles.balance, toneStyle]}>{row.amountText}</Text>
              <Text style={[styles.balanceLabel, toneStyle]}>{row.directionLabel}</Text>
            </View>
            {showActions && menuItems ? (
              <Actions
                menuVisible={menuVisible}
                setMenuVisible={setMenuVisible}
                menuItems={menuItems}
              />
            ) : handlePinToggle ? (
              <TouchableOpacity
                style={styles.pinButton}
                onPress={() => handlePinToggle(row.friend.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                {row.friend.pinned ? (
                  <PinOff size={20} color={Colors.textSecondary} />
                ) : (
                  <Pin size={20} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        </Pressable>
      </Swipeable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 78,
  },
  imageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  placeholderImage: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  pinIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 2,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  pinIcon: {
    marginLeft: Spacing.xs,
  },
  bio: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  balanceContainer: {
    alignItems: 'flex-end',
    marginRight: Spacing.xs,
    marginLeft: Spacing.sm,
    minWidth: 96,
  },
  balance: {
    fontSize: 15,
    fontWeight: '700',
  },
  positive: {
    color: Colors.success,
  },
  negative: {
    color: Colors.error,
  },
  neutral: {
    color: Colors.text,
  },
  balanceLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  pinButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeActions: {
    width: 284,
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: Spacing.sm,
  },
  swipeActionButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 78,
  },
  swipeActionDelete: {
    borderColor: Colors.error,
  },
  swipeActionText: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  swipeActionDeleteText: {
    color: Colors.error,
  },
});
