import { ExportDetailLevel, ExportFormat, ExportSource } from '@/types/export';

export const formatOptions: { value: ExportFormat; label: string }[] = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
];

export const detailOptions: { value: ExportDetailLevel; label: string; subtitle: string }[] = [
  {
    value: 'summary',
    label: 'Summary only',
    subtitle: 'Top-level friend and budget fields',
  },
  {
    value: 'detailed',
    label: 'Include items/transactions',
    subtitle: 'Adds friend transactions and budget items',
  },
];

export const sourceOptions: { value: ExportSource; label: string; subtitle: string }[] = [
  {
    value: 'local',
    label: 'Local cache',
    subtitle: 'Fast and offline-friendly',
  },
  {
    value: 'supabase',
    label: 'Fresh from Supabase',
    subtitle: 'Falls back to local cache on failure',
  },
];
