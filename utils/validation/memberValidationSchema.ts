import * as yup from 'yup';
import { i18n } from 'i18next';

let globalI18n: i18n;

export const setMemberValidationI18n = (i18nInstance: i18n) => {
  globalI18n = i18nInstance;
};

export const memberValidationSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .required(() => globalI18n.t('validation.required'))
    .min(2, () => globalI18n.t('validation.minLength', { min: 2 }))
    .max(50, () => globalI18n.t('validation.maxLength', { max: 50 })),
  lastName: yup
    .string()
    .trim()
    .required(() => globalI18n.t('validation.required'))
    .min(2, () => globalI18n.t('validation.minLength', { min: 2 }))
    .max(50, () => globalI18n.t('validation.maxLength', { max: 50 })),
  gender: yup
    .string()
    .oneOf(['Male', 'Female', 'Other', 'Unknown'], () => globalI18n.t('validation.invalidSelection'))
    .required(() => globalI18n.t('validation.required')),
  dateOfBirth: yup
    .date()
    .nullable()
    .optional()
    .max(new Date(new Date().setDate(new Date().getDate() + 1)), () => globalI18n.t('validation.futureDate')),
  dateOfDeath: yup
    .date()
    .nullable()
    .optional()
    .max(new Date(new Date().setDate(new Date().getDate() + 1)), () => globalI18n.t('validation.futureDate'))
    .test(
      'date-of-death-after-birth',
      () => globalI18n.t('validation.dateOfDeathBeforeBirth'),
      function (dateOfDeath) {
        const { dateOfBirth } = this.parent;
        if (dateOfDeath && dateOfBirth) {
          return dateOfDeath >= dateOfBirth;
        }
        return true;
      }
    ),
  placeOfBirth: yup
    .string()
    .trim()
    .transform(value => value === '' ? undefined : value)
    .max(200, () => globalI18n.t('validation.maxLength', { max: 200 }))
    .optional(),
  placeOfDeath: yup
    .string()
    .trim()
    .transform(value => value === '' ? undefined : value)
    .max(200, () => globalI18n.t('validation.maxLength', { max: 200 }))
    .optional(),
  motherId: yup
    .string()
    .uuid(() => globalI18n.t('validation.invalidUuid'))
    .transform(value => value === '' ? undefined : value)
    .optional(),
  fatherId: yup
    .string()
    .uuid(() => globalI18n.t('validation.invalidUuid'))
    .transform(value => value === '' ? undefined : value)
    .optional(),
  avatarUrl: yup
    .string()
    .transform(value => value === '' ? undefined : value)
    .optional(),
  avatarBase64: yup
    .string()
    .optional(),
  isAlive: yup
    .boolean()
    .required(() => globalI18n.t('validation.required')),
  biography: yup
    .string()
    .trim()
    .transform(value => value === '' ? undefined : value)
    .max(1000, () => globalI18n.t('validation.maxLength', { max: 1000 }))
    .optional(),
  occupation: yup
    .string()
    .trim()
    .transform(value => value === '' ? undefined : value)
    .max(100, () => globalI18n.t('validation.maxLength', { max: 100 }))
    .optional(),
  phone: yup
    .string()
    .trim()
    .transform(value => value === '' ? undefined : value)
    .matches(/^\+?[0-9]{10,15}$/, { message: () => globalI18n.t('validation.invalidPhone'), excludeEmptyString: true })
    .optional(),
  email: yup
    .string()
    .trim()
    .transform(value => value === '' ? undefined : value)
    .email(() => globalI18n.t('validation.invalidEmail'))
    .optional(),
  address: yup
    .string()
    .trim()
    .transform(value => value === '' ? undefined : value)
    .max(200, () => globalI18n.t('validation.maxLength', { max: 200 }))
    .optional(),
  husbandId: yup
    .string()
    .uuid(() => globalI18n.t('validation.invalidUuid'))
    .transform(value => value === '' ? undefined : value)
    .optional(),
  wifeId: yup
    .string()
    .uuid(() => globalI18n.t('validation.invalidUuid'))
    .transform(value => value === '' ? undefined : value)
    .optional(),
  nickname: yup
    .string()
    .trim()
    .transform(value => value === '' ? undefined : value)
    .max(100, () => globalI18n.t('validation.maxLength', { max: 100 }))
    .optional(),
  order: yup
    .number()
    .transform(value => (isNaN(value as number) || value === null) ? undefined : value) // Ensure value is treated as number
    .integer(() => globalI18n.t('validation.invalidNumber', { fieldName: globalI18n.t('memberForm.order') }))
    .min(0, () => globalI18n.t('validation.min', { fieldName: globalI18n.t('memberForm.order'), min: 0 }))
    .nullable()
    .optional(),
  isDeceased: yup
    .boolean()
    .optional(),
  isRoot: yup
    .boolean()
    .optional(),
});

export interface MemberFormData {
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other' | 'Unknown';
  dateOfBirth?: Date | null | undefined;
  dateOfDeath?: Date | null | undefined;
  placeOfBirth?: string;
  placeOfDeath?: string;
  motherId?: string;
  fatherId?: string;
  avatarUrl?: string;
  avatarBase64?: string;
  isAlive: boolean; // This should probably be derived from dateOfDeath or removed if isDeceased is explicit
  biography?: string;
  occupation?: string;
  phone?: string;
  email?: string;
  address?: string;
  husbandId?: string;
  wifeId?: string;
  nickname?: string;
  order?: number;
  isDeceased?: boolean;
  isRoot?: boolean;
}
