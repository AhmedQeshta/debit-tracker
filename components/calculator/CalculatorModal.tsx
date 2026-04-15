import { RenderKey } from '@/components/calculator/RenderKey';
import { useCalculatorModal } from '@/hooks/useCalculatorModal';
import { keyRows } from '@/lib/calc';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { CalculatorModalProps } from '@/types/common';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  visible,
  initialValue,
  onClose,
  onConfirm,
}) => {
  const {
    lastResult,
    appendValue,
    handleClear,
    handleBackspace,
    handleEquals,
    handleOk,
    expression,
    error,
    canConfirm,
  } = useCalculatorModal({ visible, initialValue, onClose, onConfirm });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Calculator</Text>

          <View style={styles.displayCard}>
            <Text style={styles.expressionText} numberOfLines={2}>
              {expression || '0'}
            </Text>
            <Text style={styles.resultText} numberOfLines={1}>
              {error ? error : lastResult ? `Last result: ${lastResult}` : ' '}
            </Text>
          </View>

          <View style={styles.keysWrap}>
            {keyRows.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.keyRow}>
                {row.map((keyValue) => (
                  <View
                    key={keyValue}
                    style={[styles.keyCell, row.length === 2 ? styles.wideCell : null]}>
                    {/* {renderKey(keyValue)} */}
                    <RenderKey
                      value={keyValue}
                      handleBackspace={handleBackspace}
                      appendValue={appendValue}
                      handleClear={handleClear}
                      handleEquals={handleEquals}
                    />
                  </View>
                ))}
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.footerButton, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, styles.okButton, !canConfirm && styles.disabledButton]}
              onPress={handleOk}
              disabled={!canConfirm}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Spacing.borderRadius.lg,
    borderTopRightRadius: Spacing.borderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  displayCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
  },
  expressionText: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'right',
    minHeight: 34,
  },
  resultText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'right',
    marginTop: Spacing.xs,
    minHeight: 18,
  },
  keysWrap: {
    marginBottom: Spacing.md,
  },
  keyRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  keyCell: {
    flex: 1,
    marginHorizontal: 4,
  },
  wideCell: {
    flex: 2,
  },
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
