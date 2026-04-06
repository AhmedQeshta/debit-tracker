import { ExportJsonPayload } from '@/types/export';

const escapeCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';

  const text = String(value);
  const needsEscaping = /[",\n\r]/.test(text);
  const escaped = text.replace(/"/g, '""');

  return needsEscaping ? `"${escaped}"` : escaped;
};

export const toCsv = <T extends Record<string, unknown>>(
  rows: T[],
  columns?: (keyof T | string)[],
): string => {
  if (rows.length === 0) {
    const headerOnly = (columns || []).map((column) => String(column));
    return `${headerOnly.join(',')}\n`;
  }

  const derivedColumns =
    columns && columns.length > 0 ? columns.map((column) => String(column)) : Object.keys(rows[0]);

  const header = derivedColumns.join(',');
  const body = rows
    .map((row) =>
      derivedColumns
        .map((column) => escapeCsvValue((row as Record<string, unknown>)[column]))
        .join(','),
    )
    .join('\n');

  return `${header}\n${body}\n`;
};

export const toJson = (payload: ExportJsonPayload): string => {
  return `${JSON.stringify(payload, null, 2)}\n`;
};
