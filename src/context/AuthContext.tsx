import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  supabaseRuntime as supabase,
  isSupabaseConfigured,
  isDemoModeEnabled,
} from '@/lib/supabase';
import { isAdminEmail } from '@/lib/authPolicy';
import type { Database } from '@/types/database';
import type { UserProfile, UserRole, AdminRole, AdminPermissions } from '@/types';
import { getAdminPermissions } from '@/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'] & {
  admin_role?: string | null;
};

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  adminRole: AdminRole;
  permissions: AdminPermissions;
  hasPermission: (permission: keyof AdminPermissions) => boolean;
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
  updateProfile: (updates: {
    fullName?: string;
    phone?: string;
  }) => Promise<{ error: Error | null; user?: UserProfile }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Restore cached user for instant UI — Supabase session validation happens in initAuth
    const saved = localStorage.getItem('practicekoro_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Discard legacy mock/demo users in production when NOT in demo mode
        if (
          !isDemoModeEnabled &&
          (parsed?.id?.startsWith('usr-') ||
            parsed?.email === 'student@practicekoro.com' ||
            parsed?.id === 'usr-admin-001')
        ) {
          localStorage.removeItem('practicekoro_user');
          localStorage.removeItem('practicekoro_is_pro');
          return null;
        }
        return parsed;
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
    if (!isSupabaseConfigured || isDemoModeEnabled) {
      setLoading(false);
      return;
    }

    /**
     * Resolve the full UserProfile from Supabase, including authoritative role
     * from user_roles + profiles tables. If the user's email is in the
     * ADMIN_EMAILS allow-list, auto-promote via sync_admin_profile RPC.
     */
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
        const emailIsAdmin = isAdminEmail(supabaseUser.email);
        const isAdminUser =
          userRoles.some((r) => r.role === 'admin') || profile?.role === 'admin' || emailIsAdmin;
        const effectiveRole: UserRole = isAdminUser ? 'admin' : profile?.role || 'student';

        // Auto-promote admin-listed emails in database (server-side via SECURITY DEFINER RPC)
        if (
          emailIsAdmin &&
          (profile?.role !== 'admin' || !userRoles.some((r) => r.role === 'admin'))
        ) {
          try {
            const rpcResult = await supabase.rpc('sync_admin_profile');
            if (rpcResult.error) {
              await Promise.all([
                supabase
                  .from('user_roles')
                  .upsert(
                    { user_id: supabaseUser.id, role: 'admin' },
                    { onConflict: 'user_id,role' }
                  ),
                supabase.from('profiles').update({ role: 'admin' }).eq('id', supabaseUser.id),
              ]);
            }
            if (profile) profile.role = 'admin';
          } catch (promoteErr) {
            console.warn('Auto admin promotion sync warning:', promoteErr);
          }
        }

        const meta = supabaseUser.user_metadata || {};
        const metaFullName = ((meta.full_name || meta.name || '') as string).trim();
        const metaAvatar = ((meta.avatar_url || meta.picture || '') as string).trim();

        // Create profile if it doesn't exist yet (e.g. first Google sign-in)
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
          // Sync avatar or full_name from Google OAuth if missing from profile
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

        const adminSubRole: AdminRole =
          profile?.admin_role === 'content_writer' || profile?.admin_role === 'support_agent'
            ? (profile.admin_role as AdminRole)
            : 'super_admin';

        return {
          id: profile?.id || supabaseUser.id,
          fullName:
            profile?.full_name || metaFullName || supabaseUser.email?.split('@')[0] || 'User',
          email: profile?.email || supabaseUser.email || '',
          phone: profile?.phone ?? undefined,
          avatarUrl: profile?.avatar_url || metaAvatar || undefined,
          targetExamId: profile?.target_exam_id ?? undefined,
          role: effectiveRole,
          adminRole: effectiveRole === 'admin' ? adminSubRole : undefined,
          createdAt: profile?.created_at || new Date().toISOString(),
        };
      } catch (err) {
        console.error('Supabase profile resolve error:', err);
        const meta = supabaseUser.user_metadata || {};
        const fallbackIsAdmin = isAdminEmail(supabaseUser.email);
        return {
          id: supabaseUser.id,
          fullName: meta.full_name || meta.name || supabaseUser.email?.split('@')[0] || 'User',
          email: supabaseUser.email || '',
          avatarUrl: meta.avatar_url || meta.picture || undefined,
          // Fallback: use isAdminEmail only for the error path to avoid locking admins out
          role: fallbackIsAdmin ? 'admin' : 'student',
          adminRole: fallbackIsAdmin ? 'super_admin' : undefined,
          createdAt: new Date().toISOString(),
        };
      }
    };

    // Check active Supabase session on mount
    const initAuth = async () => {
      try {
        // Handle OAuth PKCE code exchange from redirect
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
        } else {
          // No valid session — clear any stale cached user
          setUser(null);
          localStorage.removeItem('practicekoro_user');
          localStorage.removeItem('practicekoro_is_pro');
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
        setUser(null);
        localStorage.removeItem('practicekoro_user');
        localStorage.removeItem('practicekoro_is_pro');
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
    // NOTE: do NOT toggle the global `loading` flag here. Route guards
    // (ProtectedRoute/AdminRoute/PublicOnlyRoute) replace their children with
    // a spinner while loading is true, which would unmount the Login/Register
    // form mid-submit and silently discard the result/error. Those pages show
    // their own local progress state instead. `loading` is only for the
    // initial session bootstrap in the effect above.
    try {
      if (!isSupabaseConfigured) {
        return {
          error: new Error('Authentication service is not configured. Please try again later.'),
        };
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
        const emailIsAdmin = isAdminEmail(email) || isAdminEmail(data.user.email);
        const isAdminUser =
          userRoles.some((r) => r.role === 'admin') || profile?.role === 'admin' || emailIsAdmin;
        authenticatedRole = isAdminUser ? 'admin' : profile?.role || 'student';

        // Auto-promote admin-listed emails
        if (
          emailIsAdmin &&
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
    }
  };

  const loginWithGoogle = async (targetRedirect?: string): Promise<{ error: Error | null }> => {
    // NOTE: same as login() — do not toggle global `loading` (see above).
    try {
      if (!isSupabaseConfigured) {
        return {
          error: new Error('Authentication service is not configured. Please try again later.'),
        };
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
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string
  ): Promise<{ error: Error | null; role?: UserRole }> => {
    // NOTE: same as login() — do not toggle global `loading` (see above).
    try {
      if (!isSupabaseConfigured) {
        return {
          error: new Error('Authentication service is not configured. Please try again later.'),
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) return { error };

      // Registration always creates student accounts.
      // Admin role can only be assigned through direct database operations.
      const registeredRole: UserRole = 'student';

      if (data.user) {
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

        try {
          await supabase.auth.updateUser({
            data: { full_name: updatedFullName },
          });
        } catch (authErr) {
          console.warn('Could not sync user_metadata in auth:', authErr);
        }
      }

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

  // Role is determined exclusively from the database-resolved user profile
  const role: UserRole = user?.role || 'student';
  const isAdmin = role === 'admin';
  const isStudent = role === 'student';
  const adminRole: AdminRole = user?.adminRole || (isAdmin ? 'super_admin' : 'content_writer');
  const permissions: AdminPermissions = getAdminPermissions(adminRole);

  const hasPermission = (permission: keyof AdminPermissions): boolean => {
    if (!isAdmin) return false;
    return Boolean(permissions[permission]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        adminRole,
        permissions,
        hasPermission,
        isAdmin,
        isStudent,
        isPro,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
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
