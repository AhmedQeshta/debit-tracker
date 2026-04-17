import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { PasswordInputProps } from '@/types/common';
import { AlertCircle, Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export const PasswordInput = ({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  error,
  helperText,
  returnKeyType = 'next',
  autoComplete = 'password',
  textContentType = 'password',
  onSubmitEditing,
  blurOnSubmit,
  inputRef,
}: PasswordInputProps) => {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [isHidden, setIsHidden] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputWrap,
          isFocused ? styles.inputWrapFocused : null,
          error ? styles.inputWrapError : null,
        ]}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          onFocus={() => setIsFocused(true)}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry={isHidden}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          returnKeyType={returnKeyType}
          autoComplete={autoComplete}
          textContentType={textContentType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
        />

        <TouchableOpacity
          onPress={() => setIsHidden((prev) => !prev)}
          style={styles.iconButton}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={
            isHidden
              ? t('passwordInput.accessibility.showPassword')
              : t('passwordInput.accessibility.hidePassword')
          }>
          {isHidden ? (
            <Eye size={18} color={Colors.textSecondary} />
          ) : (
            <EyeOff size={18} color={Colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.messageRow}>
          <AlertCircle size={14} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    color: Colors.text,
    marginBottom: Spacing.sm,
    fontSize: 13,
    fontWeight: '600',
  },
  inputWrap: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.lg,
    backgroundColor: Colors.input,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.md,
  },
  inputWrapFocused: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.24,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  inputWrapError: {
    borderColor: Colors.error,
    shadowColor: 'transparent',
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    paddingVertical: 14,
    paddingRight: Spacing.sm,
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  messageRow: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
  },
  helperText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: Spacing.sm,
  },
});
