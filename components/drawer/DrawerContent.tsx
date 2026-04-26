import { MenuItemDrawer } from '@/components/drawer/MenuItemDrawer';
import { SyncStatus } from '@/components/sync/SyncStatus';
import { useTheme } from '@/contexts/ThemeContext';
import { useSignOut } from '@/hooks/auth/useSignOut';
import { getMainMenuItems } from '@/lib/menu';
import { Spacing } from '@/theme/spacing';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Info, LogIn, LogOut, X } from 'lucide-react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const DrawerContent = ({ insets, closeDrawer, isActive, navigateTo }: any) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const menuItems = useMemo(() => getMainMenuItems(t), [t]);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { handleAuthAction, isSigningOut } = useSignOut(closeDrawer);

  return (
    <View style={[styles.drawerContent, { paddingTop: insets.top }]}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>{t('navigation.drawer.menu')}</Text>
        <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.drawerMenu}
        contentContainerStyle={{ paddingBottom: Spacing.xl }}
        showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <MenuItemDrawer key={item.path} item={item} isActive={isActive} navigateTo={navigateTo} />
        ))}

        <SyncStatus />

        <MenuItemDrawer
          item={{ label: t('navigation.drawer.about'), path: '/(drawer)/about', icon: Info }}
          isActive={isActive}
          navigateTo={navigateTo}
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
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
            <TouchableOpacity
              onPress={handleAuthAction}
              style={styles.logoutButton}
              disabled={isSigningOut}
              activeOpacity={isSigningOut ? 1 : 0.7}>
              <LogOut size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={handleAuthAction} style={styles.loginButton}>
            <LogIn size={20} color={colors.accent} />
            <Text style={styles.loginButtonText}>{t('settings.rows.signIn')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: {
  surface: string;
  surface2: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
}) =>
  StyleSheet.create({
    drawerContent: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    drawerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    drawerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
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
      borderTopColor: colors.border,
      backgroundColor: colors.surface2,
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
      color: colors.accent,
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
      color: colors.text,
    },
    profileEmail: {
      fontSize: 12,
      color: colors.textMuted,
    },
    logoutButton: {
      padding: Spacing.sm,
    },
  });
