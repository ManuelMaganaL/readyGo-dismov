import { useState, useEffect, useRef } from 'react';
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  View,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Camera, User as UserIcon, Check, CircleCheck, AlertCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from "@/context/ThemeContext";
import LoaderSpinner from '@/components/loader-spinner';

import { updateUsername, uploadUserAvatar } from '@/backend/session';
import type { User } from '@/types';
import Button from '@/components/ui/button';
import { useUser } from '@/context/UserContext';

const { width } = Dimensions.get('window');

const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  isFocused,
  onFocus,
  onBlur,
  icon: Icon
}: any) => {
  const { colors, dark } = useTheme();

  return (
    <View style={styles.inputGroup}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View style={[
        styles.inputWrapper,
        { backgroundColor: colors.card },
        isFocused && { borderColor: colors.main, borderWidth: 1.5, backgroundColor: dark ? 'rgba(147, 74, 255, 0.05)' : 'rgba(157, 99, 244, 0.05)' }
      ]}>
        <Icon size={20} color={isFocused ? colors.main : colors.mid_accent} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.light_accent}
          onFocus={onFocus}
          onBlur={onBlur}
          autoCapitalize="words"
          cursorColor={colors.main}
        />
        {value.length > 0 && isFocused && (
          <Check size={18} color={colors.main} />
        )}
      </View>
    </View>
  );
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, isLoading: isUserLoading, refreshUser } = useUser();

  const [username, setUsername] = useState<string>('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [imageFailed, setImageFailed] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { colors, dark } = useTheme();

  const lastBackPress = useRef<number>(0);
  const lastPhotoPress = useRef<number>(0);
  const DEBOUNCE_TIME = 500;

  const profileSource = !imageFailed && user?.avatar_url
    ? { uri: user.avatar_url }
    : require('@/assets/images/profile.png');

  useEffect(() => {
    setImageFailed(false);
  }, [user?.avatar_url]);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setIsLoading(false);
    }
  }, [user]);

  const handleBackPress = () => {
    const now = Date.now();
    if (now - lastBackPress.current < DEBOUNCE_TIME) return;
    lastBackPress.current = now;
    router.back();
  };

  const handleChangePhoto = async () => {
    const now = Date.now();
    if (now - lastPhotoPress.current < DEBOUNCE_TIME) return;
    lastPhotoPress.current = now;

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

    if (pickResult.canceled || !pickResult.assets?.[0]?.uri) return;

    try {
      setIsUploadingPhoto(true);
      await uploadUserAvatar(user.id, pickResult.assets[0].uri, user.avatar_url);
      await refreshUser(true);
      setFeedback({ type: 'success', message: '¡Foto de perfil actualizada correctamente!' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar la foto de perfil.';
      setFeedback({ type: 'error', message });
      setTimeout(() => setFeedback(null), 5000);
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
      setFeedback(null);
      const changes = await updateUsername(user.id, trimmedUsername);
      if (!changes) return;
      await refreshUser(true);
      setFeedback({ type: 'success', message: '¡Nombre de usuario actualizado correctamente!' });
      setTimeout(() => {
        router.replace('/settings');
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar el perfil.';
      setFeedback({ type: 'error', message });
      setTimeout(() => setFeedback(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <LoaderSpinner />
      ) : (
        <ThemedView style={styles.container}>
          <StatusBar barStyle={dark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
          <Stack.Screen options={{ headerShown: false }} />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              stickyHeaderIndices={[0]}
            >
              {/* Header Section */}
              <View style={styles.headerWrapper}>
                <LinearGradient
                  colors={[colors.main + '30', 'transparent']}
                  style={styles.headerGradient}
                />
                <View style={styles.header}>
                  <TouchableOpacity
                    onPress={handleBackPress}
                    style={[styles.backButton, { backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                    activeOpacity={0.7}
                  >
                    <ArrowLeft size={28} color={colors.text} />
                  </TouchableOpacity>
                  <ThemedText type='title' style={styles.titleText}>Editar Perfil</ThemedText>
                </View>
              </View>

              <View style={styles.contentContainer}>
                <View style={styles.avatarSection}>
                  <TouchableOpacity
                    onPress={handleChangePhoto}
                    disabled={isUploadingPhoto}
                    activeOpacity={0.9}
                    style={styles.avatarContainer}
                  >
                    <View style={[styles.avatarFrame, { borderColor: colors.main + '40' }]}>
                      <Image
                        source={profileSource}
                        style={styles.profilePicture}
                        onError={() => setImageFailed(true)}
                      />
                      {isUploadingPhoto && (
                        <View style={styles.uploadingOverlay}>
                          <LoaderSpinner />
                        </View>
                      )}
                    </View>
                    <View style={[styles.cameraButton, { backgroundColor: colors.main }]}>
                      <Camera size={20} color="#FFF" />
                    </View>
                  </TouchableOpacity>
                  <ThemedText style={styles.avatarLabel}>
                    Toca para cambiar tu foto
                  </ThemedText>
                </View>

                <View style={styles.formCard}>
                  <CustomInput
                    label="Nombre de usuario"
                    placeholder="Ej: Juan Perez"
                    value={username}
                    onChangeText={setUsername}
                    icon={UserIcon}
                    isFocused={focusedInput === 'username'}
                    onFocus={() => setFocusedInput('username')}
                    onBlur={() => setFocusedInput(null)}
                  />

                  <ThemedText style={styles.infoText}>
                    Este es el nombre que verán los demás usuarios en tus actividades compartidas.
                  </ThemedText>
                </View>

                {feedback?.type === 'error' && (
                  <View style={[styles.feedbackBlock, { backgroundColor: '#EF4444' + '15', borderColor: '#EF4444' + '30' }]}>
                    <AlertCircle size={20} color="#EF4444" />
                    <ThemedText style={[styles.feedbackText, { color: '#EF4444' }]}>{feedback.message}</ThemedText>
                  </View>
                )}

                {feedback?.type === 'success' && (
                  <View style={[styles.feedbackBlock, { backgroundColor: '#22C55E' + '15', borderColor: '#22C55E' + '30' }]}>
                    <CircleCheck size={20} color="#22C55E" />
                    <ThemedText style={[styles.feedbackText, { color: '#22C55E' }]}>{feedback.message}</ThemedText>
                  </View>
                )}

                <Button
                  onPress={handleSave}
                  text={isSaving ? "Guardando..." : feedback?.type === 'success' ? "¡Listo!" : "Guardar cambios"}
                  style='main'
                  disabled={isSaving || feedback?.type === 'success'}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </ThemedView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerWrapper: {
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarFrame: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    padding: 4,
    backgroundColor: 'transparent',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    borderRadius: 66,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 66,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFF', // Always white border for contrast
  },
  avatarLabel: {
    fontSize: 14,
    color: '#6E6E6E',
    marginTop: 16,
    fontWeight: '500',
  },
  formCard: {
    paddingVertical: 10,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6E6E6E',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 16,
    height: 60,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 13,
    color: '#6E6E6E',
    lineHeight: 18,
    textAlign: 'left',
    marginTop: -12,
    paddingHorizontal: 4,
  },
  feedbackBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
  },
  feedbackText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
});
