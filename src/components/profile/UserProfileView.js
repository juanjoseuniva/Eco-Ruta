import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { handleSupabaseError } from '../../utils/errorHandler';
import { speakGuidance } from '../../utils/speechHelper';
import { validatePhone, validateRequired } from '../../utils/validators';
import VoiceButton from '../common/VoiceButton';

const UserProfileView = ({ onClose, onLogout, onVoiceCommand }) => {
  const { profile, updateProfile, loading } = useAuth();
  const [currentSection, setCurrentSection] = useState('menu');
  const [userData, setUserData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    correo: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [defaultPayment, setDefaultPayment] = useState('Efectivo');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { id: 1, text: 'Hola, soy tu asistente virtual. ¿En qué puedo ayudarte hoy?', sender: 'bot' }
  ]);

  // Cargar datos del perfil al montar
  useEffect(() => {
    if (profile) {
      setUserData({
        nombre: profile.nombre || '',
        apellido: profile.apellido || '',
        telefono: profile.telefono || '',
        correo: profile.correo || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (currentSection === 'menu') {
      speakGuidance('Menú de perfil. Opciones disponibles: Datos personales, Métodos de pago, Ayuda y soporte, Cerrar sesión. Usa comandos de voz para navegar');
    } else if (currentSection === 'personal') {
      speakGuidance('Datos personales. Puedes editar tu información');
    } else if (currentSection === 'payment') {
      speakGuidance('Métodos de pago. Di nequi, pse o efectivo para seleccionar');
    } else if (currentSection === 'support') {
      speakGuidance('Ayuda y soporte. Escribe tu consulta para recibir asistencia');
    }
  }, [currentSection]);

  const handleVoiceCommand = (command, extra) => {
    if (command === "goBack" || command === "cancel") {
      if (currentSection !== 'menu') {
        speakGuidance('Volviendo al menú');
        setCurrentSection('menu');
      }
    } else if (command === "openPersonalData") {
      speakGuidance('Abriendo datos personales');
      setCurrentSection('personal');
    } else if (command === "openPaymentMethods") {
      speakGuidance('Abriendo métodos de pago');
      setCurrentSection('payment');
    } else if (command === "openSupport") {
      speakGuidance('Abriendo ayuda y soporte');
      setCurrentSection('support');
    } else if (command === "selectPayment") {
      setDefaultPayment(extra === 'nequi' ? 'Nequi' : extra === 'pse' ? 'PSE' : 'Efectivo');
      speakGuidance(`Método ${extra} seleccionado`);
    } else {
      onVoiceCommand(command, extra);
    }
  };

  const handleSaveProfile = async () => {
    // Validaciones
    const nombreError = validateRequired(userData.nombre, 'Nombre');
    if (nombreError) {
      speakGuidance(nombreError);
      return;
    }

    const apellidoError = validateRequired(userData.apellido, 'Apellido');
    if (apellidoError) {
      speakGuidance(apellidoError);
      return;
    }

    const telefonoError = validatePhone(userData.telefono);
    if (telefonoError) {
      speakGuidance(telefonoError);
      return;
    }

    setIsSaving(true);
    speakGuidance('Guardando cambios');

    try {
      const result = await updateProfile(profile.id, {
        nombre: userData.nombre,
        apellido: userData.apellido,
        telefono: userData.telefono
      });

      if (result.success) {
        speakGuidance('Cambios guardados exitosamente');
        setIsEditing(false);
      } else {
        const errorMessage = handleSupabaseError(result.error);
        speakGuidance(`Error al guardar. ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      speakGuidance(`Error inesperado. ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = { id: Date.now(), text: chatMessage, sender: 'user' };
      setChatHistory([...chatHistory, newMessage]);
      speakGuidance('Mensaje enviado. Esperando respuesta del asistente');
      setChatMessage('');
      setTimeout(() => {
        setChatHistory(prev => [...prev, {
          id: Date.now() + 1,
          text: 'Gracias por escribirnos. Un agente especializado revisará tu caso en breve.',
          sender: 'bot'
        }]);
        speakGuidance('Respuesta recibida. Gracias por escribirnos');
      }, 1500);
    }
  };

  const renderPersonalData = () => (
    <ScrollView contentContainerStyle={styles.profileScroll}>
      <Text style={styles.modalTitle} accessibilityRole="header">Mis Datos Personales</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Nombre</Text>
        <TextInput
          style={[styles.accessibleInput, !isEditing && styles.inputDisabled]}
          value={userData.nombre}
          onChangeText={(text) => setUserData({ ...userData, nombre: text })}
          editable={isEditing}
          onFocus={() => speakGuidance('Campo nombre')}
          accessibilityLabel="Editar nombre"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Apellido</Text>
        <TextInput
          style={[styles.accessibleInput, !isEditing && styles.inputDisabled]}
          value={userData.apellido}
          onChangeText={(text) => setUserData({ ...userData, apellido: text })}
          editable={isEditing}
          onFocus={() => speakGuidance('Campo apellido')}
          accessibilityLabel="Editar apellido"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Teléfono</Text>
        <TextInput
          style={[styles.accessibleInput, !isEditing && styles.inputDisabled]}
          value={userData.telefono}
          onChangeText={(text) => setUserData({ ...userData, telefono: text })}
          editable={isEditing}
          keyboardType="phone-pad"
          onFocus={() => speakGuidance('Campo teléfono')}
          accessibilityLabel="Editar teléfono"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Correo Electrónico</Text>
        <TextInput
          style={[styles.accessibleInput, styles.inputDisabled]}
          value={userData.correo}
          editable={false}
          onFocus={() => speakGuidance('Campo correo electrónico. No editable')}
          accessibilityLabel="Correo electrónico (no editable)"
        />
      </View>

      {isEditing ? (
        <>
          <TouchableOpacity
            style={[styles.primaryButton, isSaving && styles.buttonDisabled]}
            onPress={handleSaveProfile}
            disabled={isSaving}
            accessibilityRole="button"
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setUserData({
                nombre: profile.nombre || '',
                apellido: profile.apellido || '',
                telefono: profile.telefono || '',
                correo: profile.correo || ''
              });
              setIsEditing(false);
              speakGuidance('Edición cancelada');
            }}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setIsEditing(true);
              speakGuidance('Modo edición activado. Modifica los campos que desees');
            }}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => { speakGuidance('Volviendo al menú de configuración'); setCurrentSection('menu'); }}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Volver</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );

  const renderPaymentMethods = () => {
    const methods = ['Efectivo', 'Nequi', 'PSE'];
    return (
      <View style={styles.profileScroll}>
        <Text style={styles.modalTitle} accessibilityRole="header">Método Predeterminado</Text>
        <Text style={{ marginBottom: 20, fontSize: 16 }}>Selecciona tu forma de pago. Di nequi, pse o efectivo</Text>
        {methods.map((method) => (
          <TouchableOpacity
            key={method}
            style={[styles.paymentOptionItem, defaultPayment === method && styles.paymentOptionSelected]}
            onPress={() => {
              setDefaultPayment(method);
              speakGuidance(`Método de pago ${method} seleccionado`);
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: defaultPayment === method }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name={method === 'Efectivo' ? 'cash' : method === 'Nequi' ? 'phone-portrait' : 'card'}
                size={24}
                color="#000"
              />
              <Text style={styles.paymentText}>{method}</Text>
            </View>
            {defaultPayment === method && <Ionicons name="checkmark-circle" size={24} color="green" />}
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => { speakGuidance('Volviendo al menú de configuración'); setCurrentSection('menu'); }}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSupport = () => (
    <View style={{ flex: 1 }}>
      <Text style={styles.modalTitle} accessibilityRole="header">Ayuda y Soporte</Text>
      <FlatList
        data={chatHistory}
        keyExtractor={item => item.id.toString()}
        style={styles.chatList}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={[
            styles.chatBubble,
            item.sender === 'user' ? styles.chatBubbleUser : styles.chatBubbleBot
          ]}>
            <Text style={[
              styles.chatText,
              item.sender === 'user' ? { color: '#fff' } : { color: '#000' }
            ]}>
              {item.text}
            </Text>
          </View>
        )}
      />
      <View style={styles.chatInputContainer}>
        <TextInput
          style={styles.chatInput}
          placeholder="Escribe tu consulta..."
          value={chatMessage}
          onChangeText={setChatMessage}
          onFocus={() => speakGuidance('Campo de mensaje. Escribe tu consulta')}
          accessibilityLabel="Campo de texto para mensaje de soporte"
        />
        <TouchableOpacity
          style={styles.chatSendButton}
          onPress={handleSendMessage}
          accessibilityRole="button"
          accessibilityLabel="Enviar mensaje"
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.secondaryButton, { marginTop: 10 }]}
        onPress={() => { speakGuidance('Volviendo al menú de configuración'); setCurrentSection('menu'); }}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryButtonText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );

  const getInitials = () => {
    if (!profile) return '?';
    const nombre = profile.nombre || '';
    const apellido = profile.apellido || '';
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase() || 'U';
  };

  const renderMenu = () => (
    <ScrollView contentContainerStyle={styles.profileScroll}>
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <View style={styles.profileAvatar}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
        <Text style={styles.profileName} accessibilityRole="header">
          {profile ? `${profile.nombre} ${profile.apellido}` : 'Usuario'}
        </Text>
        <Text style={styles.profileEmail}>{profile?.correo || 'correo@ejemplo.com'}</Text>
      </View>

      <TouchableOpacity
        style={styles.profileMenuItem}
        onPress={() => { speakGuidance('Abriendo datos personales'); setCurrentSection('personal'); }}
        accessibilityRole="button"
        accessibilityLabel="Ir a Datos Personales"
      >
        <Ionicons name="person" size={24} color="#333" />
        <Text style={styles.profileMenuText}>Datos Personales</Text>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.profileMenuItem}
        onPress={() => { speakGuidance('Abriendo métodos de pago'); setCurrentSection('payment'); }}
        accessibilityRole="button"
        accessibilityLabel="Ir a Métodos de Pago"
      >
        <Ionicons name="card" size={24} color="#333" />
        <Text style={styles.profileMenuText}>Métodos de Pago</Text>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.profileMenuItem}
        onPress={() => { speakGuidance('Abriendo ayuda y soporte'); setCurrentSection('support'); }}
        accessibilityRole="button"
        accessibilityLabel="Ir a Ayuda y Soporte"
      >
        <Ionicons name="help-buoy" size={24} color="#333" />
        <Text style={styles.profileMenuText}>Ayuda y Soporte</Text>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.profileMenuItem, { borderBottomWidth: 0, marginTop: 20 }]}
        onPress={() => { speakGuidance('Cerrando sesión'); onLogout(); }}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
      >
        <Ionicons name="log-out" size={24} color="red" />
        <Text style={[styles.profileMenuText, { color: 'red' }]}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={[styles.fullScreenContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.fullScreenContainer}>
      <VoiceButton onCommand={handleVoiceCommand} currentScreen={`profile_${currentSection}`} />
      <View style={styles.profileHeader}>
        <Text style={styles.profileHeaderTitle}>Mi Cuenta</Text>
      </View>
      <View style={styles.profileBody}>
        {currentSection === 'menu' && renderMenu()}
        {currentSection === 'personal' && renderPersonalData()}
        {currentSection === 'payment' && renderPaymentMethods()}
        {currentSection === 'support' && renderSupport()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  profileHeader: { backgroundColor: '#fff', padding: 30, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 },
  profileHeaderTitle: { fontSize: 22, fontWeight: 'bold' },
  profileBody: { flex: 1, padding: 20 },
  profileScroll: { paddingBottom: 30 },
  profileAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  profileName: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  profileEmail: { fontSize: 16, color: '#666' },
  profileMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#eee', justifyContent: 'space-between' },
  profileMenuText: { flex: 1, fontSize: 18, marginLeft: 15, fontWeight: '500' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputContainer: { marginBottom: 15 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  accessibleInput: { borderWidth: 2, borderColor: '#000', borderRadius: 10, padding: 15, fontSize: 16, backgroundColor: '#fff' },
  inputDisabled: { backgroundColor: '#f5f5f5', borderColor: '#ccc' },
  primaryButton: { backgroundColor: '#000', height: 55, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 25 },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  secondaryButton: { backgroundColor: '#666', height: 55, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  secondaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
  paymentOptionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, marginBottom: 10, backgroundColor: '#fff' },
  paymentOptionSelected: { borderColor: '#000', borderWidth: 2, backgroundColor: '#f0f0f0' },
  paymentText: { fontSize: 18, marginLeft: 10, fontWeight: '600' },
  chatList: { flex: 1, marginBottom: 10 },
  chatBubble: { padding: 15, borderRadius: 15, maxWidth: '80%', marginBottom: 10 },
  chatBubbleBot: { backgroundColor: '#e5e5ea', alignSelf: 'flex-start', borderBottomLeftRadius: 0 },
  chatBubbleUser: { backgroundColor: '#000', alignSelf: 'flex-end', borderBottomRightRadius: 0 },
  chatText: { fontSize: 16 },
  chatInputContainer: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 10 },
  chatInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 10, fontSize: 16, backgroundColor: '#fff', marginRight: 10 },
  chatSendButton: { backgroundColor: '#000', width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center' }
});

export default UserProfileView;