// gia-pha-viet-app/hooks/memory/useEditMemoryItem.ts

import { useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { useMemoryItem } from './useMemoryItem';
import { useUpdateMemoryItem } from './useUpdateMemoryItem';
import { MemoryItemFormData } from '@/utils/validation/memoryItemValidationSchema';

export const useEditMemoryItem = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const memoryItemId = Array.isArray(id) ? id[0] : id;

  const { data: initialMemoryItemData, isLoading, error } = useMemoryItem(memoryItemId as string);
  const { mutateAsync: updateMemoryItem, isPending: isUpdating } = useUpdateMemoryItem();

  const handleUpdateMemoryItem = useCallback(async (data: MemoryItemFormData) => {
    if (!memoryItemId) {
      Alert.alert(t('common.error'), t('memory.errors.invalidId'));
      return;
    }
    try {
      await updateMemoryItem({ id: memoryItemId, updatedItem: { ...data, id: memoryItemId } });
      router.back();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('common.error_occurred'));
    }
  }, [memoryItemId, updateMemoryItem, router, t]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return {
    initialMemoryItemData,
    isLoadingInitialData: isLoading,
    fetchError: error?.message,
    isUpdating,
    handleUpdateMemoryItem,
    handleCancel,
  };
};
