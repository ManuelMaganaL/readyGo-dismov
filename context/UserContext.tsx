import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/backend/supabase';
import { getSessionInfo, getUserInfo, singOut as supabaseSignOut } from '@/backend/session';
import type { User } from '@/types';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: (silent?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  refreshUser: async () => {},
  signOut: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const sessionUser = await getSessionInfo();
      if (!sessionUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const userInfo = await getUserInfo(sessionUser.id);
      if (userInfo) {
        setUser({
          id: userInfo.id,
          username: userInfo.username,
          email: userInfo.email,
          avatar_url: userInfo.avatar_url ?? null,
          created_at: userInfo.created_at,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    const success = await supabaseSignOut();
    if (success) {
      setUser(null);
      router.replace('/auth/login');
    }
  }, [router]);

  useEffect(() => {
    refreshUser();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        refreshUser(true);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        router.replace('/auth/login');
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [refreshUser, router]);

  return (
    <UserContext.Provider value={{ user, isLoading, refreshUser, signOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
