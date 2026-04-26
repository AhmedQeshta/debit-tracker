import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function NavigateTo({
  navigatePath,
  onPress,
}: Readonly<{
  navigatePath: string;
  onPress?: () => void;
}>) {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleNavigate = () => {
    if (onPress) {
      onPress();
      return;
    }
    router.push(navigatePath as any);
  };

  return (
    <TouchableOpacity style={styles.fab} onPress={handleNavigate}>
      <Plus size={24} color={colors.surface} />
    </TouchableOpacity>
  );
}

const createStyles = (colors: { accent: string; shadow: string }) =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: Spacing.xl,
      right: Spacing.xl,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
    },
  });
