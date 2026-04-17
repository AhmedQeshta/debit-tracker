import Header from '@/components/ui/Header';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useToast } from '@/hooks/useToast';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Github, Globe, Linkedin, Mail, MapPin, Phone } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function About() {
  const { t } = useTranslation();
  const { toastError } = useToast();
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const appName = Constants.expoConfig?.name || 'DebitTracker';

  const handleEmailPress = () => {
    Linking.openURL('mailto:ahmed.qeshta.dev@gmail.com');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+970592157001');
  };

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(() => {
      toastError(t('about.errors.openLinkFailed'));
    });
  };
  const router = useRouter();
  return (
    <View style={styles.wrapper}>
      <ScreenContainer>
        <Header
          openDrawer={() => router.push('/(drawer)/(tabs)/settings')}
          title={t('about.title')}
          isGoBack
        />

        {/* App Logo, Name and Version */}
        <View style={styles.appHeader}>
          <Image source={require('@/assets/icon.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>{appName}</Text>
          <Text style={styles.appVersion}>{t('about.version', { version: appVersion })}</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.sections.description.title')}</Text>
          <Text style={styles.description}>{t('about.sections.description.body')}</Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.sections.features.title')}</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>
              • {t('about.sections.features.items.offlineFirst')}
            </Text>
            <Text style={styles.featureItem}>• {t('about.sections.features.items.darkMode')}</Text>
            <Text style={styles.featureItem}>
              • {t('about.sections.features.items.friendManagement')}
            </Text>
            <Text style={styles.featureItem}>
              • {t('about.sections.features.items.transactionTracking')}
            </Text>
            <Text style={styles.featureItem}>
              • {t('about.sections.features.items.budgetManagement')}
            </Text>
            <Text style={styles.featureItem}>• {t('about.sections.features.items.dashboard')}</Text>
            <Text style={styles.featureItem}>
              • {t('about.sections.features.items.stateManagement')}
            </Text>
          </View>
        </View>

        {/* Developer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.sections.developer.title')}</Text>

          <View style={styles.developerCard}>
            <Text style={styles.developerName}>Ahmed Qeshta</Text>
            <Text style={styles.developerTitle}>{t('about.sections.developer.role')}</Text>

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
                <Text style={styles.socialText}>
                  {t('about.sections.developer.social.linkedin')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleLinkPress('https://github.com/ahmed-qeshta')}
                activeOpacity={0.7}>
                <Github size={16} color={Colors.primary} />
                <Text style={styles.socialText}>{t('about.sections.developer.social.github')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleLinkPress('https://ahmed.qeshta.dev')}
                activeOpacity={0.7}>
                <Globe size={16} color={Colors.primary} />
                <Text style={styles.socialText}>
                  {t('about.sections.developer.social.website')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.developerInfo}>
              <Text style={styles.developerSubtitle}>
                {t('about.sections.developer.summaryTitle')}
              </Text>
              <Text style={styles.developerDescription}>
                {t('about.sections.developer.summaryBody')}
              </Text>

              <Text style={styles.developerSubtitle}>
                {t('about.sections.developer.educationTitle')}
              </Text>
              <Text style={styles.developerDescription}>
                {t('about.sections.developer.educationBody')}
              </Text>

              <Text style={styles.developerSubtitle}>
                {t('about.sections.developer.skillsTitle')}
              </Text>
              <Text style={styles.developerDescription}>
                {t('about.sections.developer.skillsBody')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('about.footer', { year: new Date().getFullYear() })}
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
