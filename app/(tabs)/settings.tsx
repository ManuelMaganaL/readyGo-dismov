import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  type?: 'link' | 'switch' | 'button';
  value?: boolean;
  onPress?: () => void;
  onValueChange?: (val: boolean) => void;
  isDestructive?: boolean;
}

const SettingsScreen = () => {
  const router = useRouter();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const SettingItem = ({ 
    icon, 
    label, 
    type = 'link', 
    value, 
    onPress, 
    onValueChange,
    isDestructive = false
  }: SettingItemProps) => (
    <TouchableOpacity 
      style={styles.itemContainer} 
      onPress={type !== 'switch' ? onPress : undefined}
      activeOpacity={type === 'switch' ? 1 : 0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, isDestructive && styles.iconBoxDestructive]}>
          <Ionicons 
            name={icon} 
            size={20} 
            color={isDestructive ? "#E53935" : "#000"} 
          />
        </View>
        <Text style={[styles.itemText, isDestructive && styles.itemTextDestructive]}>
          {label}
        </Text>
      </View>

      <View style={styles.itemRight}>
        {type === 'switch' ? (
          <Switch
            trackColor={{ false: "#e0e0e0", true: "#000" }}
            thumbColor={"#fff"}
            ios_backgroundColor="#e0e0e0"
            onValueChange={onValueChange}
            value={value}
          />
        ) : (
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        )}
      </View>
    </TouchableOpacity>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Ajustes</Text>
        </View>

        {/* Tarjeta de Perfil */}
        <View style={styles.profileCard}>
          <View style={styles.avatarPlaceholder}>
             <Ionicons name="person" size={30} color="#999" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Nombre de Usuario</Text>
            <Text style={styles.profileEmail}>usuario@email.com</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push('/edit-profile')}
          >
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Sección CUENTA (Se eliminó Información Personal) */}
        <SectionTitle title="CUENTA" />
        <View style={styles.sectionContainer}>
          <SettingItem 
            icon="lock-closed-outline" 
            label="Seguridad y Contraseña" 
            onPress={() => router.push('/security')} 
          />
        </View>

        <SectionTitle title="PREFERENCIAS" />
        <View style={styles.sectionContainer}>
          <SettingItem 
            icon="notifications-outline" 
            label="Notificaciones Push" 
            type="switch"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          <SettingItem 
            icon="moon-outline" 
            label="Modo Oscuro" 
            type="switch"
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
          />
        </View>

        <SectionTitle title="SOPORTE" />
        <View style={styles.sectionContainer}>
          <SettingItem 
            icon="help-circle-outline" 
            label="Ayuda y Soporte" 
            onPress={() => router.push('/support')} 
          />
          <SettingItem 
            icon="document-text-outline" 
            label="Términos y Condiciones" 
            onPress={() => router.push('/terms')} 
          />
        </View>

        <View style={[styles.sectionContainer, styles.marginTop]}>
          <SettingItem 
            icon="log-out-outline" 
            label="Cerrar Sesión" 
            isDestructive 
             onPress={() => Alert.alert("Cerrar Sesión", "¿Estás seguro que deseas cerrar la sesión?", [
               { text: "Cancelar", style: "cancel" },
               { text: "Sí", style: "destructive", onPress: () => router.replace('/auth/login') }
             ])} 
          />
        </View>

        <Text style={styles.versionText}>Versión 1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#888',
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#aaa',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 24,
    letterSpacing: 1,
  },
  sectionContainer: {
    backgroundColor: '#fff',
  },
  marginTop: {
    marginTop: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconBoxDestructive: {
    backgroundColor: '#FFF0F0',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  itemTextDestructive: {
    color: '#E53935',
    fontWeight: '600',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  versionText: {
    textAlign: 'center',
    color: '#ccc',
    fontSize: 12,
    marginTop: 40,
  },
});

export default SettingsScreen;