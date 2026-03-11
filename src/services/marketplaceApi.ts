import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store/index';
import type { ApiResponse } from '../types/auth';
import type {
  Market,
  MarketDetail,
  MarketCreateRequest,
  MarketListParams,
} from '../types/market.types';

const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

interface MarketListData {
  data: Market[];
  count: number;
}

interface MarketDetailData {
  data: MarketDetail;
}

export const marketplaceApi = createApi({
  reducerPath: 'marketplaceApi',
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
  tagTypes: ['Market'],
  endpoints: (builder) => ({
    /** GET /v1/admin/marketplace */
    getMarkets: builder.query<ApiResponse<MarketListData>, MarketListParams>({
      query: (params = {}) => ({
        url: '/v1/admin/marketplace',
        params: {
          limit: params.limit ?? 50,
          sortKey: params.sortKey ?? 'createdAt',
          sortDirection: params.sortDirection ?? 'DESC',
          ...(params.page !== undefined && { page: params.page }),
        },
      }),
      providesTags: ['Market'],
    }),

    /** GET /v1/admin/marketplace/fetchSpecific?marketId=... */
    getMarketById: builder.query<ApiResponse<MarketDetailData>, string>({
      query: (marketId) => ({
        url: '/v1/admin/marketplace/fetchSpecific',
        params: { marketId },
      }),
      providesTags: (_result, _error, id) => [{ type: 'Market', id }],
    }),

    /** POST /v1/marketplace */
    createMarket: builder.mutation<ApiResponse, MarketCreateRequest>({
      query: (body) => ({
        url: '/v1/marketplace',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Market'],
    }),
  }),
});

export const {
  useGetMarketsQuery,
  useGetMarketByIdQuery,
  useCreateMarketMutation,
} = marketplaceApi;
