import { Colors } from '@/theme/colors';
import { AlertCircle, CheckCircle, Info } from 'lucide-react-native';

export const getIcon = (toast: {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}) => {
  switch (toast.type) {
    case 'success':
      return <CheckCircle size={20} color={Colors.success} />;
    case 'error':
      return <AlertCircle size={20} color={Colors.error} />;
    case 'info':
      return <Info size={20} color={Colors.primary} />;
  }
};
