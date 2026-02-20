import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { User, Lock, Bell, Moon, Info, ScrollText } from 'lucide-react-native';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import UserHeader from '@/components/layout/user-header';
import SettingItem from '@/components/layout/setting-item';
import { ACCENT_COLOR, LIGHT_ACCENT_COLOR } from '@/constants/theme';


export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  return (
    <ThemedView style={styles.mainContainer}>
      <UserHeader />

      <ThemedView style={styles.body}>
        <ThemedText type="title">Ajustes</ThemedText>

        <ThemedView style={styles.divider} />

        {/* Sección CUENTA */}
        <ThemedText style={styles.sectionTitle}>CUENTA</ThemedText>
        <ThemedView>
          <SettingItem 
            icon={<User/>} 
            label="Información Personal" 
            onPress={() => { router.replace("/account") }} 
          />
          <SettingItem 
            icon={<Lock/>} 
            label="Seguridad y Contraseña" 
            onPress={() => console.log('Ir a seguridad')} 
          />
        </ThemedView>

        {/* Sección PREFERENCIAS */}
        <ThemedText style={styles.sectionTitle}>PREFERENCIAS</ThemedText>
        <ThemedView>
          <SettingItem 
            icon={<Bell/>}
            label="Notificaciones Push" 
            type="switch"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          <SettingItem 
            icon={<Moon/>} 
            label="Modo Oscuro" 
            type="switch"
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
          />
        </ThemedView>

        {/* Sección SOPORTE */}
        <ThemedText style={styles.sectionTitle}>SOPORTE</ThemedText>
        <ThemedView>
          <SettingItem 
            icon={<Info/>} 
            label="Ayuda y Soporte" 
            onPress={() => console.log('Ayuda')} 
          />
          <SettingItem 
            icon={<ScrollText/>} 
            label="Términos y Condiciones" 
            onPress={() => console.log('Términos')} 
          />
        </ThemedView>

        <ThemedText style={styles.versionText}>Versión 1.0.0</ThemedText>

      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 10,
    padding: 15,
    marginTop: 40,
  },
  body: {
    marginTop: 20,
    flex: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: ACCENT_COLOR,
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 24,
    letterSpacing: 1,
  },
  versionText: {
    textAlign: 'center',
    color: LIGHT_ACCENT_COLOR,
    fontSize: 12,
    marginTop: 40,
  },
});
