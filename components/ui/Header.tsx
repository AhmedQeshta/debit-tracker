import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/theme/colors';
import { Menu } from 'lucide-react-native';
import { Spacing } from '@/theme/spacing';

export default function Header({ openDrawer, title }: { openDrawer: () => void; title: string }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={openDrawer} style={styles.menuButton} activeOpacity={0.7}>
        <Menu size={24} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.actionsTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  menuButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  actionsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
});
