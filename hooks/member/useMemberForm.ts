import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { memberValidationSchema, MemberFormData, setMemberValidationI18n } from '@/utils/validation';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo } from 'react';
import type { MemberDetailDto } from '@/types/member';

interface UseMemberFormProps {
  initialValues?: MemberDetailDto;
  onSubmit: (data: MemberFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export const useMemberForm = ({ initialValues, onSubmit, isSubmitting: isSubmittingProp }: UseMemberFormProps) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    setMemberValidationI18n(i18n);
  }, [i18n]);

  const defaultFormValues: MemberFormData = {
    firstName: '',
    lastName: '',
    gender: 'Unknown',
    isAlive: true,
    dateOfBirth: null,
    dateOfDeath: null,
    placeOfBirth: undefined,
    placeOfDeath: undefined,
    occupation: undefined,
    biography: undefined,
    phone: undefined,
    email: undefined,
    address: undefined,
    fatherId: undefined,
    motherId: undefined,
    husbandId: undefined,
    wifeId: undefined,
    avatarUrl: undefined,
    avatarBase64: undefined,
  };

  const currentDefaultValues = useMemo(() => {
    if (initialValues) {
      return {
        firstName: initialValues.firstName,
        lastName: initialValues.lastName,
        gender: (initialValues.gender || 'Unknown') as MemberFormData['gender'],
        isAlive: !initialValues.dateOfDeath,
        dateOfBirth: initialValues.dateOfBirth ? new Date(initialValues.dateOfBirth) : null,
        dateOfDeath: initialValues.dateOfDeath ? new Date(initialValues.dateOfDeath) : null,
        placeOfBirth: initialValues.placeOfBirth || undefined,
        placeOfDeath: initialValues.placeOfBirth || undefined,
        occupation: initialValues.occupation || undefined,
        biography: initialValues.biography || undefined,
        phone: initialValues.phone || undefined,
        email: initialValues.email || undefined,
        address: initialValues.address || undefined,
        fatherId: initialValues.fatherId || undefined,
        motherId: initialValues.motherId || undefined,
        husbandId: initialValues.husbandId || undefined,
        wifeId: initialValues.wifeId || undefined,
        avatarUrl: initialValues.avatarUrl || undefined,
        avatarBase64: undefined,
      };
    }
    return defaultFormValues;
  }, [initialValues, defaultFormValues]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setValue,
    watch,
    reset,
  } = useForm<MemberFormData>({
    resolver: yupResolver(memberValidationSchema) as Resolver<MemberFormData>,
    defaultValues: currentDefaultValues,
  });

  useEffect(() => {
    // Only reset if initialValues actually change to prevent infinite loops
    // and only if the form is not dirty to avoid overriding user input
    // The equality check here is simple; for complex objects, a deep comparison might be needed.
    if (initialValues) {
      const newMappedValues: MemberFormData = {
        firstName: initialValues.firstName,
        lastName: initialValues.lastName,
        gender: (initialValues.gender || 'Unknown') as MemberFormData['gender'],
        isAlive: !initialValues.dateOfDeath,
        dateOfBirth: initialValues.dateOfBirth ? new Date(initialValues.dateOfBirth) : null,
        dateOfDeath: initialValues.dateOfDeath ? new Date(initialValues.dateOfDeath) : null,
        placeOfBirth: initialValues.placeOfBirth || undefined,
        placeOfDeath: initialValues.placeOfDeath || undefined,
        occupation: initialValues.occupation || undefined,
        biography: initialValues.biography || undefined,
        phone: initialValues.phone || undefined,
        email: initialValues.email || undefined,
        address: initialValues.address || undefined,
        fatherId: initialValues.fatherId || undefined,
        motherId: initialValues.motherId || undefined,
        husbandId: initialValues.husbandId || undefined,
        wifeId: initialValues.wifeId || undefined,
        avatarUrl: initialValues.avatarUrl || undefined,
        avatarBase64: undefined,
      };
      reset(newMappedValues);
    } else {
      reset(defaultFormValues);
    }
  }, [initialValues, reset, defaultFormValues]); // Re-run effect if initialValues or reset function changes

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    setValue,
    watch,
    reset,
    isSubmitting: isSubmittingProp || isSubmitting,
    isValid,
  };
};
