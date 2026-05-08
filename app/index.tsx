import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/backend/supabase';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from '@/context/ThemeContext';

export default function Index() {
  const router = useRouter();

  const { colors } = useTheme(); 

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Si tarda más de 5s (sin internet, token expirado, etc.), ir al login
      SplashScreen.hideAsync();
      router.replace('/auth/login');
    }, 5000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timeout);
        SplashScreen.hideAsync();
        router.replace(session ? '/day' : '/auth/login');
      })
      .catch(() => {
        clearTimeout(timeout);
        SplashScreen.hideAsync();
        router.replace('/auth/login');
      });

    return () => clearTimeout(timeout);
  }, []);

  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}