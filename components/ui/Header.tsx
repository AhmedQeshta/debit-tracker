import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { ArrowLeft, Menu } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  openDrawer?: () => void;
  title: string;
  subtitle?: string;
  isGoBack?: boolean;
}

export default function Header({ openDrawer, title, subtitle, isGoBack = false }: HeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={openDrawer} style={styles.menuButton} activeOpacity={0.7}>
        {isGoBack ? (
          <ArrowLeft size={25} color={Colors.text} />
        ) : (
          <Menu size={24} color={Colors.text} />
        )}
      </TouchableOpacity>
      <View style={styles.titleWrap}>
        <Text style={styles.actionsTitle}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
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
  titleWrap: {
    flex: 1,
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
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});
