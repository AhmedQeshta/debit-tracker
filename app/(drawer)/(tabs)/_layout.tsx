import { Tabs } from 'expo-router';
import { Home, Users, LayoutDashboard, Calculator } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../theme/colors';
import { Spacing } from '../../../theme/spacing';
import { useUsersStore } from '@/store/usersStore';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const users = useUsersStore((state) => state.users);
  const hasUsers = users.length > 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: insets.bottom + Spacing.sm,
          paddingTop: Spacing.sm,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          href: hasUsers ? '/(drawer)/(tabs)/users' : null,
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budget',
          tabBarIcon: ({ color, size }) => <Calculator size={size} color={color} />,
          href: '/(drawer)/budget',
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

