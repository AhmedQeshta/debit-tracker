import { RenderSkeleton } from '@/components/transaction/RenderSkeleton';
import { TransactionScreenItem } from '@/components/transaction/TransactionScreenItem';
import { AppCard } from '@/components/ui/AppCard';
import NavigateTo from '@/components/ui/NavigateTo';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/contexts/ThemeContext';
import { useTransaction } from '@/hooks/transaction/useTransaction';
import { formatCurrency } from '@/lib/utils';
import { Spacing } from '@/theme/spacing';
import { useRouter } from 'expo-router';
import { Menu, Search, SlidersHorizontal } from 'lucide-react-native';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TransactionsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    openDrawer,
    groupedSections,
    summary,
    monthLabel,
    searchQuery,
    setSearchQuery,
    refreshing,
    isLoading,
    friends,
    handleEdit,
    handleDelete,
    handleRowPress,
    handleRefresh,
    handleNavigateToNewTransaction,
    showControls,
    setShowControls,
    summaryCurrency,
    summaryCurrencyLabel,
    handleSummaryCurrencyToggle,
    hasData,
  } = useTransaction();
  const router = useRouter();
  const searchInputRef = useRef<TextInput>(null);

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={openDrawer}
          style={styles.topBarButton}
          accessibilityRole="button"
          accessibilityLabel={t('transactions.accessibility.openMenu')}>
          <Menu color={colors.text} size={20} />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{t('transactions.title')}</Text>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
        </View>
        <TouchableOpacity
          style={[styles.topBarButton, showControls && styles.topBarButtonActive]}
          onPress={() => setShowControls((prev) => !prev)}
          accessibilityRole="button"
          accessibilityState={{ selected: showControls }}
          accessibilityLabel={t('transactions.accessibility.toggleFilters')}>
          <SlidersHorizontal color={colors.textMuted} size={18} />
        </TouchableOpacity>
      </View>

      {showControls ? (
        <View style={styles.searchRow}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            ref={searchInputRef}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('transactions.search.placeholder')}
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            accessibilityLabel={t('transactions.accessibility.searchTransactions')}
          />
        </View>
      ) : null}

      <AppCard style={styles.summaryStrip}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryHeaderText}>
            {t('transactions.summary.title', { currencyLabel: summaryCurrencyLabel })}
          </Text>
          <Pressable
            style={styles.currencyButton}
            onPress={handleSummaryCurrencyToggle}
            accessibilityRole="button"
            accessibilityLabel={t('transactions.summary.accessibility.changeCurrencyLabel')}
            accessibilityHint={t('transactions.summary.accessibility.changeCurrencyHint')}>
            <Text style={styles.currencyButtonText}>{summaryCurrency}</Text>
          </Pressable>
        </View>
        <View style={styles.summaryStatsWrap}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>
              {t('transactions.summary.labels.totalThisMonth')}
            </Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(summary.totalThisMonth, summaryCurrency)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('transactions.summary.labels.youPaid')}</Text>
            <Text style={[styles.summaryValue, styles.negative]}>
              {formatCurrency(summary.youPaid, summaryCurrency)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('transactions.summary.labels.youReceived')}</Text>
            <Text style={[styles.summaryValue, styles.positive]}>
              {formatCurrency(summary.youReceived, summaryCurrency)}
            </Text>
          </View>
        </View>
      </AppCard>

      <Text style={styles.statusLegend}>{t('transactions.statusLegend')}</Text>

      {isLoading ? (
        <RenderSkeleton />
      ) : (
        <SectionList
          sections={groupedSections}
          keyExtractor={(item) => item.transaction.id}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeaderWrap}>
              <Text style={styles.sectionHeader}>{title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TransactionScreenItem
              row={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPress={handleRowPress}
            />
          )}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
            />
          }
          contentContainerStyle={[styles.listContent, !hasData && styles.emptyListContent]}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>{t('transactions.empty.title')}</Text>
              <Text style={styles.emptyText}>
                {friends.length === 0
                  ? t('transactions.empty.addFriendFirst')
                  : t('transactions.empty.addFirstTransaction')}
              </Text>
              <Pressable
                style={styles.emptyButton}
                onPress={() =>
                  friends.length === 0
                    ? router.push('/(drawer)/friend/new')
                    : handleNavigateToNewTransaction()
                }
                accessibilityRole="button"
                accessibilityLabel={
                  friends.length === 0
                    ? t('transactions.actions.addFriend')
                    : t('transactions.actions.addTransaction')
                }>
                <Text style={styles.emptyButtonText}>
                  {friends.length === 0
                    ? t('transactions.actions.addFriend')
                    : t('transactions.actions.addTransaction')}
                </Text>
              </Pressable>
            </View>
          }
        />
      )}

      <NavigateTo
        navigatePath="/(drawer)/transaction/new"
        onPress={handleNavigateToNewTransaction}
      />
    </ScreenContainer>
  );
}

const createStyles = (colors: {
  text: string;
  textMuted: string;
  surface: string;
  border: string;
  accent: string;
  success: string;
  danger: string;
}) =>
  StyleSheet.create({
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.xs,
      marginBottom: Spacing.sm,
    },
    titleWrap: {
      flex: 1,
      marginLeft: Spacing.sm,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    monthLabel: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 2,
    },
    topBarButton: {
      width: 44,
      height: 44,
      borderRadius: Spacing.borderRadius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.xs,
    },
    topBarButtonActive: {
      borderColor: colors.accent,
    },
    searchRow: {
      minHeight: 44,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Spacing.borderRadius.md,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      marginBottom: Spacing.sm,
      gap: Spacing.sm,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      paddingVertical: Spacing.sm,
    },
    chipsContainer: {
      gap: Spacing.sm,
      paddingBottom: Spacing.sm,
    },
    chip: {
      minHeight: 36,
      paddingHorizontal: Spacing.md,
      borderRadius: Spacing.borderRadius.round,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
    },
    chipActive: {
      borderColor: colors.accent,
    },
    chipText: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    chipTextActive: {
      color: colors.accent,
    },
    sortContainer: {
      gap: Spacing.sm,
      paddingBottom: Spacing.sm,
    },
    sortChip: {
      minHeight: 36,
      borderRadius: Spacing.borderRadius.round,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      gap: 6,
    },
    sortChipActive: {
      borderColor: colors.accent,
    },
    sortChipText: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    sortChipTextActive: {
      color: colors.accent,
    },
    summaryStrip: {
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.sm,
      gap: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    summaryHeaderText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    currencyButton: {
      minHeight: 32,
      minWidth: 44,
      borderRadius: Spacing.borderRadius.round,
      borderWidth: 1,
      borderColor: colors.accent,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.sm,
    },
    currencyButtonText: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '700',
    },
    summaryStatsWrap: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statusLegend: {
      color: colors.textMuted,
      fontSize: 11,
      marginBottom: Spacing.xs,
    },
    summaryItem: {
      width: '32%',
    },
    summaryLabel: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '600',
      marginBottom: 2,
    },
    summaryValue: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    listContent: {
      paddingTop: Spacing.xs,
      paddingBottom: 100,
    },
    sectionHeaderWrap: {
      backgroundColor: 'transparent',
      paddingTop: Spacing.xs,
      paddingBottom: Spacing.xs,
    },
    sectionHeader: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '700',
    },
    skeletonList: {
      paddingTop: Spacing.xs,
      gap: Spacing.sm,
    },
    skeletonRow: {
      minHeight: 80,
      borderRadius: Spacing.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginBottom: Spacing.sm,
    },
    emptyListContent: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.lg,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
      marginBottom: Spacing.sm,
    },
    emptyText: {
      color: colors.textMuted,
      textAlign: 'center',
      fontSize: 14,
      marginBottom: Spacing.md,
    },
    emptyButton: {
      minHeight: 44,
      paddingHorizontal: Spacing.lg,
      borderRadius: Spacing.borderRadius.md,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyButtonText: {
      color: colors.surface,
      fontSize: 14,
      fontWeight: '700',
    },
    positive: {
      color: colors.success,
    },
    negative: {
      color: colors.danger,
    },
  });
