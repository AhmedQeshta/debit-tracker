import { DrawerContent } from '@/components/drawer/DrawerContent';
import { useTheme } from '@/contexts/ThemeContext';
import { DRAWER_WIDTH, useDrawer } from '@/hooks/drawer/useDrawer';
import { DrawerContext } from '@/hooks/drawer/useDrawerContext';
import { Slot } from 'expo-router';
import { useMemo } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function DrawerLayoutWrapper() {
  const {
    closeDrawer,
    insets,
    isActive,
    navigateTo,
    openDrawer,
    toggleDrawer,
    drawerOpen,
    overlayAnim,
    slideAnim,
    isRTL,
  } = useDrawer();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const drawerContextValue = useMemo(
    () => ({ openDrawer, closeDrawer, toggleDrawer }),
    [openDrawer, closeDrawer, toggleDrawer],
  );

  return (
    <DrawerContext.Provider value={drawerContextValue}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Slot />
        </View>

        {drawerOpen && (
          <>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeDrawer}>
              <Animated.View
                style={[
                  styles.overlayAnimated,
                  {
                    opacity: overlayAnim,
                  },
                ]}
              />
            </TouchableOpacity>
            <Animated.View
              style={[
                styles.drawer,
                isRTL ? styles.drawerRtl : styles.drawerLtr,
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}>
              <DrawerContent
                insets={insets}
                closeDrawer={closeDrawer}
                isActive={isActive}
                navigateTo={navigateTo}
              />
            </Animated.View>
          </>
        )}
      </View>
    </DrawerContext.Provider>
  );
}

const createStyles = (colors: { surface: string; shadow: string; overlay: string }) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
    },
    overlayAnimated: {
      flex: 1,
      backgroundColor: colors.overlay,
    },
    drawer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: DRAWER_WIDTH,
      zIndex: 1000,
      backgroundColor: colors.surface,
      shadowColor: colors.shadow,
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 5,
    },
    drawerLtr: {
      left: 0,
      shadowOffset: {
        width: 2,
        height: 0,
      },
    },
    drawerRtl: {
      right: 0,
      shadowOffset: {
        width: -2,
        height: 0,
      },
    },
  });
