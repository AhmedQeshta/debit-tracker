import { useSyncStatus } from '@/hooks/sync/useSyncStatus';
import { getProgressText } from '@/lib/utils';
import { selectPendingCount } from '@/selectors/dashboardSelectors';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { AlertCircle, Cloud, RefreshCw, Wifi, WifiOff } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { OfflineBanner } from './OfflineBanner';

export const SyncStatus = () =>
{
  const { isLoggedIn, syncEnabled, setSyncEnabled, isSyncing, syncStatus, handleSync, isOnline, isNetworkWeak, pullProgress, handleRetry, lastError, isTimeoutError, lastSync } = useSyncStatus();
  const pendingCount = selectPendingCount();
  if (!isLoggedIn) return null;

  return (
    <>
      <View style={styles.container}>
        {/* Show offline banner prominently when offline */}
        {!isOnline && (
          <View style={styles.offlineBannerContainer}>
            <OfflineBanner />
          </View>
        )}

        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Cloud Sync</Text>
            <Switch
              value={syncEnabled}
              onValueChange={setSyncEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#fff"
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>

          {syncEnabled && (
            isSyncing || syncStatus === 'pulling' || syncStatus === 'pushing' ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <TouchableOpacity onPress={handleSync} disabled={!isOnline || isNetworkWeak}>
                <RefreshCw size={16} color={isOnline && !isNetworkWeak ? Colors.primary : Colors.textSecondary} />
              </TouchableOpacity>
            )
          )}
        </View>

        {syncEnabled && (
          <>
            {/* Show network warning if weak/slow */}
            {isNetworkWeak && syncStatus !== 'error' && (
              <View style={styles.networkWarning}>
                <WifiOff size={14} color={Colors.error} />
                <Text style={styles.networkWarningText}>
                  Internet is weak. Sync may fail.
                </Text>
              </View>
            )}

            {/* Show pull progress */}
            {syncStatus === 'pulling' && pullProgress && (
              <View style={styles.progressMessage}>
                <Text style={styles.progressText}>{getProgressText(pullProgress)}</Text>
              </View>
            )}

            {/* Show sync status messages if there's an error */}
            {syncStatus === 'needs_config' && (
              <View style={styles.statusMessage}>
                <AlertCircle size={14} color={Colors.error} />
                <Text style={styles.statusMessageText}>
                  JWT template missing. Check setup.
                </Text>
              </View>
            )}

            {syncStatus === 'needs_login' && (
              <View style={styles.statusMessage}>
                <AlertCircle size={14} color={Colors.error} />
                <Text style={styles.statusMessageText}>
                  Authentication expired. Please log in again.
                </Text>
              </View>
            )}

            {syncStatus === 'error' && lastError && (
              <View style={styles.statusMessage}>
                <AlertCircle size={14} color={Colors.error} />
                <View style={styles.errorContent}>
                  <Text style={styles.statusMessageText}>
                    {isTimeoutError
                      ? 'Network timeout. Check your connection and retry.'
                      : lastError.message || 'Sync error occurred. Please try again.'}
                  </Text>
                  <TouchableOpacity style={styles.retryButton} onPress={handleRetry} disabled={!isOnline || isNetworkWeak}>
                    <Text style={[styles.retryButtonText, (!isOnline || isNetworkWeak) && styles.retryButtonTextDisabled]}>
                      Retry
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Show success message */}
            {syncStatus === 'success' && (
              <View style={styles.successMessage}>
                <Cloud size={14} color={Colors.success} />
                <Text style={styles.successText}>Sync complete</Text>
              </View>
            )}

            {/* Only show normal status if no error status */}
            {!syncStatus && (
              <>
                <View style={styles.row}>
                  <View style={[styles.badge, isOnline ? styles.onlineBadge : styles.offlineBadge]}>
                    {isOnline ? <Wifi size={14} stroke="#000" /> : <WifiOff size={14} stroke="#fff" />}
                    <Text style={[styles.badgeText, isOnline ? {} : { color: '#fff' }]}>
                      {isOnline ? 'Online' : 'Offline'}
                    </Text>
                  </View>

                  <View style={[styles.badge, styles.activeBadge]}>
                    <Cloud size={14} stroke="#000" />
                    <Text style={styles.badgeText}>Active</Text>
                  </View>
                </View>

                <View style={styles.details}>
                  <Text style={styles.detailText}>Pending: {pendingCount}</Text>
                  {lastSync && (
                    <Text style={styles.detailText}>
                      Last Sync: {new Date(lastSync).toLocaleTimeString()}
                    </Text>
                  )}
                </View>
              </>
            )}
          </>
        )}
      </View>
    </>

  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  offlineBannerContainer: {
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  onlineBadge: {
    backgroundColor: Colors.secondary,
  },
  offlineBadge: {
    backgroundColor: Colors.error,
  },
  activeBadge: {
    backgroundColor: Colors.secondary,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  details: {
    marginTop: Spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.xs,
    backgroundColor: Colors.error + '15',
    borderRadius: 4,
    marginTop: Spacing.xs,
  },
  statusMessageText: {
    fontSize: 12,
    color: Colors.error,
    flex: 1,
  },
  errorContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  retryButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  retryButtonTextDisabled: {
    opacity: 0.5,
  },
  networkWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.xs,
    backgroundColor: Colors.error + '15',
    borderRadius: 4,
    marginTop: Spacing.xs,
  },
  networkWarningText: {
    fontSize: 12,
    color: Colors.error,
    flex: 1,
  },
  progressMessage: {
    padding: Spacing.xs,
    marginTop: Spacing.xs,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.xs,
    backgroundColor: Colors.success + '15',
    borderRadius: 4,
    marginTop: Spacing.xs,
  },
  successText: {
    fontSize: 12,
    color: Colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
  },
});
