import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MOCK_PLACES_DB } from '../../utils/constants';
import { speakGuidance } from '../../utils/speechHelper';
import VoiceButton from '../common/VoiceButton';
import UserProfileView from '../profile/UserProfileView';
import WalletScreen from '../wallet/WalletScreen';

const { height } = Dimensions.get('window');

const MainMapScreen = ({ onNavigateToTrip, destination, setDestination, setDestinationAddress, onLogout, tripHistory, onVoiceCommand }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'home') {
      speakGuidance('Pantalla principal. Mapa de navegación. Di el nombre de un lugar o usa el buscador para seleccionar tu destino');
    }
  }, [activeTab]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Se necesita acceso a la ubicación');
          setUserLocation({
            latitude: 3.4516,
            longitude: -76.5320,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        setUserLocation({
          latitude: 3.4516,
          longitude: -76.5320,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    })();
  }, []);

  const handleSearchTextChange = (text) => {
    setSearchText(text);
    if (text.length > 0) {
      const filtered = MOCK_PLACES_DB.filter(place => place.description.toLowerCase().includes(text.toLowerCase()));
      setSuggestions(filtered);
      if (filtered.length > 0) {
        speakGuidance(`${filtered.length} resultados encontrados`);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (place) => {
    Keyboard.dismiss();
    setSearchText(place.description);
    setSuggestions([]);
    setDestination(place.coords);
    setDestinationAddress(place.description);
    speakGuidance(`Destino seleccionado: ${place.description}`);
    if (mapRef.current) mapRef.current.animateToRegion({ ...place.coords, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 1000);
  };

  const handleMapPress = async (e) => {
    const coords = e.nativeEvent.coordinate;
    setDestination(coords);
    setSuggestions([]);
    Keyboard.dismiss();
    speakGuidance('Punto marcado en el mapa');

    try {
      let result = await Location.reverseGeocodeAsync(coords);
      if (result[0]) {
        const address = `${result[0].street || ''} ${result[0].name || ''}, ${result[0].city || 'Ubicación'}`;
        setSearchText(address);
        setDestinationAddress(address);
        speakGuidance(`Dirección identificada: ${address}`);
      }
    } catch (error) {
      setSearchText('Ubicación seleccionada');
      setDestinationAddress('Ubicación en el mapa');
    }
  };

  const handleVoiceCommand = (command, extra) => {
    if (command === "goToMain") {
      speakGuidance('Volviendo a página principal');
      setActiveTab('home');
    } else if (command === "goToProfile") {
      speakGuidance('Abriendo perfil');
      setActiveTab('profile');
    } else if (command === "goToHome") {
      speakGuidance('Volviendo al mapa');
      setActiveTab('home');
    } else if (command === "goToHistory") {
      speakGuidance('Abriendo historial');
      setActiveTab('history');
    } else if (command === "focusSearch") {
      speakGuidance('Buscador activado. Escribe o di el nombre del lugar');
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } else if (command === "searchPlace") {
      const query = extra.toLowerCase();
      const filtered = MOCK_PLACES_DB.filter(place => place.description.toLowerCase().includes(query));
      if (filtered.length > 0) {
        handleSelectSuggestion(filtered[0]);
      } else {
        speakGuidance(`No se encontraron lugares con ${query}`);
      }
    } else if (command === "confirm" && destination) {
      speakGuidance('Confirmando destino');
      onNavigateToTrip();
    } else {
      onVoiceCommand(command, extra);
    }
  };

  const renderContent = () => {
    if (activeTab === 'home') {
      if (!userLocation) {
        return (
          <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={{ marginTop: 10 }}>Obteniendo tu ubicación...</Text>
          </View>
        );
      }

      return (
        <View style={{ flex: 1 }}>
          <VoiceButton onCommand={handleVoiceCommand} currentScreen="main" />

          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={userLocation}
            showsUserLocation={true}
            showsMyLocationButton={true}
            onPress={handleMapPress}
          >
            {destination && (
              <Marker
                coordinate={destination}
                title="Destino Seleccionado"
                pinColor="red"
              />
            )}
          </MapView>

          <View style={styles.googleSearchContainer}>
            <View style={[styles.searchBar, suggestions.length > 0 && styles.searchBarActive]}>
              <TouchableOpacity onPress={() => { speakGuidance('Abriendo menú de perfil'); setActiveTab('profile'); }}>
                <Image source={require('../../../assets/logo-ecoruta.png')} style={{ width: 30, height: 30 }} resizeMode="contain" />
              </TouchableOpacity>
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="¿A dónde vas?"
                placeholderTextColor="#666"
                value={searchText}
                onChangeText={handleSearchTextChange}
                onFocus={() => {
                  speakGuidance('Buscador de destinos. Escribe el lugar al que deseas ir');
                  if (destination) setSuggestions([]);
                }}
              />
              {searchText.length > 0 ? (
                <TouchableOpacity onPress={() => {
                  setSearchText('');
                  setSuggestions([]);
                  setDestination(null);
                  speakGuidance('Búsqueda limpiada');
                }}>
                  <Ionicons name="close" size={24} color="#555" />
                </TouchableOpacity>
              ) : (
                <Ionicons name="mic" size={24} color="#555" />
              )}
            </View>
            {suggestions.length > 0 && (
              <View style={styles.suggestionsCard}>
                <FlatList
                  data={suggestions}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => handleSelectSuggestion(item)}
                      accessibilityLabel={`Sugerencia: ${item.description}`}
                    >
                      <View style={styles.suggestionIconCircle}>
                        <Ionicons name="location-sharp" size={18} color="#fff" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.suggestionTitle}>{item.description.split(',')[0]}</Text>
                        <Text style={styles.suggestionSubtitle}>{item.description}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          {suggestions.length === 0 && (
            <View style={styles.bottomSheet}>
              <TouchableOpacity
                style={[styles.primaryButton, { opacity: destination ? 1 : 0.8 }]}
                onPress={() => {
                  if (destination) {
                    speakGuidance('Destino confirmado. Mostrando opciones de vehículos');
                    onNavigateToTrip();
                  } else {
                    speakGuidance('Debes seleccionar un destino primero');
                    Alert.alert("Destino", "Usa el buscador o toca el mapa");
                  }
                }}
              >
                <Text style={styles.primaryButtonText}>
                  {destination ? "Confirmar Destino" : "Selecciona destino"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    } else if (activeTab === 'profile') {
      return <UserProfileView onLogout={onLogout} onVoiceCommand={handleVoiceCommand} />;
    } else {
      return <WalletScreen onVoiceCommand={handleVoiceCommand} />;
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentArea}>{renderContent()}</View>
      <View style={styles.bottomNavBar}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => {
            speakGuidance('Pestaña inicio. Mapa principal');
            setActiveTab('home');
          }}
          accessibilityLabel="Pestaña inicio"
        >
          <Ionicons name={activeTab === 'home' ? "home" : "home-outline"} size={28} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => {
            speakGuidance('Pestaña perfil. Configuración de cuenta');
            setActiveTab('profile');
          }}
          accessibilityLabel="Pestaña perfil"
        >
          <Ionicons name={activeTab === 'profile' ? "person" : "person-outline"} size={28} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => {
            speakGuidance('Pestaña historial. Resumen de gastos y viajes anteriores');
            setActiveTab('history');
          }}
          accessibilityLabel="Pestaña historial"
        >
          <Ionicons name={activeTab === 'history' ? "stats-chart" : "stats-chart-outline"} size={28} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  contentArea: { flex: 1 },
  map: { width: '100%', height: '100%' },
  googleSearchContainer: { position: 'absolute', top: 50, left: 15, right: 15, zIndex: 10 },
  searchBar: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 50, borderRadius: 8, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
  searchBarActive: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, elevation: 0 },
  searchInput: { flex: 1, marginLeft: 15, fontSize: 16, color: '#000' },
  suggestionsCard: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, elevation: 5, maxHeight: 250 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  suggestionIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  suggestionTitle: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  suggestionSubtitle: { fontSize: 13, color: '#777' },
  bottomSheet: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  primaryButton: { backgroundColor: '#000', height: 55, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 25 },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  bottomNavBar: { flexDirection: 'row', height: 70, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 10 },
  tabButton: { alignItems: 'center', justifyContent: 'center', padding: 10, flex: 1 }
});

export default MainMapScreen;