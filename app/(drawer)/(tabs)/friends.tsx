import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { LayoutGrid, List } from 'lucide-react-native';
import { useFriendsList } from '@/hooks/useFriendsList';
import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { EmptySection } from '@/components/ui/EmptySection';
import { FilteredFriends } from '@/components/friend/FilteredFriends';
import Header from '@/components/ui/Header';
import NavigateTo from '@/components/ui/NavigateTo';

export default function FriendsList()
{
  const {
    filteredFriends,
    isGrid,
    setSearch,
    setIsGrid,
    search,
    handleFriendEdit,
    handleFriendDelete,
    handlePinToggle,
  } = useFriendsList();
  const { openDrawer } = useDrawerContext();

  return (
    <View style={styles.wrapper}>
      <ScreenContainer scrollable={false}>
        <Header openDrawer={openDrawer} title="Friends" />
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Input value={search} onChangeText={setSearch} placeholder="Search friends..." />
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
          data={filteredFriends}
          keyExtractor={(item) => item.id}
          numColumns={isGrid ? 2 : 1}
          key={isGrid ? 'grid' : 'list'}
          renderItem={({ item }) => (
            <FilteredFriends
              key={item.id}
              item={item}
              isGrid={isGrid}
              handleFriendEdit={handleFriendEdit}
              handleFriendDelete={handleFriendDelete}
              handlePinToggle={handlePinToggle}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptySection
              title={'No Friends Found'}
              description={'Try adjusting your search or add a new friend'}
              icon={'users'}
            /> // Keeping icon 'users' for now or change to 'user-plus' if available
          }
        />

        <NavigateTo navigatePath="/friend/new" />
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
    marginTop: Spacing.sm,
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
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    minHeight: 160,
  },
  gridCardHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  gridActions: {
    zIndex: 10,
  },
  gridAvatarContainer: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  gridAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridPinIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 2,
  },
  gridNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  gridPinIcon: {
    marginLeft: Spacing.xs,
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
  positive: {
    color: Colors.success,
  },
  negative: {
    color: Colors.error,
  },
});
