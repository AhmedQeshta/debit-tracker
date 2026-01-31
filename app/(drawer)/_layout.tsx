import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Slot } from 'expo-router';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { DRAWER_WIDTH, useDrawer } from '@/hooks/drawer/useDrawer';
import { DrawerContext } from '@/hooks/drawer/useDrawerContext';
import { DrawerContent } from '@/components/drawer/DrawerContent';



export default function DrawerLayoutWrapper()
{
  const { closeDrawer, insets, isActive, navigateTo, openDrawer, toggleDrawer, drawerOpen, overlayAnim, slideAnim } = useDrawer();


  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer, toggleDrawer }}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Slot />
        </View>

        {drawerOpen && (
          <>
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={closeDrawer}>
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
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}>
              <DrawerContent insets={insets} closeDrawer={closeDrawer} isActive={isActive} navigateTo={navigateTo} />
            </Animated.View>
          </>
        )}
      </View>
    </DrawerContext.Provider>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 1000,
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawerContent: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  drawerMenu: {
    flex: 1,
    paddingTop: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginHorizontal: Spacing.sm,
    marginVertical: Spacing.xs,
    borderRadius: Spacing.borderRadius.md,
    gap: Spacing.md,
  },
  menuItemActive: {
    backgroundColor: Colors.card,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  menuItemTextActive: {
    color: Colors.primary,
  },
});
