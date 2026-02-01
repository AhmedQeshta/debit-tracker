import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import { useSyncStore } from '@/store/syncStore';
import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Cloud, RefreshCw, Wifi, WifiOff } from 'lucide-react-native';

export const SyncStatus = () =>
{
  const { queue, lastSync, isSyncing, syncEnabled, setSyncEnabled } = useSyncStore();
  const { isOnline, isLoggedIn, syncNow } = useCloudSync();

  if (!isLoggedIn) return null;

  const handleSync = () =>
  {
    syncNow();
  };

  return (
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
          isSyncing ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <TouchableOpacity onPress={handleSync} disabled={!isOnline}>
              <RefreshCw size={16} color={isOnline ? Colors.primary : Colors.textSecondary} />
            </TouchableOpacity>
          )
        )}
      </View>

      {syncEnabled && (
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
});
