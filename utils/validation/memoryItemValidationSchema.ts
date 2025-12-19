// gia-pha-viet-app/utils/validation/memoryItemValidationSchema.ts

import * as yup from 'yup';
import { i18n } from 'i18next';
import { EmotionalTag, MemoryMediaDto, MemoryPersonDto } from '@/types';

// Assume this is passed from the component via a context or prop
// We need the i18n instance to get translated messages
let globalI18n: i18n;

export const setMemoryItemValidationI18n = (i18nInstance: i18n) => {
  globalI18n = i18nInstance;
};

export const memoryItemValidationSchema: yup.ObjectSchema<MemoryItemFormData> = yup.object({
  familyId: yup
    .string()
    .required(() => globalI18n.t('validation.required', { fieldName: globalI18n.t('memory.familyId') })),
  title: yup
    .string()
    .trim()
    .required(() => globalI18n.t('validation.required', { fieldName: globalI18n.t('memory.title') }))
    .min(3, () => globalI18n.t('validation.minLength', { min: 3 }))
    .max(200, () => globalI18n.t('validation.maxLength', { max: 200 })),
  description: yup
    .string()
    .trim()
    .transform(value => value === '' ? undefined : value)
    .max(1000, () => globalI18n.t('validation.maxLength', { max: 1000 }))
    .optional(),
  happenedAt: yup
    .string() // Expecting ISO 8601 string
    .required(() => globalI18n.t('validation.required', { fieldName: globalI18n.t('memory.happenedAt') }))
    .test('is-date', () => globalI18n.t('validation.invalidDate'), (value) => {
      return value ? !isNaN(new Date(value).getTime()) : true;
    }),
  emotionalTag: yup
    .number()
    .required(() => globalI18n.t('validation.required', { fieldName: globalI18n.t('memory.emotionalTag') }))
    .oneOf(Object.values(EmotionalTag).filter(v => typeof v === 'number'), () => globalI18n.t('validation.invalidSelection'))
    .typeError(() => globalI18n.t('validation.invalidSelection')),
  memoryMedia: yup
    .array(yup.object({
      id: yup.string().optional(),
      url: yup.string().optional() // Removed .url() validator
    }))
    .optional()
    .default([]),
  memoryPersons: yup
    .array(yup.object({
      memberId: yup.string().required(() => globalI18n.t('validation.required', { fieldName: globalI18n.t('memory.memberId') })),
      memberName: yup.string().optional() // Changed from required to optional
    }))
    .optional()
    .default([]),
});

export type MemoryItemFormData = {
  familyId: string;
  title: string;
  description?: string;
  happenedAt: string;
  emotionalTag: EmotionalTag;
  memoryMedia?: MemoryMediaDto[];
  memoryPersons?: MemoryPersonDto[];
};
