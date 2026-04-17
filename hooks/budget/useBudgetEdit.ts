import { useSyncMutation } from '@/hooks/sync/useSyncMutation';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import { safeId } from '@/lib/utils';
import { useBudgetStore } from '@/store/budgetStore';
import { useSyncStore } from '@/store/syncStore';
import { IBudgetFormData } from '@/types/budget';
import { useAuth } from '@clerk/clerk-expo';
import NetInfo from '@react-native-community/netinfo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const useBudgetEdit = () => {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const budgetId = safeId(id);
  const router = useRouter();
  const { budgets, setBudgets } = useBudgetStore();
  const { mutate } = useSyncMutation();
  const { userId } = useAuth();
  const { toastSuccess, toastError, toastInfo } = useToast();
  const [loading, setLoading] = useState(false);

  const budget = budgets.find((b) => b.id === budgetId);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<IBudgetFormData>({
    defaultValues: {
      title: '',
      currency: '$',
      totalBudget: '',
    },
  });

  useEffect(() => {
    if (budget) {
      reset({
        title: budget.title,
        currency: budget.currency || '$',
        totalBudget: budget.totalBudget.toString(),
      });
    }
  }, [budget, reset]);

  const title = watch('title');
  const currency = watch('currency');
  const totalBudget = watch('totalBudget');

  const parsedTotalBudget = Number.parseFloat(totalBudget || '');
  const isValidTotalBudget = Number.isFinite(parsedTotalBudget) && parsedTotalBudget >= 0;

  const unchangedFields =
    budget &&
    title.trim() === budget.title &&
    currency === budget.currency &&
    isValidTotalBudget &&
    parsedTotalBudget === budget.totalBudget;

  const canSave = Boolean(budget && !loading && isValidTotalBudget && !unchangedFields);

  const applyLocalBudgetPatch = (patch: {
    title?: string;
    currency?: string;
    totalBudget?: number;
    totalSpent?: number;
    totalIncome?: number;
    netSpent?: number;
    remaining?: number;
    isOverspent?: boolean;
    synced?: boolean;
    updatedAt?: number;
  }) => {
    setBudgets(
      useBudgetStore.getState().budgets.map((item) =>
        item.id === budgetId
          ? {
              ...item,
              ...patch,
              synced: patch.synced ?? item.synced,
              updatedAt: patch.updatedAt ?? Date.now(),
            }
          : item,
      ),
    );
  };

  // Updates budget total in a reliable online/offline flow and keeps derived totals consistent.
  const updateBudgetTotalBudget = async (
    id: string,
    newTotalBudget: number,
  ): Promise<'synced' | 'pending'> => {
    if (!Number.isFinite(newTotalBudget) || newTotalBudget < 0) {
      throw new Error(t('budgetHooks.edit.errors.invalidTotal'));
    }

    const currentBudget = useBudgetStore.getState().budgets.find((item) => item.id === id);
    if (!currentBudget) {
      throw new Error(t('budgetHooks.edit.errors.notFound'));
    }

    const metrics = useBudgetStore.getState().getBudgetMetrics(id);
    const optimisticNetSpent = metrics.totalSpent - metrics.totalIncome;
    const optimisticRemaining = newTotalBudget - optimisticNetSpent;
    const optimisticOverspent = optimisticNetSpent > newTotalBudget;

    applyLocalBudgetPatch({
      title: title.trim(),
      currency,
      totalBudget: newTotalBudget,
      totalSpent: metrics.totalSpent,
      totalIncome: metrics.totalIncome,
      netSpent: optimisticNetSpent,
      remaining: optimisticRemaining,
      isOverspent: optimisticOverspent,
      synced: false,
      updatedAt: Date.now(),
    });

    const { cloudUserId } = useSyncStore.getState();
    const netState = await NetInfo.fetch();
    const isOnline = Boolean(netState.isConnected);

    if (!cloudUserId || !userId || !isOnline) {
      await mutate(
        'budget',
        'update',
        {
          id,
          budgetId: id,
          title: title.trim(),
          currency,
          total_budget: newTotalBudget,
          updatedAt: Date.now(),
        },
        { operation: 'BUDGET_UPDATE_TOTAL', entityId: id },
      );
      return 'pending';
    }

    const updatedAtIso = new Date().toISOString();
    const { data: updatedBudget, error: updateError } = await supabase
      .from('budgets')
      .update({
        title: title.trim(),
        currency,
        total_budget: newTotalBudget,
        updated_at: updatedAtIso,
      })
      .eq('id', id)
      .eq('owner_id', cloudUserId)
      .eq('user_id', userId)
      .select(
        'id, title, currency, total_budget, total_spent, total_income, net_spent, remaining, is_overspent, pinned, created_at, updated_at',
      )
      .single();

    if (updateError || !updatedBudget) {
      throw new Error(updateError?.message || 'Failed to update budget');
    }

    const { error: rpcError } = await supabase.rpc('recompute_budget_totals', {
      p_budget_id: id,
      p_user_id: userId,
    });
    if (rpcError) {
      throw new Error(rpcError.message || 'Failed to recompute budget totals');
    }

    const { data: refreshedBudget, error: refreshError } = await supabase
      .from('budgets')
      .select(
        'id, title, currency, total_budget, total_spent, total_income, net_spent, remaining, is_overspent, pinned, created_at, updated_at',
      )
      .eq('id', id)
      .eq('owner_id', cloudUserId)
      .eq('user_id', userId)
      .single();

    if (refreshError || !refreshedBudget) {
      throw new Error(refreshError?.message || 'Failed to refresh updated budget');
    }

    applyLocalBudgetPatch({
      title: refreshedBudget.title,
      currency: refreshedBudget.currency || '$',
      totalBudget: Number(refreshedBudget.total_budget) || 0,
      totalSpent: Number(refreshedBudget.total_spent) || 0,
      totalIncome: Number(refreshedBudget.total_income) || 0,
      netSpent: Number(refreshedBudget.net_spent) || 0,
      remaining: Number(refreshedBudget.remaining) || 0,
      isOverspent: Boolean(refreshedBudget.is_overspent),
      synced: true,
      updatedAt: refreshedBudget.updated_at
        ? new Date(refreshedBudget.updated_at).getTime()
        : Date.now(),
    });

    return 'synced';
  };

  const onSubmit = async (data: IBudgetFormData) => {
    if (!budget) return;

    setLoading(true);
    try {
      const amount = Number.parseFloat(data.totalBudget);
      const status = await updateBudgetTotalBudget(budgetId, amount);
      if (status === 'pending') {
        toastInfo(t('budgetHooks.edit.pendingSyncInfo'));
      } else {
        toastSuccess(t('budgetHooks.edit.success'));
      }

      router.back();
    } catch (error) {
      console.error('[Budget] Failed to update budget total:', error);
      toastError(t('budgetHooks.edit.errors.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  return {
    control,
    errors,
    handleSubmit: handleSubmit(onSubmit),
    title,
    currency,
    totalBudget,
    setCurrency: (val: string) => setValue('currency', val),
    budget,
    loading,
    canSave,
    hasPendingSync: budget ? budget.synced !== true : false,
    router,
  };
};
