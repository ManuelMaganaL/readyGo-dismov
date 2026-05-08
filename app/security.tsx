import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, AlertCircle, Lock, Eye, EyeOff, ShieldCheck, CircleCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/button';
import { updatePassword } from '@/backend/session';

const { width } = Dimensions.get('window');

const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  isFocused,
  onFocus,
  onBlur,
  secureTextEntry,
  icon: Icon
}: any) => {
  const [showPassword, setShowPassword] = useState(false);
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
          autoCapitalize="none"
          cursorColor={colors.main}
          secureTextEntry={secureTextEntry && !showPassword}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={20} color={colors.mid_accent} />
            ) : (
              <Eye size={20} color={colors.mid_accent} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const SecurityScreen = () => {
  const router = useRouter();
  const { colors, dark } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const lastBackPress = useRef<number>(0);
  const DEBOUNCE_TIME = 500;

  const handleBackPress = () => {
    const now = Date.now();
    if (now - lastBackPress.current < DEBOUNCE_TIME) return;
    lastBackPress.current = now;
    router.back();
  };

  const handleUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);
      const update = await updatePassword(newPassword);
      if (!update) {
        setError("No se pudo cambiar la contraseña");
        setTimeout(() => setError(null), 5000);
      } else {
        setSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          router.push("/settings");
        }, 2000);
      }
    } catch (e) {
      setError("Ocurrió un error inesperado");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
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
              <ThemedText type='title' style={styles.titleText}>Seguridad</ThemedText>
            </View>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.introBox}>

              <ThemedText style={styles.introTitle}>Protege tu cuenta</ThemedText>
              <ThemedText style={styles.introSubtitle}>
                Actualiza tu contraseña periódicamente para mantener tu información segura.
              </ThemedText>
            </View>

            <View style={styles.formCard}>
              <CustomInput
                label="Nueva Contraseña"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChangeText={setNewPassword}
                icon={Lock}
                isFocused={focusedInput === 'new'}
                onFocus={() => setFocusedInput('new')}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry={true}
              />

              <CustomInput
                label="Confirmar Contraseña"
                placeholder="Repite la nueva contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                icon={Lock}
                isFocused={focusedInput === 'confirm'}
                onFocus={() => setFocusedInput('confirm')}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry={true}
              />
            </View>

            {error && (
              <View style={[styles.errorBlock, { backgroundColor: colors.danger + '15', borderColor: colors.danger + '30' }]}>
                <AlertCircle size={20} color={colors.danger} />
                <ThemedText style={[styles.errorText, { color: colors.danger }]}>{error}</ThemedText>
              </View>
            )}

            {success && (
              <View style={[styles.successBlock, { backgroundColor: '#22C55E' + '15', borderColor: '#22C55E' + '30' }]}>
                <CircleCheck size={20} color="#22C55E" />
                <ThemedText style={[styles.successText, { color: '#22C55E' }]}>¡Contraseña actualizada correctamente!</ThemedText>
              </View>
            )}

            <Button
              style='main'
              text={isUpdating ? 'Actualizando...' : success ? '¡Listo!' : 'Actualizar contraseña'}
              onPress={handleUpdate}
              disabled={!newPassword || newPassword !== confirmPassword || isUpdating || success}
            />
            
            <View style={styles.adviceBox}>
              <ThemedText style={styles.adviceText}>
                Usa una combinación de letras, números y símbolos para una contraseña más fuerte.
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
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
  introBox: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 10,
  },

  introTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 20,
    textAlign: 'center',
  },
  introSubtitle: {
    fontSize: 15,
    color: '#6E6E6E',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formCard: {
    paddingVertical: 10,
    marginBottom: 20,
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
  errorBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  successBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  adviceBox: {
    marginTop: 24,
    paddingHorizontal: 30,
  },
  adviceText: {
    fontSize: 13,
    color: '#6E6E6E',
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.8,
  },
});

export default SecurityScreen;