import * as yup from 'yup';
import { EventType } from '@/types'; // Assuming EventType is defined in '@/types'

export interface EventFormData {
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  type: EventType;
  repeatAnnually: boolean;
  isLunarDate: boolean;
  lunarDay?: number;
  lunarMonth?: number;
  isLeapMonth?: boolean;
}

export const eventValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required('validation.required')
    .min(3, 'validation.minLength'),
  description: yup.string().optional(),
  startDate: yup
    .date()
    .required('validation.required')
    .typeError('validation.invalidDate'),
  endDate: yup
    .date()
    .optional()
    .nullable()
    .test(
      'endDate-after-startDate',
      'validation.endDateBeforeStartDate',
      function (endDate) {
        const { startDate } = this.parent;
        return endDate && startDate ? endDate >= startDate : true;
      }
    ),
  location: yup.string().optional(),
  type: yup
    .mixed<EventType>()
    .oneOf(Object.values(EventType).filter(value => typeof value === 'number'), 'validation.invalidSelection')
    .required('validation.required'),
  repeatAnnually: yup.boolean().required(),
  isLunarDate: yup.boolean().required(),
  lunarDay: yup
    .number()
    .min(1, 'validation.min')
    .max(30, 'validation.max')
    .when('isLunarDate', {
      is: true,
      then: (schema) => schema.required('validation.required').typeError('validation.invalidNumber'),
      otherwise: (schema) => schema.optional().nullable(),
    }),
  lunarMonth: yup
    .number()
    .min(1, 'validation.min')
    .max(12, 'validation.max')
    .when('isLunarDate', {
      is: true,
      then: (schema) => schema.required('validation.required').typeError('validation.invalidNumber'),
      otherwise: (schema) => schema.optional().nullable(),
    }),
  isLeapMonth: yup.boolean().optional(),
});
