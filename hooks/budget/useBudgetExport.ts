import { useToast } from '@/hooks/useToast';
import { exportAndSaveToDevice, shareSavedExportFiles } from '@/services/export/exportService';
import { useSyncStore } from '@/store/syncStore';
import { BudgetExportScopeMode, ExportFormat, OpenBudgetExportModalOptions } from '@/types/export';
import { useAuth } from '@clerk/clerk-expo';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

export const useBudgetExport = () => {
  const { t } = useTranslation();
  const { getToken } = useAuth();
  const { cloudUserId } = useSyncStore();
  const { toastError, toastInfo, toastSuccess } = useToast();

  const [visible, setVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [includeBudgetItems, setIncludeBudgetItems] = useState(true);
  const [scopeMode, setScopeMode] = useState<BudgetExportScopeMode>('all');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | undefined>(undefined);

  const canUseSelectedScope = !!selectedBudgetId;

  const openBudgetExportModal = useCallback((options?: OpenBudgetExportModalOptions) => {
    setSelectedBudgetId(options?.budgetId);
    setScopeMode(options?.budgetId ? 'selected' : 'all');
    setVisible(true);
  }, []);

  const closeBudgetExportModal = useCallback(() => {
    if (!isExporting) {
      setVisible(false);
    }
  }, [isExporting]);

  const handleExport = useCallback(
    async (deliveryMode: 'save' | 'share') => {
      try {
        setIsExporting(true);
        toastInfo(t('budgetHooks.export.preparing'));

        const result = await exportAndSaveToDevice({
          format,
          detailLevel: includeBudgetItems ? 'detailed' : 'summary',
          source: 'local',
          cloudUserId,
          getToken,
          deliveryMode,
          fileNamePrefix: 'export',
          scope: {
            friends: false,
            budgets: true,
            includeBudgetItems,
            budgetId: scopeMode === 'selected' ? selectedBudgetId : undefined,
          },
        });

        result.warnings.forEach((warning) => toastInfo(warning));

        const fileCountText = t('budgetHooks.export.fileCount', { count: result.files.length });

        if (deliveryMode === 'save') {
          const savedPath = result.files[0]?.uri || 'unknown path';
          toastSuccess(t('budgetHooks.export.saved'));
          Alert.alert(
            t('budgetHooks.export.saved'),
            t('budgetHooks.export.savedDetails', { fileCountText, savedPath }),
            [
              {
                text: t('budgetHooks.export.shareFiles'),
                onPress: () => {
                  shareSavedExportFiles(result.files).catch((error) => {
                    console.error('[BudgetExport] Share after save failed:', error);
                    toastError(
                      t('budgetHooks.export.shareFailed', {
                        message: error?.message || t('budgetHooks.export.unableToShareFiles'),
                      }),
                    );
                  });
                },
              },
              {
                text: t('common.actions.ok'),
                style: 'cancel',
              },
            ],
          );
        } else {
          toastSuccess(t('budgetHooks.export.completeShared', { fileCountText }));
        }

        setVisible(false);
      } catch (error: any) {
        console.error('[BudgetExport] Export failed:', error);
        toastError(
          t('budgetHooks.export.failed', {
            message: error?.message || t('budgetHooks.export.unknownError'),
          }),
        );
      } finally {
        setIsExporting(false);
      }
    },
    [
      cloudUserId,
      format,
      getToken,
      includeBudgetItems,
      scopeMode,
      selectedBudgetId,
      toastError,
      toastInfo,
      toastSuccess,
      t,
    ],
  );

  return {
    visible,
    isExporting,
    format,
    setFormat,
    includeBudgetItems,
    setIncludeBudgetItems,
    scopeMode,
    setScopeMode,
    canUseSelectedScope,
    openBudgetExportModal,
    closeBudgetExportModal,
    exportBySaving: () => handleExport('save'),
    exportBySharing: () => handleExport('share'),
    selectedBudgetId,
    scopeSubtitle: useMemo(
      () =>
        scopeMode === 'selected'
          ? t('budgetHooks.export.scopeSelectedOnly')
          : t('budgetHooks.export.scopeAllBudgets'),
      [scopeMode, t],
    ),
  };
};
