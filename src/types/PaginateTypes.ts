import { PopulateOptions, SortOrder } from "mongoose";

export type PopulateConfig = PopulateOptions & {
  match?: Record<string, any>;
};

export type PaginateOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  searchFields?: string[];
  filter?: Record<string, any>;
  sort?: Record<string, SortOrder>;
  baseUrl?: string;
  originalQuery?: Record<string, any>;
  populate?: PopulateConfig[];
};

export type PaginateResult<T> = {
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  next: string | null;
  previous: string | null;
  results: T[];
};