export interface User {
  id: string;
  username: string;
  displayName: string;
  clearanceLevel: 'Beta' | 'Alpha' | 'Omega';
  role: 'player' | 'admin';
  avatar?: string;
  joinDate: string;
  lastActive: string;
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