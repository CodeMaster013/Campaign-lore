import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, AuthState } from '../types/auth';

const demoMode = (import.meta as any).env?.VITE_DEMO_AUTH === 'true';

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
      role: 'admin',
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
        if (demoMode) {
          console.log('AuthProvider: Demo mode - restoring demo session');
          const raw = typeof window !== 'undefined' ? window.localStorage.getItem('demo_user') : null;
          if (raw) {
            const user: User = JSON.parse(raw);
            setAuthState({ user, isAuthenticated: true, isLoading: false });
          } else {
            setAuthState({ user: null, isAuthenticated: false, isLoading: false });
          }
          return;
        }

        // Restore any demo bypass session (non-demo mode) before checking Supabase
        try {
          if (typeof window !== 'undefined') {
            const bypassRaw = window.localStorage.getItem('demo_bypass_user');
            if (bypassRaw) {
              const bypassUser: User = JSON.parse(bypassRaw);
              console.log('AuthProvider: Restoring demo bypass session from localStorage');
              setAuthState({ user: bypassUser, isAuthenticated: true, isLoading: false });
              return;
            }
          }
        } catch (e) {
          console.log('AuthProvider: Failed to read demo bypass user from localStorage');
        }

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

    // Listen for auth changes (skip in demo mode)
    const sub = demoMode
      ? { data: { subscription: { unsubscribe() {} } } } as any
      : supabase.auth.onAuthStateChange(async (event, session) => {
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
      (sub as any).data.subscription.unsubscribe();
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

      if (demoMode) {
        // Check if the entered password matches the expected password in demo mode
        if (password !== credentials.password) {
          console.log('AuthProvider: Password mismatch (demo mode)');
          return false;
        }
        // Create a local demo user and persist to localStorage
        const userProfile: User = {
          id: `demo-${credentials.userData.username || username}`,
          username: credentials.userData.username || username,
          display_name: credentials.userData.display_name || username,
          email: credentials.email,
          clearance_level: (credentials.userData.clearance_level as any) || 'Beta',
          role: (credentials.userData.role as any) || 'player',
          avatar: credentials.userData.avatar,
          join_date: new Date().toISOString(),
          last_active: new Date().toISOString(),
          is_active: true,
          created_at: new Date().toISOString()
        };

        if (typeof window !== 'undefined') {
          window.localStorage.setItem('demo_user', JSON.stringify(userProfile));
          window.localStorage.setItem('demo_session', JSON.stringify({ user: userProfile }));
        }

        setAuthState({ user: userProfile, isAuthenticated: true, isLoading: false });
        return true;
      }

      // Try to sign in via Supabase
      console.log('AuthProvider: Attempting sign in with email:', credentials.email);
      let { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password // Use the user-entered password for Supabase auth
      });

      if (error) {
        console.log('AuthProvider: Sign in error:', error);
        // Attempt sign-up if credentials are invalid (user might not exist yet)
        const message = (error as any)?.message || '';
        const status = (error as any)?.status;
        if (message.includes('Invalid login credentials') || status === 400) {
          try {
            console.log('AuthProvider: Attempting sign up for:', credentials.email);
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: credentials.email,
              password
            });

            if (signUpError) {
              console.log('AuthProvider: Sign up error:', signUpError);
              return false;
            }

            // If email confirmation is enabled, a session may not be returned
            if (!(signUpData as any)?.user) {
              console.log('AuthProvider: Sign up completed but no user returned (email confirmation likely required)');
              return false;
            }

            // If a user exists and a session was created, load/create profile and authenticate state
            const createdUser = (signUpData as any).user;
            if ((signUpData as any)?.session) {
              await loadUserProfile(createdUser);
              return true;
            }

            // No session created (likely email confirmation required): bypass for demo-mapped accounts
            try {
              console.log('AuthProvider: Bypassing email confirmation for demo account:', credentials.email);
              const userProfile: User = {
                id: createdUser.id,
                username: credentials.userData.username || username,
                display_name: credentials.userData.display_name || username,
                email: credentials.email,
                clearance_level: (credentials.userData.clearance_level as any) || 'Beta',
                role: (credentials.userData.role as any) || 'player',
                avatar: credentials.userData.avatar,
                join_date: new Date().toISOString(),
                last_active: new Date().toISOString(),
                is_active: true,
                created_at: new Date().toISOString()
              };

              setAuthState({ user: userProfile, isAuthenticated: true, isLoading: false });

              if (typeof window !== 'undefined') {
                window.localStorage.setItem('demo_bypass_user', JSON.stringify(userProfile));
              }

              // Optionally attempt to create user profile in DB for future use (ignore errors)
              try {
                await supabase.from('users').insert([userProfile]);
              } catch {}

              return true;
            } catch (bypassError) {
              console.log('AuthProvider: Demo bypass failed:', bypassError);
              return false;
            }
          } catch (signupCatch) {
            console.error('AuthProvider: Sign up attempt failed:', signupCatch);
            return false;
          }
        }
        // Do not fabricate auth state; surface the error
        return false;
      }

      if (data.session && data.user) {
        console.log('AuthProvider: Sign in successful, session established');
        
        // Build user profile from known mock mapping for display purposes
        const userProfile: User = {
          id: data.user.id,
          username: credentials.userData.username || username,
          display_name: credentials.userData.display_name || username,
          email: credentials.email,
          clearance_level: credentials.userData.clearance_level || 'Beta',
          role: credentials.userData.role || 'player',
          avatar: credentials.userData.avatar,
          join_date: new Date().toISOString(),
          last_active: new Date().toISOString(),
          is_active: true,
          created_at: new Date().toISOString()
        };

        setAuthState({
          user: userProfile,
          isAuthenticated: true,
          isLoading: false
        });
        return true;
      }

      console.log('AuthProvider: No session after sign in');
      return false;
    } catch (error) {
      console.error('AuthProvider: Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      if (demoMode) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('demo_user');
          window.localStorage.removeItem('demo_session');
        }
      } else {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('demo_bypass_user');
        }
        await supabase.auth.signOut();
      }
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
