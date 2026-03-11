import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AdminUser, AuthResponse, ProfileResponse } from '../types/auth';

interface AuthState {
  adminUser: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

function loadFromStorage(): Pick<AuthState, 'adminUser' | 'token'> {
  try {
    const token = localStorage.getItem('admin_token');
    const adminUserRaw = localStorage.getItem('admin_user');
    return {
      token,
      adminUser: adminUserRaw ? (JSON.parse(adminUserRaw) as AdminUser) : null,
    };
  } catch {
    return { token: null, adminUser: null };
  }
}

const { token, adminUser } = loadFromStorage();

const initialState: AuthState = {
  adminUser,
  token,
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Called after login/signup — stores the token only */
    setCredentials(state, action: PayloadAction<AuthResponse>) {
      const newToken = action.payload.data?.token ?? '';
      state.token = newToken;
      state.isAuthenticated = true;
      localStorage.setItem('admin_token', newToken);
    },
    /** Called after fetching profile — stores the admin object */
    setAdminProfile(state, action: PayloadAction<ProfileResponse>) {
      const admin = action.payload.data ?? null;
      state.adminUser = admin;
      if (admin) {
        localStorage.setItem('admin_user', JSON.stringify(admin));
      }
    },
    clearCredentials(state) {
      state.token = null;
      state.adminUser = null;
      state.isAuthenticated = false;
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    },
  },
});

export const { setCredentials, setAdminProfile, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
