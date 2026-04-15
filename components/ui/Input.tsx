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
  onFocus,
  maxLength,
  rightAccessory,
  inputRef,
}: IInputProps) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrap,
          isFocused ? styles.inputFocused : {},
          error ? styles.inputError : {},
          multiline ? styles.multilineInput : {},
        ]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, multiline ? styles.multilineInputInner : {}]}
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
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          editable={true}
          selectTextOnFocus={false}
          maxLength={maxLength}
        />
        {rightAccessory ? <View style={styles.rightAccessory}>{rightAccessory}</View> : null}
      </View>
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
  inputWrap: {
    backgroundColor: Colors.input,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    flex: 1,
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  multilineInput: {
    minHeight: 100,
    alignItems: 'flex-start',
  },
  multilineInputInner: {
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: Colors.error,
  },
  rightAccessory: {
    paddingRight: Spacing.sm,
    paddingLeft: Spacing.xs,
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
