import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  Handshake, 
  UserCheck, 
  Lock, 
  Info,
  ChevronRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const { width } = Dimensions.get('window');

const TermSection = ({ 
  icon: Icon, 
  title, 
  children, 
  colors, 
  styles,
  index 
}: any) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.sectionCard, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.sectionHeader}>
        <View style={[styles.iconContainer, { backgroundColor: colors.main + '20' }]}>
          <Icon size={20} color={colors.main} />
        </View>
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      </View>
      <ThemedText style={styles.bodyText}>{children}</ThemedText>
    </Animated.View>
  );
};

const TermsScreen = () => {
  const router = useRouter();
  const { colors, dark } = useTheme();
  const styles = createStyles(colors, dark);

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        {/* Header Section */}
        <View style={styles.headerWrapper}>
          <LinearGradient
            colors={[colors.main + '30', 'transparent']}
            style={styles.headerGradient}
          />
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={28} color={colors.text} />
            </TouchableOpacity>
            <ThemedText type='title' style={styles.titleText}>Términos</ThemedText>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.introBox}>

            <ThemedText style={styles.introTitle}>Tu seguridad es primero</ThemedText>
            <ThemedText style={styles.introSubtitle}>
              Revisa cómo protegemos tu información y las reglas de convivencia en ReadyGo.
            </ThemedText>
          </View>

          <TermSection 
            index={0}
            icon={Handshake} 
            title="1. Aceptación" 
            colors={colors} 
            styles={styles}
          >
            Al acceder y utilizar esta aplicación, usted acepta cumplir con estos términos y condiciones de uso. Si no está de acuerdo, le pedimos que no utilice el servicio.
          </TermSection>

          <TermSection 
            index={1}
            icon={UserCheck} 
            title="2. Uso de la cuenta" 
            colors={colors} 
            styles={styles}
          >
            Usted es responsable de mantener la confidencialidad de su cuenta y contraseña. Todas las actividades realizadas bajo su nombre de usuario serán su responsabilidad.
          </TermSection>

          <TermSection 
            index={2}
            icon={Lock} 
            title="3. Privacidad" 
            colors={colors} 
            styles={styles}
          >
            Sus datos personales están protegidos según nuestras políticas de seguridad interna. No compartimos información sensible con terceros sin su consentimiento explícito.
          </TermSection>

          <TermSection 
            index={3}
            icon={FileText} 
            title="4. Propiedad Intelectual" 
            colors={colors} 
            styles={styles}
          >
            Todo el contenido, diseño y código de esta aplicación son propiedad exclusiva del desarrollador. Queda prohibida su reproducción total o parcial.
          </TermSection>

          {/* Contact Section */}
          <TouchableOpacity 
            style={styles.contactCard}
            activeOpacity={0.8}
            onPress={() => router.push('/support')}
          >
            <View style={styles.contactInfo}>
              <Info size={24} color={colors.main} />
              <View style={styles.contactTexts}>
                <ThemedText style={styles.contactTitle}>¿Tienes dudas?</ThemedText>
                <ThemedText style={styles.contactSubtitle}>Contáctanos para más información</ThemedText>
              </View>
            </View>
            <ChevronRight size={20} color={colors.light_accent} />
          </TouchableOpacity>

          <ThemedText style={styles.footerText}>Última actualización: Mayo 2026</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const createStyles = (colors: any, dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
    },
    headerWrapper: {
      backgroundColor: colors.background,
      zIndex: 10,
    },
    headerGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 160,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    titleText: {
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    contentContainer: {
      paddingHorizontal: 20,
      paddingBottom: 60,
    },
    introBox: {
      alignItems: 'center',
      paddingVertical: 30,
      marginBottom: 10,
    },
    introTitle: {
      fontSize: 22,
      fontWeight: '800',
      marginTop: 16,
      textAlign: 'center',
    },
    introSubtitle: {
      fontSize: 15,
      color: colors.mid_accent,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 22,
      paddingHorizontal: 20,
    },
    sectionCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.3,
    },
    bodyText: {
      fontSize: 15,
      color: colors.mid_accent,
      lineHeight: 24,
    },
    contactCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.main + '10',
      padding: 20,
      borderRadius: 20,
      marginTop: 10,
      marginBottom: 30,
      borderWidth: 1,
      borderColor: colors.main + '30',
    },
    contactInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    contactTexts: {
      marginLeft: 16,
    },
    contactTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    contactSubtitle: {
      fontSize: 13,
      color: colors.mid_accent,
      marginTop: 2,
    },
    footerText: {
      fontSize: 13,
      color: colors.light_accent,
      textAlign: 'center',
      fontWeight: '600',
    },
  });

export default TermsScreen;
