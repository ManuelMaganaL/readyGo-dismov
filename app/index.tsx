import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/backend/supabase';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/day');
      } else {
        router.replace('/auth/login');
      }
      setLoading(false);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) {
        router.replace('/day');
      } else {
        router.replace('/auth/login');
      }
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
      <ActivityIndicator size="large" color="#6200EE" /> 
    </View>
  );
}