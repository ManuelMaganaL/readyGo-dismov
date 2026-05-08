import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/backend/supabase';

import { Session } from '@supabase/supabase-js';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (!session) {
        router.replace('/auth/login');
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

  if (!session) return null;
  return <>{children}</>;
}
