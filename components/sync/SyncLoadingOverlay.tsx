import { useSyncLoading } from '@/hooks/sync/useSyncLoading';
import { getProgressText } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import { AlertCircle, WifiOff } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const SyncLoadingOverlay = () => {
  const { t } = useTranslation();
  const { colors, activeTheme } = useTheme();
  const styles = createStyles(colors, activeTheme);

  const {
    lastError,
    isOnline,
    isPulling,
    hasError,
    handleRetry,
    handleContinueOffline,
    pullProgress,
  } = useSyncLoading();

  if (!isPulling && !hasError) return null;

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {hasError ? (
            <>
              <AlertCircle size={48} color={colors.error} style={styles.icon} />
              <Text style={styles.title}>{t('sync.loading.errorTitle')}</Text>
              <Text style={styles.message}>
                {lastError?.message || t('sync.loading.errorFallbackMessage')}
              </Text>

              {!isOnline && (
                <View style={styles.networkWarning}>
                  <WifiOff size={16} color={colors.error} />
                  <Text style={styles.networkWarningText}>{t('sync.loading.noInternet')}</Text>
                </View>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleRetry}
                  disabled={!isOnline}>
                  <Text
                    style={[styles.retryButtonText, !isOnline && styles.retryButtonTextDisabled]}>
                    {t('sync.actions.retry')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.continueButton} onPress={handleContinueOffline}>
                  <Text style={styles.continueButtonText}>{t('sync.actions.continueOffline')}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
              <Text style={styles.title}>{t('sync.loading.downloadingData')}</Text>
              <Text style={styles.progressText}>{getProgressText(pullProgress)}</Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (
  colors: {
    error: string;
    primary: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  },
  activeTheme: 'light' | 'dark',
) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: activeTheme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(18, 18, 18, 0.35)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: Spacing.lg,
      minWidth: 280,
      maxWidth: '80%',
      alignItems: 'center',
    },
    loader: {
      marginBottom: Spacing.md,
    },
    icon: {
      marginBottom: Spacing.md,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },
    message: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.md,
      lineHeight: 20,
    },
    progressText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.xs,
    },
    networkWarning: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      backgroundColor: activeTheme === 'dark' ? 'rgba(207, 102, 121, 0.2)' : 'rgba(176, 0, 32, 0.1)',
      padding: Spacing.xs,
      borderRadius: 4,
      marginBottom: Spacing.md,
    },
    networkWarningText: {
      fontSize: 12,
      color: colors.error,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
      width: '100%',
      marginTop: Spacing.sm,
    },
    retryButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: 8,
      alignItems: 'center',
      opacity: 1,
    },
    retryButtonText: {
      color: colors.surface,
      fontSize: 14,
      fontWeight: '600',
    },
    retryButtonTextDisabled: {
      opacity: 0.5,
    },
    continueButton: {
      flex: 1,
      backgroundColor: colors.border,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: 8,
      alignItems: 'center',
    },
    continueButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
  });
