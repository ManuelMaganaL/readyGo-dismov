import React from 'react';
import { Tabs } from 'expo-router';
import { UserCircleIcon, Calendar, Sun, ListTodo, Settings } from 'lucide-react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AuthGuard from '@/app/components/auth-guard';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
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
