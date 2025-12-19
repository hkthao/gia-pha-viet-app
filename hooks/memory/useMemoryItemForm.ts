// gia-pha-viet-app/hooks/memory/useMemoryItemForm.ts

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { memoryItemValidationSchema, MemoryItemFormData, setMemoryItemValidationI18n } from '@/utils/validation/memoryItemValidationSchema';
import { MemoryItemDto, MemoryMediaDto } from '@/types';

interface UseMemoryItemFormProps {
  initialValues?: MemoryItemDto;
  onSubmit: (data: MemoryItemFormData) => Promise<void>;
  familyId: string;
  selectedImages: MemoryMediaDto[]; // Changed to MemoryMediaDto[]
}

export const useMemoryItemForm = ({ initialValues, onSubmit, familyId, selectedImages }: UseMemoryItemFormProps) => {
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
    trigger,
  } = useForm<MemoryItemFormData>({
    resolver: yupResolver(memoryItemValidationSchema),
    defaultValues: {
      familyId: initialValues?.familyId || familyId,
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      happenedAt: initialValues?.happenedAt || new Date().toISOString(),
      emotionalTag: initialValues?.emotionalTag || 0,
      memoryMedia: initialValues?.memoryMedia || [],
      memoryPersons: initialValues?.memoryPersons || [],
    },
    mode: 'onTouched',
  });

  // Effect to update memoryMedia field in react-hook-form when selectedImages changes
  useEffect(() => {
    setValue('memoryMedia', selectedImages, { shouldDirty: true, shouldValidate: true });
  }, [selectedImages, setValue]);

  // Effect to trigger validation on mount
  useEffect(() => {
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
