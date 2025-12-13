import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { familyValidationSchema, FamilyFormData, setFamilyValidationI18n } from '@/utils/validation';
import { useEffect, useMemo } from 'react';
import { FamilyDetailDto } from '@/types'; // Import FamilyUserDto

// Define a type that aligns with FamilyFormData (from yup.optional())
type FamilyFormInitialValues = {
  name: string;
  description?: string;
  address?: string;
  avatarUrl?: string;
  visibility: 'Public' | 'Private';
  managerIds: string[];
  viewerIds: string[];
  code?: string;
};

interface UseFamilyFormProps {
  initialValues?: FamilyDetailDto;
  onSubmit: (data: FamilyFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function useFamilyForm({ initialValues, onSubmit, isSubmitting: isSubmittingProp }: UseFamilyFormProps) {
  const { i18n } = useTranslation();

  useEffect(() => {
    setFamilyValidationI18n(i18n);
  }, [i18n]);

  const defaultFormValues: FamilyFormInitialValues = {
    name: '',
    description: undefined,
    address: undefined,
    avatarUrl: undefined,
    visibility: 'Private',
    managerIds: [], // Initialize as empty array
    viewerIds: [],  // Initialize as empty array
    code: undefined, // Default to undefined
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
        managerIds: initialValues.managerIds,
        viewerIds: initialValues.viewerIds,
      };
    }
    return undefined;
  }, [initialValues]);

  const { control, handleSubmit, formState: { errors, isSubmitting, isValid }, reset, setValue, watch, trigger } = useForm<FamilyFormData>({
    resolver: yupResolver(familyValidationSchema),
    defaultValues: mappedInitialValues || defaultFormValues,
    mode: 'onTouched', // Changed from onMount because it's not a valid option, trigger will be used for onMount validation
  });

  // Effect to trigger validation on mount
  useEffect(() => {
    trigger();
  }, [trigger]);

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
    watch,
    isValid,
    trigger, // Add trigger to the returned object
  };
}
