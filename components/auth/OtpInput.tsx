import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { OtpInputProps } from '@/types/common';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export const OtpInput = ({
  label,
  value,
  onChangeText,
  error,
  helperText,
  length = 6,
}: OtpInputProps) => {
  const inputRef = React.useRef<TextInput>(null);
  const digits = value.slice(0, length).split('');

  const onCodeChange = (text: string) => {
    const numericOnly = text.replace(/\D/g, '').slice(0, length);
    onChangeText(numericOnly);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.boxesRow} onPress={() => inputRef.current?.focus()}>
        {Array.from({ length }).map((_, index) => {
          const digit = digits[index] ?? '';
          const isActive = index === digits.length && digits.length < length;

          return (
            <View
              key={`otp-${index}`}
              style={[styles.box, isActive ? styles.boxActive : {}, error ? styles.boxError : {}]}>
              <Text style={styles.boxText}>{digit}</Text>
            </View>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={onCodeChange}
        keyboardType="numeric"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!error && helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    color: Colors.text,
    marginBottom: Spacing.sm,
    fontSize: 13,
    fontWeight: '600',
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  box: {
    flex: 1,
    minHeight: 52,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: {
    borderColor: Colors.primary,
  },
  boxError: {
    borderColor: Colors.error,
  },
  boxText: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    marginTop: Spacing.sm,
  },
  helperText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: Spacing.sm,
  },
});
