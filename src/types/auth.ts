export interface User {
  id: string;
  username: string;
  display_name: string;
  email?: string;
  clearance_level: 'Beta' | 'Alpha' | 'Omega';
  role: 'player' | 'admin';
  avatar?: string;
  join_date: string;
  last_active: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}