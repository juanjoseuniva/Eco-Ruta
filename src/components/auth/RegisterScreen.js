import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { handleSupabaseError } from '../../utils/errorHandler';
import { speakGuidance } from '../../utils/speechHelper';
import { validateEmail, validatePassword, validatePasswordMatch, validatePhone, validateRequired, validateUsername } from '../../utils/validators';
import VoiceButton from '../common/VoiceButton';

const RegisterScreen = ({ onRegister, onBack, onNavigateToLegal, onVoiceCommand }) => {
  const { signUp, loading } = useAuth();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [usuario, setUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    speakGuidance('Pantalla de registro. Completa todos los campos para crear tu cuenta. Puedes decir confirmar cuando termines, o volver para regresar');
  }, []);

  const handleRegisterValidation = async () => {
    // Validaciones - los validators retornan {isValid: boolean, error: string}
    const nombreValidation = validateRequired(nombre, 'Nombre');
    if (!nombreValidation.isValid) {
      speakGuidance(nombreValidation.error);
      Alert.alert("Error", nombreValidation.error);
      return;
    }

    const apellidoValidation = validateRequired(apellido, 'Apellido');
    if (!apellidoValidation.isValid) {
      speakGuidance(apellidoValidation.error);
      Alert.alert("Error", apellidoValidation.error);
      return;
    }

    const usuarioValidation = validateUsername(usuario);
    if (!usuarioValidation.isValid) {
      speakGuidance(usuarioValidation.error);
      Alert.alert("Error", usuarioValidation.error);
      return;
    }

    const correoValidation = validateEmail(correo);
    if (!correoValidation.isValid) {
      speakGuidance(correoValidation.error);
      Alert.alert("Error", correoValidation.error);
      return;
    }

    const telefonoValidation = validatePhone(telefono);
    if (!telefonoValidation.isValid) {
      speakGuidance(telefonoValidation.error);
      Alert.alert("Error", telefonoValidation.error);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      speakGuidance(passwordValidation.error);
      Alert.alert("Error", passwordValidation.error);
      return;
    }

    const matchValidation = validatePasswordMatch(password, confirmPassword);
    if (!matchValidation.isValid) {
      speakGuidance(matchValidation.error);
      Alert.alert("Error", matchValidation.error);
      return;
    }

    setIsSubmitting(true);
    speakGuidance('Creando cuenta. Por favor espera');

    try {
      const result = await signUp(nombre, apellido, usuario, correo, telefono, password);

      if (result.success) {
        speakGuidance('Registro exitoso. Tu cuenta ha sido creada. Redirigiendo a la aplicación');
        Alert.alert("¡Registro Exitoso!", "Tu cuenta ha sido creada correctamente.", [
          { text: "Continuar", onPress: onRegister }
        ]);
      } else {
        const errorMessage = String(handleSupabaseError(result.error || result));
        speakGuidance(`Error al registrar. ${errorMessage}`);
        Alert.alert("Error", errorMessage);
      }
    } catch (error) {
      console.error('Error completo en registro:', error);
      const errorMessage = String(handleSupabaseError(error));
      speakGuidance(`Error inesperado. ${errorMessage}`);
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceCommand = (command) => {
    if (command === "confirm") {
      handleRegisterValidation();
    } else if (command === "goBack") {
      speakGuidance('Volviendo a inicio de sesión');
      onBack();
    } else {
      onVoiceCommand(command);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <VoiceButton onCommand={handleVoiceCommand} currentScreen="register" />

      <View style={styles.registerHeaderRow}>
        <TouchableOpacity
          onPress={() => { speakGuidance('Volviendo a inicio de sesión'); onBack(); }}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Ionicons name="chevron-back" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.registerTitle}>Crear Cuenta</Text>
        <Image source={require('../../../assets/logo-ecoruta.png')} style={styles.logoSmall} resizeMode="contain" />
      </View>

      <Text style={styles.sectionTitle}>Registre sus datos</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor="#888"
          value={nombre}
          onChangeText={setNombre}
          onFocus={() => speakGuidance('Campo nombre')}
          accessibilityLabel="Campo nombre"
        />
        <TextInput
          style={styles.input}
          placeholder="Apellido"
          placeholderTextColor="#888"
          value={apellido}
          onChangeText={setApellido}
          onFocus={() => speakGuidance('Campo apellido')}
          accessibilityLabel="Campo apellido"
        />
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor="#888"
          value={usuario}
          onChangeText={setUsuario}
          onFocus={() => speakGuidance('Campo usuario')}
          accessibilityLabel="Campo usuario"
        />
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={correo}
          onChangeText={setCorreo}
          onFocus={() => speakGuidance('Campo correo electrónico')}
          accessibilityLabel="Campo correo electrónico"
        />
        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          value={telefono}
          onChangeText={setTelefono}
          onFocus={() => speakGuidance('Campo teléfono')}
          accessibilityLabel="Campo teléfono"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onFocus={() => speakGuidance('Campo contraseña. Mínimo 6 caracteres')}
          accessibilityLabel="Campo contraseña"
        />
        <TextInput
          style={styles.input}
          placeholder="Repetir Contraseña"
          placeholderTextColor="#888"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          onFocus={() => speakGuidance('Confirmar contraseña. Repite la contraseña anterior')}
          accessibilityLabel="Campo confirmar contraseña"
        />

        <TouchableOpacity
          style={[styles.primaryButton, (isSubmitting || loading) && styles.buttonDisabled]}
          onPress={handleRegisterValidation}
          disabled={isSubmitting || loading}
          accessibilityRole="button"
          accessibilityLabel="Botón continuar para crear cuenta"
        >
          {(isSubmitting || loading) ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Continuar</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingHorizontal: 25, paddingTop: 20, paddingBottom: 40, justifyContent: 'center' },
  registerHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 },
  registerTitle: { fontSize: 22, fontWeight: 'bold' },
  backButton: { padding: 5 },
  logoSmall: { width: 50, height: 50 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#000' },
  formContainer: { width: '100%' },
  input: { height: 55, borderColor: '#000', borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, fontSize: 16, marginBottom: 15, color: '#000', backgroundColor: '#fff' },
  primaryButton: { backgroundColor: '#000', height: 55, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 25 },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 }
});

export default RegisterScreen;
