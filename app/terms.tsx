import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  StatusBar,
  ScrollView
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const TermsScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="arrow-back" size={32} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Términos</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Aceptación</Text>
          <Text style={styles.bodyText}>
            Al acceder y utilizar esta aplicación, usted acepta cumplir con estos términos y condiciones de uso. Si no está de acuerdo, le pedimos que no utilice el servicio.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Uso de la cuenta</Text>
          <Text style={styles.bodyText}>
            Usted es responsable de mantener la confidencialidad de su cuenta y contraseña. Todas las actividades realizadas bajo su nombre de usuario serán su responsabilidad.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Privacidad</Text>
          <Text style={styles.bodyText}>
            Sus datos personales están protegidos según nuestras políticas de seguridad interna. No compartimos información sensible con terceros sin su consentimiento explícito.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Propiedad Intelectual</Text>
          <Text style={styles.bodyText}>
            Todo el contenido, diseño y código de esta aplicación son propiedad exclusiva del desarrollador. Queda prohibida su reproducción total o parcial.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Modificaciones</Text>
          <Text style={styles.bodyText}>
            Nos reservamos el derecho de actualizar estos términos en cualquier momento. Se notificará a los usuarios sobre cambios importantes en la aplicación.
          </Text>
        </View>

        <Text style={styles.footerText}>Última actualización: Marzo 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 30,
    marginBottom: 40, 
  },
  backButton: {
    marginRight: 20,
  },
  title: {
    fontSize: 36, 
    fontWeight: '800', 
    color: '#000',
    letterSpacing: -1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 26,
    textAlign: 'justify',
  },
  footerText: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '500',
  },
});

export default TermsScreen;