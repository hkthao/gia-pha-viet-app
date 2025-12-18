import * as yup from 'yup';
import { LocationType, LocationAccuracy, LocationSource } from '@/types';

export interface FamilyLocationFormData {
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  locationType: LocationType;
  accuracy: LocationAccuracy;
  source: LocationSource;
  familyId?: string; // Will be set by the calling screen
}

export const familyLocationValidationSchema = yup.object().shape({
  name: yup.string().trim()
    .required('Tên vị trí không được để trống.')
    .min(2, 'Tên vị trí phải có ít nhất 2 ký tự.')
    .max(100, 'Tên vị trí không được vượt quá 100 ký tự.'),
  description: yup.string().trim().optional().max(500, 'Mô tả không được vượt quá 500 ký tự.'),
  address: yup.string().trim().optional().max(200, 'Địa chỉ không được vượt quá 200 ký tự.'),
  latitude: yup.number().required('Vĩ độ không được để trống.').min(-90, 'Vĩ độ không hợp lệ').max(90, 'Vĩ độ không hợp lệ'),
  longitude: yup.number().required('Kinh độ không được để trống.').min(-180, 'Kinh độ không hợp lệ').max(180, 'Kinh độ không hợp lệ'),
  locationType: yup.number()
    .required('Loại vị trí không được để trống.')
    .oneOf(Object.values(LocationType).filter(v => typeof v === 'number'), 'Loại vị trí không hợp lệ.'),
  accuracy: yup.number()
    .required('Độ chính xác không được để trống.')
    .oneOf(Object.values(LocationAccuracy).filter(v => typeof v === 'number'), 'Độ chính xác không hợp lệ.'),
  source: yup.number()
    .required('Nguồn vị trí không được để trống.')
    .oneOf(Object.values(LocationSource).filter(v => typeof v === 'number'), 'Nguồn vị trí không hợp lệ.'),
  familyId: yup.string().uuid('ID gia đình không hợp lệ.').optional(),
});
