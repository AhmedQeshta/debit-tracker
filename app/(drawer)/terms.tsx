import Header from '@/components/ui/Header';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { StyleSheet, Text, View } from 'react-native';

export default function Terms() {
  const { openDrawer } = useDrawerContext();

  return (
    <View style={styles.wrapper}>
      <ScreenContainer>
        <Header openDrawer={openDrawer} title="Terms" subtitle="Terms and conditions" />

        <View style={styles.card}>
          <Text style={styles.paragraph}>
            By using Debit Tracker, you agree to use the app responsibly and keep your account
            credentials secure. You are responsible for the accuracy of the debt, budget, and
            transaction data you enter.
          </Text>
          <Text style={styles.paragraph}>
            The app is provided as-is without guarantees of uninterrupted availability. For
            sensitive decisions, always verify financial data before acting.
          </Text>
          <Text style={styles.note}>Last updated: March 11, 2026</Text>
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  card: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
  note: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
