import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'error' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

export const Button = ({ title, onPress, variant = 'primary', loading, disabled }: Props) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return [styles.button, { backgroundColor: Colors.secondary }];
      case 'error':
        return [styles.button, { backgroundColor: Colors.error }];
      case 'outline':
        return [styles.button, styles.outlineButton];
      default:
        return styles.button;
    }
  };

  const getTextStyle = () => {
    if (variant === 'outline') return [styles.text, { color: Colors.primary }];
    return styles.text;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), disabled || loading ? styles.disabled : {}]}
      onPress={onPress}
      disabled={!!(disabled || loading)}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.text} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
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
