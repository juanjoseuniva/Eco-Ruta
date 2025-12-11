import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { speakGuidance } from '../../utils/speechHelper';
import VoiceButton from '../common/VoiceButton';

const TripStatusScreen = ({ status, onCancel, onVoiceCommand }) => {
  const [showSOSModal, setShowSOSModal] = useState(false);

  const getStatusText = () => {
    switch(status) {
      case 'found': return "Conductor Encontrado";
      case 'arrived': return "¡El conductor ha llegado!";
      case 'riding': return "EN VIAJE";
      default: return "Estado desconocido";
    }
  };

  const getStatusColor = () => {
    switch(status) {
      case 'found': return "#FFD700";
      case 'arrived': return "#28a745";
      case 'riding': return "#007bff";
      default: return "#eee";
    }
  };

  useEffect(() => {
    if (status === 'found') {
      speakGuidance('Conductor encontrado. Carlos Rodríguez. Vehículo Nissan Versa color plata. Placas XYZ 123 A. Llegará en 3 minutos. Tu código de seguridad es: PATO. No subas hasta que el conductor diga la clave. Di cancelar si deseas cancelar el viaje');
    } else if (status === 'arrived') {
      speakGuidance('El conductor ha llegado a tu ubicación. Verifica el código de seguridad PATO antes de abordar');
    } else if (status === 'riding') {
      speakGuidance('Viaje en curso. Estás en camino a tu destino. Disfruta tu viaje');
    }
  }, [status]);

  const handleVoiceCommand = (command) => {
    if (command === "cancel" && status !== 'riding') {
      speakGuidance('Cancelando viaje');
      onCancel();
    } else {
      onVoiceCommand(command);
    }
  };

  const handleSOSPress = () => {
    setShowSOSModal(true);
    speakGuidance('Emergencia activada. El viaje ha sido cancelado por motivos de seguridad. Se ha notificado a las autoridades');
  };

  const handleSOSConfirm = () => {
    setShowSOSModal(false);
    speakGuidance('Viaje cancelado por emergencia. Mantente seguro');
    // Esperar un momento para que se escuche el audio antes de cancelar
    setTimeout(() => {
      onCancel();
    }, 2000);
  };

  return (
    <View style={styles.mainContainer}>
      <VoiceButton onCommand={handleVoiceCommand} currentScreen="trip_status" />
      
      <View style={[styles.statusHeader, { borderBottomColor: getStatusColor() }]}>
        <Text style={styles.statusHeaderText} accessibilityLiveRegion="assertive">{getStatusText()}</Text>
        <Text style={styles.statusSubText}>
          {status === 'found' ? "Llega en 3 minutos" : status === 'arrived' ? "Esperando en el punto" : "Estás en camino a tu destino"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{padding: 20}}>
        <View style={styles.driverCard} importantForAccessibility="yes">
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
             <View style={styles.driverAvatarPlaceholder}>
               <Ionicons name="person" size={40} color="#fff" />
             </View>
             <View style={{marginLeft: 15}}>
               <Text style={styles.driverName}>Carlos Rodríguez</Text>
               <Text style={styles.driverRating}>★ 4.8 • 1,240 viajes</Text>
             </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.vehicleInfoRow}>
            <View style={{flex: 1}}>
              <Text style={styles.vehicleLabel}>Vehículo</Text>
              <Text style={styles.vehicleValue}>Nissan Versa</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.vehicleLabel}>Color</Text>
              <Text style={styles.vehicleValue}>Plata (Gris)</Text>
            </View>
          </View>
          <View style={styles.vehicleInfoRow}>
            <View style={{flex: 1}}>
              <Text style={styles.vehicleLabel}>Placas</Text>
              <Text style={styles.plateValue}>XYZ-123-A</Text>
            </View>
          </View>
        </View>

        {status !== 'riding' && (
          <View style={styles.safetyCodeContainer} accessibilityLabel="Código de seguridad.">
            <Text style={styles.safetyLabel}>TU CÓDIGO DE SEGURIDAD</Text>
            <Text style={styles.safetyCode}>PATO</Text>
            <Text style={styles.safetyHint}>No subas hasta que el conductor diga la clave.</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.emergencyButton} 
          accessibilityRole="button" 
          accessibilityLabel="Botón de emergencia SOS"
          onPress={handleSOSPress}
        >
          <Ionicons name="alert-circle" size={24} color="#d32f2f" style={{ marginRight: 10 }} />
          <Text style={styles.emergencyText}>SOS / EMERGENCIA</Text>
        </TouchableOpacity>

        {status !== 'riding' && (
          <TouchableOpacity 
            onPress={() => { 
              speakGuidance('Cancelando viaje'); 
              onCancel(); 
            }} 
            style={{marginTop: 20, alignItems: 'center'}}
          >
            <Text style={{color: 'red', fontWeight: 'bold'}}>Cancelar Viaje</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modal de SOS */}
      <Modal
        visible={showSOSModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSOSModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="alert-circle" size={80} color="#d32f2f" />
            </View>
            <Text style={styles.modalTitle}>EMERGENCIA ACTIVADA</Text>
            <Text style={styles.modalMessage}>
              El viaje ha sido cancelado por motivos de seguridad.{'\n\n'}
              Se ha notificado a las autoridades y al equipo de soporte.{'\n\n'}
              Tu seguridad es nuestra prioridad.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleSOSConfirm}
            >
              <Text style={styles.modalButtonText}>ENTENDIDO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  statusHeader: { 
    padding: 30, 
    borderBottomWidth: 4, 
    backgroundColor: '#fff', 
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: {width: 0, height: 2}, 
    shadowOpacity: 0.1, 
    shadowRadius: 3 
  },
  statusHeaderText: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  statusSubText: { fontSize: 16, color: '#666', marginTop: 5 },
  driverCard: { 
    backgroundColor: '#f9f9f9', 
    padding: 20, 
    borderRadius: 15, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#eee' 
  },
  driverAvatarPlaceholder: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#333', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  driverName: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  driverRating: { fontSize: 14, color: '#555', marginTop: 3 },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 15 },
  vehicleInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  vehicleLabel: { fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 1 },
  vehicleValue: { fontSize: 18, fontWeight: 'bold', color: '#000', marginTop: 2 },
  plateValue: { 
    fontSize: 24, 
    fontWeight: '900', 
    color: '#000', 
    marginTop: 2, 
    letterSpacing: 2, 
    backgroundColor: '#fff', 
    paddingHorizontal: 10, 
    paddingVertical: 2, 
    borderWidth: 2, 
    borderColor: '#000', 
    borderRadius: 5, 
    alignSelf: 'flex-start' 
  },
  safetyCodeContainer: { 
    backgroundColor: '#e8f5e9', 
    padding: 20, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#c8e6c9' 
  },
  safetyLabel: { fontSize: 12, color: '#2e7d32', fontWeight: 'bold', marginBottom: 5 },
  safetyCode: { fontSize: 32, fontWeight: 'bold', color: '#1b5e20', letterSpacing: 2 },
  safetyHint: { fontSize: 14, color: '#2e7d32', textAlign: 'center', marginTop: 5 },
  emergencyButton: { 
    backgroundColor: '#ffebee', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: '#ffcdd2',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  emergencyText: { color: '#d32f2f', fontWeight: 'bold', fontSize: 16 },
  
  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  modalIconContainer: {
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 15,
    textAlign: 'center'
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25
  },
  modalButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center'
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1
  }
});

export default TripStatusScreen;