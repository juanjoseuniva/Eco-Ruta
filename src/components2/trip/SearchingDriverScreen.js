import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { speakGuidance } from '../../utils/speechHelper';
import VoiceButton from '../common/VoiceButton';

const SearchingDriverScreen = ({ onCancel, onVoiceCommand, onDriverFound }) => {
  const [searchComplete, setSearchComplete] = useState(false);

  useEffect(() => {
    // Reproducir audio de búsqueda
    speakGuidance('Buscando conductor cercano. Estamos conectando con las redes de transporte. Di cancelar para detener la búsqueda');
    
    // Simular búsqueda de conductor con tiempo suficiente para que el audio termine
    const searchTimer = setTimeout(() => {
      setSearchComplete(true);
      // Esperar 1 segundo adicional después de que termine el audio para dar tiempo de escuchar
      setTimeout(() => {
        if (onDriverFound) {
          onDriverFound();
        }
      }, 1000);
    }, 8000); // 8 segundos para permitir que el audio se escuche completo

    return () => clearTimeout(searchTimer);
  }, [onDriverFound]);

  const handleVoiceCommand = (command) => {
    if (command === "cancel" || command === "goBack") {
      speakGuidance('Búsqueda cancelada');
      onCancel();
    } else {
      onVoiceCommand(command);
    }
  };

  return (
    <View style={styles.fullScreenCenter}>
      <VoiceButton onCommand={handleVoiceCommand} currentScreen="searching" />
      <View style={styles.radarContainer}>
        <Ionicons name="radio" size={80} color="#000" />
      </View>
      <Text style={styles.searchingTitle} accessibilityLiveRegion="polite">
        {searchComplete ? '¡Conductor encontrado!' : 'Buscando conductor cercano...'}
      </Text>
      <Text style={styles.searchingSub}>
        {searchComplete 
          ? 'Preparando detalles del viaje' 
          : 'Estamos contactando con las redes de DiDi y Uber.'}
      </Text>
      <ActivityIndicator size="large" color="#000" style={{ marginTop: 30 }} />
      <TouchableOpacity 
        style={styles.cancelSearchButton} 
        accessibilityRole="button" 
        accessibilityLabel="Cancelar búsqueda" 
        onPress={() => { 
          speakGuidance('Búsqueda cancelada'); 
          onCancel(); 
        }}
      >
        <Text style={styles.cancelSearchText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#fff' },
  radarContainer: { marginBottom: 30 },
  searchingTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  searchingSub: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 },
  cancelSearchButton: { marginTop: 50, padding: 15 },
  cancelSearchText: { color: '#666', fontSize: 16, textDecorationLine: 'underline' }
});

export default SearchingDriverScreen;