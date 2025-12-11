import * as yup from 'yup';
import { i18n } from 'i18next'; // Import i18n instance

// Assume this is passed from the component via a context or prop
// We need the i18n instance to get translated messages
let globalI18n: i18n;

export const setValidationI18n = (i18nInstance: i18n) => {
  globalI18n = i18nInstance;
};

export const familyValidationSchema: yup.ObjectSchema<FamilyFormData> = yup.object({
  name: yup
    .string()
    .trim()
    .required(() => globalI18n.t('familyForm.validation.nameRequired'))
    .min(3, () => globalI18n.t('familyForm.validation.nameMinLength', { min: 3 }))
    .max(100, () => globalI18n.t('familyForm.validation.nameMaxLength', { max: 100 })),
  description: yup
    .string()
    .trim()
    .transform(value => value === '' ? undefined : value)
    .max(500, () => globalI18n.t('familyForm.validation.descriptionMaxLength', { max: 500 }))
    .optional(),
  address: yup
    .string()
    .trim()
    .transform(value => value === '' ? undefined : value)
    .max(200, () => globalI18n.t('familyForm.validation.addressMaxLength', { max: 200 }))
    .optional(),
  avatarUrl: yup
    .string()
    .url(() => globalI18n.t('familyForm.validation.avatarUrlInvalid'))
    .transform(value => value === '' ? undefined : value)
    .optional(),
  visibility: yup
    .string()
    .oneOf(['Public', 'Private'], () => globalI18n.t('familyForm.validation.visibilityInvalid'))
    .required(() => globalI18n.t('familyForm.validation.visibilityRequired')) as yup.Schema<'Public' | 'Private'>,
});

export type FamilyFormData = {
  name: string;
  description?: string; // Optional means string | undefined
  address?: string;     // Optional means string | undefined
  avatarUrl?: string;   // Optional means string | undefined
  visibility: 'Public' | 'Private';
};
