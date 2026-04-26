import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import { StatusPillProps } from '@/types/common';
import React, { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const StatusPill: FC<StatusPillProps> = ({ label, tone = 'neutral' }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View
      style={[
        styles.container,
        tone === 'success' && styles.success,
        tone === 'error' && styles.error,
      ]}>
      <Text style={[styles.text, tone === 'error' && styles.errorText]}>{label}</Text>
    </View>
  );
};

const createStyles = (colors: {
  surface: string;
  border: string;
  success: string;
  error: string;
  text: string;
}) =>
  StyleSheet.create({
    container: {
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.sm,
      borderRadius: Spacing.borderRadius.round,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    success: {
      borderColor: colors.success,
    },
    error: {
      borderColor: colors.error,
    },
    text: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.text,
    },
    errorText: {
      color: colors.error,
    },
  });
