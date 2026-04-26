import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type AppChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export const AppChip = ({ label, selected = false, onPress }: AppChipProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipSelected : styles.chipUnselected,
        pressed ? styles.pressed : null,
      ]}>
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>
        {label}
      </Text>
    </Pressable>
  );
};

const createStyles = (colors: {
  accent: string;
  accentSoft: string;
  surface2: string;
  textMuted: string;
  border: string;
}) =>
  StyleSheet.create({
    chip: {
      minHeight: 36,
      paddingHorizontal: Spacing.md,
      borderRadius: Spacing.borderRadius.round,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    chipSelected: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accent,
    },
    chipUnselected: {
      backgroundColor: colors.surface2,
      borderColor: colors.border,
    },
    pressed: {
      opacity: 0.85,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
    },
    labelSelected: {
      color: colors.accent,
    },
    labelUnselected: {
      color: colors.textMuted,
    },
  });
