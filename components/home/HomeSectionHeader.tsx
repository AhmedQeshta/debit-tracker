import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { HomeSectionHeaderProps } from '@/types/common';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';

export const HomeSectionHeader = ({
  title,
  seeAllLabel = 'See all',
  onSeeAll,
}: HomeSectionHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onSeeAll ? (
        <Pressable style={styles.linkButton} onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.linkLabel}>{seeAllLabel}</Text>
          {I18nManager.isRTL ? (
            <ChevronLeft size={16} color={Colors.primary} />
          ) : (
            <ChevronRight size={16} color={Colors.primary} />
          )}
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  title: {
    color: Colors.text,
    fontSize: 30 / 1.5,
    fontWeight: '700',
  },
  linkButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  linkLabel: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
