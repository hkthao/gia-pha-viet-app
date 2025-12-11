import { UserProfileDto } from '@/types/userProfile';

export interface UserCheckResultDto {
  userId: string;
  userName: string;
  fullName: string;
}

export interface IUserService {
  checkUserByEmailOrUsername(identifier: string): Promise<UserCheckResultDto>;
}
