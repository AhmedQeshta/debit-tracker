import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Cloud, RefreshCw, Wifi, WifiOff, AlertCircle } from 'lucide-react-native';
import { useSyncStatus } from '@/hooks/sync/useSyncStatus';
import { getProgressText } from '@/lib/utils';

export const SyncStatus = () =>
{
  const { isLoggedIn, syncEnabled, setSyncEnabled, isSyncing, syncStatus, handleSync, isOnline, isNetworkWeak, pullProgress, handleRetry, lastError, isTimeoutError, queue, lastSync } = useSyncStatus();
  if (!isLoggedIn) return null;

  return (
    <>
      <View style={styles.container}>
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
                  <View style={styles.statusItem}>
                    {isOnline ? <Wifi size={14} color={Colors.success} /> : <WifiOff size={14} color={Colors.error} />}
                    <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
                  </View>

                  <View style={styles.statusItem}>
                    <Cloud size={14} color={Colors.success} />
                    <Text style={styles.statusText}>Active</Text>
                  </View>
                </View>

                <View style={styles.details}>
                  <Text style={styles.detailText}>Pending: {queue.length}</Text>
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
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textSecondary,
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
