import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { StatusPillProps } from '@/types/common';
import React, { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const StatusPill: FC<StatusPillProps> = ({ label, tone = 'neutral' }) => {
  return (
    <View
      style={[
        styles.container,
        tone === 'success' && styles.success,
        tone === 'error' && styles.error,
      ]}>
      <Text style={[styles.text, tone === 'error' && styles.errorText]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  success: {
    borderColor: Colors.success,
  },
  error: {
    borderColor: Colors.error,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  errorText: {
    color: Colors.error,
  },
});
