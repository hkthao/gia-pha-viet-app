import * as yup from 'yup';
import { CalendarType, EventType, RepeatRule } from '@/types'; // Assuming EventType is defined in '@/types'

export interface EventFormData {
  name: string;
  code: string; // New field
  color?: string; // New field
  description?: string;
  solarDate?: Date; // Renamed from startDate, made optional as it's conditional on calendarType
  location?: string;
  type: EventType;
  repeatRule: RepeatRule; // Changed from repeatAnnually
  calendarType: CalendarType; // Changed from isLunarDate
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
      is: CalendarType.SOLAR,
      then: (schema) => schema.required('validation.required').typeError('validation.invalidDate'),
      otherwise: (schema) => schema.optional().nullable(),
    }),
  location: yup.string().optional(),
  type: yup
    .mixed<EventType>()
    .oneOf(Object.values(EventType).filter(value => typeof value === 'number'), 'validation.invalidSelection')
    .required('validation.required'),
  repeatRule: yup // Changed from repeatAnnually
    .mixed<RepeatRule>()
    .oneOf(Object.values(RepeatRule).filter(value => typeof value === 'number'), 'validation.invalidSelection')
    .required('validation.required'),
  calendarType: yup // Changed from isLunarDate
    .mixed<CalendarType>()
    .oneOf(Object.values(CalendarType).filter(value => typeof value === 'number'), 'validation.invalidSelection')
    .required('validation.required'),
  lunarDay: yup
    .number()
    .min(1, 'validation.min')
    .max(30, 'validation.max')
    .when('calendarType', { // Conditional on calendarType
      is: CalendarType.LUNAR,
      then: (schema) => schema.required('validation.required').typeError('validation.invalidNumber'),
      otherwise: (schema) => schema.optional().nullable(),
    }),
  lunarMonth: yup
    .number()
    .min(1, 'validation.min')
    .max(12, 'validation.max')
    .when('calendarType', { // Conditional on calendarType
      is: CalendarType.LUNAR,
      then: (schema) => schema.required('validation.required').typeError('validation.invalidNumber'),
      otherwise: (schema) => schema.optional().nullable(),
    }),
  isLeapMonth: yup.boolean().optional(),
});
