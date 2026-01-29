import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Input } from '@/components/Input';
import { UserCard } from '@/components/UserCard';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { LayoutGrid, List, Menu, Users as UsersIcon } from 'lucide-react-native';
import { useUsersList } from '@/hooks/useUsersList';
import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { EmptySection } from '@/components/EmptySection';


export default function UsersList() {
  const { filteredUsers, isGrid, setSearch, setIsGrid, getUserBalance, search,handlePinToggle } = useUsersList();
  const { openDrawer } = useDrawerContext();
 

  return (
    <View style={styles.wrapper}>
      <ScreenContainer scrollable={false}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={openDrawer}
            style={styles.menuButton}
            activeOpacity={0.7}>
            <Menu size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Users</Text>
        </View>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Input value={search} onChangeText={setSearch} placeholder="Search users..." />
          </View>
          <TouchableOpacity onPress={() => setIsGrid(!isGrid)} style={styles.toggle}>
            {isGrid ? (
              <List color={Colors.text} size={24} />
            ) : (
              <LayoutGrid color={Colors.text} size={24} />
            )}
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          numColumns={isGrid ? 2 : 1}
          key={isGrid ? 'grid' : 'list'}
          renderItem={({ item }) => {
            const balance = getUserBalance(item.id);

            if (isGrid) {
              return (
                <View style={styles.gridItem}>
                  <View style={styles.gridCard}>
                    <View style={styles.gridAvatar}>
                      <Text style={styles.gridAvatarText}>{item.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.gridName}>{item.name}</Text>
                    <Text
                      style={[
                        styles.gridAmount,
                        balance < 0 ? styles.negative : styles.positive,
                      ]}>
                      ${Math.abs(balance).toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            }

            return (
              <View style={styles.listItem}>
                <UserCard user={item} balance={balance} onPinToggle={handlePinToggle} />
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptySection title={'No Users Found'}
            description={'Try adjusting your search or add a new user'}
            icon={'users'}/>
          }
        />
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  menuButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggle: {
    width: 58,
    height: 58,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  listContent: {
    paddingBottom: 100,
  },
  gridItem: {
    flex: 0.5,
    marginHorizontal: 4,
    marginBottom: Spacing.sm,
  },
  listItem: {
    marginBottom: Spacing.sm,
  },
  gridCard: {
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gridAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  gridAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  gridName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  gridAmount: {
    fontSize: 14,
    fontWeight: '700',
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
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  positive: {
    color: Colors.success,
  },
  negative: {
    color: Colors.error,
  },
});

