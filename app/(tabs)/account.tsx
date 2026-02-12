import React, { useState, useEffect } from 'react';
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

const RegisterScreen = () => {
  // Estados
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  // Estados de UI
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Validación
  useEffect(() => {
    const isValidEmail = email.includes('@') && email.length > 5;
    const passwordsMatch = password === confirmPassword && password.length > 0;
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsFormValid(isValidEmail && passwordsMatch);
  }, [email, password, confirmPassword]);

  const handleRegister = () => {
    if (isFormValid) {
      console.log('Registrando:', email);
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
          <Text style={styles.title}>Crear Perfil</Text>
          <Text style={styles.subtitle}>Únete y comienza la experiencia.</Text>
        </View>

        <View style={styles.form}>
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

          <CustomInput
            label="CONFIRMAR CONTRASEÑA"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!isPasswordVisible}
            isFocused={focusedInput === 'confirm'}
            onFocus={() => setFocusedInput('confirm')}
            onBlur={() => setFocusedInput(null)}
          />

          {password !== confirmPassword && confirmPassword.length > 0 && (
            <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
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
            <Text style={[
              styles.buttonText,
              !isFormValid && styles.buttonTextDisabled
            ]}>
              REGISTRARSE
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Inicia Sesión</Text>
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

export default RegisterScreen;