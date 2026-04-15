import { toCsv } from '@/services/export/serializers';
import { CsvBuildInput, ExportFilePayload } from '@/types/export';

export const buildCsvExportFiles = ({
  scope,
  friends,
  budgets,
  friendTransactions,
  budgetItems,
}: CsvBuildInput): ExportFilePayload[] => {
  const files: ExportFilePayload[] = [];

  if (scope.friends) {
    files.push({
      name: 'friends.csv',
      content: toCsv(friends),
      mimeType: 'text/csv',
    });
  }

  if (scope.budgets) {
    files.push({
      name: 'budgets.csv',
      content: toCsv(budgets),
      mimeType: 'text/csv',
    });
  }

  if (scope.includeFriendTransactions && friendTransactions.length > 0) {
    files.push({
      name: 'friend_transactions.csv',
      content: toCsv(friendTransactions),
      mimeType: 'text/csv',
    });
  }

  if (scope.includeBudgetItems && budgetItems.length > 0) {
    files.push({
      name: 'budget_items.csv',
      content: toCsv(budgetItems),
      mimeType: 'text/csv',
    });
  }

  return files;
};
