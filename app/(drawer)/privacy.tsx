import Header from '@/components/ui/Header';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { StyleSheet, Text, View } from 'react-native';

export default function Privacy() {
  const { openDrawer } = useDrawerContext();

  return (
    <View style={styles.wrapper}>
      <ScreenContainer>
        <Header openDrawer={openDrawer} title="Privacy" subtitle="How your data is handled" />

        <View style={styles.card}>
          <Text style={styles.paragraph}>
            Debit Tracker stores your app data locally on your device. If cloud sync is enabled,
            your data can also be stored securely in your connected cloud account to support backup
            and multi-device use.
          </Text>
          <Text style={styles.paragraph}>
            You can sign out at any time. You can also clear local data from Settings, which removes
            data only from this device and does not automatically delete cloud data already synced
            to your account.
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
