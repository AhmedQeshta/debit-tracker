import { Button } from '@/components/ui/Button';
import SelectChip from '@/components/ui/SelectChip';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { BudgetExportModalProps } from '@/types/export';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export const BudgetExportModal = ({
  visible,
  format,
  onChangeFormat,
  includeBudgetItems,
  onChangeIncludeBudgetItems,
  scopeMode,
  onChangeScopeMode,
  canUseSelectedScope,
  loading,
  onClose,
  onSaveToDevice,
  onShare,
}: BudgetExportModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{t('budgetExportModal.title')}</Text>
          <Text style={styles.subtitle}>{t('budgetExportModal.subtitle')}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('budgetExportModal.sections.scope')}</Text>
            <View style={styles.row}>
              <SelectChip
                label={t('budgetExportModal.scope.all')}
                active={scopeMode === 'all'}
                onPress={() => onChangeScopeMode('all')}
              />
              <SelectChip
                label={t('budgetExportModal.scope.selected')}
                active={scopeMode === 'selected'}
                onPress={() => {
                  if (canUseSelectedScope) {
                    onChangeScopeMode('selected');
                  }
                }}
              />
            </View>
            {!canUseSelectedScope ? (
              <Text style={styles.hintText}>{t('budgetExportModal.scope.selectedHint')}</Text>
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('budgetExportModal.sections.format')}</Text>
            <View style={styles.row}>
              <SelectChip
                label={t('budgetExportModal.format.csv')}
                active={format === 'csv'}
                onPress={() => onChangeFormat('csv')}
              />
              <SelectChip
                label={t('budgetExportModal.format.json')}
                active={format === 'json'}
                onPress={() => onChangeFormat('json')}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('budgetExportModal.sections.includeItems')}</Text>
            <View style={styles.row}>
              <SelectChip
                label={t('common.words.yes')}
                active={includeBudgetItems}
                onPress={() => onChangeIncludeBudgetItems(true)}
              />
              <SelectChip
                label={t('common.words.no')}
                active={!includeBudgetItems}
                onPress={() => onChangeIncludeBudgetItems(false)}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title={
                loading
                  ? t('budgetExportModal.actions.exporting')
                  : t('budgetExportModal.actions.saveToDevice')
              }
              onPress={onSaveToDevice}
              loading={loading}
              disabled={loading}
            />
            <Button
              title={t('budgetExportModal.actions.share')}
              onPress={onShare}
              variant="outline"
              disabled={loading}
            />
            <Button
              title={t('common.actions.cancel')}
              onPress={onClose}
              variant="outline"
              disabled={loading}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  section: {
    gap: Spacing.xs,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  hintText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actions: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
});
