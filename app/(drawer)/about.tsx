import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import Constants from 'expo-constants';
import { Menu, Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react-native';
import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { useToast } from '@/contexts/ToastContext';

export default function About()
{
  const { openDrawer } = useDrawerContext();
  const { toastError } = useToast();
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const appName = Constants.expoConfig?.name || 'DebitTracker';

  const handleEmailPress = () =>
  {
    Linking.openURL('mailto:ahmed.qeshta.dev@gmail.com');
  };

  const handlePhonePress = () =>
  {
    Linking.openURL('tel:+970592157001');
  };

  const handleLinkPress = (url: string) =>
  {
    Linking.openURL(url).catch(() =>
    {
      toastError('Could not open the link');
    });
  };

  return (
    <View style={styles.wrapper}>
      <ScreenContainer>
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuButton} activeOpacity={0.7}>
            <Menu size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>About</Text>
        </View>

        {/* App Logo, Name and Version */}
        <View style={styles.appHeader}>
          <Image source={require('@/assets/icon.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>{appName}</Text>
          <Text style={styles.appVersion}>Version {appVersion}</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            DebitTracker is a premium, offline-first mobile application designed to help you manage
            personal finances with ease. Track debts, transactions, and balances seamlessly, even
            without an internet connection. Built with modern technologies for a fast, reliable, and
            intuitive user experience.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Offline-First Architecture</Text>
            <Text style={styles.featureItem}>• Premium Dark Mode Interface</Text>
            <Text style={styles.featureItem}>• Friend Management & Profiles</Text>
            <Text style={styles.featureItem}>• Transaction Tracking & History</Text>
            <Text style={styles.featureItem}>• Budget Calculator & Management</Text>
            <Text style={styles.featureItem}>• Dashboard & Analytics</Text>
            <Text style={styles.featureItem}>• Persistent State Management</Text>
          </View>
        </View>

        {/* Developer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer</Text>

          <View style={styles.developerCard}>
            <Text style={styles.developerName}>Ahmed Qeshta</Text>
            <Text style={styles.developerTitle}>Computer Engineer - Full Stack Engineer</Text>

            <View style={styles.contactInfo}>
              <TouchableOpacity
                style={styles.contactItem}
                onPress={handleEmailPress}
                activeOpacity={0.7}>
                <Mail size={18} color={Colors.primary} />
                <Text style={styles.contactText}>ahmed.qeshta.dev@gmail.com</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactItem}
                onPress={handlePhonePress}
                activeOpacity={0.7}>
                <Phone size={18} color={Colors.primary} />
                <Text style={styles.contactText}>+970592157001</Text>
              </TouchableOpacity>

              <View style={styles.contactItem}>
                <MapPin size={18} color={Colors.primary} />
                <Text style={styles.contactText}>Palestine, Gaza Strip, Gaza</Text>
              </View>
            </View>

            <View style={styles.socialLinks}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleLinkPress('https://www.linkedin.com/in/ahmed-qeshta')}
                activeOpacity={0.7}>
                <Linkedin size={16} color={Colors.primary} />
                <Text style={styles.socialText}>LinkedIn</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleLinkPress('https://github.com/ahmed-qeshta')}
                activeOpacity={0.7}>
                <Github size={16} color={Colors.primary} />
                <Text style={styles.socialText}>GitHub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleLinkPress('https://ahmed.qeshta.dev')}
                activeOpacity={0.7}>
                <Globe size={16} color={Colors.primary} />
                <Text style={styles.socialText}>Website</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.developerInfo}>
              <Text style={styles.developerSubtitle}>Professional Summary</Text>
              <Text style={styles.developerDescription}>
                Experienced Full Stack Engineer with a strong focus on React, Next.js, and modern
                web technologies. Specialized in building production-ready applications with
                emphasis on component architecture, state management, and performance optimization.
                Comfortable working across the full stack, from frontend UI/UX to backend APIs and
                database design.
              </Text>

              <Text style={styles.developerSubtitle}>Education</Text>
              <Text style={styles.developerDescription}>
                {
                  "Bachelor's degree in Computer Engineering from The Islamic University of Gaza (April 2016 - June 2021)"
                }
              </Text>

              <Text style={styles.developerSubtitle}>Key Skills</Text>
              <Text style={styles.developerDescription}>
                React.js, Next.js, React Native, Node.js, TypeScript, JavaScript, PHP/Laravel, REST
                APIs, GraphQL, PostgreSQL, MongoDB, AWS, Docker, Git, and modern development tools.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} DebitTracker. All rights reserved.
          </Text>
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
    marginBottom: Spacing.lg,
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
  appHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  appVersion: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
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
    textAlign: 'justify',
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
  developerCard: {
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  developerName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  developerTitle: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  contactInfo: {
    marginBottom: Spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  contactText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  socialLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  socialText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  developerInfo: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  developerSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  developerDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: Spacing.sm,
    textAlign: 'justify',
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
