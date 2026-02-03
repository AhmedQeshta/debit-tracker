import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '@/theme/colors';
import
{
  Info,
  X,
  LogIn,
  LogOut,
} from 'lucide-react-native';
import { Spacing } from '@/theme/spacing';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { MenuItemDrawer } from '@/components/drawer/MenuItemDrawer';
import { MAIN_MENU_ITEMS } from '@/lib/menu';
import { SyncStatus } from '@/components/sync/SyncStatus';


export const DrawerContent = ({ insets, closeDrawer, isActive, navigateTo }: any) =>
{
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleAuthAction = () =>
  {
    if (isSignedIn) signOut();
    else router.push('/(auth)/login');
    closeDrawer();
  };

  return (
    <View style={[styles.drawerContent, { paddingTop: insets.top }]}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Menu</Text>
        <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.drawerMenu}>
        {MAIN_MENU_ITEMS.map((item) => (
          <MenuItemDrawer key={item.path} item={item} isActive={isActive} navigateTo={navigateTo} />
        ))}


        <SyncStatus />


        <MenuItemDrawer
          item={{ label: 'About Me', path: '/(drawer)/about', icon: Info }}
          isActive={isActive}
          navigateTo={navigateTo}
        />
      </ScrollView>

      <View style={styles.footer}>
        {isSignedIn ? (
          <View style={styles.profileSection}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {user?.fullName || user?.emailAddresses[0].emailAddress}
              </Text>
              <Text style={styles.profileEmail} numberOfLines={1}>
                {user?.emailAddresses[0].emailAddress}
              </Text>
            </View>
            <TouchableOpacity onPress={handleAuthAction} style={styles.logoutButton}>
              <LogOut size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={handleAuthAction} style={styles.loginButton}>
            <LogIn size={20} color={Colors.primary} />
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.sm,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  profileEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  logoutButton: {
    padding: Spacing.sm,
  },
});
