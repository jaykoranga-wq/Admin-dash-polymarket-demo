export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

/** Standard API wrapper returned by every endpoint */
export interface ApiResponse<T = undefined> {
  statusCode: number;
  status: boolean;
  message: string;
  type: string;
  data?: T;
}

/** Login / Signup response — only token in data */
export interface AuthResponse extends ApiResponse<{ token: string }> {}

/** Profile response — admin object in data */
export interface ProfileResponse extends ApiResponse<AdminUser> {}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
}
