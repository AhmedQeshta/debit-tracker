import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useToast } from '@/contexts/ToastContext';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react-native';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </View>
  );
};

const ToastItem: React.FC<{ toast: { id: string; message: string; type: 'success' | 'error' | 'info' }; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} color={Colors.success} />;
      case 'error':
        return <AlertCircle size={20} color={Colors.error} />;
      case 'info':
        return <Info size={20} color={Colors.primary} />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return Colors.success + '20';
      case 'error':
        return Colors.error + '20';
      case 'info':
        return Colors.primary + '20';
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return Colors.success;
      case 'error':
        return Colors.error;
      case 'info':
        return Colors.primary;
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: getBackgroundColor(),
          borderLeftColor: getBorderColor(),
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        {getIcon()}
        <Text style={styles.message}>{toast.message}</Text>
      </View>
      <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
        <X size={16} color={Colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    borderLeftWidth: 4,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  closeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
});

