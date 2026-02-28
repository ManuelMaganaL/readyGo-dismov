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
import { ACCENT_COLOR, DANGER_COLOR } from '@/constants/theme';
import { signUp } from '@/backend/session';

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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
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
                placeholderTextColor="#ccc"
                cursorColor="#000"
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
                placeholderTextColor="#ccc"
                cursorColor="#000"
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
                placeholderTextColor="#ccc"
                cursorColor="#000"
              />
              <TouchableOpacity 
                onPress={() => setIsPasswordVisible(!isPasswordVisible)} 
                style={styles.eyeIcon}
              >
                {isPasswordVisible ? 
                  <Eye color={ACCENT_COLOR}/> 
                : 
                  <EyeClosed color={ACCENT_COLOR}/>
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
                placeholderTextColor="#ccc"
                cursorColor="#000"
              />
            </ThemedView>
          </ThemedView>

          {password !== confirmPassword && confirmPassword.length > 0 && (
            <ThemedText style={styles.errorText}>Las contraseñas no coinciden</ThemedText>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              !isFormValid && styles.buttonDisabled
            ]}
            onPress={handleRegister}
            disabled={!isFormValid}
            activeOpacity={0.8}
          >
            <ThemedText style={[
              styles.buttonText,
              !isFormValid && styles.buttonTextDisabled
            ]}>
              REGISTRARSE
            </ThemedText>
          </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: ACCENT_COLOR,
    fontWeight: '400',
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 8,
    letterSpacing: 1,
  },
  labelFocused: {
    color: '#000',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  inputWrapperFocused: {
    borderBottomColor: '#000',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 4,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: DANGER_COLOR,
    fontSize: 12,
    marginTop: -15,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  feedbackBox: {
    backgroundColor: '#E0F7FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  feedbackText: {
    color: '#00796B',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonDisabled: {
    backgroundColor: '#F0F0F0',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  buttonTextDisabled: {
    color: '#aaa',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#888',
  },
  linkText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
