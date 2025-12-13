import { BaseSearchQuery } from './common'

export interface UserCheckResultDto {
  userId: string;
  userName: string;
  fullName: string;
}

export interface UserListDto {
  id: string;
  fullName: string;
  userName: string;
  email?: string;
  authProviderId: string;
}

export interface SearchUsersQuery extends BaseSearchQuery {
}