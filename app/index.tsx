import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
      if (session) {
        router.replace('/day');
      } else {
        router.replace('/auth/login');
      }
    };
    checkSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
      if (newSession) {
        router.replace('/day');
      } else {
        router.replace('/auth/login');
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;
  return null;
}
