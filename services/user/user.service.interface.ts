import { UserProfileDto } from '@/types/userProfile';
import { UserCheckResultDto, PaginatedList, UserListDto, SearchUsersQuery, Result } from '@/types';

export interface IUserService {
  checkUserByEmailOrUsername(identifier: string): Promise<UserCheckResultDto>;
  search(query: SearchUsersQuery): Promise<PaginatedList<UserListDto>>;
}

