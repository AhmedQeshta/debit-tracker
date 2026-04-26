import { AppInput } from '@/components/ui/AppInput';
import { IInputProps } from '@/types/common';
import React from 'react';

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
}: IInputProps) => (
  <AppInput
    label={label}
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    keyboardType={keyboardType}
    error={error}
    helperText={helperText}
    multiline={multiline}
    autoCapitalize={autoCapitalize}
    secureTextEntry={secureTextEntry}
    onBlur={onBlur}
    onFocus={onFocus}
    maxLength={maxLength}
    rightAccessory={rightAccessory}
    inputRef={inputRef}
  />
);
