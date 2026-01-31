import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function NavigateTo({ navigatePath }: { navigatePath: string }) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(navigatePath as any);
  };

  return (
    <TouchableOpacity style={styles.fab} onPress={handleNavigate}>
      <Plus size={24} color="#000" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
