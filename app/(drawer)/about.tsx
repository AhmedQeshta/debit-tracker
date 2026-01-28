import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import Constants from 'expo-constants';
import { Menu } from 'lucide-react-native';
import { useDrawer } from './_layout';

export default function About() {
  const { openDrawer } = useDrawer();
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const appName = Constants.expoConfig?.name || 'DebitTracker';

  return (
    <View style={styles.wrapper}>
      <ScreenContainer>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={openDrawer}
            style={styles.menuButton}
            activeOpacity={0.7}>
            <Menu size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>About Me</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Name:</Text>
            <Text style={styles.infoValue}>{appName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version:</Text>
            <Text style={styles.infoValue}>{appVersion}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            DebitTracker is a premium, offline-first mobile application that allows you to track 
            personal debts, transactions, and balances with a seamless user experience, even 
            without an internet connection.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Offline-First Architecture</Text>
            <Text style={styles.featureItem}>• Premium Dark Mode Interface</Text>
            <Text style={styles.featureItem}>• User Management</Text>
            <Text style={styles.featureItem}>• Transaction Tracking</Text>
            <Text style={styles.featureItem}>• Dashboard & Analytics</Text>
            <Text style={styles.featureItem}>• Persistent State Management</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer Credits</Text>
          <Text style={styles.description}>
            Built with React Native and Expo, powered by modern technologies including Expo Router, 
            Zustand, and AsyncStorage for a fast and reliable experience.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 DebitTracker</Text>
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  menuButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  featureList: {
    marginTop: Spacing.sm,
  },
  featureItem: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: Spacing.sm,
    lineHeight: 24,
  },
  footer: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

