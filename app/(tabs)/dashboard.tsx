import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Wifi, WifiOff, Pin, PinOff } from 'lucide-react-native';
import { useDashboard } from '@/hooks/useDashboard';
import { TouchableOpacity } from 'react-native';

export default function Dashboard() {
  const { users, queueSize, isOnline, globalDebit, totalPaidBack, pinnedUsers, pinnedCount, getUserBalance , router,handleUnpin} = useDashboard();
 
  return (
    <View style={styles.wrapper}>
      <ScreenContainer>
        <View style={styles.statusHeader}>
          <Text style={styles.title}>Dashboard</Text>
          <View style={[styles.badge, isOnline ? styles.onlineBadge : styles.offlineBadge]}>
            {isOnline ? <Wifi size={14} stroke="#000" /> : <WifiOff size={14} stroke="#fff" />}
            <Text style={[styles.badgeText, isOnline ? {} : { color: '#fff' }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Users</Text>
            <Text style={styles.statValue}>{users.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pinned Users</Text>
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {pinnedCount}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pending Syncs</Text>
            <Text style={[styles.statValue, queueSize > 0 ? { color: Colors.primary } : {}]}>
              {queueSize}
            </Text>
          </View>
        </View>

        <View style={styles.mainStats}>
          <View style={[styles.mainStatCard, { borderLeftColor: Colors.error }]}>
            <Text style={styles.mainStatLabel}>Total They Owe You</Text>
            <Text style={[styles.mainStatValue, { color: Colors.error }]}>
              ${globalDebit.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.mainStatCard, { borderLeftColor: Colors.success }]}>
            <Text style={styles.mainStatLabel}>Total You Owe Them</Text>
            <Text style={[styles.mainStatValue, { color: Colors.success }]}>
              ${totalPaidBack.toFixed(2)}
            </Text>
          </View>
        </View>

        {pinnedCount > 0 && (
          <View style={styles.pinnedSection}>
            <View style={styles.sectionHeader}>
              <Pin size={18} color={Colors.primary} fill={Colors.primary} />
              <Text style={styles.sectionTitle}>Pinned Users ({pinnedCount})</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pinnedList}
            >
              {pinnedUsers.map((user) => {
                const balance = getUserBalance(user.id);
                return (
                  <View key={user.id} style={styles.pinnedUserCardWrapper}>
                    <TouchableOpacity
                      style={styles.pinnedUserCard}
                      onPress={() => router.push(`/user/${user.id}`)}
                    >
                      <View style={styles.pinnedAvatar}>
                        <Text style={styles.pinnedAvatarText}>{user.name.charAt(0)}</Text>
                      </View>
                      <Text style={styles.pinnedUserName} numberOfLines={1}>
                        {user.name}
                      </Text>
                      <Text
                        style={[
                          styles.pinnedBalance,
                          balance < 0 ? styles.negative : styles.positive,
                        ]}
                      >
                        ${Math.abs(balance).toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.unpinButton}
                      onPress={(e) => handleUnpin(user.id, e)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <PinOff size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={styles.chartPlaceholder}>
          <Text style={styles.placeholderText}>Charts & Insights Coming Soon</Text>
          <View style={styles.barPlaceholder} />
          <View
            style={[styles.barPlaceholder, { width: '70%', backgroundColor: Colors.surface }]}
          />
          <View style={[styles.barPlaceholder, { width: '40%' }]} />
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  onlineBadge: {
    backgroundColor: Colors.secondary,
  },
  offlineBadge: {
    backgroundColor: Colors.error,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  mainStats: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  mainStatCard: {
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    borderRadius: Spacing.borderRadius.lg,
    borderLeftWidth: 6,
  },
  mainStatLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  mainStatValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 4,
  },
  chartPlaceholder: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Spacing.borderRadius.lg,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  placeholderText: {
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  barPlaceholder: {
    height: 12,
    width: '100%',
    backgroundColor: Colors.border,
    borderRadius: 6,
    marginBottom: Spacing.sm,
  },
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
  pinnedUserCardWrapper: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  pinnedUserCard: {
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pinnedAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  pinnedAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  pinnedUserName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    textAlign: 'center',
    maxWidth: 100,
  },
  pinnedBalance: {
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

