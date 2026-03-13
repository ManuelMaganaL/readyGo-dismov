import { useState, useEffect } from 'react';
import {
  Alert,
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
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from "@/context/ThemeContext";
import LoaderSpinner from '@/components/loader-spinner';

import { updateUsername, getUserInfo, getSessionInfo, uploadUserAvatar } from '@/backend/session';

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
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <ThemedView style={styles.inputContainer}>
      <ThemedText style={[styles.label, isFocused && styles.labelFocused]}>{label}</ThemedText>
      <ThemedView style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.light_accent}
          onFocus={onFocus}
          onBlur={onBlur}
          autoCapitalize="words"
          cursorColor={colors.tint}
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
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [imageFailed, setImageFailed] = useState<boolean>(false);

  const { colors } = useTheme();
  const styles = createStyles(colors);

  const profileSource = !imageFailed && user?.avatar_url
    ? { uri: user.avatar_url }
    : require('@/assets/images/profile.png');

  useEffect(() => {
    setImageFailed(false);
  }, [user?.avatar_url]);

  const handleChangePhoto = async () => {
    if (!user || isUploadingPhoto) return;

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso requerido', 'Necesitas permitir acceso a la galería para cambiar tu foto.');
      return;
    }

    const pickResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
    });

    if (pickResult.canceled || !pickResult.assets?.[0]?.uri) {
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const newAvatarUrl = await uploadUserAvatar(user.id, pickResult.assets[0].uri, user.avatar_url);
      setUser(prev => prev ? { ...prev, avatar_url: newAvatarUrl } : prev);
      Alert.alert('Foto actualizada', 'Tu foto de perfil se actualizó correctamente.');
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'No se pudo actualizar la foto de perfil.';
      Alert.alert('Error', message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!user || isSaving) return;

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      Alert.alert('Nombre inválido', 'Escribe un nombre de usuario válido.');
      return;
    }

    if (trimmedUsername === user.username) {
      router.back();
      return;
    }

    try {
      setIsSaving(true);
      const changes = await updateUsername(user.id, trimmedUsername);
      if (!changes) return;

      setUser(prev => prev ? { ...prev, username: trimmedUsername } : prev);
      Alert.alert('Perfil actualizado', 'Tu nombre de usuario se actualizó correctamente.');
      router.replace('/settings');
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'No se pudo actualizar el perfil.';
      Alert.alert('Error al guardar', message);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const isLogedIn = async () => {
      try {
        const sessionInfo = await getSessionInfo();
        if (!sessionInfo) {
          router.push("/auth/login");
          return;
        }

        const userInfo = await getUserInfo(sessionInfo.id);
        if (!userInfo) {
          router.push("/auth/login");
          return;
        }

        setUser({
          id: userInfo.id,
          username: userInfo.username,
          email: userInfo.email,
          avatar_url: userInfo.avatar_url ?? null,
          created_at: userInfo.created_at,
        });
        setUsername(userInfo.username);
      } finally {
        setIsLoading(false);
      }
    };
    isLogedIn();
  }, []);

  return (
    <>
      {isLoading ? (
        <LoaderSpinner/>
      ) : (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
          
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
                <ArrowLeft size={32} color={colors.tint} />
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
                  source={profileSource}
                  style={styles.profilePicture}
                  onError={() => setImageFailed(true)}
                />
                </ThemedView>
                <TouchableOpacity onPress={handleChangePhoto} disabled={isUploadingPhoto}>
                  <ThemedText type='defaultSemiBold'>
                    {isUploadingPhoto ? 'Subiendo foto...' : 'Cambiar foto'}
                  </ThemedText>
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
                text={isSaving ? "Guardando..." : "Guardar cambios"}
                style='main'
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}
    </>
  );
};

const createStyles = (colors:any) => 
StyleSheet.create({
  container: {
    marginTop: 20,
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
    backgroundColor: colors.background,
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
    color: colors.light_accent,
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  labelFocused: {
    color: colors.text,
  },
  inputWrapper: {
    borderBottomWidth: 1, 
    borderBottomColor: colors.light_accent,
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
