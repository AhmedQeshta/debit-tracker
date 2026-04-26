import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import { HeaderProps } from '@/types/common';
import { ArrowLeft, ArrowRight, Menu } from 'lucide-react-native';
import { I18nManager, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Header({ openDrawer, title, subtitle, isGoBack = false }: HeaderProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={openDrawer} style={styles.menuButton} activeOpacity={0.7}>
        {isGoBack ? (
          I18nManager.isRTL ? (
            <ArrowRight size={25} color={colors.text} />
          ) : (
            <ArrowLeft size={25} color={colors.text} />
          )
        ) : (
          <Menu size={24} color={colors.text} />
        )}
      </TouchableOpacity>
      <View style={styles.titleWrap}>
        <Text style={styles.actionsTitle}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const createStyles = (colors: { text: string; textSecondary: string }) =>
  StyleSheet.create({
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
      color: colors.text,
    },
    actionsTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
    },
  });
