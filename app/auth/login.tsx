import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeClosed, Mail, Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import Button from '@/components/ui/button';

import { login, getSessionInfo } from '@/backend/session';
import { useTheme } from '@/context/ThemeContext';


export default function LoginScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const user = await getSessionInfo();
      if (user) router.replace('/');
    };
    checkSession();
  }, []);

  // Estados
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Estados de UI
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Validación
  useEffect(() => {
    const isValidEmail = email.includes('@') && email.length > 5;
    setIsFormValid(isValidEmail && password.length > 0);
  }, [email, password]);

  const handleLogin = async () => {
    const error = await login(email, password);
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFeedback(error);
      setTimeout(() => setFeedback(null), 4000);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.header}>
          <ThemedText type='title'>Iniciar Sesión</ThemedText>
          <ThemedText style={styles.subtitle}>
            Bienvenido de nuevo. Ingresa tus datos.
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.form}>
          {feedback && (
            <ThemedView style={styles.feedbackBox}>
              <ThemedText style={styles.feedbackText}>{feedback}</ThemedText>
            </ThemedView>
          )}

          <ThemedView style={styles.inputContainer}>
            <ThemedText style={[styles.label, focusedInput === 'email' && styles.labelFocused]}>
              EMAIL
            </ThemedText>
            <ThemedView style={[styles.inputWrapper, focusedInput === 'email' && styles.inputWrapperFocused]}>
              <Mail color={focusedInput === 'email' ? colors.main : colors.mid_accent} size={20} style={{marginRight: 10}} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="none"
                placeholder="ejemplo@correo.com"
                placeholderTextColor={colors.light_accent}
                cursorColor={colors.tint}
                keyboardType="email-address"
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.inputContainer}>
            <ThemedText style={[styles.label, focusedInput === 'password' && styles.labelFocused]}>
              CONTRASEÑA
            </ThemedText>
            <ThemedView style={[styles.inputWrapper, focusedInput === 'password' && styles.inputWrapperFocused]}>
              <Lock color={focusedInput === 'password' ? colors.main : colors.mid_accent} size={20} style={{marginRight: 10}} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="none"
                placeholder="••••••••"
                placeholderTextColor={colors.light_accent}
                cursorColor={colors.tint}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.eyeIcon}
              >
                {isPasswordVisible ?
                  <Eye color={colors.accent} />
                  :
                  <EyeClosed color={colors.accent} />
                }
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          <TouchableOpacity 
            onPress={() => router.push('/auth/forgot-password')}
            style={styles.forgotPassword}
          >
            <ThemedText style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</ThemedText>
          </TouchableOpacity>

          <Button
            text='Inicia sesión'
            style={"main"}
            onPress={handleLogin}
            disabled={!isFormValid}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.footer}>
          <ThemedText style={styles.footerText}>
            ¿No tienes cuenta?{' '}
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <ThemedText style={styles.linkText}>
              Regístrate
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    gradient: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 20,
      backgroundColor: 'transparent',
    },
    logo: {
      width: 160,
      height: 160,
    },
    header: {
      marginBottom: 40,
      backgroundColor: 'transparent',
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: colors.mid_accent,
      fontWeight: '500',
      textAlign: 'center',
    },
    form: {
      marginBottom: 10,
      backgroundColor: 'transparent',
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: 25,
      marginTop: -5,
      padding: 4,
    },
    forgotPasswordText: {
      color: colors.mid_accent,
      fontSize: 14,
      fontWeight: '600',
    },
    inputContainer: {
      marginBottom: 24,
      backgroundColor: 'transparent',
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.mid_accent,
      marginBottom: 10,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    labelFocused: {
      color: colors.main,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.light_accent,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 58,
      backgroundColor: colors.card,
    },
    inputWrapperFocused: {
      borderColor: colors.main,
      backgroundColor: colors.card,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    eyeIcon: {
      padding: 8,
    },
    feedbackBox: {
      backgroundColor: 'rgba(255, 59, 48, 0.1)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 59, 48, 0.3)',
    },
    feedbackText: {
      color: '#FF3B30',
      fontWeight: '600',
      fontSize: 14,
      textAlign: 'center',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 30,
      backgroundColor: 'transparent',
    },
    footerText: {
      color: colors.mid_accent,
      fontSize: 15,
    },
    linkText: {
      color: colors.main,
      fontWeight: '700',
      fontSize: 15,
    },
  });
