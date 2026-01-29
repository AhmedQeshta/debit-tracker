import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet, Image, Pressable, Animated } from 'react-native';
import { User } from "@/types/models";
import { State } from 'react-native-gesture-handler';
import { IMenuItem } from "@/types/common";
import { Colors } from "@/theme/colors";
import { Pencil, Pin, PinOff, Trash2 } from "lucide-react-native";

export const useUserCard = (user: User, onPinToggle: (userId: string) => void, handleUserDelete: (userId: string, userName: string) => void) =>
{
  const router = useRouter();
  const translateX = useRef(new Animated.Value(0)).current;
  const [isPinning, setIsPinning] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const lastTranslateX = useRef(0);

  const handlePinToggle = () =>
  {
    if (onPinToggle && !isPinning)
    {
      setIsPinning(true);
      onPinToggle(user.id);
      setTimeout(() => setIsPinning(false), 300);
    }
  };

  const onGestureEvent = (event: any) =>
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

  const onHandlerStateChange = (event: any) =>
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

  const handleCardPress = () =>
  {
    const currentValue = lastTranslateX.current;
    if (Math.abs(currentValue) < 10)
    {
      router.push(`/user/${user.id}`);
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



  const menuItems: IMenuItem[] = [
    {
      icon: user.pinned ? (
        <PinOff size={18} color={Colors.text} />
      ) : (
        <Pin size={18} color={Colors.text} />
      ),
      label: user.pinned ? 'Unpin User' : 'Pin User',
      onPress: () => handlePinToggle(),
    },
    {
      icon: <Pencil size={18} color={Colors.text} />,
      label: 'Edit User',
      onPress: () => router.push(`/user/${user.id}/edit`),
    },
    {
      icon: <Trash2 size={18} color={Colors.error} />,
      label: 'Delete User',
      onPress: () => handleUserDelete(user.id, user.name),
      danger: true,
    },
  ];


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