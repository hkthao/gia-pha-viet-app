// gia-pha-viet-app/hooks/memory/useMemoryItemForm.ts

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { memoryItemValidationSchema, MemoryItemFormData, setMemoryItemValidationI18n } from '@/utils/validation/memoryItemValidationSchema';
import { MemoryItemDto } from '@/types';

interface UseMemoryItemFormProps {
  initialValues?: MemoryItemDto;
  onSubmit: (data: MemoryItemFormData) => Promise<void>;
  familyId: string;
}

export const useMemoryItemForm = ({ initialValues, onSubmit, familyId }: UseMemoryItemFormProps) => {
  const { i18n } = useTranslation();

  // Set the i18n instance for validation messages
  useEffect(() => {
    setMemoryItemValidationI18n(i18n);
  }, [i18n]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setValue,
    watch,
    reset,
    trigger, // Add trigger to the destructuring
  } = useForm<MemoryItemFormData>({
    resolver: yupResolver(memoryItemValidationSchema),
    defaultValues: {
      familyId: initialValues?.familyId || familyId,
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      happenedAt: initialValues?.happenedAt || new Date().toISOString(),
      emotionalTag: initialValues?.emotionalTag || 0, // Default to Neutral
      memoryMedia: initialValues?.memoryMedia || [],
      memoryPersons: initialValues?.memoryPersons || [],
    },
    mode: 'onTouched', // Changed from 'onBlur'
  });

  // Effect to trigger validation on mount
  useEffect(() => {
    // Only trigger validation on mount if not in edit mode (or if initialValues are not provided)
    // This prevents showing errors for existing data in edit mode
    if (!initialValues) {
      trigger();
    }
  }, [trigger, initialValues]);

  // Effect to update form values if initialValues change (e.g., when editing an existing item)
  useEffect(() => {
    if (initialValues) {
      reset({
        familyId: initialValues.familyId,
        title: initialValues.title,
        description: initialValues.description,
        happenedAt: initialValues.happenedAt,
        emotionalTag: initialValues.emotionalTag,
        memoryMedia: initialValues.memoryMedia,
        memoryPersons: initialValues.memoryPersons,
      });
      // Trigger validation after resetting the form for edit mode
      // This will ensure any existing validation errors are re-evaluated
      trigger();
    }
  }, [initialValues, reset, trigger]);

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
    isValid,
    setValue,
    watch,
    reset,
  };
};
