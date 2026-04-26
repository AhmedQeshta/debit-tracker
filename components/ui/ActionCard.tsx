import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import { IActionCardProps } from '@/types/common';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const ActionCard = ({ icon: Icon, title, onPress, disabled }: IActionCardProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Icon size={32} color={disabled ? colors.textMuted : colors.accent} />
      </View>
      <Text style={[styles.title, disabled && styles.disabledText]}>{title}</Text>
    </TouchableOpacity>
  );
};

const createStyles = (colors: {
  surface: string;
  border: string;
  text: string;
  textMuted: string;
}) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      padding: Spacing.md,
      borderRadius: Spacing.borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 120,
      flex: 1,
      margin: Spacing.xs,
    },
    iconContainer: {
      marginBottom: Spacing.sm,
    },
    title: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    disabled: {
      opacity: 0.5,
    },
    disabledText: {
      color: colors.textMuted,
    },
  });
