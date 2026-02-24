import { ReactNode } from 'react';

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
  helperText?: string;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  onBlur?: () => void;
  maxLength?: number;
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

export interface AccountFormData {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Startup profiler timestamps
 */
export interface StartupTimings {
  hydrateStart: number;
  hydrateEnd: number | null;
  splashHide: number | null;
  firstRender: number | null;
  syncStart: number | null;
  syncEnd: number | null;
}

export interface ConfirmDialogState {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
}

export interface ConfirmDialogContextType {
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string },
  ) => void;
}

export interface MenuModalState {
  visible: boolean;
  position: { top: number; right: number };
  menuItems: {
    icon: ReactNode;
    label: string;
    onPress: () => void;
    danger?: boolean;
  }[];
}

export interface MenuModalContextType {
  openMenu: (
    position: { top: number; right: number },
    menuItems: MenuModalState['menuItems'],
  ) => void;
  closeMenu: () => void;
  menuState: MenuModalState;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastType) => void;
  toastSuccess: (message: string) => void;
  toastError: (message: string) => void;
  toastInfo: (message: string) => void;
  removeToast: (id: string) => void;
}

export interface HomeQuickActionsProps {
  onAddTransaction: () => void;
  onAddFriend: () => void;
  onCreateBudget: () => void;
}

export interface QuickActionItemProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  onPress: () => void;
  primary?: boolean;
}

export interface HomeGetStartedCardProps {
  onAddFriend: () => void;
  onAddTransaction: () => void;
  onCreateBudget: () => void;
}

export interface HomeSectionHeaderProps {
  title: string;
  seeAllLabel?: string;
  onSeeAll?: () => void;
}

export interface HomeSummaryCardProps {
  netBalanceText: string;
  youOweText: string;
  owedToYouText: string;
  trend: 'up' | 'down' | 'flat';
  trendText: string;
  updatedText?: string;
}

export interface IStepItemProps {
  step: string;
  title: string;
  actionLabel: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
}

export interface OtpInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  helperText?: string;
  length?: number;
}
