import { useToast } from '@/hooks/useToast';
import { exportData } from '@/services/export/exportService';
import { useSyncStore } from '@/store/syncStore';
import { ExportDetailLevel, ExportFormat, ExportScope, ExportSource } from '@/types/export';
import { useAuth } from '@clerk/clerk-expo';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';

export const useExportData = () => {
  const { getToken } = useAuth();
  const { toastSuccess, toastError, toastInfo } = useToast();
  const { cloudUserId } = useSyncStore();
  const params = useLocalSearchParams<{ friendId?: string }>();

  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [detailLevel, setDetailLevel] = useState<ExportDetailLevel>('summary');
  const [source, setSource] = useState<ExportSource>('local');
  const [friendsSelected, setFriendsSelected] = useState(true);
  const [budgetsSelected, setBudgetsSelected] = useState(true);

  const scopedFriendId = typeof params.friendId === 'string' ? params.friendId : undefined;

  const summaryText = useMemo(() => {
    if (friendsSelected && budgetsSelected) return 'Friends + Budgets';
    if (friendsSelected) return 'Friends only';
    if (budgetsSelected) return 'Budgets only';
    return 'No dataset selected';
  }, [friendsSelected, budgetsSelected]);

  const handleExport = async () => {
    if (!friendsSelected && !budgetsSelected) {
      toastError('Please select at least one dataset.');
      return;
    }

    const scope: ExportScope = {
      friends: friendsSelected,
      budgets: budgetsSelected,
      includeBudgetItems: detailLevel === 'detailed' && budgetsSelected,
      includeFriendTransactions: detailLevel === 'detailed' && friendsSelected,
      friendId: friendsSelected ? scopedFriendId : undefined,
    };

    try {
      setIsExporting(true);
      toastInfo('Preparing export...');

      const result = await exportData({
        format,
        detailLevel,
        scope,
        source,
        cloudUserId,
        getToken,
      });

      result.warnings.forEach((warning) => toastInfo(warning));

      const fileCountText = result.files.length === 1 ? '1 file' : `${result.files.length} files`;
      toastSuccess(`Export complete: ${fileCountText} ready to share.`);
    } catch (error: any) {
      const message = error?.message || 'Unknown error';
      console.error('[ExportScreen] Export failed:', error);
      toastError(`Export failed: ${message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    format,
    setFormat,
    detailLevel,
    setDetailLevel,
    source,
    setSource,
    friendsSelected,
    setFriendsSelected,
    budgetsSelected,
    setBudgetsSelected,
    summaryText,
    scopedFriendId,
    handleExport,
    isExporting,
  };
};
