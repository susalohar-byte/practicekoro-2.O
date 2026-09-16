import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  supabaseRuntime as supabase,
  isSupabaseConfigured,
  isDemoModeEnabled,
} from '@/lib/supabase';
import { canRestoreCachedUser, resolveDemoRole, isAdminEmail } from '@/lib/authPolicy';
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
  loginWithGoogle: (targetRedirect?: string) => Promise<{ error: Error | null }>;
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
      user_metadata?: Record<string, any>;
    }): Promise<UserProfile> => {
      try {
        const [profileRes, rolesRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', supabaseUser.id).maybeSingle(),
          supabase.from('user_roles').select('role').eq('user_id', supabaseUser.id),
        ]);

        let profile = profileRes.data as ProfileRow | null;
        const userRoles = (rolesRes.data as { role: string }[] | null) || [];
        const isEmailAdmin = isAdminEmail(supabaseUser.email);
        const isAdminUser =
          userRoles.some((r) => r.role === 'admin') || profile?.role === 'admin' || isEmailAdmin;
        const effectiveRole: UserRole = isAdminUser ? 'admin' : profile?.role || 'student';

        // Automatically synchronize admin role in database if authorized admin email logs in
        if (
          isEmailAdmin &&
          (profile?.role !== 'admin' || !userRoles.some((r) => r.role === 'admin'))
        ) {
          try {
            await Promise.all([
              supabase
                .from('user_roles')
                .upsert(
                  { user_id: supabaseUser.id, role: 'admin' },
                  { onConflict: 'user_id,role' }
                ),
              supabase.from('profiles').update({ role: 'admin' }).eq('id', supabaseUser.id),
            ]);
            if (profile) profile.role = 'admin';
          } catch (promoteErr) {
            console.warn('Auto admin promotion sync warning:', promoteErr);
          }
        }

        const meta = supabaseUser.user_metadata || {};
        const metaFullName = ((meta.full_name || meta.name || '') as string).trim();
        const metaAvatar = ((meta.avatar_url || meta.picture || '') as string).trim();

        // If profile doesn't exist yet, insert it (e.g. first Google sign-in)
        if (!profile) {
          const initialName = metaFullName || supabaseUser.email?.split('@')[0] || 'Candidate';
          const newProfile = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            full_name: initialName,
            avatar_url: metaAvatar || null,
            role: effectiveRole,
          };
          try {
            await supabase.from('profiles').upsert(newProfile, { onConflict: 'id' });
          } catch (err) {
            console.warn('Profile upsert warning:', err);
          }

          profile = newProfile as ProfileRow;
        } else {
          // If avatar or full_name is missing from profile but provided by Google OAuth, sync them
          const needsAvatarUpdate = !profile.avatar_url && Boolean(metaAvatar);
          const needsNameUpdate =
            (!profile.full_name || profile.full_name === profile.email?.split('@')[0]) &&
            Boolean(metaFullName);

          if (needsAvatarUpdate || needsNameUpdate) {
            const updates: Record<string, string> = {};
            if (needsAvatarUpdate) updates.avatar_url = metaAvatar;
            if (needsNameUpdate) updates.full_name = metaFullName;

            try {
              await supabase.from('profiles').update(updates).eq('id', supabaseUser.id);
            } catch (err) {
              console.warn('Profile sync warning:', err);
            }
          }
        }

        return {
          id: profile?.id || supabaseUser.id,
          fullName:
            profile?.full_name || metaFullName || supabaseUser.email?.split('@')[0] || 'User',
          email: profile?.email || supabaseUser.email || '',
          phone: profile?.phone ?? undefined,
          avatarUrl: profile?.avatar_url || metaAvatar || undefined,
          targetExamId: profile?.target_exam_id ?? undefined,
          role: effectiveRole,
          createdAt: profile?.created_at || new Date().toISOString(),
        };
      } catch (err) {
        console.error('Supabase profile resolve error:', err);
        const meta = supabaseUser.user_metadata || {};
        return {
          id: supabaseUser.id,
          fullName: meta.full_name || meta.name || supabaseUser.email?.split('@')[0] || 'User',
          email: supabaseUser.email || '',
          avatarUrl: meta.avatar_url || meta.picture || undefined,
          role: isAdminEmail(supabaseUser.email) ? 'admin' : 'student',
          createdAt: new Date().toISOString(),
        };
      }
    };

    // Check active Supabase session
    const initAuth = async () => {
      try {
        // If OAuth returned PKCE code in query string, handle exchange cleanly
        if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          if (code) {
            try {
              await supabase.auth.exchangeCodeForSession(code);
              const cleanUrl = window.location.pathname;
              window.history.replaceState({}, document.title, cleanUrl);
            } catch (exchangeErr) {
              console.warn('OAuth PKCE exchange handled or error:', exchangeErr);
            }
          }
        }

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
        const isEmailAdmin = isAdminEmail(email) || isAdminEmail(data.user.email);
        const isAdminUser =
          userRoles.some((r) => r.role === 'admin') || profile?.role === 'admin' || isEmailAdmin;
        authenticatedRole = isAdminUser ? 'admin' : profile?.role || 'student';

        if (
          isEmailAdmin &&
          (profile?.role !== 'admin' || !userRoles.some((r) => r.role === 'admin'))
        ) {
          try {
            await Promise.all([
              supabase
                .from('user_roles')
                .upsert({ user_id: data.user.id, role: 'admin' }, { onConflict: 'user_id,role' }),
              supabase.from('profiles').update({ role: 'admin' }).eq('id', data.user.id),
            ]);
            if (profile) profile.role = 'admin';
          } catch (promoteErr) {
            console.warn('Auto admin promotion sync warning:', promoteErr);
          }
        }

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

  const loginWithGoogle = async (targetRedirect?: string): Promise<{ error: Error | null }> => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        if (!isDemoModeEnabled) {
          return { error: new Error('Authentication is not configured') };
        }
        // In demo mode without configured Supabase, authenticate as mock student
        setUser(MOCK_STUDENT_USER);
        localStorage.setItem('practicekoro_user', JSON.stringify(MOCK_STUDENT_USER));
        return { error: null };
      }

      const redirectUri = targetRedirect || `${window.location.origin}/dashboard`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
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
        const isEmailAdmin = isAdminEmail(email);
        const registeredRole: UserRole = isEmailAdmin ? 'admin' : 'student';
        const newUser: UserProfile = {
          id: 'usr-' + Date.now(),
          fullName,
          email,
          role: registeredRole,
          createdAt: new Date().toISOString(),
        };
        setUser(newUser);
        localStorage.setItem('practicekoro_user', JSON.stringify(newUser));
        return { error: null, role: registeredRole };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) return { error };

      const isEmailAdmin = isAdminEmail(email);
      const registeredRole: UserRole = isEmailAdmin ? 'admin' : 'student';

      if (data.user) {
        if (isEmailAdmin) {
          try {
            await Promise.all([
              supabase
                .from('user_roles')
                .upsert({ user_id: data.user.id, role: 'admin' }, { onConflict: 'user_id,role' }),
              supabase.from('profiles').update({ role: 'admin' }).eq('id', data.user.id),
            ]);
          } catch (promoteErr) {
            console.warn('Auto admin promotion sync warning on register:', promoteErr);
          }
        }

        const newUser: UserProfile = {
          id: data.user.id,
          fullName,
          email,
          role: registeredRole,
          createdAt: new Date().toISOString(),
        };
        setUser(newUser);
        localStorage.setItem('practicekoro_user', JSON.stringify(newUser));
      }
      return { error: null, role: registeredRole };
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

  const role: UserRole = isAdminEmail(user?.email) ? 'admin' : user?.role || 'student';
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
        loginWithGoogle,
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
