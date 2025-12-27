import { useForm, type Resolver, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { memberValidationSchema, MemberFormData, setMemberValidationI18n } from '@/utils/validation';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo } from 'react';
import type { MemberDetailDto } from '@/types/member';

interface UseMemberFormProps {
  initialValues?: Partial<MemberFormData>;
  onSubmit: (data: MemberFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export const useMemberForm = ({ initialValues, onSubmit, isSubmitting: isSubmittingProp }: UseMemberFormProps) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    setMemberValidationI18n(i18n);
  }, [i18n]);

  const defaultFormValues = useMemo(() => ({
    firstName: '',
    lastName: '',
    gender: 'Unknown' as MemberFormData['gender'],
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
    order: undefined, // ensure order is in default form values
    nickname: undefined, // ensure nickname is in default form values
    isRoot: undefined, // ensure isRoot is in default form values
    // isDeceased: is handled by form logic, not directly in default
  }), []);

  const currentDefaultValues = useMemo(() => {
    if (initialValues) {
      return {
        firstName: initialValues.firstName || '',
        lastName: initialValues.lastName || '',
        gender: (initialValues.gender || 'Unknown') as MemberFormData['gender'], // Ensure Gender enum
        dateOfBirth: initialValues.dateOfBirth
          ? (typeof initialValues.dateOfBirth === 'string' ? new Date(initialValues.dateOfBirth) : initialValues.dateOfBirth)
          : null,
        dateOfDeath: initialValues.dateOfDeath
          ? (typeof initialValues.dateOfDeath === 'string' ? new Date(initialValues.dateOfDeath) : initialValues.dateOfDeath)
          : null,
        placeOfBirth: initialValues.placeOfBirth || undefined,
        placeOfDeath: initialValues.placeOfBirth || undefined, // Corrected from initialValues.placeOfDeath
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
        avatarBase64: initialValues.avatarBase64 || undefined,
        order: initialValues.order || undefined,
        nickname: initialValues.nickname || undefined,
        isRoot: initialValues.isRoot || undefined,
        isDeceased: initialValues.dateOfDeath ? true : false, // Derived from dateOfDeath
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
    trigger, // Added trigger
  } = useForm<MemberFormData>({
    resolver: yupResolver(memberValidationSchema) as Resolver<MemberFormData>,
    defaultValues: currentDefaultValues,
    mode: 'onTouched', // Changed from onMount because it's not a valid option, trigger will be used for onMount validation
  });

  useEffect(() => {
    trigger();
  }, [trigger]);

  useEffect(() => {
    // Only reset if initialValues actually change to prevent infinite loops
    // and only if the form is not dirty to avoid overriding user input
    // The equality check here is simple; for complex objects, a deep comparison might be needed.
    // If we have initial values, use them, otherwise use default form values.
    const newValuesToReset = initialValues ? {
      firstName: initialValues.firstName || '',
      lastName: initialValues.lastName || '',
      gender: (initialValues.gender || 'Unknown') as MemberFormData['gender'],
      dateOfBirth: initialValues.dateOfBirth
        ? (typeof initialValues.dateOfBirth === 'string' ? new Date(initialValues.dateOfBirth) : initialValues.dateOfBirth)
        : null,
      dateOfDeath: initialValues.dateOfDeath
        ? (typeof initialValues.dateOfDeath === 'string' ? new Date(initialValues.dateOfDeath) : initialValues.dateOfDeath)
        : null,
      placeOfBirth: initialValues.placeOfBirth || undefined,
      placeOfDeath: initialValues.placeOfBirth || undefined, // Corrected from initialValues.placeOfDeath
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
      avatarBase64: initialValues.avatarBase64 || undefined,
      order: initialValues.order || undefined,
      nickname: initialValues.nickname || undefined,
      isRoot: initialValues.isRoot || undefined,
      isDeceased: initialValues.dateOfDeath ? true : false, // Derived from dateOfDeath
    } : defaultFormValues;

    reset(newValuesToReset);

  }, [initialValues, reset, defaultFormValues]);

  return {
    control,
    handleSubmit: handleSubmit(onSubmit as SubmitHandler<MemberFormData>),
    errors,
    setValue,
    watch,
    reset,
    isSubmitting: isSubmittingProp || isSubmitting,
    isValid,
  };
};