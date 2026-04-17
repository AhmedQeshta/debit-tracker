import i18n from '@/i18n';
import { ExportDetailLevel, ExportFormat, ExportSource } from '@/types/export';

export const formatOptions: { value: ExportFormat; label: string }[] = [
  { value: 'csv', label: i18n.t('settingsExport.formatOptions.csv') },
  { value: 'json', label: i18n.t('settingsExport.formatOptions.json') },
];

export const detailOptions: { value: ExportDetailLevel; label: string; subtitle: string }[] = [
  {
    value: 'summary',
    label: i18n.t('settingsExport.detailOptions.summary.label'),
    subtitle: i18n.t('settingsExport.detailOptions.summary.subtitle'),
  },
  {
    value: 'detailed',
    label: i18n.t('settingsExport.detailOptions.detailed.label'),
    subtitle: i18n.t('settingsExport.detailOptions.detailed.subtitle'),
  },
];

export const sourceOptions: { value: ExportSource; label: string; subtitle: string }[] = [
  {
    value: 'local',
    label: i18n.t('settingsExport.sourceOptions.local.label'),
    subtitle: i18n.t('settingsExport.sourceOptions.local.subtitle'),
  },
  {
    value: 'supabase',
    label: i18n.t('settingsExport.sourceOptions.supabase.label'),
    subtitle: i18n.t('settingsExport.sourceOptions.supabase.subtitle'),
  },
];
