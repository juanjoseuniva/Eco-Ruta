import * as Location from 'expo-location';
import { speakGuidance } from '../utils/speechHelper';

export const requestLocationPermission = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    speakGuidance('Permiso de ubicación denegado. Usando ubicación predeterminada');
    return null;
  }
  return status;
};

export const getCurrentLocation = async () => {
  try {
    const status = await requestLocationPermission();
    if (!status) {
      return { latitude: 4.6865, longitude: -74.0537, latitudeDelta: 0.01, longitudeDelta: 0.01 };
    }
    
    speakGuidance('Obteniendo tu ubicación actual');
    let location = await Location.getCurrentPositionAsync({});
    speakGuidance('Ubicación obtenida. Mapa listo para usar');
    
    return { 
      latitude: location.coords.latitude, 
      longitude: location.coords.longitude, 
      latitudeDelta: 0.01, 
      longitudeDelta: 0.01 
    };
  } catch (error) {
    console.log('Error getting location:', error);
    return { latitude: 4.6865, longitude: -74.0537, latitudeDelta: 0.01, longitudeDelta: 0.01 };
  }
};

export const reverseGeocode = async (coords) => {
  try {
    let addressResponse = await Location.reverseGeocodeAsync(coords);
    if (addressResponse.length > 0) {
      const addr = addressResponse[0];
      const street = addr.street || addr.name || '';
      const number = addr.streetNumber || '';
      const city = addr.city || addr.region || '';
      const fullAddress = `${street} ${number}, ${city}`.replace(/^ , /, '').trim() || "Ubicación en mapa";
      return fullAddress;
    }
    return "Ubicación en mapa";
  } catch (error) {
    console.log('Error reverse geocoding:', error);
    return "Ubicación seleccionada en mapa";
  }
};