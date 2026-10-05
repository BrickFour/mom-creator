import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase.js';
import { getMe, signInWithPassword, signUpWithPassword, signOutUser } from '../services/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(isSupabaseConfigured());
  const [authError, setAuthError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const meData = await getMe();
      if (meData) {
        if (meData.user) setUser(meData.user);
        if (meData.profile) setProfile(meData.profile);
      }
    } catch (err) {
      console.warn('Failed to fetch /me profile:', err);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      setConfigured(false);
      return;
    }

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.access_token) {
        // Defer profile loading out of the session check
        setTimeout(() => {
          fetchProfile();
        }, 0);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Session retrieval error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      setConfigured(false);
      return;
    }

    setConfigured(true);
    refreshSession();

    // Defer backend profile loading out of the Supabase onAuthStateChange callback
    // to prevent awaiting while Supabase's internal auth lock is held
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.access_token) {
        setTimeout(() => {
          fetchProfile();
        }, 0);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [refreshSession, fetchProfile]);

  const signIn = async (email, password) => {
    setAuthError(null);
    try {
      const res = await signInWithPassword(email, password);
      setSession(res.session);
      setUser(res.user);
      if (res.session) {
        setTimeout(() => {
          fetchProfile();
        }, 0);
      }
      return res;
    } catch (err) {
      setAuthError(err.message || 'Failed to sign in');
      throw err;
    }
  };

  const signUp = async (email, password, name) => {
    setAuthError(null);
    try {
      const res = await signUpWithPassword(email, password, name);
      if (res.session) {
        setSession(res.session);
        setUser(res.user);
        setTimeout(() => {
          fetchProfile();
        }, 0);
      }
      return res;
    } catch (err) {
      setAuthError(err.message || 'Failed to sign up');
      throw err;
    }
  };


  const requestPasswordReset = async (email) => {
    setAuthError(null);

    const supabase = getSupabase();

    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const normalizedEmail = String(email || '').trim();

    if (!normalizedEmail) {
      throw new Error('Please enter your email address.');
    }

    const redirectTo = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      { redirectTo }
    );

    if (error) {
      setAuthError(error.message || 'Failed to send password reset email.');
      throw error;
    }

    return true;
  };

  const updatePassword = async (password) => {
    setAuthError(null);

    const supabase = getSupabase();

    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setAuthError(error.message || 'Failed to update password.');
      throw error;
    }

    return data;
  };

  const signOut = async () => {
    try {
      await signOutUser();
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        configured,
        authError,
        signIn,
        signUp,
        requestPasswordReset,
        updatePassword,
        signOut,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
