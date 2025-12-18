import { UserCheckResultDto, PaginatedList, UserListDto, SearchUsersQuery } from '@/types';

export interface IUserService {
  checkUserByEmailOrUsername(identifier: string): Promise<UserCheckResultDto>;
  search(query: SearchUsersQuery): Promise<PaginatedList<UserListDto>>;
  getByIds(ids: string []): Promise<UserListDto[]>;
}

