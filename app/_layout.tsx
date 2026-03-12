import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, DarkTheme, ThemeProvider as ReactThemeProvider } from '@react-navigation/native'
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeProvider, useTheme } from '@/context/ThemeContext';

import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Unsupported top level event type "topSvgLayout"']);

function NavigationLayout() {
  const { dark } = useTheme();
  return (
    <ReactThemeProvider value={dark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="activities/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={"auto"}></StatusBar>
    </ReactThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <NavigationLayout />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}