import { toJson } from '@/services/export/serializers';
import { ExportFilePayload, ExportJsonPayload, JsonBuildInput } from '@/types/export';

const buildJsonPayload = ({
  source,
  detailLevel,
  friends,
  budgets,
  friendTransactions,
  budgetItems,
}: Omit<JsonBuildInput, 'fileNamePrefix'>): ExportJsonPayload => {
  const payload: ExportJsonPayload = {
    exportedAt: new Date().toISOString(),
    source,
    friends,
    budgets,
  };

  if (detailLevel === 'detailed' && friendTransactions.length > 0) {
    payload.friendTransactions = friendTransactions;
  }

  if (detailLevel === 'detailed' && budgetItems.length > 0) {
    payload.budgetItems = budgetItems;
  }

  return payload;
};

export const buildJsonExportFile = ({
  source,
  detailLevel,
  friends,
  budgets,
  friendTransactions,
  budgetItems,
  fileNamePrefix,
}: JsonBuildInput): ExportFilePayload[] => {
  const payload = buildJsonPayload({
    source,
    detailLevel,
    friends,
    budgets,
    friendTransactions,
    budgetItems,
  });

  const normalizedPrefix = fileNamePrefix?.trim() || 'export';

  return [
    {
      name: `${normalizedPrefix}.json`,
      content: toJson(payload),
      mimeType: 'application/json',
    },
  ];
};
