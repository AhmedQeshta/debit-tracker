import { IMenuItemDrawer } from '@/types/common';
import type { TFunction } from 'i18next';
import {
  ArrowRightLeft,
  Calculator,
  Home,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react-native';

export const getMainMenuItems = (t: TFunction): IMenuItemDrawer[] => [
  { label: t('navigation.tabs.home'), path: '/(drawer)/(tabs)', icon: Home },
  { label: t('navigation.tabs.friends'), path: '/(drawer)/(tabs)/friends', icon: Users },
  {
    label: t('navigation.tabs.transactions'),
    path: '/(drawer)/(tabs)/transactions',
    icon: ArrowRightLeft,
  },
  { label: t('navigation.tabs.budgets'), path: '/(drawer)/(tabs)/budget', icon: Calculator },
  {
    label: t('navigation.tabs.dashboard'),
    path: '/(drawer)/(tabs)/dashboard',
    icon: LayoutDashboard,
  },
  { label: t('navigation.tabs.settings'), path: '/(drawer)/(tabs)/settings', icon: Settings },
];
