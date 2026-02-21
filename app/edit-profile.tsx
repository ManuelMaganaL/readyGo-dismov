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
  onBlur
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
          autoCapitalize="words"
          cursorColor="#000"
          editable={true}
        />
      </View>
    </View>
  );
};

const EditProfileScreen = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
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
          <Text style={styles.title}>Editar Perfil</Text>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarSection}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={70} color="#999" />
            </View>
            <TouchableOpacity>
              <Text style={styles.changePhotoText}>Cambiar foto</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <CustomInput 
              label="(nombre de usuario)"
              placeholder="Escribe tu nuevo nombre" 
              value={username} 
              onChangeText={setUsername} 
              isFocused={focusedInput === 'username'}
              onFocus={() => setFocusedInput('username')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          <TouchableOpacity 
            style={styles.saveButton} 
            activeOpacity={0.8}
            onPress={() => console.log('Guardando nuevo nombre:', username)}
          >
            <Text style={styles.saveButtonText}>GUARDAR CAMBIOS</Text>
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
    marginBottom: 40, 
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 60, 
  },
  avatarPlaceholder: {
    width: 140, 
    height: 140,
    borderRadius: 70, 
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, 
  },
  changePhotoText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 18, 
  },
  form: {
    marginBottom: 60, 
  },
  inputContainer: {
    marginBottom: 30,
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

export default EditProfileScreen;