export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SortParam {
  field: string;
  direction: 'asc' | 'desc';
}

export interface QueryParams {
  pagination?: PaginationParams;
  sort?: SortParam[];
}

export interface FindManyOptions extends QueryParams {
  select?: string[];
}
