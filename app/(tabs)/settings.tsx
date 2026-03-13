import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Alert, Pressable, LayoutAnimation, Platform, UIManager, Linking, Animated, Easing } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Lock, Bell, Moon, Info, FileText, LogOut, Clock3 } from 'lucide-react-native';
import { requestNotificationPermissions, getNotificationsEnabled, saveNotificationsEnabled, getReminderMinutes, saveReminderMinutes, getNotificationPermissionState } from '@/utils/notifications';

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
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [isCloseSessionModalVisible, setIsCloseSessionModalVisible] = useState(false);
  const reminderOptions = [5, 10, 15, 30];
  const reminderContentAnim = useRef(new Animated.Value(0)).current;

  const { dark, colors, setDark } = useTheme();
  const styles = createStyles(colors);

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    const sessionInfo = await getSessionInfo();
    if (!sessionInfo) {
      router.push('/auth/login');
      return;
    }

    const userInfo = await getUserInfo(sessionInfo.id);
    if (!userInfo) {
      router.push('/auth/login');
      return;
    }

    setUser({
      id: userInfo.id,
      username: userInfo.username,
      email: userInfo.email,
      avatar_url: userInfo.avatar_url ?? null,
      created_at: userInfo.created_at,
    });
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    getNotificationsEnabled().then(setNotificationsEnabled);
    getReminderMinutes().then(setReminderMinutes);
  }, []);

  useEffect(() => {
    Animated.timing(reminderContentAnim, {
      toValue: notificationsEnabled ? 1 : 0,
      duration: 620,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    }).start();
  }, [notificationsEnabled, reminderContentAnim]);

  const handleReminderMinutes = async (minutes: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setReminderMinutes(minutes);
    await saveReminderMinutes(minutes);
  };

  const handleNotificationsToggle = async (value: boolean) => {
    if (value) {
      const state = await getNotificationPermissionState();
      if (state === 'simulator') {
        Alert.alert(
          'No disponible en emulador',
          'Las notificaciones push requieren un dispositivo físico para funcionar correctamente.'
        );
        return;
      }

      const granted = await requestNotificationPermissions();
      if (!granted) {
        const newState = await getNotificationPermissionState();
        if (newState === 'denied-blocked') {
          Alert.alert(
            'Permiso bloqueado',
            'Debes activar las notificaciones desde los ajustes del sistema para esta app.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }

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
    loadUser();
  }, [loadUser]);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  return (
    <>
      {isLoading ? (
        <LoaderSpinner/>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
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
                <ThemedView style={styles.reminderCardWrapper}>
                <ThemedView style={styles.reminderCard}>
                  <ThemedView style={styles.reminderHeader}>
                    <ThemedView style={styles.reminderIconBox}>
                      <Clock3 color={colors.mid_accent} size={18} />
                    </ThemedView>
                    <ThemedView style={styles.reminderTextContainer}>
                      <ThemedText type="defaultSemiBold">Recordatorio antes</ThemedText>
                      <Animated.View
                        style={{
                          opacity: reminderContentAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.82, 1],
                          }),
                        }}
                      >
                        <ThemedText style={styles.reminderSubtitle}>
                          {notificationsEnabled
                            ? `Te avisaremos ${reminderMinutes} min antes de iniciar.`
                            : 'Activa notificaciones push para usar recordatorios.'}
                        </ThemedText>
                      </Animated.View>
                    </ThemedView>
                  </ThemedView>

                  <Animated.View
                    style={[
                      styles.reminderOptionsRow,
                      {
                        opacity: reminderContentAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.78, 1],
                        }),
                      },
                    ]}
                  >
                    {reminderOptions.map((minutes) => {
                      const isActive = reminderMinutes === minutes;
                      return (
                        <Pressable
                          key={minutes}
                          disabled={!notificationsEnabled}
                          onPress={() => handleReminderMinutes(minutes)}
                          style={[
                            styles.reminderChip,
                            {
                              backgroundColor: isActive ? colors.main : colors.secondary,
                              opacity: notificationsEnabled ? 1 : 0.5,
                            },
                          ]}
                        >
                          <ThemedText
                            type="defaultSemiBold"
                            style={{ color: isActive ? '#fff' : colors.text }}
                          >
                            {minutes}m
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </Animated.View>
                </ThemedView>
                </ThemedView>
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
    scrollView: {
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      backgroundColor: colors.background,
      paddingBottom: 10,
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
    reminderCard: {
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.mid_accent,
      gap: 12,
    },
    reminderCardWrapper: {
      marginHorizontal: 24,
      marginVertical: 8,
    },
    reminderHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    reminderTextContainer: {
      flex: 1,
      minWidth: 0,
    },
    reminderIconBox: {
      width: 30,
      height: 30,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reminderSubtitle: {
      fontSize: 12,
      lineHeight: 14,
      opacity: 0.75,
      marginTop: 2,
      flexWrap: 'wrap',
    },
    reminderOptionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
    },
    reminderChip: {
      width: 64,
      minHeight: 38,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    versionText: {
      textAlign: 'center',
      color: colors.light_accent,
      fontSize: 12,
      marginTop: 40,
    },
  });