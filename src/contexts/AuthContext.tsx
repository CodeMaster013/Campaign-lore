import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserClearance: (userId: string, clearance: 'Beta' | 'Alpha' | 'Omega') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database - in a real app, this would be in a backend
const mockUsers: Record<string, { password: string; user: User }> = {
  'founder': {
    password: 'omega-prime-2024',
    user: {
      id: 'founder-001',
      username: 'founder',
      displayName: 'The Founder',
      clearanceLevel: 'Omega',
      role: 'admin',
      avatar: '👑',
      joinDate: '2024-01-01',
      lastActive: new Date().toISOString()
    }
  },
  'operative-alpha': {
    password: 'alpha-clearance',
    user: {
      id: 'op-001',
      username: 'operative-alpha',
      displayName: 'Agent Mitchell',
      clearanceLevel: 'Alpha',
      role: 'player',
      avatar: '🚀',
      joinDate: '2024-01-15',
      lastActive: new Date().toISOString()
    }
  },
  'operative-beta': {
    password: 'beta-access',
    user: {
      id: 'op-002',
      username: 'operative-beta',
      displayName: 'Operative Chen',
      clearanceLevel: 'Beta',
      role: 'player',
      avatar: '⭐',
      joinDate: '2024-01-20',
      lastActive: new Date().toISOString()
    }
  },
  'recruit': {
    password: 'new-recruit',
    user: {
      id: 'rec-001',
      username: 'recruit',
      displayName: 'Recruit Davis',
      clearanceLevel: 'Beta',
      role: 'player',
      avatar: '🔰',
      joinDate: '2024-02-01',
      lastActive: new Date().toISOString()
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('theseus-user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } catch {
        localStorage.removeItem('theseus-user');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const userRecord = mockUsers[username.toLowerCase()];
    
    if (userRecord && userRecord.password === password) {
      const user = {
        ...userRecord.user,
        lastActive: new Date().toISOString()
      };
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
      
      localStorage.setItem('theseus-user', JSON.stringify(user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    localStorage.removeItem('theseus-user');
  };

  const updateUserClearance = (userId: string, clearance: 'Beta' | 'Alpha' | 'Omega') => {
    if (authState.user?.role === 'admin') {
      // In a real app, this would update the backend
      console.log(`Updated user ${userId} clearance to ${clearance}`);
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      updateUserClearance
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};