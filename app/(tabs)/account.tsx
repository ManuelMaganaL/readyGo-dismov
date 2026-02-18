import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  StatusBar,
  TextInputProps,
} from 'react-native';

// Interfaces para TypeScript
interface CustomInputProps extends TextInputProps {
  label: string;
  isFocused: boolean;
  toggleVisibility?: () => void;
}

const AccountScreen = () => {
  const navigation = useNavigation();

  // Estado para alternar entre registro e inicio de sesión
  const [isLogin, setIsLogin] = useState<boolean>(true);

  // Estados
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
    if (isLogin) {
      setIsFormValid(isValidEmail && password.length > 0);
    } else {
      const passwordsMatch = password === confirmPassword && password.length > 0;
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsFormValid(isValidEmail && passwordsMatch);
    }
  }, [email, password, confirmPassword, isLogin]);

  const handleRegister = () => {
    if (isFormValid) {
      setFeedback('¡Registro exitoso!');
      // console.log('Registrando:', email);
    }
  };

  const handleLogin = () => {
    if (isFormValid) {
      setFeedback('¡Sesión iniciada!');
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'index' }],
        });
      }, 700);
    }
  };

  // Componente Input
  const CustomInput: React.FC<CustomInputProps> = ({ 
    label, 
    value, 
    onChangeText, 
    secureTextEntry = false, 
    onFocus, 
    onBlur, 
    isFocused,
    toggleVisibility,
    ...props 
  }) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, isFocused && styles.labelFocused]}>{label}</Text>
      <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          onFocus={onFocus}
          onBlur={onBlur}
          autoCapitalize="none"
          placeholderTextColor="#ccc"
          cursorColor="#000"
          {...props}
        />
        {toggleVisibility && (
          <TouchableOpacity onPress={toggleVisibility} style={styles.eyeIcon}>
            <Text style={styles.eyeText}>
              {secureTextEntry ? "Ver" : "Ocultar"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{isLogin ? 'Iniciar Sesión' : 'Crear Perfil'}</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Bienvenido de nuevo. Ingresa tus datos.' : 'Únete y comienza la experiencia.'}
          </Text>
        </View>

        <View style={styles.form}>
          {feedback && (
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          )}
          <CustomInput
            label="EMAIL"
            value={email}
            onChangeText={setEmail}
            isFocused={focusedInput === 'email'}
            onFocus={() => setFocusedInput('email')}
            onBlur={() => setFocusedInput(null)}
          />

          <CustomInput
            label="CONTRASEÑA"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            isFocused={focusedInput === 'password'}
            onFocus={() => setFocusedInput('password')}
            onBlur={() => setFocusedInput(null)}
            toggleVisibility={() => setIsPasswordVisible(!isPasswordVisible)}
          />

          {!isLogin && (
            <CustomInput
              label="CONFIRMAR CONTRASEÑA"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isPasswordVisible}
              isFocused={focusedInput === 'confirm'}
              onFocus={() => setFocusedInput('confirm')}
              onBlur={() => setFocusedInput(null)}
            />
          )}

          {!isLogin && password !== confirmPassword && confirmPassword.length > 0 && (
            <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              !isFormValid && styles.buttonDisabled
            ]}
            onPress={() => {
              if (isLogin) handleLogin();
              else handleRegister();
            }}
            disabled={!isFormValid}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.buttonText,
              !isFormValid && styles.buttonTextDisabled
            ]}>
              {isLogin ? 'INICIAR SESIÓN' : 'REGISTRARSE'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          </Text>
          <TouchableOpacity onPress={() => {
            setIsLogin(!isLogin);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setIsFormValid(false);
            setFeedback(null);
          }}>
            <Text style={styles.linkText}>
              {isLogin ? 'Regístrate' : 'Inicia Sesión'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
    color: '#888',
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
  eyeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  errorText: {
    color: '#E53935',
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

export default AccountScreen;