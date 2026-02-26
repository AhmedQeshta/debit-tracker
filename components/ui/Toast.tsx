import { ToastItem } from '@/components/ui/ToastItem';
import { useToast } from '@/hooks/useToast';
import { Spacing } from '@/theme/spacing';
import React from 'react';
import { StyleSheet, View } from 'react-native';

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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
});
