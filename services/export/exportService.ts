import { calculateBudgetMetrics, getBalance, getBalanceBreakdown } from '@/lib/utils';
import { GetTokenFunction } from '@/services/authSync';
import { syncService } from '@/services/syncService';
import { useBudgetStore } from '@/store/budgetStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import {
  BudgetExportRow,
  BudgetItemExportRow,
  ExportAndSaveOptions,
  ExportDataBundle,
  ExportDetailLevel,
  ExportFileDescriptor,
  ExportOptions,
  ExportResult,
  ExportScope,
  ExportSource,
  FriendExportRow,
  FriendTransactionExportRow,
} from '@/types/export';
import { Budget } from '@/types/models';
import { buildCsvExportFiles } from './formatters/csv';
import { buildJsonExportFile } from './formatters/json';
import { persistExportFiles, shareExportFiles } from './saveToDevice';

const toIsoOrEmpty = (timestamp?: number): string => {
  if (!timestamp || !Number.isFinite(timestamp) || timestamp <= 0) return '';
  return new Date(timestamp).toISOString();
};

const getSyncStatus = (synced?: boolean): 'pending' | 'synced' => {
  return synced ? 'synced' : 'pending';
};

const sanitizeScope = (scope: ExportScope): ExportScope => {
  const safeScope = {
    ...scope,
    friends: !!scope.friends,
    budgets: !!scope.budgets,
    includeBudgetItems: !!scope.includeBudgetItems,
    includeFriendTransactions: !!scope.includeFriendTransactions,
  };

  if (!safeScope.friends && !safeScope.budgets) {
    throw new Error('Please select at least one dataset to export.');
  }

  return safeScope;
};

const loadLocalDataBundle = (scope: ExportScope): ExportDataBundle => {
  const friends = useFriendsStore.getState().friends.filter((friend) => !friend.deletedAt);
  const transactions = useTransactionsStore
    .getState()
    .transactions.filter((transaction) => !transaction.deletedAt);
  const budgets = useBudgetStore.getState().budgets.filter((budget) => !budget.deletedAt);

  const filteredFriends = scope.friendId
    ? friends.filter((friend) => friend.id === scope.friendId)
    : friends;
  const filteredTransactions = scope.friendId
    ? transactions.filter((transaction) => transaction.friendId === scope.friendId)
    : transactions;

  const friendIdSet = new Set(filteredFriends.map((friend) => friend.id));
  let filteredBudgets =
    scope.friendId && scope.budgets
      ? budgets.filter((budget) => !budget.friendId || friendIdSet.has(budget.friendId))
      : budgets;

  if (scope.budgetId) {
    filteredBudgets = filteredBudgets.filter((budget) => budget.id === scope.budgetId);
  }

  return {
    friends: filteredFriends,
    transactions: filteredTransactions,
    budgets: filteredBudgets,
    warnings: [],
    usedSource: 'local',
  };
};

const loadSupabaseDataBundle = async (
  scope: ExportScope,
  cloudUserId: string,
  getToken: GetTokenFunction,
): Promise<ExportDataBundle> => {
  const result = await syncService.pullAllDataForUser(cloudUserId, getToken);

  const friends = (result.friends || []).filter((friend) => !friend.deletedAt);
  const transactions = (result.transactions || []).filter((transaction) => !transaction.deletedAt);
  const budgets = (result.budgets || []).filter((budget) => !budget.deletedAt);

  const filteredFriends = scope.friendId
    ? friends.filter((friend) => friend.id === scope.friendId)
    : friends;
  const filteredTransactions = scope.friendId
    ? transactions.filter((transaction) => transaction.friendId === scope.friendId)
    : transactions;

  const friendIdSet = new Set(filteredFriends.map((friend) => friend.id));
  let filteredBudgets =
    scope.friendId && scope.budgets
      ? budgets.filter((budget) => !budget.friendId || friendIdSet.has(budget.friendId))
      : budgets;

  if (scope.budgetId) {
    filteredBudgets = filteredBudgets.filter((budget) => budget.id === scope.budgetId);
  }

  return {
    friends: filteredFriends,
    transactions: filteredTransactions,
    budgets: filteredBudgets,
    warnings: [],
    usedSource: 'supabase',
  };
};

const loadDataBundle = async (
  source: ExportSource,
  scope: ExportScope,
  cloudUserId?: string | null,
  getToken?: GetTokenFunction,
): Promise<ExportDataBundle> => {
  if (source !== 'supabase') {
    return loadLocalDataBundle(scope);
  }

  if (!cloudUserId || !getToken) {
    const fallback = loadLocalDataBundle(scope);
    return {
      ...fallback,
      warnings: [
        'Supabase export requested, but auth/session details are missing. Exported local data instead.',
      ],
    };
  }

  try {
    return await loadSupabaseDataBundle(scope, cloudUserId, getToken);
  } catch (error: any) {
    console.error('[ExportService] Supabase export failed, falling back to local data:', error);
    const fallback = loadLocalDataBundle(scope);
    return {
      ...fallback,
      warnings: [
        `Unable to fetch fresh cloud data (${error?.message || 'unknown error'}). Exported local data instead.`,
      ],
      usedSource: 'local',
    };
  }
};

export const fetchFriendsForExport = (
  data: ExportDataBundle,
  scope: ExportScope,
): {
  friends: FriendExportRow[];
  friendTransactions: FriendTransactionExportRow[];
} => {
  if (!scope.friends) {
    return { friends: [], friendTransactions: [] };
  }

  const friendRows: FriendExportRow[] = data.friends.map((friend) => {
    const friendTransactions = data.transactions.filter(
      (transaction) => transaction.friendId === friend.id,
    );
    const breakdown = getBalanceBreakdown(friendTransactions);
    const netBalance = getBalance(friend.id, data.transactions);

    const lastTransactionDate = friendTransactions.reduce((latest, transaction) => {
      if (!transaction.date) return latest;
      return Math.max(latest, transaction.date);
    }, 0);

    const pendingSyncCount =
      friendTransactions.filter((transaction) => !transaction.synced).length +
      (friend.synced ? 0 : 1);

    return {
      friendId: friend.id || '',
      name: friend.name || '',
      createdAt: toIsoOrEmpty(friend.createdAt),
      updatedAt: toIsoOrEmpty(friend.updatedAt || friend.createdAt),
      netBalance: Number(netBalance || 0),
      youOwe: Number(breakdown.youOwe || 0),
      owedToYou: Number(breakdown.owedToYou || 0),
      lastTransactionDate: toIsoOrEmpty(lastTransactionDate),
      pendingSyncCount,
    };
  });

  const budgetNameMap = new Map<string, string>();
  data.budgets.forEach((budget) => {
    budgetNameMap.set(budget.id, budget.title || '');
  });

  const friendNameMap = new Map<string, string>();
  data.friends.forEach((friend) => {
    friendNameMap.set(friend.id, friend.name || '');
  });

  const friendTransactions: FriendTransactionExportRow[] = data.transactions
    .filter((transaction) => {
      if (scope.friendId) return transaction.friendId === scope.friendId;
      return true;
    })
    .map((transaction) => {
      const type = transaction.amount >= 0 ? 'income' : 'expense';
      return {
        transactionId: transaction.id || '',
        friendId: transaction.friendId || '',
        friendName: friendNameMap.get(transaction.friendId) || '',
        title: transaction.title || '',
        signedAmount: Number(transaction.amount || 0),
        amount: Math.abs(Number(transaction.amount || 0)),
        type,
        date: toIsoOrEmpty(transaction.date || transaction.createdAt),
        source: 'transaction',
        budgetId: transaction.budgetId || '',
        budgetName: (transaction.budgetId && budgetNameMap.get(transaction.budgetId)) || '',
        syncStatus: getSyncStatus(transaction.synced),
      };
    });

  return {
    friends: friendRows,
    friendTransactions,
  };
};

const flattenActiveBudgetItems = (
  budgets: Budget[],
): { budget: Budget; item: Budget['items'][number] }[] => {
  const flattened: { budget: Budget; item: Budget['items'][number] }[] = [];

  budgets.forEach((budget) => {
    (budget.items || []).forEach((item) => {
      if (!item.deletedAt) {
        flattened.push({ budget, item });
      }
    });
  });

  return flattened;
};

export const fetchBudgetsForExport = (
  data: ExportDataBundle,
  includeItems: boolean,
): {
  budgets: BudgetExportRow[];
  budgetItems: BudgetItemExportRow[];
} => {
  const budgets: BudgetExportRow[] = data.budgets.map((budget) => {
    const activeItems = (budget.items || []).filter((item) => !item.deletedAt);
    const metrics = calculateBudgetMetrics(activeItems, Number(budget.totalBudget || 0));

    return {
      budgetId: budget.id || '',
      name: budget.title || '',
      currency: budget.currency || '$',
      period: 'custom',
      startDate: '',
      endDate: '',
      limit: Number(budget.totalBudget || 0),
      totalSpent: Number(metrics.totalSpent || 0),
      totalIncome: Number(metrics.totalIncome || 0),
      remaining: Number(metrics.remaining || 0),
      progressPercent: Number((metrics.progressRatio * 100).toFixed(2)),
      itemsCount: activeItems.length,
      lastUpdatedAt: toIsoOrEmpty(budget.updatedAt || budget.createdAt),
    };
  });

  if (!includeItems) {
    return {
      budgets,
      budgetItems: [],
    };
  }

  const budgetItems: BudgetItemExportRow[] = flattenActiveBudgetItems(data.budgets).map(
    ({ item, budget }) => {
      const type = item.type === 'income' ? 'income' : 'expense';
      const signedAmount =
        type === 'income'
          ? Math.abs(Number(item.amount || 0))
          : -Math.abs(Number(item.amount || 0));

      return {
        itemId: item.id || '',
        budgetId: item.budgetId || budget.id || '',
        title: item.title || '',
        signedAmount,
        amount: Math.abs(Number(item.amount || 0)),
        type,
        date: toIsoOrEmpty(item.createdAt),
        source: item.transactionId ? 'transaction' : 'manual',
        transactionId: item.transactionId || '',
        syncStatus: getSyncStatus(item.synced),
      };
    },
  );

  return {
    budgets,
    budgetItems,
  };
};

const buildExportFiles = (
  format: 'csv' | 'json',
  source: ExportSource,
  detailLevel: ExportDetailLevel,
  scope: ExportScope,
  friends: FriendExportRow[],
  budgets: BudgetExportRow[],
  friendTransactions: FriendTransactionExportRow[],
  budgetItems: BudgetItemExportRow[],
  fileNamePrefix?: string,
) => {
  if (format === 'csv') {
    return buildCsvExportFiles({
      scope,
      friends,
      budgets,
      friendTransactions,
      budgetItems,
    });
  }

  return buildJsonExportFile({
    source,
    detailLevel,
    friends,
    budgets,
    friendTransactions,
    budgetItems,
    fileNamePrefix,
  });
};

export const exportAndSaveToDevice = async (
  options: ExportAndSaveOptions,
): Promise<ExportResult> => {
  const detailLevel = options.detailLevel || 'summary';
  const scope = sanitizeScope(options.scope);

  const includeDetailed = detailLevel === 'detailed';
  const resolvedScope: ExportScope = {
    ...scope,
    includeBudgetItems: scope.budgets && includeDetailed && !!scope.includeBudgetItems,
    includeFriendTransactions:
      scope.friends && includeDetailed && !!scope.includeFriendTransactions,
  };

  const dataBundle = await loadDataBundle(
    options.source,
    resolvedScope,
    options.cloudUserId,
    options.getToken,
  );

  const { friends, friendTransactions } = fetchFriendsForExport(dataBundle, resolvedScope);
  const { budgets, budgetItems } = fetchBudgetsForExport(
    dataBundle,
    !!resolvedScope.includeBudgetItems,
  );

  const preparedFiles = buildExportFiles(
    options.format,
    dataBundle.usedSource,
    detailLevel,
    resolvedScope,
    friends,
    budgets,
    resolvedScope.includeFriendTransactions ? friendTransactions : [],
    resolvedScope.includeBudgetItems ? budgetItems : [],
    options.fileNamePrefix,
  );

  if (preparedFiles.length === 0) {
    throw new Error('No exportable data was found for your selection.');
  }

  const persistResult = await persistExportFiles(preparedFiles, {
    deliveryMode: options.deliveryMode || 'save',
  });

  return {
    files: persistResult.files,
    warnings: [...dataBundle.warnings, ...persistResult.warnings],
    usedSource: dataBundle.usedSource,
    deliveryMode: persistResult.deliveryMode,
  };
};

export const exportData = async (options: ExportOptions): Promise<ExportResult> => {
  return exportAndSaveToDevice({
    ...options,
    detailLevel: options.detailLevel,
    deliveryMode: options.deliveryMode,
    fileNamePrefix: options.fileNamePrefix,
  });
};

export const shareSavedExportFiles = async (files: ExportFileDescriptor[]): Promise<void> => {
  await shareExportFiles(files);
};
