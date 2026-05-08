import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, DarkTheme, ThemeProvider as ReactThemeProvider } from '@react-navigation/native'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { UserProvider } from '@/context/UserContext';
import { ActivitiesProvider } from '@/context/ActivitiesContext';
import { initializeNotifications } from '@/utils/notifications';

SplashScreen.preventAutoHideAsync();

function NavigationLayout() {
  const { dark } = useTheme();
  return (
    <ReactThemeProvider value={dark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="activities/[id]" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="security" />
        <Stack.Screen name="support" />
        <Stack.Screen name="terms" />
      </Stack>
      <StatusBar style="auto" />
    </ReactThemeProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    initializeNotifications().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <UserProvider>
          <ActivitiesProvider>
            <NavigationLayout />
          </ActivitiesProvider>
        </UserProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}