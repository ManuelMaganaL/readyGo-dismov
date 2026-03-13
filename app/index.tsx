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
    supabase.auth.getSession().then(({ data: { session } }) => {
      SplashScreen.hideAsync();
      router.replace(session ? '/day' : '/auth/login');
    });
  }, []);

  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}