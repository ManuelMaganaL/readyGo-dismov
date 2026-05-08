import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Linking,
  ScrollView,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail,
  Headphones,
  ChevronRight,
  HelpCircle,
  ChevronDown
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQItem = ({ question, answer, colors, styles }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  return (
    <TouchableOpacity
      style={[styles.faqItem, isOpen && { borderColor: colors.main + '40' }]}
      onPress={toggleOpen}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <ThemedText style={styles.faqQuestion}>{question}</ThemedText>
        <Animated.View style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}>
          <ChevronDown size={20} color={colors.mid_accent} />
        </Animated.View>
      </View>
      {isOpen && (
        <ThemedText style={styles.faqAnswer}>{answer}</ThemedText>
      )}
    </TouchableOpacity>
  );
};

const ContactCard = ({ icon: Icon, title, subtitle, color, onPress, index, colors, styles }: any) => {
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
        styles.contactCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.cardTouchable}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <View style={[styles.iconWrapper, { backgroundColor: color + '20' }]}>
          <Icon size={28} color={color} />
        </View>
        <View style={styles.cardInfo}>
          <ThemedText style={styles.cardTitle}>{title}</ThemedText>
          <ThemedText style={styles.cardSubtitle}>{subtitle}</ThemedText>
        </View>
        <ChevronRight size={20} color={colors.light_accent} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const SupportScreen = () => {
  const { colors, dark } = useTheme();
  const styles = createStyles(colors, dark);
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
            <ThemedText type='title' style={styles.titleText}>Soporte</ThemedText>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.introBox}>

            <ThemedText style={styles.introTitle}>¿Cómo podemos ayudarte?</ThemedText>
            <ThemedText style={styles.introSubtitle}>
              Nuestro equipo está disponible para resolver tus dudas lo más pronto posible.
            </ThemedText>
          </View>

          <View style={styles.cardsContainer}>
            <ContactCard
              index={0}
              icon={MessageCircle}
              title="WhatsApp"
              subtitle="Respuesta casi instantánea"
              color="#25D366"
              onPress={handleWhatsApp}
              colors={colors}
              styles={styles}
            />
            <ContactCard
              index={1}
              icon={Phone}
              title="Llamar"
              subtitle="Atención telefónica directa"
              color={colors.main}
              onPress={handlePhone}
              colors={colors}
              styles={styles}
            />
            <ContactCard
              index={2}
              icon={Mail}
              title="Correo Electrónico"
              subtitle="Consultas generales"
              color="#E1B12C"
              onPress={handleEmail}
              colors={colors}
              styles={styles}
            />
          </View>

          <View style={styles.faqSection}>
            <View style={styles.faqHeaderMain}>
              <HelpCircle size={22} color={colors.main} />
              <ThemedText style={styles.faqSectionTitle}>Preguntas Frecuentes</ThemedText>
            </View>

            <FAQItem
              colors={colors}
              styles={styles}
              question="¿Cómo cambio mi contraseña?"
              answer="Ve a Ajustes > Seguridad y Contraseña para actualizar tus credenciales de acceso."
            />
            <FAQItem
              colors={colors}
              styles={styles}
              question="¿Las notificaciones no llegan?"
              answer="Asegúrate de haber otorgado permisos en los ajustes de tu teléfono y dentro de la pestaña de Ajustes de la app."
            />
            <FAQItem
              colors={colors}
              styles={styles}
              question="¿Cómo agrego una nueva actividad?"
              answer="En el Dashboard principal, toca el botón '+' para seleccionar una actividad de la lista."
            />
          </View>

          <ThemedText style={styles.footerText}>ReadyGo Support</ThemedText>
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
      marginTop: 20,
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
    cardsContainer: {
      gap: 12,
      marginBottom: 32,
    },
    contactCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    cardTouchable: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    iconWrapper: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    cardInfo: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    cardSubtitle: {
      fontSize: 13,
      color: colors.mid_accent,
      marginTop: 2,
      fontWeight: '500',
    },
    faqSection: {
      marginTop: 8,
      paddingBottom: 20,
    },
    faqHeaderMain: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    faqSectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      marginLeft: 10,
    },
    faqItem: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    faqHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    faqQuestion: {
      fontSize: 15,
      fontWeight: '700',
      flex: 1,
      paddingRight: 10,
    },
    faqAnswer: {
      fontSize: 14,
      color: colors.mid_accent,
      marginTop: 12,
      lineHeight: 20,
    },
    footerText: {
      fontSize: 13,
      color: colors.light_accent,
      textAlign: 'center',
      fontWeight: '600',
      marginTop: 20,
    },
  });

export default SupportScreen;