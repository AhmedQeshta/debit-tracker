import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { IInputProps } from '@/types/common';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  error,
  helperText,
  multiline = false,
  autoCapitalize,
  secureTextEntry,
  onBlur,
  maxLength,
}: IInputProps) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isFocused ? styles.inputFocused : {},
          error ? styles.inputError : {},
          multiline ? styles.multilineInput : {},
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        keyboardType={keyboardType}
        multiline={!!multiline}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        onFocus={() => setIsFocused(true)}
        editable={true}
        selectTextOnFocus={false}
        maxLength={maxLength}
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
  input: {
    backgroundColor: Colors.input,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderRadius: Spacing.borderRadius.lg,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 52,
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: Colors.error,
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
