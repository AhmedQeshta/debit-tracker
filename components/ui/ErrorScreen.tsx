import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { ScreenContainer } from './ScreenContainer';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';

interface ErrorScreenProps
{
  title?: string;
  message?: string;
}

export const ErrorScreen = ({
  title = 'Configuration Error',
  message = 'Missing required configuration. Please check your environment variables.'
}: ErrorScreenProps) =>
{
  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <AlertCircle size={64} color={Colors.error} strokeWidth={1.5} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.error,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
});

