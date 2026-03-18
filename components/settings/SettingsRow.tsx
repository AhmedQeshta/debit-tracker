import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { SettingsRowProps } from '@/types/common';
import { ChevronRight } from 'lucide-react-native';
import { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const SettingsRow: FC<SettingsRowProps> = ({
  icon: Icon,
  title,
  subtitle,
  value,
  onPress,
  destructive = false,
  showChevron,
  showDivider = true,
  rightSlot,
  accessibilityLabel,
}) => {
  const isPressable = Boolean(onPress);

  return (
    <Pressable
      onPress={onPress}
      disabled={!isPressable}
      accessibilityRole={isPressable ? 'button' : 'text'}
      accessibilityLabel={accessibilityLabel || title}
      style={({ pressed }) => [styles.row, pressed && isPressable && styles.rowPressed]}>
      <View style={styles.leftGroup}>
        <View style={[styles.iconWrap, destructive && styles.iconWrapDestructive]}>
          <Icon size={18} color={destructive ? Colors.error : Colors.primary} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, destructive && styles.titleDestructive]}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={styles.rightGroup}>
        {value ? <Text style={styles.value}>{value}</Text> : null}
        {rightSlot}
        {(showChevron ?? isPressable) ? (
          <ChevronRight size={16} color={destructive ? Colors.error : Colors.textSecondary} />
        ) : null}
      </View>

      {showDivider ? <View style={styles.divider} /> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    justifyContent: 'center',
  },
  rowPressed: {
    backgroundColor: Colors.surface,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.md,
    gap: Spacing.sm + 2,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDestructive: {
    borderColor: Colors.error,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  titleDestructive: {
    color: Colors.error,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  rightGroup: {
    position: 'absolute',
    right: Spacing.md,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  value: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  divider: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    bottom: 0,
    height: 1,
    backgroundColor: Colors.border,
  },
});
