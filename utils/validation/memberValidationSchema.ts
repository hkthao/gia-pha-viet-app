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
    .required(() => globalI18n.t('memberForm.validation.firstNameRequired'))
    .min(2, () => globalI18n.t('memberForm.validation.firstNameMinLength', { min: 2 }))
    .max(50, () => globalI18n.t('memberForm.validation.firstNameMaxLength', { max: 50 })),
  lastName: yup
    .string()
    .trim()
    .required(() => globalI18n.t('memberForm.validation.lastNameRequired'))
    .min(2, () => globalI18n.t('memberForm.validation.lastNameMinLength', { min: 2 }))
    .max(50, () => globalI18n.t('memberForm.validation.lastNameMaxLength', { max: 50 })),
  gender: yup
    .string()
    .oneOf(['Male', 'Female', 'Other', 'Unknown'], () => globalI18n.t('memberForm.validation.genderInvalid'))
    .required(() => globalI18n.t('memberForm.validation.genderRequired')),
  dateOfBirth: yup
    .date()
    .nullable()
    .optional()
    .max(new Date(new Date().setDate(new Date().getDate() + 1)), () => globalI18n.t('memberForm.validation.dateOfBirthFuture')),
  dateOfDeath: yup
    .date()
    .nullable()
    .optional()
    .max(new Date(new Date().setDate(new Date().getDate() + 1)), () => globalI18n.t('memberForm.validation.dateOfDeathFuture'))
    .test(
      'date-of-death-after-birth',
      () => globalI18n.t('memberForm.validation.dateOfDeathBeforeBirth'),
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
    .max(200, () => globalI18n.t('memberForm.validation.placeOfBirthMaxLength', { max: 200 }))
    .optional(),
  placeOfDeath: yup
    .string()
    .trim()
    .transform(value => value === '' ? undefined : value)
    .max(200, () => globalI18n.t('memberForm.validation.placeOfDeathMaxLength', { max: 200 }))
    .optional(),
  motherId: yup
    .string()
    .uuid(() => globalI18n.t('memberForm.validation.motherIdInvalid'))
    .transform(value => value === '' ? undefined : value)
    .optional(),
  fatherId: yup
    .string()
    .uuid(() => globalI18n.t('memberForm.validation.fatherIdInvalid'))
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
    .required(() => globalI18n.t('memberForm.validation.isAliveRequired')),
  biography: yup
    .string()
    .trim()
    .transform(value => value === '' ? undefined : value)
    .max(1000, () => globalI18n.t('memberForm.validation.biographyMaxLength', { max: 1000 }))
    .optional(),
  occupation: yup
    .string()
    .trim()
    .transform(value => value === '' ? undefined : value)
    .max(100, () => globalI18n.t('memberForm.validation.occupationMaxLength', { max: 100 }))
    .optional(),
  phone: yup
    .string()
    .trim()
    .transform(value => value === '' ? undefined : value)
    .matches(/^\+?[0-9]{10,15}$/, { message: () => globalI18n.t('memberForm.validation.phoneInvalid'), excludeEmptyString: true })
    .optional(),
  email: yup
    .string()
    .trim()
    .transform(value => value === '' ? undefined : value)
    .email(() => globalI18n.t('memberForm.validation.emailInvalid'))
    .optional(),
  address: yup
    .string()
    .trim()
    .transform(value => value === '' ? undefined : value)
    .max(200, () => globalI18n.t('memberForm.validation.addressMaxLength', { max: 200 }))
    .optional(),
  husbandId: yup
    .string()
    .uuid(() => globalI18n.t('memberForm.validation.husbandIdInvalid'))
    .transform(value => value === '' ? undefined : value)
    .optional(),
  wifeId: yup
    .string()
    .uuid(() => globalI18n.t('memberForm.validation.wifeIdInvalid'))
    .transform(value => value === '' ? undefined : value)
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
  isAlive: boolean;
  biography?: string;
  occupation?: string;
  phone?: string;
  email?: string;
  address?: string;
  husbandId?: string;
  wifeId?: string;
}
