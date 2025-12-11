import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { handleSupabaseError } from '../../utils/errorHandler';
import { speakGuidance } from '../../utils/speechHelper';
import VoiceButton from '../common/VoiceButton';

const LoginScreen = ({ onLogin, onNavigateToRegister, onNavigateToLegal, onVoiceCommand }) => {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    speakGuidance('Bienvenido a Ecoruta. Aplicación de transporte accesible. Ingresa tu correo electrónico y contraseña para continuar. O presiona crear cuenta si eres nuevo. Puedes usar comandos de voz presionando el botón de micrófono');
  }, []);

  const handleLoginPress = async () => {
    if (!email.trim() || !pass.trim()) {
      speakGuidance('Error. Debes completar todos los campos');
      return;
    }

    setIsSubmitting(true);
    speakGuidance('Iniciando sesión. Por favor espera');

    try {
      const result = await signIn(email, pass);

      if (result.success) {
        speakGuidance('Inicio de sesión exitoso. Bienvenido a Ecoruta');
        onLogin(email, pass);
      } else {
        const errorMessage = handleSupabaseError(result.error);
        speakGuidance(`Error al iniciar sesión. ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      speakGuidance(`Error inesperado. ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterPress = () => {
    speakGuidance('Navegando a crear cuenta');
    onNavigateToRegister();
  };

  const handleVoiceCommand = (command) => {
    if (command === "confirm") {
      handleLoginPress();
    } else if (command === "cancel") {
      speakGuidance('Navegando a crear cuenta');
      onNavigateToRegister();
    } else {
      onVoiceCommand(command);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <VoiceButton onCommand={handleVoiceCommand} currentScreen="login" />

      <View style={styles.headerContainer} importantForAccessibility="yes">
        <Image source={require('../../../assets/logo-ecoruta.png')} style={styles.logoBig} resizeMode="contain" accessibilityLabel="Logo Eco Ruta" />
        <Text style={styles.title} accessibilityRole="header">BIENVENIDO</Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          accessibilityLabel="Campo de correo electrónico"
          onFocus={() => speakGuidance('Campo de correo electrónico. Escribe tu email')}
          editable={!isSubmitting}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={pass}
          onChangeText={setPass}
          secureTextEntry
          accessibilityLabel="Campo de contraseña"
          onFocus={() => speakGuidance('Campo de contraseña. Ingresa tu contraseña')}
          editable={!isSubmitting}
        />
        <TouchableOpacity
          style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
          onPress={handleLoginPress}
          accessibilityRole="button"
          accessibilityLabel="Botón continuar para iniciar sesión"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Continuar</Text>
          )}
        </TouchableOpacity>
        <View style={styles.centerTextContainer}><Text style={styles.subText}>¿No tienes una cuenta aun?</Text></View>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRegisterPress}
          accessibilityRole="button"
          accessibilityLabel="Botón crear una cuenta"
          disabled={isSubmitting}
        >
          <Text style={styles.primaryButtonText}>Crear una cuenta</Text>
        </TouchableOpacity>
        <Text style={styles.legalText}>
          Al hacer clic en continuar, aceptas nuestros <Text style={styles.boldLink} onPress={() => { speakGuidance('Abriendo términos de servicio'); onNavigateToLegal('terms'); }}> Términos de Servicio </Text> y nuestra <Text style={styles.boldLink} onPress={() => { speakGuidance('Abriendo política de privacidad'); onNavigateToLegal('privacy'); }}> Política de Privacidad</Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingHorizontal: 25, paddingTop: 20, paddingBottom: 40, justifyContent: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 30 },
  logoBig: { width: 140, height: 140, marginBottom: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#000', marginTop: 5 },
  formContainer: { width: '100%' },
  input: { height: 55, borderColor: '#000', borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, fontSize: 16, marginBottom: 15, color: '#000', backgroundColor: '#fff' },
  primaryButton: { backgroundColor: '#000', height: 55, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 25 },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  centerTextContainer: { alignItems: 'center', marginBottom: 15, width: '100%' },
  subText: { textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#000' },
  legalText: { textAlign: 'center', color: '#666', fontSize: 12, lineHeight: 18, paddingHorizontal: 10 },
  boldLink: { fontWeight: 'bold', color: '#000', textDecorationLine: 'underline' },
  disabledButton: { opacity: 0.6 }
});

export default LoginScreen;
