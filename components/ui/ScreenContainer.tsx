import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import { IScreenContainerProps } from '@/types/common';


export const ScreenContainer = ({ children, scrollable = true }: IScreenContainerProps) =>
{
  const { colors, activeTheme } = useTheme();
  const styles = createStyles(colors.background);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <ExpoStatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
      {scrollable ? (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.container, { padding: Spacing.md }]}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const createStyles = (backgroundColor: string) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor,
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: Spacing.md,
      paddingBottom: Spacing.xl,
    },
  });
