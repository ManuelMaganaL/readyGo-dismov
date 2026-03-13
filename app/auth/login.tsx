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
import { Eye, EyeClosed } from 'lucide-react-native';

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
      if (user) router.push('/');
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
      setFeedback(error);
      setTimeout(() => setFeedback(null), 4000);
    } else {
      router.push('/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.content}
        >
          <ThemedView style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </ThemedView>
          <ThemedView style={styles.header}>
            <ThemedText type='title'>Iniciar Sesión</ThemedText>
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
                    <Eye color={colors.accent}/> 
                  : 
                    <EyeClosed color={colors.accent}/>
                  }
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>

            <Button
              text='Inicia sesión'
              style={"main"}
              onPress={handleLogin}
              disabled={!isFormValid}
            />
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
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 200,
    height: 200,
  },
  header: {
    marginBottom: 40,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '400',
  },
  form: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    marginBottom: 25,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mid_accent,
    marginBottom: 8,
    letterSpacing: 1,
  },
  labelFocused: {
    color: colors.tint,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light_accent,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  inputWrapperFocused: {
    borderColor: colors.main,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.tint,
    paddingVertical: 6,
  },
  eyeIcon: {
    padding: 4,
  },
  feedbackBox: {
    backgroundColor: colors.danger,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  feedbackText: {
    color: colors.opposite_text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    backgroundColor: 'transparent',
  },
  footerText: {
    color: colors.mid_accent,
  },
  linkText: {
    color: colors.text,
    fontWeight: 'bold',
  },
});
