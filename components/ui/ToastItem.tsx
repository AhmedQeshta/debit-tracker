import { getIcon } from '@/components/ui/getIcon';
import { useToastItem } from '@/hooks/useToastItem';
import { getBackgroundColor, getBorderColor } from '@/lib/utils';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { X } from 'lucide-react-native';
import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const ToastItem: React.FC<{
  toast: { id: string; message: string; type: 'success' | 'error' | 'info' };
  onDismiss: () => void;
}> = ({ toast, onDismiss }) => {
  const { slideAnim, opacityAnim } = useToastItem({
    toast,
    onDismiss,
  });

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: getBackgroundColor(toast),
          borderLeftColor: getBorderColor(toast),
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}>
      <View style={styles.content}>
        {getIcon(toast)}
        <Text style={styles.message}>{toast.message}</Text>
      </View>
      <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
        <X size={16} color={Colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
