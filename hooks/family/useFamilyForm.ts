import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { familyValidationSchema, FamilyFormData, setValidationI18n } from '@/utils/validation/familyValidationSchema';
import { useEffect, useMemo } from 'react';
import type { FamilyDetailDto } from '@/types/family';

// Define a type that aligns with FamilyFormData (from yup.optional())
type FamilyFormInitialValues = {
  name: string;
  description?: string; // undefined, not null
  address?: string;     // undefined, not null
  avatarUrl?: string;   // undefined, not null
  visibility: 'Public' | 'Private';
};

interface UseFamilyFormProps {
  initialValues?: FamilyDetailDto;
  onSubmit: (data: FamilyFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function useFamilyForm({ initialValues, onSubmit, isSubmitting: isSubmittingProp }: UseFamilyFormProps) {
  const { i18n } = useTranslation();

  useEffect(() => {
    setValidationI18n(i18n);
  }, [i18n]);

  const defaultFormValues: FamilyFormInitialValues = {
    name: '',
    description: undefined, // Use undefined
    address: undefined,     // Use undefined
    avatarUrl: undefined,   // Use undefined
    visibility: 'Private',
  };

  // Convert initialValues from FamilyDetailDto to FamilyFormInitialValues
  const mappedInitialValues: FamilyFormInitialValues | undefined = useMemo(() => {
    if (initialValues) {
      return {
        name: initialValues.name,
        description: initialValues.description || undefined, // Convert null to undefined
        address: initialValues.address || undefined,         // Convert null to undefined
        avatarUrl: initialValues.avatarUrl || undefined,     // Convert null to undefined
        visibility: (initialValues.visibility === 'Public' || initialValues.visibility === 'Private')
          ? initialValues.visibility
          : 'Private',
      };
    }
    return undefined;
  }, [initialValues]);

  const { control, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<FamilyFormData>({
    resolver: yupResolver(familyValidationSchema),
    defaultValues: mappedInitialValues || defaultFormValues,
  });

  useEffect(() => {
    if (mappedInitialValues) {
      reset(mappedInitialValues);
    }
  }, [mappedInitialValues, reset]);

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting: isSubmittingProp || isSubmitting,
    reset,
    setValue,
  };
}
