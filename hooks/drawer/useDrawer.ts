import { useRouter, useSegments } from "expo-router";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {  Animated } from 'react-native';


export const DRAWER_WIDTH = 280;

export const useDrawer =()=>{
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const slideAnim = useState(new Animated.Value(-DRAWER_WIDTH))[0];
  const overlayAnim = useState(new Animated.Value(0))[0];

  const toggleDrawer = () => {
    if (drawerOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDrawerOpen(false);
    });
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const navigateTo = (path: string) => {
    // Use relative paths for Expo Router
    if (path === '/(drawer)/(tabs)' || path === '/(drawer)/(tabs)/index') {
      router.push('/(drawer)/(tabs)' as any);
    } else if (path === '/(drawer)/(tabs)/users') {
      router.push('/(drawer)/(tabs)/users' as any);
    } else if (path === '/(drawer)/(tabs)/dashboard') {
      router.push('/(drawer)/(tabs)/dashboard' as any);
    } else if (path === '/(drawer)/budget') {
      router.push('/(drawer)/budget' as any);
    } else if (path === '/(drawer)/about') {
      router.push('/(drawer)/about' as any);
    }
    closeDrawer();
  };

  const isActive = (path: string) => {
    // Check if current path matches or starts with the target path
    const segArray = segments as string[];
    const seg0 = segArray[0];
    const seg1 = segArray[1];
    const seg2 = segArray[2];
    
    if (path === '/(drawer)/(tabs)' || path === '/(drawer)/(tabs)/index') {
      // For home tab, check if we're on index route
      return seg0 === '(drawer)' && seg1 === '(tabs)' && (segArray.length === 2 || seg2 === 'index' || !seg2);
    }
    if (path === '/(drawer)/(tabs)/users') {
      // For users tab
      return seg0 === '(drawer)' && seg1 === '(tabs)' && seg2 === 'users';
    }
    if (path === '/(drawer)/(tabs)/dashboard') {
      // For dashboard tab
      return seg0 === '(drawer)' && seg1 === '(tabs)' && seg2 === 'dashboard';
    }
    if (path === '/(drawer)/budget') {
      return seg0 === '(drawer)' && seg1 === 'budget';
    }
    if (path === '/(drawer)/about') {
      return seg0 === '(drawer)' && seg1 === 'about';
    }
    return false;
  };

  return {
    closeDrawer,
    insets,
    isActive,
    navigateTo,
    openDrawer,
    toggleDrawer,
    drawerOpen,
    overlayAnim,
    slideAnim,


  }
}