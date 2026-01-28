import React from 'react';
import { View, Text, StyleSheet,  TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TransactionItem } from '@/components/TransactionItem';
import { Button } from '@/components/Button';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Pencil, Trash2, Pin, PinOff, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUserDetails } from '@/hooks/user/useUserDetails';
import { getBalanceStatus, getBalanceText } from '@/lib/utils';

export default function UserDetails() {
  const { user, transactions, balance, handleEditUser, handleDeleteUser, handleEditTransaction, handleDeleteTransaction, handlePinToggle, router, id} = useUserDetails();
  const insets = useSafeAreaInsets();

  if (!user) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }


  return (
    <ScreenContainer>
      <View style={styles.titleRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={25} color={Colors.text} />
          <Text style={styles.title}>User Details</Text>
        </TouchableOpacity> 
        <View style={styles.userActions}>
          <TouchableOpacity onPress={handlePinToggle} style={styles.iconButton}>
            {user.pinned ? (
              <PinOff size={20} color={Colors.primary} />
            ) : (
              <Pin size={20} color={Colors.textSecondary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEditUser} style={styles.iconButton}>
            <Pencil size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteUser} style={styles.iconButton}>
            <Trash2 size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          {user.pinned && (
            <View style={styles.pinBadge}>
              <Pin size={14} color={Colors.primary} fill={Colors.primary} />
            </View>
          )}
        </View>

        <View style={styles.nameContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.name}</Text>
            {user.pinned && (
              <View style={styles.pinIndicator}>
                <Pin size={16} color={Colors.primary} fill={Colors.primary} />
                <Text style={styles.pinText}>Pinned</Text>
              </View>
            )}
          </View>
          {user.bio ? (
            <Text style={styles.bio}>{user.bio}</Text>
          ) : null}
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={[styles.balance, balance < 0 ? styles.negative : styles.positive]}>
            {getBalanceText(balance)}
          </Text>
          <Text style={styles.balanceStatus}>
            {getBalanceStatus(balance)}
          </Text>
        </View>
      </View>

      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>History</Text>
        <Button
          title="+ Add Record"
          variant="secondary"
          onPress={() => router.push({ pathname: '/transaction/new', params: { userId: id } })}
        />
      </View>

      <View style={[styles.list, { paddingBottom: insets.bottom + Spacing.md }]}>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No transaction history found.</Text>
        ) : (
          transactions.map((item) => (
          <TransactionItem
            key={item.id}
            transaction={item}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        )))}

      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  header: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.card,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
  },
  pinBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  name: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  pinIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  pinText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  bio: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
  userActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  iconButton: {
    padding: Spacing.sm,
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: Colors.surface,
  },
  balanceCard: {
    backgroundColor: Colors.card,
    padding: Spacing.xl,
    borderRadius: Spacing.borderRadius.lg,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  balance: {
    fontSize: 42,
    fontWeight: 'bold',
    marginVertical: Spacing.xs,
  },
  balanceStatus: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: Spacing.xs,
    fontWeight: '500',
  },
  positive: {
    color: Colors.success,
  },
  negative: {
    color: Colors.error,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  historyTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  list: {
    marginBottom: Spacing.xl,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xl,
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  errorText: {
    color: Colors.error,
    fontSize: 18,
    marginBottom: Spacing.lg,
  },
  backButton:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  }
});

