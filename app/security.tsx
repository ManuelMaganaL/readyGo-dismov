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

import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/ui/button';

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
  const { colors } = useTheme();
  const styles = createStyles(colors);

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

  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
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
            <Ionicons name="arrow-back" size={32} color={colors.tint} />
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

          <Button
            style='main'
            text='Actualizar'
            onPress={() => console.log("COntraseña actualizada")}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (colors:any) => 
StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.tint,
    letterSpacing: -1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  subtitle: {
    fontSize: 16,
    color: colors.mid_accent,
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
    color: colors.mid_accent,
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  labelFocused: {
    color: colors.tint,
  },
  inputWrapper: {
    borderBottomWidth: 1, 
    borderBottomColor: colors.mid_accent,
    paddingBottom: 8, 
  },
  inputWrapperFocused: {
    borderBottomColor: colors.tint,
    borderBottomWidth: 2, 
  },
  input: {
    fontSize: 18, 
    fontWeight: '500', 
    color: colors.text,
    paddingVertical: 8,
  },
});

export default SecurityScreen;