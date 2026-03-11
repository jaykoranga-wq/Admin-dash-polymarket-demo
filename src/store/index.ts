import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { authApi } from '../services/authApi';
import { categoriesApi } from '../services/categoriesApi';
import { marketplaceApi } from '../services/marketplaceApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [marketplaceApi.reducerPath]: marketplaceApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(categoriesApi.middleware)
      .concat(marketplaceApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
