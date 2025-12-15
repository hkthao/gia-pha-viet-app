import * as yup from 'yup';
import { EventType } from '@/types'; // Assuming EventType is defined in '@/types'

export enum EventFormCalendarType {
  SOLAR = 'solar',
  LUNAR = 'lunar',
}

export enum EventFormRepeatRule {
  YEARLY = 'yearly',
  NONE = 'none',
}

export interface EventFormData {
  name: string;
  code: string; // New field
  color?: string; // New field
  description?: string;
  solarDate?: Date; // Renamed from startDate, made optional as it's conditional on calendarType
  location?: string;
  type: EventType;
  repeatRule: EventFormRepeatRule; // Changed from repeatAnnually
  calendarType: EventFormCalendarType; // Changed from isLunarDate
  lunarDay?: number;
  lunarMonth?: number;
  isLeapMonth?: boolean;
}

export const eventValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required('validation.required')
    .min(3, 'validation.minLength'),
  code: yup // New field validation
    .string()
    .optional(),
  color: yup.string().optional(), // New field validation
  description: yup.string().optional(),
  solarDate: yup // Renamed from startDate
    .date()
    .when('calendarType', { // Conditional on calendarType
      is: EventFormCalendarType.SOLAR,
      then: (schema) => schema.required('validation.required').typeError('validation.invalidDate'),
      otherwise: (schema) => schema.optional().nullable(),
    }),
  location: yup.string().optional(),
  type: yup
    .mixed<EventType>()
    .oneOf(Object.values(EventType).filter(value => typeof value === 'number'), 'validation.invalidSelection')
    .required('validation.required'),
  repeatRule: yup // Changed from repeatAnnually
    .mixed<EventFormRepeatRule>()
    .oneOf(Object.values(EventFormRepeatRule), 'validation.invalidSelection')
    .required('validation.required'),
  calendarType: yup // Changed from isLunarDate
    .mixed<EventFormCalendarType>()
    .oneOf(Object.values(EventFormCalendarType), 'validation.invalidSelection')
    .required('validation.required'),
  lunarDay: yup
    .number()
    .min(1, 'validation.min')
    .max(30, 'validation.max')
    .when('calendarType', { // Conditional on calendarType
      is: EventFormCalendarType.LUNAR,
      then: (schema) => schema.required('validation.required').typeError('validation.invalidNumber'),
      otherwise: (schema) => schema.optional().nullable(),
    }),
  lunarMonth: yup
    .number()
    .min(1, 'validation.min')
    .max(12, 'validation.max')
    .when('calendarType', { // Conditional on calendarType
      is: EventFormCalendarType.LUNAR,
      then: (schema) => schema.required('validation.required').typeError('validation.invalidNumber'),
      otherwise: (schema) => schema.optional().nullable(),
    }),
  isLeapMonth: yup.boolean().optional(),
});
