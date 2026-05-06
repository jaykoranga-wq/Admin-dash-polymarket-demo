import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store/index';
import type { ApiResponse } from '../types/auth';
import type {
  Market,
  MarketDetail,
  MarketCreateRequest,
  MarketListParams,
  ProposeResponseData,
  ProposeResponseRequest,
} from '../types/market.types';

/** Mirrors the backend RESOLUTION_ACTION enum */
export const RESOLUTION_ACTION = {
  PROPOSE: 1,
  DISPUTE: 2,
  DISPUTE_SETTLEMENT: 3,
  SETTLE: 4,
} as const;
export type ResolutionAction = typeof RESOLUTION_ACTION[keyof typeof RESOLUTION_ACTION];

export interface OracleTimelineEntry {
  id: string;
  action: ResolutionAction;
  status: number;
  bondAmount: string | null;
  response: number | null;
  createdAt: string;
  proposerAddress: string | null;
  disputerAddress: string | null;
}

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
      providesTags: (result) => [
        { type: 'Market', id: 'LIST' },
        ...(result?.data?.data?.map((market) => ({
          type: 'Market' as const,
          id: market.id,
        })) ?? []),
      ],
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

    /** POST /v1/admin/marketplace/propose-response */
    proposeResponse: builder.mutation<ApiResponse<ProposeResponseData>, ProposeResponseRequest>({
      query: (body) => ({
        url: '/v1/admin/marketplace/propose-response',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, body) => [
        { type: 'Market', id: body.marketId },
        { type: 'Market', id: 'LIST' },
        { type: 'Market' as const, id: `timeline-${body.marketId}` },
      ],
    }),

    /** GET /v1/admin/marketplace/oracle-timeline?marketId=... */
    getOracleTimeline: builder.query<{ data: OracleTimelineEntry[] }, string>({
      query: (marketId) => ({
        url: '/v1/admin/marketplace/oracle-timeline',
        params: { marketId },
      }),
      providesTags: (_result, _error, marketId) => [
        { type: 'Market' as const, id: `timeline-${marketId}` },
      ],
    }),
  }),
});

export const {
  useGetMarketsQuery,
  useGetMarketByIdQuery,
  useCreateMarketMutation,
  useProposeResponseMutation,
  useGetOracleTimelineQuery,
} = marketplaceApi;

