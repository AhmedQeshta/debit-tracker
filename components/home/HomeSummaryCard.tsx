import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { HomeSummaryCardProps } from '@/types/common';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

export const HomeSummaryCard = ({
  netBalanceText,
  youOweText,
  owedToYouText,
  trend,
  trendText,
  updatedText = 'Updated just now',
}: HomeSummaryCardProps) => {
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;
  const trendColor =
    trend === 'up' ? Colors.success : trend === 'down' ? Colors.error : Colors.textSecondary;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.kicker}>Net Balance</Text>
        <View style={styles.trendPill}>
          <TrendIcon size={14} color={trendColor} />
          <Text style={[styles.trendText, { color: trendColor }]}>{trendText}</Text>
        </View>
      </View>

      <Text style={styles.netBalanceValue}>{netBalanceText}</Text>
      <Text style={styles.updatedText}>{updatedText}</Text>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.metricCell}>
          <Text style={styles.metricLabel}>You Owe</Text>
          <Text style={[styles.metricValue, { color: Colors.success }]}>{youOweText}</Text>
        </View>

        <View style={styles.metricSeparator} />

        <View style={styles.metricCell}>
          <Text style={styles.metricLabel}>Owed To You</Text>
          <Text style={[styles.metricValue, { color: Colors.error }]}>{owedToYouText}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  kicker: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  trendPill: {
    minHeight: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.round,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    gap: 2,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  netBalanceValue: {
    color: Colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  updatedText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  divider: {
    marginVertical: Spacing.md,
    height: 1,
    backgroundColor: Colors.border,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricCell: {
    flex: 1,
  },
  metricSeparator: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  metricLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
  },
});
