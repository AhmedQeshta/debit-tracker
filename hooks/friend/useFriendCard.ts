import { useRef, useState } from 'react';
import { Animated } from 'react-native';
import { State } from 'react-native-gesture-handler';
import { Friend } from '@/types/models';
import { useNavigation } from '@/hooks/useNavigation';
import { createMenuItems } from '@/components/friend/createMenuItems';

export const useFriendCard = (
  friend: Friend,
  onPinToggle: (friendId: string) => void,
  handleFriendDelete: (friendId: string, friendName: string) => void,
) => {
  const { navigateToFriend, navigateToFriendEdit } = useNavigation();
  const translateX = useRef(new Animated.Value(0)).current;
  const [isPinning, setIsPinning] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const lastTranslateX = useRef(0);

  const handlePinToggle = (): void => {
    if (onPinToggle && !isPinning) {
      setIsPinning(true);
      onPinToggle(friend.id);
      setTimeout(() => setIsPinning(false), 300);
    }
  };

  const onGestureEvent = (event: any): void => {
    const { translationX } = event.nativeEvent;
    // Only allow swiping left (negative translation), clamp to -80
    if (translationX < 0) {
      const clampedValue = Math.max(translationX, -80);
      translateX.setValue(clampedValue);
      lastTranslateX.current = clampedValue;
    }
  };

  const onHandlerStateChange = (event: any): void => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;

      // Only allow swiping left (negative translation)
      if (translationX < -50) {
        // Swiped left enough, trigger pin toggle
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start(() => {
          handlePinToggle();
          lastTranslateX.current = 0;
        });
      } else {
        // Spring back to original position
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
        lastTranslateX.current = 0;
      }
    }
  };

  const handleCardPress = (): void => {
    const currentValue = lastTranslateX.current;
    if (Math.abs(currentValue) < 10) {
      navigateToFriend(friend.id);
    } else {
      // Reset position if swiped
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
      lastTranslateX.current = 0;
    }
  };

  const animatedStyle = {
    transform: [{ translateX }],
  };

  const handleEdit = (): void => {
    navigateToFriendEdit(friend.id);
  };

  const handleDelete = (): void => {
    handleFriendDelete(friend.id, friend.name);
  };

  const menuItems = createMenuItems(friend, handlePinToggle, handleEdit, handleDelete);

  return {
    animatedStyle,
    handleCardPress,
    handlePinToggle,
    onGestureEvent,
    onHandlerStateChange,
    isPinning,
    menuItems,
    menuVisible,
    setMenuVisible,
  };
};
