import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  authError: string | null;
  retrySession: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadSession = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth
      .getSession()
      ;

      if (error) {
        setAuthError(
          'Fabricator could not reach account services. You can retry sign-in when the backend is available.'
        );
      } else {
        setAuthError(null);
      }

      setSession(data?.session ?? null);
    } catch {
      setAuthError(
        'Fabricator could not reach account services. You can retry sign-in when the backend is available.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      authError,
      retrySession: loadSession,

      async signUp(email, password) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        setAuthError(null);
      },

      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        setAuthError(null);
      },

      async signOut() {
        const { error } = await supabase.auth.signOut();

        if (error) {
          throw error;
        }

        setAuthError(null);
      },

      async resetPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
          throw error;
        }

        setAuthError(null);
      },
    }),
    [session, isLoading, authError]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}
