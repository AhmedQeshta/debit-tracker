import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { getButtonStyle, getTextStyle } from '@/lib/utils';
import { IButtonProps } from '@/types/common';


export const Button = ({ title, onPress, variant = 'primary', loading, disabled }: IButtonProps) => {
  return (
    <TouchableOpacity
      style={[getButtonStyle(variant,styles), disabled || loading ? styles.disabled : {}]}
      onPress={onPress}
      disabled={!!(disabled || loading)}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.text} />
      ) : (
        <Text style={getTextStyle(variant,styles)}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginVertical: Spacing.xs,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  text: {
    color: '#000000', // Better contrast on primary/secondary usually, but primary is BB86FC (light purple)
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
});
