import { useRouter, useSegments } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Animated } from 'react-native';

export const DRAWER_WIDTH = 280;

export const useDrawer = () => {
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
    // Allow direct navigation for defined routes
    if (path.startsWith('/(drawer)')) {
      router.push(path as any);
    } else {
      // Fallback for any other paths
      router.push(path as any);
    }
    closeDrawer();
  };

  const isActive = (path: string) => {
    // Check if current path matches or starts with the target path
    const segArray = segments as string[];
    const seg0 = segArray[0];
    const seg1 = segArray[1];
    const seg2 = segArray[2];

    // Normalize path for comparison
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const pathSegments = cleanPath.split('/');

    if (path === '/(drawer)/(tabs)' || path === '/(drawer)/(tabs)/index') {
      return (
        seg0 === '(drawer)' &&
        seg1 === '(tabs)' &&
        (segArray.length === 2 || seg2 === 'index' || !seg2)
      );
    }

    // Match segments
    // (drawer)/(tabs)/friends -> seg0=(drawer), seg1=(tabs), seg2=friends
    if (pathSegments.length >= 3) {
      return seg0 === pathSegments[0] && seg1 === pathSegments[1] && seg2 === pathSegments[2];
    }

    if (pathSegments.length === 2) {
      return seg0 === pathSegments[0] && seg1 === pathSegments[1];
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
  };
};
