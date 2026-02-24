import { getButtonStyle, getTextStyle } from '@/lib/utils';
import { Colors } from '@/theme/colors';
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
  return (
    <TouchableOpacity
      style={[getButtonStyle(variant, styles), disabled || loading ? styles.disabled : {}]}
      onPress={onPress}
      disabled={!!(disabled || loading)}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.text} />
      ) : (
        <Text style={getTextStyle(variant, styles)}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginVertical: Spacing.xs,
    width: '100%',
  },
  outlineButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.55,
  },
});
