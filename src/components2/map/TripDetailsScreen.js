import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { formatCOP } from '../../utils/formatters';
import { speakGuidance } from '../../utils/speechHelper';
import VoiceButton from '../common/VoiceButton';

const { height } = Dimensions.get('window');

const TripDetailsScreen = ({ destination, destinationAddress, onBack, onProceedToPayment, onVoiceCommand }) => {
  const [selectedCar, setSelectedCar] = useState(1);

  useEffect(() => {
    speakGuidance('Detalles del viaje. Elige tu vehículo. Di uber, didi o taxi para seleccionar. Di confirmar para continuar');
  }, []);

  const fareOptions = [
    { id: 1, name: 'Uber', price: 15000, time: '4 min', icon: 'car-sport', access: 'Confort' },
    { id: 2, name: 'DiDi', price: 13000, time: '6 min', icon: 'flash', access: 'Rápido' },
    { id: 3, name: 'Taxi', price: 11000, time: '8 min', icon: 'car', access: 'Básico' },
  ];

  const handleVoiceCommand = (command, extra) => {
    if (command === "goBack") {
      speakGuidance('Volviendo al mapa');
      onBack();
    } else if (command === "selectCar") {
      setSelectedCar(extra);
      const car = fareOptions.find(c => c.id === extra);
      speakGuidance(`${car.name} seleccionado. Precio ${car.price} pesos`);
    } else if (command === "confirm") {
      const selected = fareOptions.find(c => c.id === selectedCar);
      speakGuidance(`Confirmando viaje con ${selected.name}`);
      onProceedToPayment(selected);
    } else {
      onVoiceCommand(command, extra);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <VoiceButton onCommand={handleVoiceCommand} currentScreen="trip_details" />
      <View style={styles.miniMapContainer}>
        <MapView 
          style={styles.miniMap} 
          scrollEnabled={false} 
          zoomEnabled={false} 
          region={{ 
            latitude: destination.latitude, 
            longitude: destination.longitude, 
            latitudeDelta: 0.005, 
            longitudeDelta: 0.005 
          }}
        >
          <Marker coordinate={destination} pinColor="red" />
        </MapView>
        <TouchableOpacity 
          style={styles.floatingBackButton} 
          onPress={() => { speakGuidance('Volviendo al mapa'); onBack(); }}
          accessibilityRole="button" 
          accessibilityLabel="Volver al mapa"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tripDetailsContainer}>
        <Text style={styles.tripTitle}>Detalles del Viaje</Text>
        
        <View style={styles.addressRow}>
          <Ionicons name="navigate-circle" size={24} color="blue" />
          <Text style={styles.addressText}>Ubicación Actual</Text>
        </View>
        <View style={styles.lineConnector} />
        <View style={styles.addressRow}>
          <Ionicons name="location" size={24} color="red" />
          <Text style={[styles.addressText, { fontWeight: 'bold', color: '#000' }]} numberOfLines={1}>
            {destinationAddress || "Destino Seleccionado"}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { alignSelf: 'flex-start', marginTop: 20, fontSize: 16 }]}>
          Elige tu vehículo
        </Text>
        
        <FlatList 
          data={fareOptions} 
          keyExtractor={(item) => item.id.toString()} 
          showsVerticalScrollIndicator={false} 
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.carOption, selectedCar === item.id && styles.carOptionSelected]} 
              onPress={() => {
                setSelectedCar(item.id);
                speakGuidance(`${item.name} seleccionado. Precio ${item.price} pesos. Tiempo de espera ${item.time}`);
              }}
              accessibilityLabel={`Opción ${item.name}, precio ${item.price} pesos, llegada en ${item.time}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedCar === item.id }}
            >
              <View style={styles.carIconBox}>
                <Ionicons 
                  name={item.icon} 
                  size={30} 
                  color={selectedCar === item.id ? "#fff" : "#000"} 
                />
              </View>
              <View style={{ flex: 1, paddingHorizontal: 10 }}>
                <Text style={styles.carName}>{item.name}</Text>
                <Text style={styles.carAccess}>{item.access}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.carPrice}>{formatCOP(item.price)}</Text>
                <Text style={styles.carTime}>{item.time}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
        
        <TouchableOpacity 
          style={styles.confirmTripButton} 
          onPress={() => {
            const selected = fareOptions.find(c => c.id === selectedCar);
            speakGuidance(`Confirmando viaje con ${selected.name}. Dirigiendo a métodos de pago`);
            onProceedToPayment(selected);
          }}
          accessibilityRole="button"
        >
          <Text style={styles.confirmTripText}>Ir a Pagar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  miniMapContainer: { height: height * 0.35, width: '100%' },
  miniMap: { width: '100%', height: '100%' },
  floatingBackButton: { position: 'absolute', top: 50, left: 20, backgroundColor: '#fff', padding: 10, borderRadius: 20, elevation: 5 },
  tripDetailsContainer: { flex: 1, backgroundColor: '#fff', marginTop: -20, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, elevation: 10 },
  tripTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  addressText: { marginLeft: 10, fontSize: 16, color: '#666' },
  lineConnector: { height: 15, width: 1, backgroundColor: '#ccc', marginLeft: 11, marginVertical: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#000' },
  carOption: { flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 10, borderRadius: 12, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  carOptionSelected: { borderColor: '#000', backgroundColor: '#f9f9f9' },
  carIconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  carName: { fontWeight: 'bold', fontSize: 16 },
  carAccess: { fontSize: 12, color: '#666' },
  carPrice: { fontWeight: 'bold', fontSize: 16 },
  carTime: { fontSize: 12, color: '#666' },
  confirmTripButton: { backgroundColor: '#000', height: 55, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  confirmTripText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default TripDetailsScreen;