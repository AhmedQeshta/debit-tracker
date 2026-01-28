import { useState, createContext, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerLayout } from 'react-native-drawer-layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useSegments, Slot } from 'expo-router';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { Home, Info, X } from 'lucide-react-native';

type DrawerContextType = {
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};

const DrawerContext = createContext<DrawerContextType | null>(null);

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within DrawerLayoutWrapper');
  }
  return context;
};

export default function DrawerLayoutWrapper() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const openDrawer = () => {
    setDrawerOpen(true);
  };

  const navigateTo = (path: string) => {
    // Use relative paths for Expo Router
    if (path === '/(drawer)/(tabs)') {
      router.push('/(drawer)/(tabs)' as any);
    } else if (path === '/(drawer)/about') {
      router.push('/(drawer)/about' as any);
    }
    closeDrawer();
  };

  const isActive = (path: string) => {
    const currentPath = '/' + segments.join('/');
    // Check if current path matches or starts with the target path
    if (path === '/(drawer)/(tabs)') {
      // For tabs, check if we're in the tabs section
      return segments[0] === '(drawer)' && segments[1] === '(tabs)';
    }
    if (path === '/(drawer)/about') {
      return segments[0] === '(drawer)' && segments[1] === 'about';
    }
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const drawerContent = () => (
    <View style={[styles.drawerContent, { paddingTop: insets.top }]}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Menu</Text>
        <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.drawerMenu}>
        <TouchableOpacity
          style={[styles.menuItem, isActive('/(drawer)/(tabs)') && styles.menuItemActive]}
          onPress={() => navigateTo('/(drawer)/(tabs)')}>
          <Home size={20} color={isActive('/(drawer)/(tabs)') ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.menuItemText, isActive('/(drawer)/(tabs)') && styles.menuItemTextActive]}>
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuItem, isActive('/(drawer)/about') && styles.menuItemActive]}
          onPress={() => navigateTo('/(drawer)/about')}>
          <Info size={20} color={isActive('/(drawer)/about') ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.menuItemText, isActive('/(drawer)/about') && styles.menuItemTextActive]}>
            About Me
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer, toggleDrawer }}>
      <DrawerLayout
        drawerPosition="left"
        drawerType="slide"
        drawerStyle={styles.drawer}
        open={drawerOpen}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
        renderDrawerContent={drawerContent}
        overlayStyle={styles.overlay}>
        <View style={styles.content}>
          <Slot />
        </View>
      </DrawerLayout>
    </DrawerContext.Provider>
  );
}

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: Colors.surface,
    width: 280,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    flex: 1,
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
