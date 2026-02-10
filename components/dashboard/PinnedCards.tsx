import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { IPinnedCardsProps } from '@/types/common';
import { useRouter, type Href } from 'expo-router';
import { Pin, PinOff } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const PinnedCards = ({
  title,
  count,
  items,
  renderAvatar,
  getTitle,
  getAmount,
  formatAmount,
  getNavigationPath,
  onUnpin,
}: IPinnedCardsProps) => {
  const router = useRouter();

  if (count === 0) {
    return null;
  }

  return (
    <View style={styles.pinnedSection}>
      <View style={styles.sectionHeader}>
        <Pin size={18} color={Colors.primary} fill={Colors.primary} />
        <Text style={styles.sectionTitle}>
          {title} ({count})
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pinnedList}>
        {items.map((item) => {
          const amount = getAmount(item);
          return (
            <View key={item.id} style={styles.cardWrapper}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(getNavigationPath(item) as unknown as Href)}
                activeOpacity={0.7}>
                <View style={styles.avatar}>{renderAvatar(item)}</View>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {getTitle(item)}
                </Text>
                <Text style={[styles.amount, amount < 0 ? styles.negative : styles.positive]}>
                  {formatAmount(Math.abs(amount), item)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.unpinButton}
                onPress={(e) => onUnpin(item.id, e)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <PinOff size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  pinnedSection: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  pinnedList: {
    paddingRight: Spacing.md,
  },
  cardWrapper: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  card: {
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  itemTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    textAlign: 'center',
    maxWidth: 100,
  },
  amount: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  unpinButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 4,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  positive: {
    color: Colors.success,
  },
  negative: {
    color: Colors.error,
  },
});
