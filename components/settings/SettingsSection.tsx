import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import { SettingsSectionProps } from '@/types/common';
import React, { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const SettingsSection: FC<SettingsSectionProps> = ({ title, children }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.container}>{children}</View>
    </View>
  );
};

const createStyles = (colors: { textSecondary: string; card: string; border: string }) =>
  StyleSheet.create({
    section: {
      marginBottom: Spacing.md,
    },
    title: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: Spacing.sm,
      paddingHorizontal: Spacing.xs,
    },
    container: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Spacing.borderRadius.lg,
      overflow: 'hidden',
    },
  });
