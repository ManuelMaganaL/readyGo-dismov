import { useState, useEffect } from 'react';
import {
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import LoaderSpinner from '@/components/loader-spinner';

import { updateUsername, getUserInfo, getSessionInfo } from '@/backend/session';

import type { User } from '@/types';
import Button from '@/components/ui/button';

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
    <ThemedView style={styles.inputContainer}>
      <ThemedText style={[styles.label, isFocused && styles.labelFocused]}>{label}</ThemedText>
      <ThemedView style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
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
      </ThemedView>
    </ThemedView>
  );
};

export default function EditProfileScreen() {
  const router = useRouter();

  const [username, setUsername] = useState<string>('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleSave = async () => {
    if (!user) return;
    const changes = await updateUsername(user.id, username);
    if (!changes) {
      return
    } else {
      router.push("/settings");
    }
  }

  useEffect(() => {
    const isLogedIn = async () => {
      const sessionInfo = await getSessionInfo();
      if (!sessionInfo) {
        router.push("/auth/login");
        return;
      }

      const userInfo = await getUserInfo(sessionInfo.id);
      if (!userInfo) {
        router.push("/auth/login");
        return;
      } else {
        setUser({id: userInfo.id, username: userInfo.username, email: userInfo.email, created_at: userInfo.created_at});
        setUsername(userInfo.username);
      }
    }
    isLogedIn();

    setIsLoading(false);
  }, []);

  return (
    <>
      {isLoading ? (
        <LoaderSpinner/>
      ) : (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          
          <Stack.Screen options={{ headerShown: false }} />

          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <ThemedView style={styles.header}>
              <TouchableOpacity 
                onPress={() => router.back()} 
                style={styles.backButton}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <ArrowLeft size={32} color="#000" />
              </TouchableOpacity>
              <ThemedText type='title'>Editar Perfil</ThemedText>
            </ThemedView>

            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <ThemedView style={styles.avatarSection}>
                <ThemedView style={styles.avatarPlaceholder}>
                <Image
                  source={require('@/assets/images/profile.png')}
                  style={styles.profilePicture}
                />
                </ThemedView>
                <TouchableOpacity>
                  <ThemedText type='defaultSemiBold'>Cambiar foto</ThemedText>
                </TouchableOpacity>
              </ThemedView>

              <ThemedView style={styles.form}>
                <CustomInput 
                  label="(nombre de usuario)"
                  placeholder="Escribe tu nuevo nombre" 
                  value={username} 
                  onChangeText={setUsername} 
                  isFocused={focusedInput === 'username'}
                  onFocus={() => setFocusedInput('username')}
                  onBlur={() => setFocusedInput(null)}
                />
              </ThemedView>

              <Button 
                onPress={handleSave}
                text="Guardar cambios"
                style='secondary'
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
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
  profilePicture: {
    width: 140,
    height: 140,
    borderRadius: 70,
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
});
