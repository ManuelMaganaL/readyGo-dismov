import React from 'react';
import { Tabs } from 'expo-router';
import { Calendar, Sun, ListTodo, Settings } from 'lucide-react-native';

import { HapticTab } from '@/components/haptic-tab';
import AuthGuard from '@/components/auth-guard';
import { useTheme } from '@/context/ThemeContext';

function TabsContent() {
  const { colors } = useTheme();

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.main,
          tabBarInactiveTintColor: colors.icon,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.card,
          }
        }}
      >
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ color }) => <Calendar color={color}/>,
          }}
        />
        <Tabs.Screen
          name="day"
          options={{
            title: 'Day',
            tabBarIcon: ({ color }) => <Sun color={color}/>
          }}
        />
        <Tabs.Screen
          name="activities"
          options={{
            title: 'Activities',
            tabBarIcon: ({ color }) => <ListTodo color={color}/>,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Settings color={color}/>,
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}

export default function TabLayout() {
  return <TabsContent />;
}