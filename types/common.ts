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
  keyboardType?: 'default' | 'numeric' | 'email-address';
  error?: string;
  multiline?: boolean;
}

export interface IScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
}


export interface IDrawerContextType {
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};


export interface IEmptySectionProps{
  title:string;
  description:string;
  icon?:'transactions' | 'users' | 'budgets' | '';
}