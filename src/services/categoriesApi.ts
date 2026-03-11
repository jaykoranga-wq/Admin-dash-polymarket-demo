import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store/index';
import type { ApiResponse } from '../types/auth';
import type {
  Category,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  CategoryDeleteRequest,
  CategoryListParams,
} from '../types/market.types';

const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

interface CategoryListData {
  data: Category[];
  count: number;
}

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {

      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', token);
      }
      return headers;
    },
  }),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    /** GET /v1/admin/categories */
    getCategories: builder.query<ApiResponse<CategoryListData>, CategoryListParams>({
      query: (params = {}) => ({
        url: '/v1/admin/categories',
        params: {
          limit: params.limit ?? 50,
          sortKey: params.sortKey ?? 'createdAt',
          sortDirection: params.sortDirection ?? 'DESC',
          ...(params.page !== undefined && { page: params.page }),
        },
      }),
      providesTags: ['Category'],
    }),

    /** POST /v1/categories */
    createCategory: builder.mutation<ApiResponse, CategoryCreateRequest>({
      query: (body) => ({
        url: '/v1/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Category'],
    }),

    /** PUT /v1/categories/:id  (assumed — no curl provided, standard REST) */
    updateCategory: builder.mutation<ApiResponse, { id: string } & CategoryUpdateRequest>({
      query: ({ id, ...body }) => ({
        url: `/v1/categories/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Category'],
    }),

    /** DELETE /v1/categories  (batch delete via body) */
    deleteCategories: builder.mutation<ApiResponse, CategoryDeleteRequest>({
      query: (body) => ({
        url: '/v1/categories',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoriesMutation,
} = categoriesApi;
