import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type AppCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
};

export const AppCard = ({ children, style, elevated = false }: AppCardProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors, elevated);

  return <View style={[styles.card, style]}>{children}</View>;
};

const createStyles = (
  colors: {
    surface: string;
    border: string;
    shadow: string;
  },
  elevated: boolean,
) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Spacing.borderRadius.lg,
      padding: Spacing.md,
      ...(elevated
        ? {
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 6,
            elevation: 4,
          }
        : null),
    },
  });
