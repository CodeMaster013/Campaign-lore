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
    console.log('AuthProvider: Starting initialization');
    
    // Simple timeout to ensure we don't stay in loading forever
    const loadingTimeout = setTimeout(() => {
      console.log('AuthProvider: Loading timeout reached, setting loading to false');
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }, 3000);

    const initAuth = async () => {
      try {
        console.log('AuthProvider: Checking session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('AuthProvider: Session error:', error);
          throw error;
        }

        if (session?.user) {
          console.log('AuthProvider: Found session, loading user profile');
          await loadUserProfile(session.user);
        } else {
          console.log('AuthProvider: No session found');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('AuthProvider: Init failed:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      } finally {
        clearTimeout(loadingTimeout);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider: Auth state changed:', event);
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

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('AuthProvider: Loading user profile for:', supabaseUser.id);
      
      // Try to get user from database
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.log('AuthProvider: Database query error:', error);
      }

      if (!userData) {
        console.log('AuthProvider: No user profile found, creating fallback user');
        
        // Find the correct clearance from mock credentials based on email
        let correctClearance = 'Beta';
        let correctUserData = {};
        
        for (const [username, creds] of Object.entries(mockCredentials)) {
          if (creds.email === supabaseUser.email) {
            correctClearance = creds.userData.clearance_level || 'Beta';
            correctUserData = creds.userData;
            break;
          }
        }
        
        const fallbackUser: User = {
          id: supabaseUser.id,
          username: (correctUserData as any).username || supabaseUser.email?.split('@')[0] || 'user',
          display_name: (correctUserData as any).display_name || supabaseUser.email?.split('@')[0] || 'User',
          email: supabaseUser.email,
          clearance_level: correctClearance as 'Beta' | 'Alpha' | 'Omega',
          role: (correctUserData as any).role || 'player',
          avatar: (correctUserData as any).avatar || '👤',
          join_date: new Date().toISOString(),
          last_active: new Date().toISOString(),
          is_active: true,
          created_at: new Date().toISOString()
        };
        
        console.log('AuthProvider: Using fallback user with correct clearance:', correctClearance);
        setAuthState({
          user: fallbackUser,
          isAuthenticated: true,
          isLoading: false
        });
        
        // Try to create the user profile in the database for future use
        try {
          await supabase
            .from('users')
            .insert([fallbackUser]);
          console.log('AuthProvider: User profile created in database');
        } catch (insertError) {
          console.log('AuthProvider: Failed to create user profile in database:', insertError);
        }
        
        return;
      }

      const user: User = userData;
      console.log('AuthProvider: User profile loaded successfully');
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      console.error('AuthProvider: Failed to load user profile:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthProvider: Attempting login for:', username);
      
      const credentials = mockCredentials[username.toLowerCase()];
      if (!credentials) {
        console.log('AuthProvider: No credentials found for username');
        return false;
      }

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        console.log('AuthProvider: Sign in error:', error);
        
        // If user doesn't exist, create them
        if (error.message.includes('Invalid login credentials')) {
          console.log('AuthProvider: Creating new user account');
          
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password
          });

          if (signUpError) {
            console.error('AuthProvider: Sign up failed:', signUpError);
            return false;
          }

          if (signUpData.user) {
            console.log('AuthProvider: User created, creating profile');
            
            // Create user profile in database
            try {
              const { error: profileError } = await supabase
                .from('users')
                .insert([{
                  id: signUpData.user.id,
                  ...credentials.userData,
                  email: credentials.email
                }]);

              if (profileError) {
                console.log('AuthProvider: Profile creation error:', profileError);
              }
            } catch (profileError) {
              console.log('AuthProvider: Profile creation failed:', profileError);
            }

            await loadUserProfile(signUpData.user);
            return true;
          }
        }
        return false;
      }

      if (data.user) {
        console.log('AuthProvider: Sign in successful');
        await loadUserProfile(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('AuthProvider: Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('AuthProvider: Logout failed:', error);
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

  console.log('AuthProvider: Current state:', authState);

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