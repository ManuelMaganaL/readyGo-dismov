import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/backend/supabase';
import { getSessionInfo, getUserInfo, singOut as supabaseSignOut } from '@/backend/session';
import type { User } from '@/types';
import { saveUserCache, getUserCache } from '@/utils/sqlite';
import * as Network from 'expo-network';

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
      // 1. Try to load cached user first (instant offline support)
      const cached = await getUserCache().catch(() => null);
      if (cached && !user) {
        setUser({
          id: cached.id,
          username: cached.username,
          email: cached.email,
          avatar_url: cached.avatar_url ?? null,
          created_at: cached.created_at,
        });
        // Stop loading immediately — we have a cached user
        if (!silent) setIsLoading(false);
      }

      // 2. Check if we're online
      const network = await Network.getNetworkStateAsync();
      const isOnline = !!(network.isConnected && network.isInternetReachable);

      if (!isOnline) {
        // Offline — use local session check (no network needed)
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && !cached) {
          setUser(null);
          if (!silent) setIsLoading(false);
          return;
        }
        // Keep using cached user
        if (!silent) setIsLoading(false);
        return;
      }

      // 3. Online — verify with server
      const sessionUser = await getSessionInfo();
      if (!sessionUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      let userInfo = await getUserInfo(sessionUser.id);
      
      // Retry logic para mitigar la condicion de carrera durante el registro
      // donde auth.signUp dispara el onAuthStateChange antes de insertar en public.users
      if (!userInfo) {
        for (let i = 0; i < 3; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          userInfo = await getUserInfo(sessionUser.id);
          if (userInfo) break;
        }
      }

      if (userInfo) {
        const userData: User = {
          id: userInfo.id,
          username: userInfo.username,
          email: userInfo.email,
          avatar_url: userInfo.avatar_url ?? null,
          created_at: userInfo.created_at,
        };
        setUser(userData);
        // Cache for offline use
        await saveUserCache(userData).catch(() => {});
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If we don't have a user yet, try cache as last resort
      if (!user) {
        const cached = await getUserCache().catch(() => null);
        if (cached) {
          setUser({
            id: cached.id,
            username: cached.username,
            email: cached.email,
            avatar_url: cached.avatar_url ?? null,
            created_at: cached.created_at,
          });
        }
      }
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

