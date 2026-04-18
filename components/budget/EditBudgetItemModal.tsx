import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { BudgetItemType } from '@/types/models';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type EditBudgetItemModalProps = {
  visible: boolean;
  title: string;
  amount: string;
  type: BudgetItemType;
  saving: boolean;
  errorText: string;
  isLinkedToTransaction: boolean;
  canSave: boolean;
  onClose: () => void;
  onTitleChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onTypeChange: (value: BudgetItemType) => void;
  onSave: () => void;
};

export const EditBudgetItemModal: React.FC<EditBudgetItemModalProps> = ({
  visible,
  title,
  amount,
  type,
  saving,
  errorText,
  isLinkedToTransaction,
  canSave,
  onClose,
  onTitleChange,
  onAmountChange,
  onTypeChange,
  onSave,
}) => {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{t('budgetDetail.editItem.title')}</Text>

          {isLinkedToTransaction ? (
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>{t('budgetDetail.editItem.linkedBlocked')}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>{t('budgetDetail.editItem.fields.title')}</Text>
          <TextInput
            value={title}
            onChangeText={onTitleChange}
            style={styles.input}
            editable={!saving && !isLinkedToTransaction}
            placeholder={t('budgetDetail.editItem.placeholders.title')}
            placeholderTextColor={Colors.textSecondary}
          />

          <Text style={styles.label}>{t('budgetDetail.editItem.fields.amount')}</Text>
          <TextInput
            value={amount}
            onChangeText={onAmountChange}
            style={styles.input}
            editable={!saving && !isLinkedToTransaction}
            keyboardType="decimal-pad"
            placeholder={t('budgetDetail.editItem.placeholders.amount')}
            placeholderTextColor={Colors.textSecondary}
          />

          <Text style={styles.label}>{t('budgetDetail.editItem.fields.type')}</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'expense' ? styles.typeButtonActive : null]}
              disabled={saving || isLinkedToTransaction}
              onPress={() => onTypeChange('expense')}>
              <Text style={[styles.typeText, type === 'expense' ? styles.typeTextActive : null]}>
                {t('budgetDetail.quickAdd.expenseType')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === 'income' ? styles.typeButtonActive : null]}
              disabled={saving || isLinkedToTransaction}
              onPress={() => onTypeChange('income')}>
              <Text style={[styles.typeText, type === 'income' ? styles.typeTextActive : null]}>
                {t('budgetDetail.quickAdd.incomeType')}
              </Text>
            </TouchableOpacity>
          </View>

          {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.footerButton, styles.cancelButton]}
              disabled={saving}
              onPress={onClose}>
              <Text style={styles.cancelText}>{t('common.actions.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.footerButton,
                styles.saveButton,
                (!canSave || saving || isLinkedToTransaction) && styles.disabledButton,
              ]}
              disabled={!canSave || saving || isLinkedToTransaction}
              onPress={onSave}>
              <Text style={styles.saveText}>
                {saving ? t('common.states.loading') : t('common.actions.save')}
              </Text>
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
  noticeBox: {
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: Colors.error + '20',
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  noticeText: {
    color: Colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    minHeight: 44,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.input,
    color: Colors.text,
    paddingHorizontal: Spacing.sm,
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  typeButton: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
  },
  typeText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  typeTextActive: {
    color: Colors.background,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  footer: {
    marginTop: Spacing.sm,
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
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  saveText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
