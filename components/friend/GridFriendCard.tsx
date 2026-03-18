import { useNavigation } from '@/hooks/useNavigation';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { GridFriendCardProps } from '@/types/friend';
import { Pin } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Actions } from '../ui/Actions';

export const GridFriendCard = ({ row, menuItems }: GridFriendCardProps) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { navigateToFriend } = useNavigation();

  const initials = row.friend.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const toneStyle =
    row.status === 'owes-you'
      ? styles.positive
      : row.status === 'you-owe'
        ? styles.negative
        : styles.neutral;

  return (
    <View style={styles.gridItem}>
      <Pressable
        style={styles.gridCard}
        onPress={() => navigateToFriend(row.friend.id)}
        accessibilityRole="button"
        accessibilityLabel={`${row.friend.name}, ${row.directionLabel} ${row.amountText}`}>
        <View style={styles.gridCardHeader}>
          <View style={styles.gridActions}>
            <Actions
              menuVisible={menuVisible}
              setMenuVisible={setMenuVisible}
              menuItems={menuItems}
            />
          </View>
        </View>
        <View style={styles.gridAvatarContainer}>
          <View style={styles.gridAvatar}>
            <Text style={styles.gridAvatarText}>{initials}</Text>
          </View>
          {row.friend.pinned && (
            <View style={styles.gridPinIndicator}>
              <Pin size={12} color={Colors.primary} fill={Colors.primary} />
            </View>
          )}
        </View>
        <View style={styles.gridNameRow}>
          <Text style={styles.gridName} numberOfLines={1}>
            {row.friend.name}
          </Text>
          {row.friend.pinned && (
            <Pin
              size={14}
              color={Colors.primary}
              fill={Colors.primary}
              style={styles.gridPinIcon}
            />
          )}
        </View>
        <Text style={styles.gridSubtitle} numberOfLines={1}>
          {row.subtitle}
        </Text>
        <Text style={[styles.gridAmount, toneStyle]}>{row.amountText}</Text>
        <Text style={[styles.gridDirection, toneStyle]}>{row.directionLabel}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  gridItem: {
    flex: 0.5,
    marginHorizontal: 4,
  },
  gridCard: {
    backgroundColor: Colors.card,
    paddingVertical: 12,
    paddingHorizontal: Spacing.sm,
    borderRadius: Spacing.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    minHeight: 182,
  },
  gridCardHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  gridActions: {
    zIndex: 10,
  },
  gridAvatarContainer: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  gridAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  gridPinIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 2,
  },
  gridNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  gridName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    maxWidth: '88%',
  },
  gridSubtitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginBottom: Spacing.xs,
  },
  gridAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  gridDirection: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
  },
  negative: {
    color: Colors.error,
  },
  positive: {
    color: Colors.success,
  },
  neutral: {
    color: Colors.text,
  },
  gridPinIcon: {
    marginLeft: Spacing.xs,
  },
});
