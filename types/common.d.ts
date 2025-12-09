// gia-pha-viet-app/src/types/common.d.ts

export interface PaginatedList<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
}

export interface BaseAuditableDto {
  created: string; // DateTime in C# maps to string in TypeScript
  createdBy?: string;
  lastModified?: string;
  lastModifiedBy?: string;
}

export interface BaseSearchQuery {
  page?: number;
  itemsPerPage?: number;
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: string; // "asc" or "desc"
}
