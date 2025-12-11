import { UserProfileDto } from '@/types/userProfile';
import { UserCheckResultDto } from '@/types';

export interface IUserService {
  checkUserByEmailOrUsername(identifier: string): Promise<UserCheckResultDto>;
}
