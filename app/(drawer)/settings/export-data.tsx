import { Button } from '@/components/ui/Button';
import Header from '@/components/ui/Header';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import SelectChip from '@/components/ui/SelectChip';
import { useExportData } from '@/hooks/useExportData';
import { detailOptions, formatOptions, sourceOptions } from '@/lib/export';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { useRouter } from 'expo-router';
import { Database, FileSpreadsheet, FileText, Users, Wallet } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ExportDataScreen() {
  const router = useRouter();
  const {
    format,
    setFormat,
    detailLevel,
    setDetailLevel,
    source,
    setSource,
    friendsSelected,
    setFriendsSelected,
    budgetsSelected,
    setBudgetsSelected,
    summaryText,
    scopedFriendId,
    handleExport,
    isExporting,
  } = useExportData();
  return (
    <ScreenContainer>
      <Header
        openDrawer={() => router.push('/(drawer)/(tabs)/settings')}
        title="Export Data"
        subtitle="Share friends and budgets as CSV or JSON"
        isGoBack
      />

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>What to export</Text>
        <View style={styles.scopeRow}>
          <SelectChip
            label="Friends"
            active={friendsSelected}
            onPress={() => setFriendsSelected((prev) => !prev)}
          />
          <SelectChip
            label="Budgets"
            active={budgetsSelected}
            onPress={() => setBudgetsSelected((prev) => !prev)}
          />
        </View>
        <Text style={styles.scopeSummary}>{summaryText}</Text>
        {scopedFriendId ? (
          <Text style={styles.scopeHint}>Friend-scoped export is active.</Text>
        ) : null}
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeadingRow}>
          <FileSpreadsheet size={18} color={Colors.textSecondary} />
          <Text style={styles.sectionTitle}>Format</Text>
        </View>
        <View style={styles.scopeRow}>
          {formatOptions.map((option) => (
            <SelectChip
              key={option.value}
              label={option.label}
              active={format === option.value}
              onPress={() => setFormat(option.value)}
            />
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeadingRow}>
          <FileText size={18} color={Colors.textSecondary} />
          <Text style={styles.sectionTitle}>Detail level</Text>
        </View>
        {detailOptions.map((option) => (
          <Pressable
            key={option.value}
            style={({ pressed }) => [
              styles.optionRow,
              detailLevel === option.value && styles.optionRowActive,
              pressed && styles.optionRowPressed,
            ]}
            onPress={() => setDetailLevel(option.value)}>
            <Text style={styles.optionTitle}>{option.label}</Text>
            <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeadingRow}>
          <Database size={18} color={Colors.textSecondary} />
          <Text style={styles.sectionTitle}>Data source</Text>
        </View>
        {sourceOptions.map((option) => (
          <Pressable
            key={option.value}
            style={({ pressed }) => [
              styles.optionRow,
              source === option.value && styles.optionRowActive,
              pressed && styles.optionRowPressed,
            ]}
            onPress={() => setSource(option.value)}>
            <Text style={styles.optionTitle}>{option.label}</Text>
            <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.quickFactsCard}>
        <View style={styles.quickFactRow}>
          <Users size={16} color={Colors.textSecondary} />
          <Text style={styles.quickFactText}>
            Friends include balance, you owe, owed to you, and sync state.
          </Text>
        </View>
        <View style={styles.quickFactRow}>
          <Wallet size={16} color={Colors.textSecondary} />
          <Text style={styles.quickFactText}>
            Budgets include spent, remaining, progress, and optional item rows.
          </Text>
        </View>
      </View>

      <Button
        title={isExporting ? 'Exporting...' : 'Export data'}
        onPress={handleExport}
        loading={isExporting}
        disabled={isExporting}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  scopeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '18',
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.primary,
  },
  scopeSummary: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  scopeHint: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  optionRow: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  optionRowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  optionRowPressed: {
    opacity: 0.85,
  },
  optionTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  optionSubtitle: {
    marginTop: 2,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  quickFactsCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  quickFactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quickFactText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
