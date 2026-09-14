import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_STUDENT_USER, MOCK_ADMIN_USER } from '@/services/mockData';
import type { Database } from '@/types/database';
import type { UserProfile, UserRole } from '@/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isStudent: boolean;
  isPro: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null; role?: UserRole }>;
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<{ error: Error | null; role?: UserRole }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Check saved demo user or local profile
    const saved = localStorage.getItem('practicekoro_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isPro, setIsPro] = useState<boolean>(() => {
    return localStorage.getItem('practicekoro_is_pro') === 'true';
  });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Check active Supabase session
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (data) {
            const profile = data as ProfileRow;
            const userObj: UserProfile = {
              id: profile.id,
              fullName: profile.full_name,
              email: profile.email || session.user.email || '',
              phone: profile.phone ?? undefined,
              avatarUrl: profile.avatar_url ?? undefined,
              targetExamId: profile.target_exam_id ?? undefined,
              role: profile.role,
              createdAt: profile.created_at,
            };
            setUser(userObj);
            localStorage.setItem('practicekoro_user', JSON.stringify(userObj));
          }
        }
      } catch (err) {
        console.error('Supabase session load error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (data) {
          const profile = data as ProfileRow;
          const userObj: UserProfile = {
            id: profile.id,
            fullName: profile.full_name,
            email: profile.email || session.user.email || '',
            phone: profile.phone ?? undefined,
            avatarUrl: profile.avatar_url ?? undefined,
            targetExamId: profile.target_exam_id ?? undefined,
            role: profile.role,
            createdAt: profile.created_at,
          };
          setUser(userObj);
          localStorage.setItem('practicekoro_user', JSON.stringify(userObj));
        }
      } else {
        if (isSupabaseConfigured) {
          const saved = localStorage.getItem('practicekoro_user');
          if (!saved) {
            setUser(null);
            localStorage.removeItem('practicekoro_user');
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null; role?: UserRole }> => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        // Mock fallback login
        if (email.includes('admin')) {
          setUser(MOCK_ADMIN_USER);
          localStorage.setItem('practicekoro_user', JSON.stringify(MOCK_ADMIN_USER));
          return { error: null, role: 'admin' };
        } else {
          setUser(MOCK_STUDENT_USER);
          localStorage.setItem('practicekoro_user', JSON.stringify(MOCK_STUDENT_USER));
          return { error: null, role: 'student' };
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };

      let authenticatedRole: UserRole = 'student';
      if (data.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileData) {
          const profile = profileData as ProfileRow;
          const userObj: UserProfile = {
            id: profile.id,
            fullName: profile.full_name,
            email: profile.email || data.user.email || '',
            phone: profile.phone ?? undefined,
            avatarUrl: profile.avatar_url ?? undefined,
            targetExamId: profile.target_exam_id ?? undefined,
            role: profile.role,
            createdAt: profile.created_at,
          };
          authenticatedRole = profile.role;
          setUser(userObj);
          localStorage.setItem('practicekoro_user', JSON.stringify(userObj));
        }
      }
      return { error: null, role: authenticatedRole };
    } catch (err: unknown) {
      return { error: err as Error };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string
  ): Promise<{ error: Error | null; role?: UserRole }> => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        const newUser: UserProfile = {
          id: 'usr-' + Date.now(),
          fullName,
          email,
          role: 'student',
          createdAt: new Date().toISOString(),
        };
        setUser(newUser);
        localStorage.setItem('practicekoro_user', JSON.stringify(newUser));
        return { error: null, role: 'student' };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) return { error };

      if (data.user) {
        const newUser: UserProfile = {
          id: data.user.id,
          fullName,
          email,
          role: 'student',
          createdAt: new Date().toISOString(),
        };
        setUser(newUser);
        localStorage.setItem('practicekoro_user', JSON.stringify(newUser));
      }
      return { error: null, role: 'student' };
    } catch (err: unknown) {
      return { error: err as Error };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setUser(null);
    setIsPro(false);
    localStorage.removeItem('practicekoro_user');
    localStorage.removeItem('practicekoro_is_pro');
  };

  const switchDemoRole = (newRole: UserRole) => {
    const selectedUser = newRole === 'admin' ? MOCK_ADMIN_USER : MOCK_STUDENT_USER;
    setUser(selectedUser);
    localStorage.setItem('practicekoro_user', JSON.stringify(selectedUser));
  };

  const role = user?.role || 'student';
  const isAdmin = role === 'admin';
  const isStudent = role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isStudent,
        isPro,
        loading,
        login,
        register,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
