import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { Lock, Bell, Moon, Info, FileText, LogOut } from 'lucide-react-native';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import LoaderSpinner from '@/components/loader-spinner';
import UserHeader from '@/components/layout/user-header';
import SettingItem from '@/components/layout/setting-item';
import CloseSessionModal from '@/components/modal/close-session';

import { getSessionInfo, getUserInfo } from '@/backend/session';

import { DANGER_COLOR, LIGHT_ACCENT_COLOR, MID_ACCENT_COLOR } from '@/constants/theme';
import { User } from '@/types';


export default function SettingsTab() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [isCloseSessionModalVisible, setIsCloseSessionModalVisible] = useState(false);

  useEffect(() => {
    const isLogedIn = async () => {
      setIsLoading(true);
      const sessionInfo = await getSessionInfo();
      if (!sessionInfo) {
        router.push("/auth/login");
        return;
      }

      const userInfo = await getUserInfo(sessionInfo.id);
      if (!userInfo) {
        router.push("/auth/login");
        return;
      } else {
        setUser({id: userInfo.id, username: userInfo.username, email: userInfo.email, created_at: userInfo.created_at});
      }

      setIsLoading(false);
    }
    isLogedIn();
  }, []);

  return (
    <>
      {isLoading ? (
        <LoaderSpinner/>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.mainContainer}>
            <UserHeader user={user!} isSettings={true}/>
    
            <ThemedView style={styles.body}>
              <ThemedText type="title">Ajustes</ThemedText>
    
              <ThemedView style={styles.divider} />
    
              {/* Sección CUENTA */}
              <ThemedText style={styles.sectionTitle}>CUENTA</ThemedText>
              <ThemedView>
                <SettingItem 
                  icon={<Lock color={MID_ACCENT_COLOR}/>} 
                  label="Seguridad y Contraseña" 
                  onPress={() => router.push('/security')} 
                />
              </ThemedView>
    
              {/* Sección PREFERENCIAS */}
              <ThemedText style={styles.sectionTitle}>PREFERENCIAS</ThemedText>
              <ThemedView>
                <SettingItem 
                  icon={<Bell color={MID_ACCENT_COLOR}/>}
                  label="Notificaciones Push" 
                  type="switch"
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                />
                <SettingItem 
                  icon={<Moon color={MID_ACCENT_COLOR}/>} 
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
                  icon={<Info color={MID_ACCENT_COLOR}/>} 
                  label="Ayuda y Soporte" 
                  onPress={() => router.push('/support')} 
                />
                <SettingItem 
                  icon={<FileText color={MID_ACCENT_COLOR}/>} 
                  label="Términos y Condiciones" 
                  onPress={() => router.push('/terms')} 
                />
              </ThemedView>
              
              <ThemedView style={styles.closeSessionButton}>
                <SettingItem 
                  icon={<LogOut color={DANGER_COLOR}/>}
                  label="Cerrar Sesión" 
                  onPress={() => {setIsCloseSessionModalVisible(true)}} 
                  isDanger={true}
                />
              </ThemedView>
              
              <ThemedText style={styles.versionText}>Versión 1.0.0</ThemedText>
    
              <CloseSessionModal
                isModalVisible={isCloseSessionModalVisible} 
                setIsModalVisible={setIsCloseSessionModalVisible}
              />
    
            </ThemedView>
          </ThemedView>
        </ScrollView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
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
  closeSessionButton: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: MID_ACCENT_COLOR,
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
