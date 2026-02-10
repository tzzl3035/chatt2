export interface Profile {
  id: string
  username: string
  email: string
  avatar_url: string | null
  password_hash?: string
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: { id: string; username: string } | null
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface RegisterCredentials {
  username: string
  password: string
  confirmPassword: string
}

export interface LoginCredentials {
  identifier: string
  password: string
}

export interface VerificationCodeRequest {
  email: string
}