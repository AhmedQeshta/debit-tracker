import { FilteredFriends } from '@/components/friend/FilteredFriends';
import { AppCard } from '@/components/ui/AppCard';
import { AppChip } from '@/components/ui/AppChip';
import NavigateTo from '@/components/ui/NavigateTo';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/contexts/ThemeContext';
import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { useFriendsList } from '@/hooks/useFriendsList';
import { FILTER_OPTIONS, formatCurrency, SORT_OPTIONS } from '@/lib/utils';
import { Spacing } from '@/theme/spacing';
import { FriendsFilterBy, FriendsListItem, FriendsSortBy } from '@/types/friend';
import { useRouter } from 'expo-router';
import { LayoutGrid, List, Menu, Search, SlidersHorizontal, Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
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
    handleSettle,
    summaryCurrencyLabel,
    handleSummaryCurrencyToggle,
    summaryCurrency,
    showControls,
    setShowControls,
    listData,
    handleFriendAmountCopy,
  } = useFriendsList();

  const { openDrawer } = useDrawerContext();

  const router = useRouter();

  const netTone =
    summary.netBalance > 0
      ? styles.positive
      : summary.netBalance < 0
        ? styles.negative
        : styles.neutral;

  return (
    <View style={styles.wrapper}>
      <ScreenContainer scrollable={false}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={openDrawer}
            style={styles.topBarButton}
            accessibilityRole="button"
            accessibilityLabel={t('friends.accessibility.openMenu')}>
            <Menu color={colors.text} size={20} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('friends.title')}</Text>
          <View style={styles.topActions}>
            <View style={styles.topSegmentedToggle}>
              <Pressable
                style={[styles.topToggleItem, !isGrid && styles.topToggleItemActive]}
                onPress={() => setIsGrid(false)}
                accessibilityRole="button"
                accessibilityLabel={t('friends.accessibility.listView')}
                accessibilityState={{ selected: !isGrid }}>
                <List color={!isGrid ? colors.surface : colors.textMuted} size={14} />
                <Text style={[styles.topToggleText, !isGrid && styles.topToggleTextActive]}>
                  {t('friends.viewModes.list')}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.topToggleItem, isGrid && styles.topToggleItemActive]}
                onPress={() => setIsGrid(true)}
                accessibilityRole="button"
                accessibilityLabel={t('friends.accessibility.gridView')}
                accessibilityState={{ selected: isGrid }}>
                <LayoutGrid color={isGrid ? colors.surface : colors.textMuted} size={14} />
                <Text style={[styles.topToggleText, isGrid && styles.topToggleTextActive]}>
                  {t('friends.viewModes.grid')}
                </Text>
              </Pressable>
            </View>
            <TouchableOpacity
              style={[styles.topBarButton, showControls && styles.topBarButtonActive]}
              onPress={() => setShowControls((prev) => !prev)}
              accessibilityRole="button"
              accessibilityState={{ selected: showControls }}
              accessibilityLabel={t('friends.accessibility.toggleFilters')}>
              <SlidersHorizontal color={colors.textMuted} size={18} />
            </TouchableOpacity>
          </View>
        </View>
        {showControls && (
          <View style={styles.controlsSection}>
            <View style={styles.searchContainer}>
              <Search size={16} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder={t('friends.search.placeholder')}
                placeholderTextColor={colors.textMuted}
                accessibilityLabel={t('friends.accessibility.searchFriends')}
              />
            </View>

            <View style={styles.controlRow}>
              <View style={styles.chipsWrap}>
                {SORT_OPTIONS.map((option) => (
                  <AppChip
                    key={option.key}
                    label={t(`friends.sortOptions.${option.key}`)}
                    selected={sortBy === option.key}
                    onPress={() => setSortBy(option.key as FriendsSortBy)}
                  />
                ))}
              </View>

              <View style={styles.chipsWrap}>
                {FILTER_OPTIONS.map((option) => (
                  <AppChip
                    key={option.key}
                    label={t(`friends.filterOptions.${option.key}`)}
                    selected={filterBy === option.key}
                    onPress={() => setFilterBy(option.key as FriendsFilterBy)}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        <AppCard style={styles.summaryRow}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryHeaderText}>
              {t('friends.summary.title', { currencyLabel: summaryCurrencyLabel })}
            </Text>
            <Pressable
              style={styles.currencyButton}
              onPress={handleSummaryCurrencyToggle}
              accessibilityRole="button"
              accessibilityLabel={t('friends.summary.accessibility.changeCurrencyLabel')}
              accessibilityHint={t('friends.summary.accessibility.changeCurrencyHint')}>
              <Text style={styles.currencyButtonText}>{summaryCurrency}</Text>
            </Pressable>
          </View>
          <View style={styles.summaryStatsWrap}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('friends.summary.labels.friends')}</Text>
              <Text style={styles.summaryValue}>{summary.totalFriends}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('money.labels.youOwe')}</Text>
              <Text style={[styles.summaryValue, styles.negative]}>
                {formatCurrency(summary.youOweTotal, summaryCurrency)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('money.labels.owedToYou')}</Text>
              <Text style={[styles.summaryValue, styles.positive]}>
                {formatCurrency(summary.owedToYouTotal, summaryCurrency)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('friends.summary.labels.settled')}</Text>
              <Text style={styles.summaryValue}>{summary.settledCount}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('friends.summary.labels.net')}</Text>
              <Text style={[styles.summaryValue, netTone]}>
                {formatCurrency(summary.netBalance, summaryCurrency)}
              </Text>
            </View>
          </View>
        </AppCard>

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
                onCopyAmount={handleFriendAmountCopy}
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
                <Users size={40} color={colors.accent} />
              </View>
              <Text style={styles.emptyTitle}>
                {search ? t('friends.empty.searchTitle') : t('friends.empty.defaultTitle')}
              </Text>
              <Text style={styles.emptyText}>
                {search
                  ? t('friends.empty.searchDescription')
                  : t('friends.empty.defaultDescription')}
              </Text>
              {!search && (
                <Pressable
                  style={styles.emptyCta}
                  onPress={() => router.push('/(drawer)/friend/new')}
                  accessibilityRole="button"
                  accessibilityLabel={t('friends.empty.addFirstFriend')}>
                  <Text style={styles.emptyCtaText}>{t('friends.empty.addFirstFriend')}</Text>
                </Pressable>
              )}
            </View>
          }
        />

        {friendRows.length === 0 && !search ? (
          <View style={styles.fabHint} pointerEvents="none">
            <Text style={styles.fabHintText}>{t('friends.actions.addFriend')}</Text>
          </View>
        ) : null}
        <NavigateTo navigatePath="/(drawer)/friend/new" />
      </ScreenContainer>
    </View>
  );
}

const createStyles = (colors: {
  text: string;
  textMuted: string;
  border: string;
  surface: string;
  surface2: string;
  accent: string;
  accentSoft: string;
  background: string;
  success: string;
  danger: string;
}) =>
  StyleSheet.create({
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
      color: colors.text,
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
      backgroundColor: colors.surface2,
      borderRadius: Spacing.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
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
      backgroundColor: colors.accent,
    },
    topToggleText: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '600',
    },
    topToggleTextActive: {
      color: colors.surface,
    },
    topBarButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: Spacing.borderRadius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: Spacing.xs,
    },
    controlsSection: {
      gap: Spacing.sm,
    },
    searchContainer: {
      minHeight: 44,
      borderRadius: Spacing.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      gap: Spacing.sm,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
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
    summaryRow: {
      marginTop: Spacing.sm,
      marginBottom: Spacing.sm,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.sm,
      gap: Spacing.sm,
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
      backgroundColor: colors.surface2,
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
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: Spacing.sm,
    },
    summaryItem: {
      width: '32%',
      gap: 2,
    },
    summaryLabel: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '600',
    },
    summaryValue: {
      color: colors.text,
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
      backgroundColor: colors.surface,
      minHeight: 78,
      borderRadius: Spacing.borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
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
      backgroundColor: colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.lg,
      borderWidth: 2,
      borderColor: colors.border,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    emptyText: {
      color: colors.textMuted,
      textAlign: 'center',
      fontSize: 14,
      lineHeight: 20,
      marginBottom: Spacing.md,
    },
    emptyCta: {
      minHeight: 44,
      borderRadius: Spacing.borderRadius.md,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
    },
    emptyCtaText: {
      color: colors.surface,
      fontSize: 14,
      fontWeight: '700',
    },
    fabHint: {
      position: 'absolute',
      right: Spacing.xl + 64,
      bottom: Spacing.xl + 14,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: Spacing.borderRadius.round,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 6,
    },
    fabHintText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    positive: {
      color: colors.success,
    },
    negative: {
      color: colors.danger,
    },
    neutral: {
      color: colors.text,
    },
    topBarButtonActive: {
      borderColor: colors.accent,
    },
  });
