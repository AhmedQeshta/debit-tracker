import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { Home, Users, LayoutDashboard } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';

export const BottomNav = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <View style={styles.container}>
      <Link href="/" asChild>
        <TouchableOpacity style={styles.tab}>
          <Home size={24} stroke={isActive('/') ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.label, isActive('/') ? styles.activeLabel : {}]}>Home</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/users" asChild>
        <TouchableOpacity style={styles.tab}>
          <Users size={24} stroke={isActive('/users') ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.label, isActive('/users') ? styles.activeLabel : {}]}>Users</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/dashboard" asChild>
        <TouchableOpacity style={styles.tab}>
          <LayoutDashboard
            size={24}
            stroke={isActive('/dashboard') ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.label, isActive('/dashboard') ? styles.activeLabel : {}]}>
            Dashboard
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Spacing.md,
  },
  tab: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  label: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activeLabel: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
