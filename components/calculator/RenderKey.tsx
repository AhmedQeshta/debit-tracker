import { isOperator } from '@/lib/calc';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Delete } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export const RenderKey = ({
  value,
  handleBackspace,
  appendValue,
  handleClear,
  handleEquals,
}: any) => {
  if (value === 'C') {
    return (
      <TouchableOpacity key={value} style={[styles.key, styles.specialKey]} onPress={handleClear}>
        <Text style={styles.specialKeyText}>C</Text>
      </TouchableOpacity>
    );
  }

  if (value === '⌫') {
    return (
      <TouchableOpacity
        key={value}
        style={[styles.key, styles.specialKey]}
        onPress={handleBackspace}>
        <Delete size={18} color={Colors.text} />
      </TouchableOpacity>
    );
  }

  if (value === '=') {
    return (
      <TouchableOpacity key={value} style={[styles.key, styles.equalsKey]} onPress={handleEquals}>
        <Text style={styles.equalsKeyText}>=</Text>
      </TouchableOpacity>
    );
  }

  const isOp = isOperator(value);

  return (
    <TouchableOpacity
      key={value}
      style={[styles.key, isOp ? styles.operatorKey : styles.numberKey]}
      onPress={() => appendValue(value)}>
      <Text style={[styles.keyText, isOp ? styles.operatorKeyText : null]}>
        {value === '*' ? '×' : value === '/' ? '÷' : value}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  key: {
    height: 52,
    borderRadius: Spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  numberKey: {
    backgroundColor: Colors.input,
  },
  operatorKey: {
    backgroundColor: Colors.surface,
  },
  specialKey: {
    backgroundColor: Colors.surface,
  },
  equalsKey: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  keyText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  operatorKeyText: {
    color: Colors.primary,
  },
  specialKeyText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  equalsKeyText: {
    color: '#000',
    fontSize: 20,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  footerButton: {
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.md,
  },
  cancelButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  okButton: {
    backgroundColor: Colors.primary,
  },
  okButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.4,
  },
});
