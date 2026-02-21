import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const CustomInput = ({ 
  label,
  value, 
  onChangeText, 
  placeholder, 
  isFocused,
  onFocus,
  onBlur,
  secureTextEntry
}: any) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, isFocused && styles.labelFocused]}>{label}</Text>
      <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#ccc"
          onFocus={onFocus}
          onBlur={onBlur}
          autoCapitalize="none"
          cursorColor="#000"
          editable={true}
          secureTextEntry={secureTextEntry}
        />
      </View>
    </View>
  );
};

const SecurityScreen = () => {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="arrow-back" size={32} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Seguridad</Text>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            Actualiza tu contraseña para mantener tu cuenta segura.
          </Text>

          <View style={styles.form}>
            <CustomInput 
              label="(contraseña actual)"
              placeholder="Escribe tu contraseña" 
              value={currentPassword} 
              onChangeText={setCurrentPassword} 
              isFocused={focusedInput === 'current'}
              onFocus={() => setFocusedInput('current')}
              onBlur={() => setFocusedInput(null)}
              secureTextEntry={true}
            />

            <CustomInput 
              label="(nueva contraseña)"
              placeholder="Mínimo 6 caracteres" 
              value={newPassword} 
              onChangeText={setNewPassword} 
              isFocused={focusedInput === 'new'}
              onFocus={() => setFocusedInput('new')}
              onBlur={() => setFocusedInput(null)}
              secureTextEntry={true}
            />

            <CustomInput 
              label="(confirmar contraseña)"
              placeholder="Repite la contraseña" 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
              isFocused={focusedInput === 'confirm'}
              onFocus={() => setFocusedInput('confirm')}
              onBlur={() => setFocusedInput(null)}
              secureTextEntry={true}
            />
          </View>

          <TouchableOpacity 
            style={styles.saveButton} 
            activeOpacity={0.8}
            onPress={() => console.log('Actualizando contraseña')}
          >
            <Text style={styles.saveButtonText}>ACTUALIZAR CONTRASEÑA</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
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
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 50,
    lineHeight: 24,
  },
  form: {
    marginBottom: 60, 
  },
  inputContainer: {
    marginBottom: 35,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  labelFocused: {
    color: '#000',
  },
  inputWrapper: {
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc',
    paddingBottom: 8, 
  },
  inputWrapperFocused: {
    borderBottomColor: '#000',
    borderBottomWidth: 2, 
  },
  input: {
    fontSize: 18, 
    fontWeight: '500', 
    color: '#000',
    paddingVertical: 8,
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 24, 
    borderRadius: 16, 
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16, 
    fontWeight: '800',
    letterSpacing: 2, 
  },
});

export default SecurityScreen;