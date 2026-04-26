import { Actions } from '@/components/ui/Actions';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency } from '@/lib/utils';
import { Spacing } from '@/theme/spacing';
import { HomeBudgetOverviewCardProps } from '@/types/budget';
import { IMenuItem } from '@/types/common';
import { CalendarDays, Copy, Download, Pencil, Pin, PinOff, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const HomeBudgetOverviewCard = ({
  budget,
  spent,
  progress,
  warningLabel,
  onOpen,
  onEdit,
  onPinToggle,
  onDelete,
  onExportBudget,
  onCopyRemaining,
  onResetPeriod,
}: HomeBudgetOverviewCardProps) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [menuVisible, setMenuVisible] = useState(false);
  const remaining = budget.totalBudget - spent;
  const progressColor = progress >= 1 ? colors.danger : colors.accent;

  const menuItems = useMemo<IMenuItem[]>(
    () => [
      {
        icon: <Copy size={18} color={colors.text} />,
        label: t('budgetCard.menu.copyRemainingAmount'),
        onPress: () => onCopyRemaining(remaining, budget.currency),
      },

      {
        icon: budget.pinned ? (
          <PinOff size={18} color={colors.text} />
        ) : (
          <Pin size={18} color={colors.text} />
        ),
        label: budget.pinned ? t('budgetCard.menu.unpinBudget') : t('budgetCard.menu.pinBudget'),
        onPress: () => onPinToggle(budget.id),
      },

      {
        icon: <CalendarDays size={18} color={colors.text} />,
        label: t('budgetCard.menu.resetPeriod'),
        onPress: () => onResetPeriod(budget.id, budget.title),
      },
      {
        icon: <Download size={18} color={colors.text} />,
        label: t('budgetCard.menu.exportBudgets'),
        onPress: () => onExportBudget?.(budget.id),
      },
      {
        icon: <Pencil size={18} color={colors.text} />,
        label: t('budgetCard.menu.editBudget'),
        onPress: () => onEdit(budget.id),
      },
      {
        icon: <Trash2 size={18} color={colors.danger} />,
        label: t('budgetCard.menu.deleteBudget'),
        onPress: () => onDelete(budget.id, budget.title),
        danger: true,
      },
    ],
    [
      budget,
      onResetPeriod,
      onExportBudget,
      onCopyRemaining,
      onDelete,
      onEdit,
      onPinToggle,
      remaining,
      t,
      colors.text,
      colors.danger,
    ],
  );

  return (
    <Pressable style={styles.budgetCardCompact} onPress={() => onOpen(budget.id)}>
      <View style={styles.budgetCompactTopRow}>
        <View style={styles.budgetTitleWrap}>
          {budget.pinned ? <Pin size={12} color={colors.accent} fill={colors.accent} /> : null}
          <Text style={styles.budgetCompactTitle} numberOfLines={1}>
            {budget.title}
          </Text>
        </View>
        <Actions menuVisible={menuVisible} setMenuVisible={setMenuVisible} menuItems={menuItems} />
      </View>

      <Text style={styles.budgetCompactAmounts} numberOfLines={1}>
        {formatCurrency(spent, budget.currency)} /{' '}
        {formatCurrency(budget.totalBudget, budget.currency)}
      </Text>

      <View style={styles.progressTrackCompact}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: progressColor },
          ]}
        />
      </View>

      <View style={styles.budgetCompactFooter}>
        {warningLabel ? <Text style={styles.warningLabel}>{warningLabel}</Text> : <View />}
        <Text style={styles.budgetCompactMeta}>
          {remaining >= 0
            ? t('budgetCard.status.left', { amount: formatCurrency(remaining, budget.currency) })
            : t('budgetDetail.overview.overAmount', {
                amount: formatCurrency(Math.abs(remaining), budget.currency),
              })}
        </Text>
      </View>
    </Pressable>
  );
};

const createStyles = (colors: {
  card: string;
  border: string;
  text: string;
  accent: string;
  danger: string;
  textMuted: string;
  surface2: string;
}) =>
  StyleSheet.create({
    budgetCardCompact: {
      backgroundColor: colors.card,
      borderRadius: Spacing.borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.sm,
    },
    budgetCompactTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    budgetTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      flex: 1,
    },
    budgetCompactTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    warningLabel: {
      color: colors.danger,
      fontSize: 11,
      fontWeight: '600',
    },
    budgetCompactAmounts: {
      marginTop: Spacing.xs,
      color: colors.textMuted,
      fontSize: 13,
    },
    progressTrackCompact: {
      marginTop: Spacing.sm,
      height: 6,
      borderRadius: Spacing.borderRadius.round,
      backgroundColor: colors.surface2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
    },
    budgetCompactFooter: {
      marginTop: Spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    budgetCompactMeta: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
  });
