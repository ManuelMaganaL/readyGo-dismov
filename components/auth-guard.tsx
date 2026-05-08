import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/backend/supabase';

import { Session } from '@supabase/supabase-js';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        // getSession() reads from local storage — works offline
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (!session) {
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('AuthGuard session error:', error);
        // If we can't check, redirect to login
        router.replace('/auth/login');
      } finally {
        setIsChecking(false);
      }
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        router.replace('/auth/login');
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (isChecking || !session) return null;
  return <>{children}</>;
}

