import { useToast } from '@/hooks/useToast';
import { exportAndSaveToDevice, shareSavedExportFiles } from '@/services/export/exportService';
import { useSyncStore } from '@/store/syncStore';
import { BudgetExportScopeMode, ExportFormat, OpenBudgetExportModalOptions } from '@/types/export';
import { useAuth } from '@clerk/clerk-expo';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

export const useBudgetExport = () => {
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
        toastInfo('Preparing budget export...');

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

        const fileCountText = result.files.length === 1 ? '1 file' : `${result.files.length} files`;

        if (deliveryMode === 'save') {
          const savedPath = result.files[0]?.uri || 'unknown path';
          toastSuccess('Export saved');
          Alert.alert('Export saved', `Saved ${fileCountText}\n${savedPath}`, [
            {
              text: 'Share file(s)',
              onPress: () => {
                shareSavedExportFiles(result.files).catch((error) => {
                  console.error('[BudgetExport] Share after save failed:', error);
                  toastError(`Couldn't export. ${error?.message || 'Unable to share files.'}`);
                });
              },
            },
            {
              text: 'OK',
              style: 'cancel',
            },
          ]);
        } else {
          toastSuccess(`Export complete: ${fileCountText} shared.`);
        }

        setVisible(false);
      } catch (error: any) {
        console.error('[BudgetExport] Export failed:', error);
        toastError(`Couldn't export. ${error?.message || 'Unknown error'}`);
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
      () => (scopeMode === 'selected' ? 'Selected budget only' : 'All budgets'),
      [scopeMode],
    ),
  };
};
