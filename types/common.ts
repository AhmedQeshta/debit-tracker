export interface IActionCardProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export interface IButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'error' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

export interface IInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  error?: string;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  onBlur?: () => void;
}

export interface IScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
}

export interface IDrawerContextType {
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

export interface IEmptySectionProps {
  title: string;
  description: string;
  icon?: 'transactions' | 'users' | 'budgets' | '';
}

export interface IMenuItem {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

export interface IActionsProps {
  menuVisible: boolean;
  setMenuVisible: (visible: boolean) => void;
  menuItems: IMenuItem[];
}

export interface IPinnedCardsProps {
  title: string;
  count: number;
  items: any[];
  renderAvatar: (item: any) => React.ReactNode;
  getTitle: (item: any) => string;
  getAmount: (item: any) => number;
  formatAmount: (amount: number, item: any) => string;
  getNavigationPath: (item: any) => string;
  onUnpin: (id: string, e: any) => void;
}


export interface IMenuItemDrawer {
  label: string;
  path: string;
  icon: React.ElementType;
}

export interface IMenuItemDrawerProps {
  item: IMenuItemDrawer;
  isActive: (path: string) => boolean;
  navigateTo: (path: string) => void;
}