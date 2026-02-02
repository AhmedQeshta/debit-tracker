import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { AlertCircle, WifiOff } from 'lucide-react-native';
import { useSyncLoading } from '@/hooks/sync/useSyncLoading';
import { getProgressText } from '@/lib/utils';

export const SyncLoadingOverlay = () =>
{

  const { lastError, isOnline, isPulling, hasError, handleRetry, handleContinueOffline, pullProgress } = useSyncLoading();

  if (!isPulling && !hasError) return null;


  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {hasError ? (
            <>
              <AlertCircle size={48} color={Colors.error} style={styles.icon} />
              <Text style={styles.title}>Could not download your data</Text>
              <Text style={styles.message}>
                {lastError?.message || 'Your internet might be slow. Please check your connection and try again.'}
              </Text>

              {!isOnline && (
                <View style={styles.networkWarning}>
                  <WifiOff size={16} color={Colors.error} />
                  <Text style={styles.networkWarningText}>No internet connection</Text>
                </View>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.retryButton} onPress={handleRetry} disabled={!isOnline}>
                  <Text style={[styles.retryButtonText, !isOnline && styles.retryButtonTextDisabled]}>
                    Retry
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.continueButton} onPress={handleContinueOffline}>
                  <Text style={styles.continueButtonText}>Continue Offline</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
              <Text style={styles.title}>Downloading your data...</Text>
              <Text style={styles.progressText}>{getProgressText(pullProgress)}</Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.surface,
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
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  networkWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.error + '15',
    padding: Spacing.xs,
    borderRadius: 4,
    marginBottom: Spacing.md,
  },
  networkWarningText: {
    fontSize: 12,
    color: Colors.error,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    marginTop: Spacing.sm,
  },
  retryButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 1,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  retryButtonTextDisabled: {
    opacity: 0.5,
  },
  continueButton: {
    flex: 1,
    backgroundColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});

