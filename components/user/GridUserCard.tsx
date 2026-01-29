import { GridUserCardProps } from "@/types/user";
import { View, Text, StyleSheet } from "react-native";
import { Actions } from "../ui/Actions";
import { useState } from "react";
import { Colors } from "@/theme/colors";
import { Pin } from "lucide-react-native";
import { Spacing } from "@/theme/spacing";

export const GridUserCard = ({ user, balance, menuItems }: GridUserCardProps) =>
{
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.gridItem}>
      <View style={styles.gridCard}>
        <View style={styles.gridCardHeader}>
          <View style={styles.gridActions}>
            <Actions
              menuVisible={menuVisible}
              setMenuVisible={setMenuVisible}
              menuItems={menuItems}
            />
          </View>
        </View>
        <View style={styles.gridAvatarContainer}>
          <View style={styles.gridAvatar}>
            <Text style={styles.gridAvatarText}>{user.name.charAt(0)}</Text>
          </View>
          {user.pinned && (
            <View style={styles.gridPinIndicator}>
              <Pin size={12} color={Colors.primary} fill={Colors.primary} />
            </View>
          )}
        </View>
        <View style={styles.gridNameRow}>
          <Text style={styles.gridName}>{user.name}</Text>
          {user.pinned && (
            <Pin size={14} color={Colors.primary} fill={Colors.primary} style={styles.gridPinIcon} />
          )}
        </View>
        <Text
          style={[
            styles.gridAmount,
            balance < 0 ? styles.negative : styles.positive,
          ]}>
          {user.currency || '$'}{Math.abs(balance).toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridItem: {
    flex: 0.5,
    marginHorizontal: 4,
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
  gridAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
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
  negative: {
    color: Colors.error,
  },
  positive: {
    color: Colors.success,
  },
  gridPinIcon: {
    marginLeft: Spacing.xs,
  },

});   