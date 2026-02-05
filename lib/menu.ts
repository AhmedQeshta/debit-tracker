import { IMenuItemDrawer } from '@/types/common';
import
{
  Home,
  Users,
  LayoutDashboard,
  Calculator,
  ArrowRightLeft,
  Settings,
} from 'lucide-react-native';

export const MAIN_MENU_ITEMS: IMenuItemDrawer[] = [
  { label: 'Home', path: '/(drawer)/(tabs)', icon: Home },
  { label: 'Friends', path: '/(drawer)/(tabs)/friends', icon: Users },
  { label: 'Transactions', path: '/(drawer)/(tabs)/transactions', icon: ArrowRightLeft },
  { label: 'Budget Calculator', path: '/(drawer)/(tabs)/budget', icon: Calculator },
  { label: 'Dashboard', path: '/(drawer)/(tabs)/dashboard', icon: LayoutDashboard },
  { label: 'Settings', path: '/(drawer)/settings', icon: Settings },
];
