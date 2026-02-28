import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  StatusBar,
  Linking,
  ScrollView
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SupportScreen = () => {
  const router = useRouter();

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/528994349854?text=Hola,%20necesito%20ayuda');
  };

  const handlePhone = () => {
    Linking.openURL('tel:8994349854');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:ssbppoo@gmail.com?subject=Soporte%20App');
  };

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
        <Text style={styles.title}>Soporte</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          ¿Tienes algún problema o duda? Estamos aquí para ayudarte. Elige tu medio de contacto preferido.
        </Text>

        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={styles.contactCard} 
            activeOpacity={0.8}
            onPress={handleWhatsApp}
          >
            <View style={[styles.iconWrapper, styles.whatsappIcon]}>
              <Ionicons name="logo-whatsapp" size={45} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>WhatsApp</Text>
            <Text style={styles.cardSubtitle}>Respuesta rápida</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactCard} 
            activeOpacity={0.8}
            onPress={handlePhone}
          >
            <View style={[styles.iconWrapper, styles.phoneIcon]}>
              <Ionicons name="call" size={40} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Llamar</Text>
            <Text style={styles.cardSubtitle}>8994349854</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactCard} 
            activeOpacity={0.8}
            onPress={handleEmail}
          >
            <View style={[styles.iconWrapper, styles.emailIcon]}>
              <Ionicons name="mail" size={40} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Correo</Text>
            <Text style={styles.cardSubtitle}>ssbppoo@gmail.com</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 30,
    marginBottom: 20, 
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
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    marginBottom: 40,
    lineHeight: 26,
    textAlign: 'center',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  contactCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 35,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  whatsappIcon: {
    backgroundColor: '#25D366', 
  },
  phoneIcon: {
    backgroundColor: '#000', 
  },
  emailIcon: {
    backgroundColor: '#000', 
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
});

export default SupportScreen;