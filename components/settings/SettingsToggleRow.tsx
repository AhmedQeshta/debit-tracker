import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import { SettingsToggleRowProps } from '@/types/common';
import React, { FC } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

export const SettingsToggleRow: FC<SettingsToggleRowProps> = ({
  icon: Icon,
  title,
  subtitle,
  value,
  onValueChange,
  disabled = false,
  showDivider = true,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View
      style={[styles.row, disabled && styles.rowDisabled]}
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityState={{ checked: value, disabled }}>
      <View style={styles.leftGroup}>
        <View style={styles.iconWrap}>
          <Icon size={18} color={colors.primary} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.surface}
      />

      {showDivider ? <View style={styles.divider} /> : null}
    </View>
  );
};

const createStyles = (colors: {
  primary: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
}) =>
  StyleSheet.create({
  row: {
    minHeight: 56,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowDisabled: {
    opacity: 0.7,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingEnd: Spacing.md,
    gap: Spacing.sm + 2,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textSecondary,
  },
  divider: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    bottom: 0,
    height: 1,
    backgroundColor: colors.border,
  },
});
