import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  supabaseRuntime as supabase,
  isSupabaseConfigured,
  isDemoModeEnabled,
} from '@/lib/supabase';
import { canRestoreCachedUser, resolveDemoRole } from '@/lib/authPolicy';
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
  updateProfile: (updates: {
    fullName?: string;
    phone?: string;
  }) => Promise<{ error: Error | null; user?: UserProfile }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (!canRestoreCachedUser(isDemoModeEnabled)) return null;
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

    // Fetch profile and authoritative user_roles in parallel to guarantee real admin role resolution
    const resolveUserProfile = async (supabaseUser: {
      id: string;
      email?: string;
    }): Promise<UserProfile> => {
      try {
        const [profileRes, rolesRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', supabaseUser.id).maybeSingle(),
          supabase.from('user_roles').select('role').eq('user_id', supabaseUser.id),
        ]);

        const profile = profileRes.data as ProfileRow | null;
        const userRoles = (rolesRes.data as { role: string }[] | null) || [];
        const isAdminUser = userRoles.some((r) => r.role === 'admin') || profile?.role === 'admin';
        const effectiveRole: UserRole = isAdminUser ? 'admin' : profile?.role || 'student';

        return {
          id: profile?.id || supabaseUser.id,
          fullName: profile?.full_name || supabaseUser.email?.split('@')[0] || 'User',
          email: profile?.email || supabaseUser.email || '',
          phone: profile?.phone ?? undefined,
          avatarUrl: profile?.avatar_url ?? undefined,
          targetExamId: profile?.target_exam_id ?? undefined,
          role: effectiveRole,
          createdAt: profile?.created_at || new Date().toISOString(),
        };
      } catch (err) {
        console.error('Supabase session load error:', err);
        return {
          id: supabaseUser.id,
          fullName: supabaseUser.email?.split('@')[0] || 'User',
          email: supabaseUser.email || '',
          role: 'student',
          createdAt: new Date().toISOString(),
        };
      }
    };

    // Check active Supabase session
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const userObj = await resolveUserProfile(session.user);
          setUser(userObj);
          localStorage.setItem('practicekoro_user', JSON.stringify(userObj));
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
        const userObj = await resolveUserProfile(session.user);
        setUser(userObj);
        localStorage.setItem('practicekoro_user', JSON.stringify(userObj));
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
        if (!isDemoModeEnabled) return { error: new Error('Authentication is not configured') };
        if (resolveDemoRole(email) === 'admin') {
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
        const [profileRes, rolesRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle(),
          supabase.from('user_roles').select('role').eq('user_id', data.user.id),
        ]);

        const profile = profileRes.data as ProfileRow | null;
        const userRoles = (rolesRes.data as { role: string }[] | null) || [];
        const isAdminUser = userRoles.some((r) => r.role === 'admin') || profile?.role === 'admin';
        authenticatedRole = isAdminUser ? 'admin' : profile?.role || 'student';

        const userObj: UserProfile = {
          id: profile?.id || data.user.id,
          fullName: profile?.full_name || data.user.email?.split('@')[0] || 'User',
          email: profile?.email || data.user.email || '',
          phone: profile?.phone ?? undefined,
          avatarUrl: profile?.avatar_url ?? undefined,
          targetExamId: profile?.target_exam_id ?? undefined,
          role: authenticatedRole,
          createdAt: profile?.created_at || new Date().toISOString(),
        };

        setUser(userObj);
        localStorage.setItem('practicekoro_user', JSON.stringify(userObj));
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
        if (!isDemoModeEnabled) return { error: new Error('Authentication is not configured') };
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
    if (!isDemoModeEnabled) return;
    const selectedUser = newRole === 'admin' ? MOCK_ADMIN_USER : MOCK_STUDENT_USER;
    setUser(selectedUser);
    localStorage.setItem('practicekoro_user', JSON.stringify(selectedUser));
  };

  const updateProfile = async (updates: {
    fullName?: string;
    phone?: string;
  }): Promise<{ error: Error | null; user?: UserProfile }> => {
    if (!user) return { error: new Error('User is not logged in') };

    const updatedFullName =
      updates.fullName !== undefined ? updates.fullName.trim() : user.fullName;
    const updatedPhone = updates.phone !== undefined ? updates.phone.trim() : user.phone;

    if (!updatedFullName) {
      return { error: new Error('Full Name cannot be empty') };
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

    try {
      if (isSupabaseConfigured && isUuid) {
        // 1. Update profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: updatedFullName,
            phone: updatedPhone || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (profileError) {
          return { error: profileError };
        }

        // 2. Also update user_metadata in Supabase auth
        try {
          await supabase.auth.updateUser({
            data: { full_name: updatedFullName },
          });
        } catch (authErr) {
          console.warn('Could not sync user_metadata in auth:', authErr);
        }
      }

      // 3. Update local state and localStorage
      const updatedUser: UserProfile = {
        ...user,
        fullName: updatedFullName,
        phone: updatedPhone,
      };

      setUser(updatedUser);
      localStorage.setItem('practicekoro_user', JSON.stringify(updatedUser));

      return { error: null, user: updatedUser };
    } catch (err: unknown) {
      return { error: err as Error };
    }
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
        updateProfile,
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
