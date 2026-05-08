import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  StatusBar,
  Image,
  View,
} from 'react-native';
import { Eye, EyeClosed } from 'lucide-react-native';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { signUp } from '@/backend/session';
import Button from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';

export default function RegisterScreen() {
  const router = useRouter();

  // Estados
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

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
    const isValidUsername = username.length > 2;
    const passwordsMatch = password === confirmPassword && password.length > 0;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsFormValid(isValidEmail && isValidUsername && passwordsMatch);
  }, [email, password, confirmPassword, username]);

  const handleRegister = async () => {
    if (!isFormValid) return;
    setFeedback(null);
    try {
      await signUp(username, email, password);
      setFeedback('Cuenta creada. Inicia sesión con tu nueva cuenta');
      setTimeout(() => router.replace('/auth/login'), 2000);
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : 'Error al registrarse.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <ThemedView style={styles.header}>
          <ThemedText type='title'>Crear Perfil</ThemedText>
          <ThemedText style={styles.subtitle}>
            Únete y comienza la experiencia.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.form}>
          {feedback && (
            <ThemedView style={styles.feedbackBox}>
              <ThemedText style={styles.feedbackText}>{feedback}</ThemedText>
            </ThemedView>
          )}

          <ThemedView style={styles.inputContainer}>
            <ThemedText style={[styles.label, focusedInput === 'username' && styles.labelFocused]}>
              NOMBRE DE USUARIO
            </ThemedText>
            <ThemedView style={[styles.inputWrapper, focusedInput === 'username' && styles.inputWrapperFocused]}>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                onFocus={() => setFocusedInput('username')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="none"
                placeholderTextColor={colors.light_accent}
                cursorColor={colors.tint}
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.inputContainer}>
            <ThemedText style={[styles.label, focusedInput === 'email' && styles.labelFocused]}>
              EMAIL
            </ThemedText>
            <ThemedView style={[styles.inputWrapper, focusedInput === 'email' && styles.inputWrapperFocused]}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="none"
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
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="none"
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

          <ThemedView style={styles.inputContainer}>
            <ThemedText style={[styles.label, focusedInput === 'confirm' && styles.labelFocused]}>
              CONFIRMAR CONTRASEÑA
            </ThemedText>
            <ThemedView style={[styles.inputWrapper, focusedInput === 'confirm' && styles.inputWrapperFocused]}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!isPasswordVisible}
                onFocus={() => setFocusedInput('confirm')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="none"
                placeholderTextColor={colors.light_accent}
                cursorColor={colors.tint}
              />
            </ThemedView>
          </ThemedView>

          {password !== confirmPassword && confirmPassword.length > 0 && (
            <ThemedText style={styles.errorText}>Las contraseñas no coinciden</ThemedText>
          )}

          <Button
            text='Registrarse'
            onPress={handleRegister}
            style='main'
            disabled={!isFormValid}
          />
        </ThemedView>

        <ThemedView style={styles.footer}>
          <ThemedText style={styles.footerText}>
            ¿Ya tienes cuenta?{' '}
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <ThemedText style={styles.linkText}>
              Inicia Sesión
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
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
      marginBottom: 10,
      backgroundColor: 'transparent',
    },
    logo: {
      width: 100,
      height: 100,
    },
    header: {
      marginBottom: 30,
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
      marginBottom: 20,
      backgroundColor: 'transparent',
    },
    inputContainer: {
      marginBottom: 20,
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
      height: 56,
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
    errorText: {
      color: '#FF3B30',
      fontSize: 12,
      fontWeight: '600',
      marginTop: 6,
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
