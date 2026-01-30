import { useRef, useState } from "react";
import { Animated } from "react-native";
import { State } from "react-native-gesture-handler";
import { User } from "@/types/models";
import { useNavigation } from "@/hooks/useNavigation";
import { createMenuItems } from "@/components/user/createMenuItems";

export const useUserCard = (
  user: User,
  onPinToggle: (userId: string) => void,
  handleUserDelete: (userId: string, userName: string) => void
) =>
{
  const { navigateToUser, navigateToUserEdit } = useNavigation();
  const translateX = useRef(new Animated.Value(0)).current;
  const [isPinning, setIsPinning] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const lastTranslateX = useRef(0);

  const handlePinToggle = (): void =>
  {
    if (onPinToggle && !isPinning)
    {
      setIsPinning(true);
      onPinToggle(user.id);
      setTimeout(() => setIsPinning(false), 300);
    }
  };

  const onGestureEvent = (event: any): void =>
  {
    const { translationX } = event.nativeEvent;
    // Only allow swiping left (negative translation), clamp to -80
    if (translationX < 0)
    {
      const clampedValue = Math.max(translationX, -80);
      translateX.setValue(clampedValue);
      lastTranslateX.current = clampedValue;
    }
  };

  const onHandlerStateChange = (event: any): void =>
  {
    if (event.nativeEvent.oldState === State.ACTIVE)
    {
      const { translationX } = event.nativeEvent;

      // Only allow swiping left (negative translation)
      if (translationX < -50)
      {
        // Swiped left enough, trigger pin toggle
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start(() =>
        {
          handlePinToggle();
          lastTranslateX.current = 0;
        });
      } else
      {
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

  const handleCardPress = (): void =>
  {
    const currentValue = lastTranslateX.current;
    if (Math.abs(currentValue) < 10)
    {
      navigateToUser(user.id);
    } else
    {
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

  const handleEdit = (): void =>
  {
    navigateToUserEdit(user.id);
  };

  const handleDelete = (): void =>
  {
    handleUserDelete(user.id, user.name);
  };

  const menuItems = createMenuItems(
    user,
    handlePinToggle,
    handleEdit,
    handleDelete
  );

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
