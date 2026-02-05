import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff, Pause } from 'lucide-react-native';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';

/**
 * Small banner showing offline status and sync paused state
 */
export const OfflineBanner = () => {
  return (
    <View style={styles.container}>
      <WifiOff size={14} color={Colors.error} />
      <Text style={styles.text}>Offline mode</Text>
      <View style={styles.separator} />
      <Pause size={14} color={Colors.textSecondary} />
      <Text style={styles.textSecondary}>Sync paused</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.error + '15',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
  },
  textSecondary: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.xs,
  },
});

