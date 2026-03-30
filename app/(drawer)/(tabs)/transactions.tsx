import { TransactionScreenItem } from '@/components/transaction/TransactionScreenItem';
import NavigateTo from '@/components/ui/NavigateTo';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useTransaction } from '@/hooks/transaction/useTransaction';
import { formatCurrency } from '@/lib/utils';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { useRouter } from 'expo-router';
import { Menu, Search, SlidersHorizontal } from 'lucide-react-native';
import { useRef } from 'react';
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
  } = useTransaction();
  const router = useRouter();
  const searchInputRef = useRef<TextInput>(null);

  const hasData = groupedSections.length > 0;

  const renderSkeleton = () => (
    <View style={styles.skeletonList}>
      {Array.from({ length: 8 }).map((_, index) => (
        <View key={`tx-skeleton-${index}`} style={styles.skeletonRow} />
      ))}
    </View>
  );

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={openDrawer}
          style={styles.topBarButton}
          accessibilityRole="button"
          accessibilityLabel="Open menu">
          <Menu color={Colors.text} size={20} />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Transactions</Text>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
        </View>
        <TouchableOpacity
          style={[styles.topBarButton, showControls && styles.topBarButtonActive]}
          onPress={() => setShowControls((prev) => !prev)}
          accessibilityRole="button"
          accessibilityState={{ selected: showControls }}
          accessibilityLabel="Show or hide filters">
          <SlidersHorizontal color={Colors.textSecondary} size={18} />
        </TouchableOpacity>
      </View>

      {showControls ? (
        <>
          <View style={styles.searchRow}>
            <Search size={16} color={Colors.textSecondary} />
            <TextInput
              ref={searchInputRef}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search transactions..."
              placeholderTextColor={Colors.textSecondary}
              style={styles.searchInput}
              accessibilityLabel="Search transactions"
            />
          </View>
        </>
      ) : null}

      <View style={styles.summaryStrip}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryHeaderText}>Summary ({summaryCurrencyLabel})</Text>
          <Pressable
            style={styles.currencyButton}
            onPress={handleSummaryCurrencyToggle}
            accessibilityRole="button"
            accessibilityLabel="Change summary currency"
            accessibilityHint="Cycles through USD, ILS, and EUR currencies">
            <Text style={styles.currencyButtonText}>{summaryCurrency}</Text>
          </Pressable>
        </View>
        <View style={styles.summaryStatsWrap}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total this month</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(summary.totalThisMonth, summaryCurrency)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>You paid</Text>
            <Text style={[styles.summaryValue, styles.negative]}>
              {formatCurrency(summary.youPaid, summaryCurrency)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>You received</Text>
            <Text style={[styles.summaryValue, styles.positive]}>
              {formatCurrency(summary.youReceived, summaryCurrency)}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.statusLegend}>Status: Pending sync • Failed</Text>

      {isLoading ? (
        renderSkeleton()
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
              tintColor={Colors.primary}
            />
          }
          contentContainerStyle={[styles.listContent, !hasData && styles.emptyListContent]}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptyText}>
                {friends.length === 0
                  ? 'Add a friend first'
                  : 'Add your first transaction to start tracking balances'}
              </Text>
              <Pressable
                style={styles.emptyButton}
                onPress={() =>
                  friends.length === 0
                    ? router.push('/(drawer)/friend/new')
                    : handleNavigateToNewTransaction()
                }
                accessibilityRole="button"
                accessibilityLabel={friends.length === 0 ? 'Add friend' : 'Add transaction'}>
                <Text style={styles.emptyButtonText}>
                  {friends.length === 0 ? 'Add friend' : 'Add transaction'}
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

const styles = StyleSheet.create({
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
    color: Colors.text,
  },
  monthLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  topBarButton: {
    width: 44,
    height: 44,
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  topBarButtonActive: {
    borderColor: Colors.primary,
  },
  searchRow: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
  },
  chipActive: {
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.primary,
  },
  sortContainer: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  sortChip: {
    minHeight: 36,
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: 6,
  },
  sortChipActive: {
    borderColor: Colors.primary,
  },
  sortChipText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  sortChipTextActive: {
    color: Colors.primary,
  },
  summaryStrip: {
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
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
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  currencyButton: {
    minHeight: 32,
    minWidth: 44,
    borderRadius: Spacing.borderRadius.round,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  currencyButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryStatsWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusLegend: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginBottom: Spacing.xs,
  },
  summaryItem: {
    width: '32%',
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  summaryValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingTop: Spacing.xs,
    paddingBottom: 100,
  },
  sectionHeaderWrap: {
    backgroundColor: Colors.background,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  sectionHeader: {
    color: Colors.textSecondary,
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
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
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
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  emptyButton: {
    minHeight: 44,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  positive: {
    color: Colors.success,
  },
  negative: {
    color: Colors.error,
  },
});
