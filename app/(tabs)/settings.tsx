import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { Lock, Bell, Moon, Info, FileText, LogOut } from 'lucide-react-native';
import { requestNotificationPermissions, getNotificationsEnabled, saveNotificationsEnabled } from '@/utils/notifications';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import LoaderSpinner from '@/components/loader-spinner';
import UserHeader from '@/components/layout/user-header';
import SettingItem from '@/components/layout/setting-item';
import CloseSessionModal from '@/components/modal/close-session';

import { getSessionInfo, getUserInfo } from '@/backend/session';

import { User } from '@/types';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsTab() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isCloseSessionModalVisible, setIsCloseSessionModalVisible] = useState(false);

  const { dark, colors, setDark } = useTheme();
  const styles = createStyles(colors);

  useEffect(() => {
    getNotificationsEnabled().then(setNotificationsEnabled);
  }, []);

  const handleNotificationsToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Permisos denegados',
          'Para recibir notificaciones, actívalas manualmente en los ajustes de tu dispositivo.',
          [{ text: 'Entendido' }]
        );
        return;
      }
    }
    setNotificationsEnabled(value);
    await saveNotificationsEnabled(value);
  };

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
    
              <ThemedText style={styles.sectionTitle}>CUENTA</ThemedText>
              <ThemedView>
                <SettingItem 
                  icon={<Lock color={colors.mid_accent}/>} 
                  label="Seguridad y Contraseña" 
                  onPress={() => router.push('/security')} 
                />
              </ThemedView>
    
              <ThemedText style={styles.sectionTitle}>PREFERENCIAS</ThemedText>
              <ThemedView>
                <SettingItem 
                  icon={<Bell color={colors.mid_accent}/>}
                  label="Notificaciones Push" 
                  type="switch"
                  value={notificationsEnabled}
                  onValueChange={handleNotificationsToggle}
                />
                <SettingItem 
                  icon={<Moon color={colors.mid_accent}/>} 
                  label="Modo Oscuro" 
                  type="switch"
                  value={dark}
                  onValueChange={setDark}
                />
              </ThemedView>
    
              <ThemedText style={styles.sectionTitle}>SOPORTE</ThemedText>
              <ThemedView>
                <SettingItem 
                  icon={<Info color={colors.mid_accent}/>} 
                  label="Ayuda y Soporte" 
                  onPress={() => router.push('/support')} 
                />
                <SettingItem 
                  icon={<FileText color={colors.mid_accent}/>} 
                  label="Términos y Condiciones" 
                  onPress={() => router.push('/terms')} 
                />
              </ThemedView>
              
              <ThemedView style={styles.closeSessionButton}>
                <SettingItem 
                  icon={<LogOut color={colors.danger}/>}
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

const createStyles = (colors: any) =>
  StyleSheet.create({
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
      color: colors.mid_accent,
      marginTop: 20,
      marginBottom: 10,
      paddingHorizontal: 24,
      letterSpacing: 1,
    },
    versionText: {
      textAlign: 'center',
      color: colors.light_accent,
      fontSize: 12,
      marginTop: 40,
    },
  });