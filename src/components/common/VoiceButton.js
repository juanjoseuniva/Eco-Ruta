import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { speakGuidance } from '../../utils/speechHelper';

const VoiceButton = ({ onCommand, currentScreen }) => {
  const [showModal, setShowModal] = useState(false);

  const simulateVoiceCommand = (command, extra) => {
    Vibration.vibrate(50);
    setShowModal(false);

    if (command === "searchPlace" && extra) {
      speakGuidance(`Buscando ${extra}`);
    } else if (command === "confirm") {
      speakGuidance('Confirmando');
    } else if (command === "goBack") {
      speakGuidance('Volviendo atrás');
    } else if (command === "openPersonalData") {
      speakGuidance('Abriendo datos personales');
    } else if (command === "openPaymentMethods") {
      speakGuidance('Abriendo métodos de pago');
    } else if (command === "openSupport") {
      speakGuidance('Abriendo ayuda y soporte');
    } else if (command === "goToMain") {
      speakGuidance('Ir a página principal');
    } else if (command === "goToProfile") {
      speakGuidance('Ir a mi cuenta');
    } else if (command === "goToHistory") {
      speakGuidance('Ir a resumen de gastos');
    } else if (command === "goToRegister") {
      speakGuidance('Ir a crear cuenta');
    }

    onCommand(command, extra);
  };

  const renderGlobalNavigation = () => (
    <>
      <Text style={styles.sectionTitle}>Navegación Principal</Text>

      <TouchableOpacity
        style={styles.commandButton}
        onPress={() => simulateVoiceCommand("goToMain")}
      >
        <Ionicons name="home" size={24} color="#4CAF50" />
        <View style={styles.commandTextContainer}>
          <Text style={styles.commandText}>Página Principal</Text>
          <Text style={styles.commandSubtext}>Ir al mapa y búsqueda</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.commandButton}
        onPress={() => simulateVoiceCommand("goToProfile")}
      >
        <Ionicons name="person" size={24} color="#2196F3" />
        <View style={styles.commandTextContainer}>
          <Text style={styles.commandText}>Mi Cuenta</Text>
          <Text style={styles.commandSubtext}>Ver perfil y configuración</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.commandButton}
        onPress={() => simulateVoiceCommand("goToHistory")}
      >
        <Ionicons name="stats-chart" size={24} color="#FF9800" />
        <View style={styles.commandTextContainer}>
          <Text style={styles.commandText}>Resumen de Gastos</Text>
          <Text style={styles.commandSubtext}>Ver historial de viajes</Text>
        </View>
      </TouchableOpacity>
    </>
  );

  const renderCommandOptions = () => {
    // Login screen
    if (currentScreen === 'login') {
      return (
        <>
          <Text style={styles.sectionTitle}>Acciones Disponibles</Text>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("confirm")}
          >
            <Ionicons name="log-in" size={24} color="#4CAF50" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Iniciar Sesión</Text>
              <Text style={styles.commandSubtext}>Confirmar e ingresar</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("cancel")}
          >
            <Ionicons name="person-add" size={24} color="#2196F3" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Crear Cuenta</Text>
              <Text style={styles.commandSubtext}>Ir a registro</Text>
            </View>
          </TouchableOpacity>
        </>
      );
    }

    // Register screen
    if (currentScreen === 'register') {
      return (
        <>
          <Text style={styles.sectionTitle}>Acciones Disponibles</Text>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("confirm")}
          >
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Continuar</Text>
              <Text style={styles.commandSubtext}>Crear cuenta</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("goBack")}
          >
            <Ionicons name="arrow-back" size={24} color="#666" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Volver</Text>
              <Text style={styles.commandSubtext}>Regresar a inicio de sesión</Text>
            </View>
          </TouchableOpacity>
        </>
      );
    }

    // Main map screen
    if (currentScreen === 'main') {
      return (
        <>
          <Text style={styles.sectionTitle}>Destinos principales</Text>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("searchPlace", "unicentro")}
          >
            <Ionicons name="cart" size={24} color="#4CAF50" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Unicentro Cali</Text>
              <Text style={styles.commandSubtext}>Centro Comercial</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("searchPlace", "aeropuerto")}
          >
            <Ionicons name="airplane" size={24} color="#2196F3" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Aeropuerto Alfonso Bonilla</Text>
              <Text style={styles.commandSubtext}>Palmira</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("searchPlace", "terminal")}
          >
            <Ionicons name="bus" size={24} color="#FF9800" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Terminal de Transporte</Text>
              <Text style={styles.commandSubtext}>Cali</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Otros comandos</Text>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("focusSearch")}
          >
            <Ionicons name="search" size={24} color="#666" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Abrir buscador</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Navegación Rápida</Text>
          {renderGlobalNavigation()}
        </>
      );
    } else if (currentScreen === 'profile_menu' || currentScreen === 'profile_personal' || currentScreen === 'profile_payment' || currentScreen === 'profile_support') {
      return (
        <>
          <Text style={styles.sectionTitle}>Navegación de Perfil</Text>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("openPersonalData")}
          >
            <Ionicons name="person" size={24} color="#4CAF50" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Datos Personales</Text>
              <Text style={styles.commandSubtext}>Ver y editar información</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("openPaymentMethods")}
          >
            <Ionicons name="card" size={24} color="#2196F3" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Métodos de Pago</Text>
              <Text style={styles.commandSubtext}>Gestionar formas de pago</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("openSupport")}
          >
            <Ionicons name="help-buoy" size={24} color="#FF9800" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Ayuda y Soporte</Text>
              <Text style={styles.commandSubtext}>Obtener asistencia</Text>
            </View>
          </TouchableOpacity>

          {currentScreen !== 'profile_menu' && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Acciones</Text>

              <TouchableOpacity
                style={styles.commandButton}
                onPress={() => simulateVoiceCommand("goBack")}
              >
                <Ionicons name="arrow-back" size={24} color="#666" />
                <View style={styles.commandTextContainer}>
                  <Text style={styles.commandText}>Volver al menú</Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Navegación Rápida</Text>
          {renderGlobalNavigation()}

          {currentScreen === 'profile_payment' && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Métodos de Pago</Text>

              <TouchableOpacity
                style={styles.commandButton}
                onPress={() => simulateVoiceCommand("selectPayment", "efectivo")}
              >
                <Ionicons name="cash" size={24} color="#4CAF50" />
                <View style={styles.commandTextContainer}>
                  <Text style={styles.commandText}>Seleccionar Efectivo</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.commandButton}
                onPress={() => simulateVoiceCommand("selectPayment", "nequi")}
              >
                <Ionicons name="phone-portrait" size={24} color="#FF1744" />
                <View style={styles.commandTextContainer}>
                  <Text style={styles.commandText}>Seleccionar Nequi</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.commandButton}
                onPress={() => simulateVoiceCommand("selectPayment", "pse")}
              >
                <Ionicons name="card" size={24} color="#2196F3" />
                <View style={styles.commandTextContainer}>
                  <Text style={styles.commandText}>Seleccionar PSE</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </>
      );
    } else if (currentScreen === 'trip_details') {
      return (
        <>
          <Text style={styles.sectionTitle}>Seleccionar vehículo</Text>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("selectCar", 1)}
          >
            <Ionicons name="car-sport" size={24} color="#000" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Seleccionar Uber</Text>
              <Text style={styles.commandSubtext}>Confort</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("selectCar", 2)}
          >
            <Ionicons name="flash" size={24} color="#FF9800" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Seleccionar DiDi</Text>
              <Text style={styles.commandSubtext}>Rápido</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("selectCar", 3)}
          >
            <Ionicons name="car" size={24} color="#FFEB3B" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Seleccionar Taxi</Text>
              <Text style={styles.commandSubtext}>Básico</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Acciones</Text>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("confirm")}
          >
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Confirmar selección</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("goBack")}
          >
            <Ionicons name="arrow-back" size={24} color="#666" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Volver al mapa</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Navegación Rápida</Text>
          {renderGlobalNavigation()}
        </>
      );
    } else if (currentScreen === 'payment') {
      return (
        <>
          <Text style={styles.sectionTitle}>Método de pago</Text>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("selectPayment", "cash")}
          >
            <Ionicons name="cash" size={24} color="#4CAF50" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Pagar en Efectivo</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("selectPayment", "nequi")}
          >
            <Ionicons name="phone-portrait" size={24} color="#FF1744" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Pagar con Nequi</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("selectPayment", "pse")}
          >
            <Ionicons name="card" size={24} color="#2196F3" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Pagar con PSE</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Acciones</Text>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("confirm")}
          >
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Confirmar pago</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("goBack")}
          >
            <Ionicons name="arrow-back" size={24} color="#666" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Volver</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Navegación Rápida</Text>
          {renderGlobalNavigation()}
        </>
      );
    } else if (currentScreen === 'wallet') {
      // Wallet/history screen - no navigation options
      return (
        <>
          <Text style={styles.sectionTitle}>Navegación</Text>
          {renderGlobalNavigation()}
        </>
      );
    } else {
      // Default fallback
      return (
        <>
          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("confirm")}
          >
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Confirmar</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("cancel")}
          >
            <Ionicons name="close-circle" size={24} color="#f44336" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Cancelar</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commandButton}
            onPress={() => simulateVoiceCommand("goBack")}
          >
            <Ionicons name="arrow-back" size={24} color="#666" />
            <View style={styles.commandTextContainer}>
              <Text style={styles.commandText}>Volver</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Navegación Rápida</Text>
          {renderGlobalNavigation()}
        </>
      );
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.voiceButton,
          currentScreen === 'main' && { bottom: 120 }  // Higher on main screen to avoid overlap
        ]}
        onPress={() => {
          speakGuidance('Menú de comandos de voz. Selecciona una acción');
          setShowModal(true);
        }}
        accessibilityLabel="Abrir comandos de voz"
        accessibilityHint="Presiona para ver comandos disponibles"
      >
        <Ionicons name="mic" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comandos de Voz</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.commandsContainer} showsVerticalScrollIndicator={false}>
              {renderCommandOptions()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  voiceButton: {
    position: 'absolute',
    bottom: 20,  // Will be overridden for main screen
    alignSelf: 'center',  // Better centering
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 999
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 30,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  commandsContainer: {
    padding: 20
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase'
  },
  commandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 10
  },
  commandTextContainer: {
    marginLeft: 15,
    flex: 1
  },
  commandText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000'
  },
  commandSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 2
  }
});

export default VoiceButton;