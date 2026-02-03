import { TouchableOpacity, View, Text, StyleSheet, Image, Pressable, Animated } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Pencil, Pin, Trash2, PinOff } from 'lucide-react-native';
import { useFriendCard } from '@/hooks/friend/useFriendCard';
import { IFriendCardProps } from '@/types/friend';
import { Actions } from '@/components/ui/Actions';
import { useActionMenu } from '@/hooks/common/useActionMenu';

export const FriendCard = ({
  friend,
  balance,
  showActions,
  handleFriendDelete,
  handlePinToggle,
}: IFriendCardProps) => {
  const {
    animatedStyle,
    handleCardPress,
    onGestureEvent,
    onHandlerStateChange,
    menuItems,
  } = useFriendCard(friend, handlePinToggle || (() => {}), handleFriendDelete);
  const { openMenu } = useActionMenu();

  return (
    <View style={styles.wrapper}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-5, 5]}>
        <Animated.View style={animatedStyle}>
          <Pressable onPress={handleCardPress}>
            <View style={styles.container}>
              <View style={styles.imageContainer}>
                {friend.imageUri ? (
                  <Image source={{ uri: friend.imageUri }} style={styles.image} />
                ) : (
                  <View style={[styles.image, styles.placeholderImage]}>
                    <Text style={styles.placeholderText}>{friend.name.charAt(0)}</Text>
                  </View>
                )}
                {friend.pinned && (
                  <View style={styles.pinIndicator}>
                    <Pin size={12} color={Colors.primary} fill={Colors.primary} />
                  </View>
                )}
              </View>
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{friend.name}</Text>
                  {friend.pinned && (
                    <Pin
                      size={14}
                      color={Colors.primary}
                      fill={Colors.primary}
                      style={styles.pinIcon}
                    />
                  )}
                </View>
                <Text style={styles.bio} numberOfLines={1}>
                  {friend.bio}
                </Text>
              </View>
              <View style={styles.balanceContainer}>
                <Text style={[styles.balance, balance < 0 ? styles.negative : styles.positive]}>
                  {friend.currency || '$'}
                  {Math.abs(balance).toFixed(2)}
                </Text>
                <Text style={styles.balanceLabel}>{balance < 0 ? 'Owes You' : 'You Owe'}</Text>
              </View>
              {showActions && menuItems ? (
                <Actions
                  menuItems={menuItems}
                  openMenu={openMenu}
                />
              ) : handlePinToggle ? (
                <TouchableOpacity
                  style={styles.pinButton}
                  onPress={() => handlePinToggle(friend.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  {friend.pinned ? (
                    <PinOff size={20} color={Colors.textSecondary} />
                  ) : (
                    <Pin size={20} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>
              ) : null}
            </View>
          </Pressable>
        </Animated.View>
      </PanGestureHandler>
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
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageContainer: {
    marginRight: Spacing.md,
    position: 'relative',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  placeholderImage: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
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
    fontSize: 16,
    fontWeight: '700',
  },
  pinIcon: {
    marginLeft: Spacing.xs,
  },
  bio: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  balanceContainer: {
    alignItems: 'flex-end',
    marginRight: Spacing.sm,
  },
  balance: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positive: {
    color: Colors.success,
  },
  negative: {
    color: Colors.error,
  },
  balanceLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  pinButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
