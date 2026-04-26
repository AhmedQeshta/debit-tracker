import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import { ConfirmDialogProps } from '@/types/common';
import { AlertTriangle } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { colors, activeTheme } = useTheme();
  const styles = createStyles(colors, activeTheme);
  const resolvedConfirmText = confirmText || t('common.actions.ok');
  const resolvedCancelText = cancelText || t('common.actions.cancel');

  const handleConfirm = () => {
    // Use requestAnimationFrame to avoid unmount issues
    requestAnimationFrame(() => {
      onConfirm();
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <AlertTriangle size={20} color={colors.error} />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.7}>
              <Text style={styles.cancelButtonText}>{resolvedCancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
              activeOpacity={0.7}>
              <Text style={styles.confirmButtonText}>{resolvedConfirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (
  colors: { card: string; border: string; error: string; surface: string; text: string },
  activeTheme: 'light' | 'dark',
) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: activeTheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(18, 18, 18, 0.25)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.lg,
    },
    dialog: {
      backgroundColor: colors.card,
      borderRadius: Spacing.borderRadius.lg,
      padding: Spacing.lg,
      width: '100%',
      maxWidth: 400,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: Spacing.borderRadius.round,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.error,
      backgroundColor: colors.surface,
    },
    title: {
      fontSize: 19,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    message: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
      marginBottom: Spacing.lg,
    },
    actions: {
      flexDirection: 'row',
      gap: Spacing.md,
      justifyContent: 'flex-end',
    },
    button: {
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      borderRadius: Spacing.borderRadius.md,
      minWidth: 100,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    confirmButton: {
      backgroundColor: colors.error,
    },
    cancelButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    confirmButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.surface,
    },
  });
