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
} from 'react-native';
import { Eye, EyeClosed } from 'lucide-react-native';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ACCENT_COLOR } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();

  // Estados
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Estados de UI
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Validación
  useEffect(() => {
    const isValidEmail = email.includes('@') && email.length > 5;
    setIsFormValid(isValidEmail && password.length > 0);
  }, [email, password]);

  const handleLogin = () => {
    if (isFormValid) {
      setFeedback('¡Sesión iniciada!');
      setTimeout(() => {
        router.replace('/');
      }, 700);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Iniciar Sesión</ThemedText>
          <ThemedText style={styles.subtitle}>
            Bienvenido de nuevo. Ingresa tus datos.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.form}>
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

          <TouchableOpacity
            style={[
              styles.button,
              !isFormValid && styles.buttonDisabled
            ]}
            onPress={handleLogin}
            disabled={!isFormValid}
            activeOpacity={0.8}
          >
            <ThemedText style={[
              styles.buttonText,
              !isFormValid && styles.buttonTextDisabled
            ]}>
              INICIAR SESIÓN
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.footer}>
          <ThemedText style={styles.footerText}>
            ¿No tienes cuenta?{' '}
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <ThemedText style={styles.linkText}>
              Regístrate
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
