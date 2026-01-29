import { View, Text, StyleSheet, TouchableOpacity, Pressable, Modal } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import {  Trash2, Pin, PinOff, Pencil, MoreVertical } from 'lucide-react-native';
import { IActionsProps } from '@/types/budget';
import { useRouter } from 'expo-router';




export const Actions = ({ menuVisible, setMenuVisible, budget, handlePinToggle, handleDeleteBudget }: IActionsProps) => {
  const router = useRouter();
  
  return (
    <View style={styles.budgetActions}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={(e) => {
          e.stopPropagation();
          setMenuVisible(true);
        }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}>
        <MoreVertical size={20} color={Colors.text} />
      </TouchableOpacity>
      
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}>
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}>
          <View style={styles.menuWrapper}>
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  router.push(`/(drawer)/budget/${budget.id}/edit`);
                }}
                activeOpacity={0.7}>
                <Pencil size={18} color={Colors.text} />
                <Text style={styles.menuItemText}>Edit Budget</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  handlePinToggle(budget.id);
                }}
                activeOpacity={0.7}>
                {budget.pinned ? (
                  <>
                    <PinOff size={18} color={Colors.text} />
                    <Text style={styles.menuItemText}>Unpin Budget</Text>
                  </>
                ) : (
                  <>
                    <Pin size={18} color={Colors.text} />
                    <Text style={styles.menuItemText}>Pin Budget</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemDanger]}
                onPress={() => {
                  setMenuVisible(false);
                  handleDeleteBudget(budget.id, budget.title);
                }}
                activeOpacity={0.7}>
                <Trash2 size={18} color={Colors.error} />
                <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Delete Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  budgetInfoHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     marginBottom: Spacing.md,
   },
   budgetInfoTitleRow: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: Spacing.xs,
     flex: 1,
   },
   budgetActions: {
     position: 'relative',
   },
   menuButton: {
     padding: Spacing.xs,
   },
   menuOverlay: {
     flex: 1,
     backgroundColor: 'rgba(0, 0, 0, 0.3)',
     justifyContent: 'flex-start',
     alignItems: 'flex-end',
     paddingTop: 100,
     paddingRight: 60,
   },
   menuWrapper: {
     alignItems: 'flex-end',
   },
   menuContainer: {
     backgroundColor: Colors.card,
     borderRadius: Spacing.borderRadius.md,
     borderWidth: 1,
     borderColor: Colors.border,
     minWidth: 180,
     shadowColor: '#000',
     shadowOffset: {
       width: 0,
       height: 2,
     },
     shadowOpacity: 0.25,
     shadowRadius: 3.84,
     elevation: 10,
   },
   menuItem: {
     flexDirection: 'row',
     alignItems: 'center',
     padding: Spacing.md,
     gap: Spacing.sm,
     borderBottomWidth: 1,
     borderBottomColor: Colors.border,
   },
   menuItemDanger: {
     borderBottomWidth: 0,
   },
   menuItemText: {
     fontSize: 16,
     color: Colors.text,
     fontWeight: '500',
   },
   menuItemTextDanger: {
     color: Colors.error,
   },
 });