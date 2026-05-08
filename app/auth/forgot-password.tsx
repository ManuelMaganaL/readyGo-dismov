import { useState } from 'react';
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
  View,
} from 'react-native';
import { ArrowLeft, Mail, CircleCheck, AlertCircle } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { resetPassword } from '@/backend/session';
import Button from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { logger } from '@/utils/logger';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleReset = async () => {
    if (!email.includes('@') || isSubmitting) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setFeedback(null);
    setIsSubmitting(true);
    
    try {
      await resetPassword(email);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFeedback({ 
        type: 'success', 
        message: 'Correo enviado. Revisa tu bandeja de entrada.' 
      });
      setTimeout(() => router.back(), 3000);
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsSubmitting(false);
      const message = e instanceof Error ? e.message : 'Error al enviar el correo.';
      setFeedback({ type: 'error', message });
      logger.error('Reset password error:', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color={colors.text} size={28} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.header}>
          <ThemedText type='title'>Recuperar Cuenta</ThemedText>
          <ThemedText style={styles.subtitle}>
            Ingresa tu correo y te enviaremos las instrucciones.
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.form}>
          {feedback && (
            <View style={[
              styles.feedbackBox, 
              { backgroundColor: feedback.type === 'error' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                borderColor: feedback.type === 'error' ? 'rgba(255, 59, 48, 0.3)' : 'rgba(34, 197, 94, 0.3)' }
            ]}>
              {feedback.type === 'error' ? <AlertCircle size={20} color="#FF3B30" /> : <CircleCheck size={20} color="#22C55E" />}
              <ThemedText style={[styles.feedbackText, { color: feedback.type === 'error' ? '#FF3B30' : '#22C55E' }]}>
                {feedback.message}
              </ThemedText>
            </View>
          )}

          <ThemedView style={styles.inputContainer}>
            <ThemedText style={[styles.label, focusedInput === 'email' && styles.labelFocused]}>
              EMAIL
            </ThemedText>
            <ThemedView style={[styles.inputWrapper, focusedInput === 'email' && styles.inputWrapperFocused]}>
              <Mail color={focusedInput === 'email' ? colors.main : colors.mid_accent} size={20} style={{marginRight: 10}} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="none"
                placeholder="ejemplo@correo.com"
                placeholderTextColor={colors.light_accent}
                cursorColor={colors.tint}
                keyboardType="email-address"
              />
            </ThemedView>
          </ThemedView>

          <Button
            text={isSubmitting ? 'Enviando...' : 'Enviar Instrucciones'}
            onPress={handleReset}
            style='main'
            disabled={!email.includes('@') || isSubmitting}
          />
        </Animated.View>
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
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    backButtonContainer: {
      position: 'absolute',
      top: 50,
      left: 20,
      zIndex: 10,
    },
    backButton: {
      padding: 8,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 10,
      backgroundColor: 'transparent',
    },
    logo: {
      width: 80,
      height: 80,
    },
    header: {
      marginBottom: 30,
      backgroundColor: 'transparent',
      alignItems: 'center',
    },
    subtitle: {
      fontSize: 15,
      color: colors.mid_accent,
      fontWeight: '500',
      textAlign: 'center',
      marginTop: 8,
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
      fontWeight: '700',
      color: colors.mid_accent,
      marginBottom: 10,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    labelFocused: {
      color: colors.main,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.light_accent,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
      backgroundColor: colors.card,
    },
    inputWrapperFocused: {
      borderColor: colors.main,
      backgroundColor: colors.card,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    feedbackBox: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      gap: 10,
    },
    feedbackText: {
      fontWeight: '600',
      fontSize: 14,
      flex: 1,
    },
  });
