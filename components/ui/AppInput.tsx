import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/theme/spacing';
import { IInputProps } from '@/types/common';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export const AppInput = ({
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
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrap,
          isFocused ? styles.inputFocused : null,
          error ? styles.inputError : null,
          multiline ? styles.multilineInput : null,
        ]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, multiline ? styles.multilineInputInner : null]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
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
          editable
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

const createStyles = (colors: {
  text: string;
  inputText: string;
  textMuted: string;
  inputBg: string;
  placeholder: string;
  border: string;
  accent: string;
  danger: string;
}) =>
  StyleSheet.create({
    container: {
      marginBottom: Spacing.lg,
    },
    label: {
      color: colors.text,
      marginBottom: Spacing.sm,
      fontSize: 13,
      fontWeight: '600',
    },
    inputWrap: {
      backgroundColor: colors.inputBg,
      borderRadius: Spacing.borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
    },
    input: {
      color: colors.inputText,
      paddingHorizontal: Spacing.md,
      paddingVertical: 14,
      fontSize: 16,
      flex: 1,
    },
    inputFocused: {
      borderColor: colors.accent,
    },
    multilineInput: {
      minHeight: 100,
      alignItems: 'flex-start',
    },
    multilineInputInner: {
      textAlignVertical: 'top',
    },
    inputError: {
      borderColor: colors.danger,
    },
    rightAccessory: {
      paddingRight: Spacing.sm,
      paddingLeft: Spacing.xs,
    },
    errorText: {
      color: colors.danger,
      fontSize: 13,
      marginTop: Spacing.sm,
    },
    helperText: {
      color: colors.textMuted,
      fontSize: 13,
      marginTop: Spacing.sm,
    },
  });
