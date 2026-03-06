import { FilteredFriends } from '@/components/friend/FilteredFriends';
import NavigateTo from '@/components/ui/NavigateTo';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { useFriendsList } from '@/hooks/useFriendsList';
import { FILTER_OPTIONS, formatCurrency, SORT_OPTIONS } from '@/lib/utils';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { FriendsFilterBy, FriendsListItem, FriendsSortBy } from '@/types/friend';
import { useRouter } from 'expo-router';
import { LayoutGrid, List, Menu, Search, SlidersHorizontal, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function FriendsList() {
  const {
    friendRows,
    summary,
    isGrid,
    setSearch,
    setIsGrid,
    search,
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
    handleFriendEdit,
    handleFriendDelete,
    handlePinToggle,
    handleAddTransaction,
    handleSettle,
  } = useFriendsList();
  const { openDrawer } = useDrawerContext();
  const router = useRouter();
  const [isLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const netTone = useMemo(() => {
    if (summary.netBalance > 0) return styles.positive;
    if (summary.netBalance < 0) return styles.negative;
    return styles.neutral;
  }, [summary.netBalance]);

  const listData = useMemo(() => {
    if (isLoading) {
      return Array.from({ length: isGrid ? 6 : 8 }, (_, index) => ({
        type: 'skeleton' as const,
        id: `skeleton-${index}`,
      }));
    }

    return friendRows as FriendsListItem[];
  }, [isLoading, isGrid, friendRows]);

  return (
    <View style={styles.wrapper}>
      <ScreenContainer scrollable={false}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={openDrawer}
            style={styles.topBarButton}
            accessibilityRole="button"
            accessibilityLabel="Open menu">
            <Menu color={Colors.text} size={20} />
          </TouchableOpacity>
          <Text style={styles.title}>Friends</Text>
          <View style={styles.topActions}>
            <View style={styles.topSegmentedToggle}>
              <Pressable
                style={[styles.topToggleItem, !isGrid && styles.topToggleItemActive]}
                onPress={() => setIsGrid(false)}
                accessibilityRole="button"
                accessibilityLabel="List view"
                accessibilityState={{ selected: !isGrid }}>
                <List color={!isGrid ? Colors.background : Colors.textSecondary} size={14} />
                <Text style={[styles.topToggleText, !isGrid && styles.topToggleTextActive]}>
                  List
                </Text>
              </Pressable>
              <Pressable
                style={[styles.topToggleItem, isGrid && styles.topToggleItemActive]}
                onPress={() => setIsGrid(true)}
                accessibilityRole="button"
                accessibilityLabel="Grid view"
                accessibilityState={{ selected: isGrid }}>
                <LayoutGrid color={isGrid ? Colors.background : Colors.textSecondary} size={14} />
                <Text style={[styles.topToggleText, isGrid && styles.topToggleTextActive]}>
                  Grid
                </Text>
              </Pressable>
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
        </View>
        {showControls && (
          <View style={styles.controlsSection}>
            <View style={styles.searchContainer}>
              <Search size={16} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search by friend name"
                placeholderTextColor={Colors.textSecondary}
                accessibilityLabel="Search friends"
              />
            </View>

            <View style={styles.controlRow}>
              <View style={styles.chipsWrap}>
                {SORT_OPTIONS.map((option) => (
                  <Pressable
                    key={option.key}
                    style={[styles.chip, sortBy === option.key && styles.chipActive]}
                    onPress={() => setSortBy(option.key as FriendsSortBy)}
                    accessibilityRole="button"
                    accessibilityLabel={`Sort by ${option.label}`}
                    accessibilityState={{ selected: sortBy === option.key }}>
                    <Text style={[styles.chipText, sortBy === option.key && styles.chipTextActive]}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.chipsWrap}>
                {FILTER_OPTIONS.map((option) => (
                  <Pressable
                    key={option.key}
                    style={[styles.chip, filterBy === option.key && styles.chipActive]}
                    onPress={() => setFilterBy(option.key as FriendsFilterBy)}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter ${option.label}`}
                    accessibilityState={{ selected: filterBy === option.key }}>
                    <Text
                      style={[styles.chipText, filterBy === option.key && styles.chipTextActive]}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Friends</Text>
            <Text style={styles.summaryValue}>{summary.totalFriends}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>You owe</Text>
            <Text style={[styles.summaryValue, styles.negative]}>
              {formatCurrency(summary.youOweTotal)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Owed to you</Text>
            <Text style={[styles.summaryValue, styles.positive]}>
              {formatCurrency(summary.owedToYouTotal)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Settled</Text>
            <Text style={styles.summaryValue}>{summary.settledCount}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Net</Text>
            <Text style={[styles.summaryValue, netTone]}>{formatCurrency(summary.netBalance)}</Text>
          </View>
        </View>

        <FlatList<FriendsListItem>
          data={listData}
          keyExtractor={(item) => ('type' in item ? item.id : item.friend.id)}
          numColumns={isGrid ? 2 : 1}
          key={isGrid ? 'grid' : 'list'}
          renderItem={({ item }) =>
            'type' in item ? (
              <View style={[styles.skeletonCard, isGrid && styles.skeletonGridCard]} />
            ) : (
              <FilteredFriends
                key={item.friend.id}
                row={item}
                isGrid={isGrid}
                handleFriendEdit={handleFriendEdit}
                handleFriendDelete={handleFriendDelete}
                handlePinToggle={handlePinToggle}
                onAddTransaction={handleAddTransaction}
                onSettle={handleSettle}
              />
            )
          }
          contentContainerStyle={[
            styles.listContent,
            friendRows.length === 0 && styles.emptyListContent,
          ]}
          columnWrapperStyle={isGrid ? styles.gridRow : undefined}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Users size={40} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>
                {search ? 'No matching friends' : 'No friends yet'}
              </Text>
              <Text style={styles.emptyText}>
                {search
                  ? 'Try another name, filter, or sort option.'
                  : 'Track who owes who and settle faster'}
              </Text>
              {!search && (
                <Pressable
                  style={styles.emptyCta}
                  onPress={() => router.push('/(drawer)/friend/new')}
                  accessibilityRole="button"
                  accessibilityLabel="Add your first friend">
                  <Text style={styles.emptyCtaText}>Add your first friend</Text>
                </Pressable>
              )}
            </View>
          }
        />

        {friendRows.length === 0 && !search ? (
          <View style={styles.fabHint} pointerEvents="none">
            <Text style={styles.fabHintText}>Add friend</Text>
          </View>
        ) : null}
        <NavigateTo navigatePath="/(drawer)/friend/new" />
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  title: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  topSegmentedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 2,
    marginRight: Spacing.xs,
  },
  topToggleItem: {
    minHeight: 36,
    minWidth: 52,
    borderRadius: Spacing.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
  },
  topToggleItemActive: {
    backgroundColor: Colors.primary,
  },
  topToggleText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  topToggleTextActive: {
    color: Colors.background,
  },
  topBarButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.xs,
  },
  controlsSection: {
    gap: Spacing.sm,
  },
  searchContainer: {
    minHeight: 44,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    paddingVertical: Spacing.sm,
  },
  controlRow: {
    gap: Spacing.sm,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.card,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.primary,
  },
  summaryRow: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.sm,
  },
  summaryItem: {
    width: '32%',
    gap: 2,
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  summaryValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: Spacing.xs,
    gap: Spacing.sm,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  gridRow: {
    gap: Spacing.xs,
  },
  skeletonCard: {
    backgroundColor: Colors.surface,
    minHeight: 78,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  skeletonGridCard: {
    flex: 1,
    minHeight: 180,
    marginHorizontal: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  emptyCta: {
    minHeight: 44,
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyCtaText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  fabHint: {
    position: 'absolute',
    right: Spacing.xl + 64,
    bottom: Spacing.xl + 14,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Spacing.borderRadius.round,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  fabHintText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  positive: {
    color: Colors.success,
  },
  negative: {
    color: Colors.error,
  },
  neutral: {
    color: Colors.text,
  },
  topBarButtonActive: {
    borderColor: Colors.primary,
  },
});
