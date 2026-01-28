import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';

interface Props {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export const ActionCard = ({ icon: Icon, title, onPress, disabled }: Props) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Icon size={32} color={disabled ? Colors.textSecondary : Colors.primary} />
      </View>
      <Text style={[styles.title, disabled && styles.disabledText]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 120,
    flex: 1,
    margin: Spacing.xs,
  },
  iconContainer: {
    marginBottom: Spacing.sm,
  },
  title: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: Colors.textSecondary,
  },
});

