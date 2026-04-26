import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import { IButtonProps } from '@/types/common';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
}: IButtonProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const isOutline = variant === 'outline';

  const buttonStyle = [
    styles.button,
    variant === 'secondary' && styles.secondaryButton,
    variant === 'error' && styles.errorButton,
    isOutline && styles.outlineButton,
    (disabled || loading) && styles.disabled,
  ];

  const textStyle = [styles.text, isOutline && styles.outlineText];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={!!(disabled || loading)}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.accent : colors.accentText} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: {
  accent: string;
  accentText: string;
  secondary: string;
  danger: string;
  surface: string;
  border: string;
  text: string;
}) =>
  StyleSheet.create({
    button: {
      backgroundColor: colors.accent,
      paddingHorizontal: Spacing.md,
      borderRadius: Spacing.borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52,
      marginVertical: Spacing.xs,
      width: '100%',
    },
    secondaryButton: {
      backgroundColor: colors.secondary,
    },
    errorButton: {
      backgroundColor: colors.danger,
    },
    outlineButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    text: {
      color: colors.accentText,
      fontSize: 16,
      fontWeight: '700',
    },
    outlineText: {
      color: colors.text,
    },
    disabled: {
      opacity: 0.55,
    },
  });
