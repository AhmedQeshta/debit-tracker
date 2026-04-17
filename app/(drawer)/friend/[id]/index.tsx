import { TransactionItem } from '@/components/transaction/TransactionItem';
import { Actions } from '@/components/ui/Actions';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Copy, Filter, Pencil, Pin, PinOff, Search, Trash2 } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptySection } from '@/components/ui/EmptySection';
import Header from '@/components/ui/Header';
import { useFriendDetail } from '@/hooks/friend/useFriendDetail';
import { useCopyAmount } from '@/hooks/useCopyAmount';
import { useToast } from '@/hooks/useToast';
import { formatAbsoluteCurrency, getBalanceDirectionTone } from '@/lib/utils';

type TransactionsFilter = 'all' | 'you-paid' | 'they-paid' | 'pending';
const TransactionsTaps = [
  { key: 'all' },
  { key: 'you-paid' },
  { key: 'they-paid' },
  { key: 'pending' },
];
export default function FriendDetails() {
  const { t } = useTranslation();
  const {
    friend,
    transactions,
    balance,
    breakdown,
    pendingCount,
    lastActivity,
    handleEditFriend,
    handleDeleteFriend,
    handleEditTransaction,
    handleDeleteTransaction,
    handlePinToggle,
    handleSettleUp,
    isSettling,
    canSettle,
    router,
    id,
  } = useFriendDetail();
  const insets = useSafeAreaInsets();
  const [friendMenuVisible, setFriendMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TransactionsFilter>('all');
  const [searchVisible, setSearchVisible] = useState(false);
  const { toastInfo } = useToast();
  const { handleCopyAmount } = useCopyAmount();

  const handleCopyBalance = async () => {
    if (!friend) return;

    await handleCopyAmount(balance, friend.currency || '$', {
      successMessage: t('friendDetail.toasts.balanceCopied'),
      errorMessage: t('friendDetail.toasts.balanceCopyFailed'),
    });
  };
  const isLoading = !!id && !friend;

  const tone = getBalanceDirectionTone(balance);
  const balanceDirectionText =
    balance > 0
      ? t('friendDetail.balance.directionOwesYou', { name: friend?.name ?? '' })
      : balance < 0
        ? t('friendDetail.balance.directionYouOwe', { name: friend?.name ?? '' })
        : t('friendDetail.balance.directionSettled');

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const matchesFilter = (amount: number, synced: boolean) => {
      if (activeFilter === 'you-paid') return amount > 0;
      if (activeFilter === 'they-paid') return amount < 0;
      if (activeFilter === 'pending') return !synced;
      return true;
    };

    return transactions.filter((transaction) => {
      const filterMatch = matchesFilter(transaction.amount, transaction.synced);
      if (!filterMatch) return false;
      if (!query) return true;

      return (
        transaction.title.toLowerCase().includes(query) ||
        transaction.note?.toLowerCase().includes(query)
      );
    });
  }, [activeFilter, searchQuery, transactions]);

  const handleNewTransaction = () => {
    router.push({ pathname: '/(drawer)/transaction/new', params: { friendId: id } });
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingCard} />
        <View style={styles.loadingBalance} />
        <View style={styles.loadingRow} />
        <View style={styles.loadingRow} />
        <View style={styles.loadingRow} />
      </ScreenContainer>
    );
  }

  if (!friend) {
    return (
      <EmptySection
        title={t('friendDetail.errors.notFoundTitle')}
        description={t('friendDetail.errors.notFoundDescription')}
        icon={'users'}
      />
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.titleRow}>
        <Header
          openDrawer={() => router.push('/(drawer)/(tabs)/friends')}
          title={friend.name}
          isGoBack={true}
        />

        <View style={styles.userActions}>
          <Actions
            menuVisible={friendMenuVisible}
            setMenuVisible={setFriendMenuVisible}
            menuItems={[
              {
                icon: friend.pinned ? (
                  <PinOff size={18} color={Colors.text} />
                ) : (
                  <Pin size={18} color={Colors.text} />
                ),
                label: friend.pinned
                  ? t('friendDetail.menu.unpinFriend')
                  : t('friendDetail.menu.pinFriend'),
                onPress: handlePinToggle,
              },
              {
                icon: <Copy size={18} color={Colors.text} />,
                label: t('friendDetail.menu.copyBalance'),
                onPress: handleCopyBalance,
              },
              {
                icon: <Pencil size={18} color={Colors.text} />,
                label: t('friendDetail.menu.editFriend'),
                onPress: handleEditFriend,
              },
              {
                icon: <Filter size={18} color={Colors.text} />,
                label: t('friendDetail.menu.export'),
                onPress: () =>
                  router.push({
                    pathname: '/(drawer)/settings/export-data' as any,
                    params: { friendId: friend.id },
                  }),
              },
              {
                icon: <Trash2 size={18} color={Colors.error} />,
                label: t('friendDetail.menu.deleteFriend'),
                onPress: handleDeleteFriend,
                danger: true,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{friend.name.charAt(0)}</Text>
          </View>
          {friend.pinned && (
            <View style={styles.pinBadge}>
              <Pin size={14} color={Colors.primary} fill={Colors.primary} />
            </View>
          )}
        </View>

        <View style={styles.nameContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{friend.name}</Text>
            <View style={styles.statusChip}>
              <Text style={styles.statusChipText}>
                {friend.synced ? t('friendDetail.status.synced') : t('friendDetail.status.active')}
              </Text>
            </View>
          </View>
          {!!friend.bio && <Text style={styles.bio}>{friend.bio}</Text>}
        </View>
      </View>

      <View style={styles.balanceCard}>
        <View style={styles.balanceTopRow}>
          <Text style={styles.balanceLabel}>{t('friendDetail.balance.title')}</Text>
          {pendingCount > 0 ? (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{t('friendDetail.balance.pendingSync')}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.balanceMainRow}>
          <View>
            <Text
              style={[
                styles.balance,
                tone === 'positive'
                  ? styles.positive
                  : tone === 'negative'
                    ? styles.negative
                    : styles.neutral,
              ]}>
              {formatAbsoluteCurrency(balance, friend.currency || '$')}
            </Text>
          </View>
          <Pressable style={styles.copyBalanceButton} onPress={handleCopyBalance}>
            <Copy size={16} color={Colors.text} />
            <Text style={styles.copyBalanceButtonText}>{t('friendDetail.actions.copy')}</Text>
          </Pressable>
        </View>
        <Text style={styles.balanceStatus}>{balanceDirectionText}</Text>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>{t('friendDetail.balance.youOwe')}</Text>
          <Text style={styles.breakdownValue}>
            {formatAbsoluteCurrency(breakdown.youOwe, friend.currency || '$')}
          </Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>{t('friendDetail.balance.owedToYou')}</Text>
          <Text style={styles.breakdownValue}>
            {formatAbsoluteCurrency(breakdown.owedToYou, friend.currency || '$')}
          </Text>
        </View>
        <Text style={styles.lastActivity}>
          {t('friendDetail.balance.lastActivity')}{' '}
          {lastActivity
            ? new Date(lastActivity).toLocaleDateString()
            : t('friendDetail.balance.noActivityYet')}
        </Text>
      </View>

      <View style={styles.primaryActionsRow}>
        <View style={styles.actionColumn}>
          <Button title={t('friendDetail.actions.addTransaction')} onPress={handleNewTransaction} />
        </View>
        <View style={styles.actionColumn}>
          <Button
            title={
              canSettle ? t('friendDetail.actions.settleUp') : t('friendDetail.actions.settled')
            }
            onPress={handleSettleUp}
            variant="outline"
            loading={isSettling}
            disabled={!canSettle || isSettling}
          />
        </View>
      </View>

      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>{t('friendDetail.history.title')}</Text>
        <View style={styles.historyActions}>
          <Pressable
            style={styles.headerIconButton}
            onPress={() => setSearchVisible((value) => !value)}>
            <Search size={18} color={Colors.text} />
          </Pressable>
          <Pressable
            style={styles.headerIconButton}
            onPress={() => toastInfo(t('friendDetail.toasts.filterHint'))}>
            <Filter size={18} color={Colors.text} />
          </Pressable>
        </View>
      </View>

      {searchVisible ? (
        <TextInput
          placeholder={t('friendDetail.history.searchPlaceholder')}
          placeholderTextColor={Colors.textSecondary}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      ) : null}

      <View style={styles.tabsRow}>
        {TransactionsTaps.map((tab) => {
          const selected = activeFilter === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tabItem, selected && styles.tabItemActive]}
              onPress={() => setActiveFilter(tab.key as TransactionsFilter)}>
              <Text style={[styles.tabText, selected && styles.tabTextActive]}>
                {t(`friendDetail.filters.${tab.key}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.list, { paddingBottom: insets.bottom + Spacing.md }]}>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyTransactionsState}>
            <Text style={styles.emptyTitle}>{t('friendDetail.history.emptyTitle')}</Text>
            <Text style={styles.emptyText}>{t('friendDetail.history.emptyDescription')}</Text>
            <View style={styles.emptyCta}>
              <Button
                title={t('friendDetail.actions.addTransaction')}
                onPress={handleNewTransaction}
              />
            </View>
          </View>
        ) : (
          filteredTransactions.map((item) => (
            <TransactionItem
              key={item.id}
              transaction={item}
              currency={friend.currency || '$'}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onCopyAmount={() =>
                void handleCopyAmount(item.amount, friend.currency || '$', {
                  successMessage: t('friendDetail.toasts.transactionAmountCopied'),
                  errorMessage: t('friendDetail.toasts.amountCopyFailed'),
                })
              }
            />
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  pinBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  nameContainer: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  statusChip: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.round,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  statusChipText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  bio: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: Spacing.xs,
  },
  userActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginLeft: -Spacing.lg,
  },
  balanceCard: {
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  pendingBadge: {
    backgroundColor: Colors.surface,
    borderColor: Colors.primary,
    borderWidth: 1,
    borderRadius: Spacing.borderRadius.round,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  pendingBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  balanceLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  balance: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  balanceMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  copyBalanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  copyBalanceButtonText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  balanceStatus: {
    color: Colors.textSecondary,
    fontSize: 15,
    marginBottom: Spacing.md,
    fontWeight: '500',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  breakdownLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  breakdownValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  lastActivity: {
    marginTop: Spacing.xs,
    color: Colors.textSecondary,
    fontSize: 12,
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
  primaryActionsRow: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionColumn: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  historyTitle: {
    color: Colors.text,
    fontSize: 19,
    fontWeight: '700',
  },
  historyActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Spacing.borderRadius.md,
    minHeight: 44,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.xs,
    marginBottom: Spacing.md,
  },
  tabItem: {
    flex: 1,
    minHeight: 36,
    borderRadius: Spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.background,
  },
  list: {
    marginBottom: Spacing.lg,
  },
  emptyTransactionsState: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.lg,
    backgroundColor: Colors.card,
    padding: Spacing.lg,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 13,
  },
  emptyCta: {
    width: '100%',
    marginTop: Spacing.md,
  },
  loadingCard: {
    height: 88,
    borderRadius: Spacing.borderRadius.lg,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
  },
  loadingBalance: {
    height: 220,
    borderRadius: Spacing.borderRadius.lg,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
  },
  loadingRow: {
    height: 72,
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
});
