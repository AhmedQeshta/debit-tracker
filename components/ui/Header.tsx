import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/theme/colors';
import { ArrowLeft, Menu } from 'lucide-react-native';
import { Spacing } from '@/theme/spacing';

export default function Header({ openDrawer, title, isGoBack = false }: { openDrawer?: () => void; title: string, isGoBack?: boolean })
{
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={openDrawer} style={styles.menuButton} activeOpacity={0.7}>
        {isGoBack ? <ArrowLeft size={25} color={Colors.text} /> : <Menu size={24} color={Colors.text} />}
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
  arrowLeft: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  actionsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
});
