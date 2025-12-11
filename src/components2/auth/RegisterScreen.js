import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { speakGuidance } from '../../utils/speechHelper';
import VoiceButton from '../common/VoiceButton';

const RegisterScreen = ({ onRegister, onBack, onNavigateToLegal, onVoiceCommand }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    speakGuidance('Pantalla de registro. Completa todos los campos para crear tu cuenta. Puedes decir confirmar cuando termines, o volver para regresar');
  }, []);

  const handleRegisterValidation = () => {
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      speakGuidance('Error. Todos los campos son obligatorios. Por favor completa la información faltante');
      Alert.alert("Campos Incompletos", "Por favor, llena todas las casillas para continuar.");
      return;
    }
    if (password !== confirmPassword) {
      speakGuidance('Error. Las contraseñas no coinciden. Verifica e intenta nuevamente');
      Alert.alert("Error de Contraseña", "Las contraseñas no coinciden. Verifícalas.");
      return;
    }
    if (password.length < 6) {
      speakGuidance('Error. La contraseña debe tener al menos 6 caracteres');
      Alert.alert("Seguridad", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    speakGuidance('Registro exitoso. Tu cuenta ha sido creada. Redirigiendo al mapa principal');
    Alert.alert("¡Registro Exitoso!", "Tu cuenta ha sido creada correctamente.", [
      { text: "Continuar", onPress: onRegister }
    ]);
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
          placeholder="Nombre Completo" 
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
          onFocus={() => speakGuidance('Campo nombre completo')}
          accessibilityLabel="Campo nombre completo"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Usuario" 
          placeholderTextColor="#888" 
          value={username}
          onChangeText={setUsername}
          onFocus={() => speakGuidance('Campo usuario')}
          accessibilityLabel="Campo usuario"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Correo Electrónico" 
          placeholderTextColor="#888" 
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          onFocus={() => speakGuidance('Campo correo electrónico')}
          accessibilityLabel="Campo correo electrónico"
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
          style={styles.primaryButton} 
          onPress={handleRegisterValidation}
          accessibilityRole="button"
          accessibilityLabel="Botón continuar para crear cuenta"
        >
          <Text style={styles.primaryButtonText}>Continuar</Text>
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
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});

export default RegisterScreen;