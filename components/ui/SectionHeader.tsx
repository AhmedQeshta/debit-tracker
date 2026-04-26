import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export const SectionHeader = ({ title, actionLabel, onActionPress }: SectionHeaderProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onActionPress ? (
        <Pressable style={styles.actionButton} onPress={onActionPress} hitSlop={8}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const createStyles = (colors: { text: string; accent: string }) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: Spacing.lg,
      marginBottom: Spacing.sm,
    },
    title: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
    },
    actionButton: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: Spacing.xs,
    },
    actionLabel: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: '600',
    },
  });
