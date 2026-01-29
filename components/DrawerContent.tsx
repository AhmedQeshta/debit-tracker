import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Colors } from '@/theme/colors';
import { Home, Info, X, Users, LayoutDashboard, Calculator } from 'lucide-react-native';
import { Spacing } from '@/theme/spacing';
import { DRAWER_WIDTH } from '@/hooks/drawer/useDrawer';
import { useUsersStore } from '@/store/usersStore';

export const DrawerContent = ({insets,closeDrawer,isActive,navigateTo,}:any) => {
  const users = useUsersStore((state) => state.users);
  const hasUsers = users.length > 0;

  return (
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
      {hasUsers && (
        <TouchableOpacity
          style={[styles.menuItem, isActive('/(drawer)/(tabs)/users') && styles.menuItemActive]}
          onPress={() => navigateTo('/(drawer)/(tabs)/users')}>
          <Users size={20} color={isActive('/(drawer)/(tabs)/users') ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.menuItemText, isActive('/(drawer)/(tabs)/users') && styles.menuItemTextActive]}>
            Users
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.menuItem, isActive('/(drawer)/(tabs)/dashboard') && styles.menuItemActive]}
        onPress={() => navigateTo('/(drawer)/(tabs)/dashboard')}>
        <LayoutDashboard size={20} color={isActive('/(drawer)/(tabs)/dashboard') ? Colors.primary : Colors.textSecondary} />
        <Text style={[styles.menuItemText, isActive('/(drawer)/(tabs)/dashboard') && styles.menuItemTextActive]}>
          Dashboard
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.menuItem, isActive('/(drawer)/budget') && styles.menuItemActive]}
        onPress={() => navigateTo('/(drawer)/budget')}>
        <Calculator size={20} color={isActive('/(drawer)/budget') ? Colors.primary : Colors.textSecondary} />
        <Text style={[styles.menuItemText, isActive('/(drawer)/budget') && styles.menuItemTextActive]}>
          Budget Calculator
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
};


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
