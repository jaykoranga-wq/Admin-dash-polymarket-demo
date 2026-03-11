import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store/index';
import type {
  AuthResponse,
  ProfileResponse,
  LoginRequest,
  SignupRequest,
} from '../types/auth';

const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
       
      const token = (getState() as RootState).auth.token;
      if (token) {
        // API expects raw token in 'authorization' header (no 'Bearer' prefix)
        headers.set('authorization', token);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/v1/admin/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    signup: builder.mutation<AuthResponse, SignupRequest>({
      query: (data) => ({
        url: '/v1/admin/signup',
        method: 'POST',
        body: data,
      }),
    }),
    getProfile: builder.query<ProfileResponse, void>({
      query: () => '/v1/admin/profile',
    }),
    logout: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: '/v1/admin/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useGetProfileQuery,
  useLogoutMutation,
} = authApi;
