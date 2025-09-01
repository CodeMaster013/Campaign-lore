import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserClearance: (userId: string, clearance: 'Beta' | 'Alpha' | 'Omega') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock credentials for demo purposes
const mockCredentials: Record<string, { email: string; password: string; userData: Partial<User> }> = {
  'founder': {
    email: 'founder@theseus.com',
    password: 'omega-prime-2024',
    userData: {
      username: 'founder',
      display_name: 'The Founder',
      clearance_level: 'Omega',
      role: 'admin',
      avatar: '👑'
    }
  },
  'operative-alpha': {
    email: 'alpha@theseus.com',
    password: 'alpha-clearance',
    userData: {
      username: 'operative-alpha',
      display_name: 'Agent Mitchell',
      clearance_level: 'Alpha',
      role: 'player',
      avatar: '🚀'
    }
  },
  'operative-beta': {
    email: 'beta@theseus.com',
    password: 'beta-access',
    userData: {
      username: 'operative-beta',
      display_name: 'Operative Chen',
      clearance_level: 'Beta',
      role: 'player',
      avatar: '⭐'
    }
  },
  'recruit': {
    email: 'recruit@theseus.com',
    password: 'new-recruit',
    userData: {
      username: 'recruit',
      display_name: 'Recruit Davis',
      clearance_level: 'Beta',
      role: 'player',
      avatar: '🔰'
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
    // Check for existing Supabase session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Try to get user from database
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const user: User = userData || {
        id: supabaseUser.id,
        username: supabaseUser.email?.split('@')[0] || 'user',
        display_name: supabaseUser.email?.split('@')[0] || 'User',
        email: supabaseUser.email,
        clearance_level: 'Beta',
        role: 'player',
        avatar: '👤',
        join_date: new Date().toISOString(),
        last_active: new Date().toISOString(),
        is_active: true,
        created_at: new Date().toISOString()
      };

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const credentials = mockCredentials[username.toLowerCase()];
      if (!credentials) {
        return false;
      }

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        // If user doesn't exist, create them
        if (error.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password
          });

          if (signUpError) {
            console.error('Sign up failed:', signUpError);
            return false;
          }

          if (signUpData.user) {
            // Create user profile in database using service role
            const { error: profileError } = await supabase
              .from('users')
              .insert([{
                id: signUpData.user.id,
                ...credentials.userData,
                email: credentials.email
              }]);

            if (profileError) {
              console.error('Profile creation failed:', profileError);
            }

            await loadUserProfile(signUpData.user);
            return true;
          }
        }
        return false;
      }

      if (data.user) {
        await loadUserProfile(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const updateUserClearance = async (userId: string, clearance: 'Beta' | 'Alpha' | 'Omega') => {
    // Only allow if current user is admin
    if (authState.user?.role !== 'admin') {
      console.error('Unauthorized: Only admins can update clearance');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ clearance_level: clearance })
        .eq('id', userId);

      if (error) {
        console.error('Failed to update clearance:', error);
      }
    } catch (error) {
      console.error('Clearance update failed:', error);
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