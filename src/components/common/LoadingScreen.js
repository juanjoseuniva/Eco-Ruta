import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { speakGuidance } from '../../utils/speechHelper';

const LoadingScreen = () => {
  useEffect(() => {
    speakGuidance('Registro completado exitosamente. Redirigiendo al mapa principal. Espera un momento');
  }, []);

  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
      <Ionicons name="checkmark-circle" size={120} color="#28a745" />
      <Text style={styles.successTitle}>¡Registrado de forma correcta!</Text>
      <Text style={styles.successSub}>Te estamos redirigiendo al mapa...</Text>
      <ActivityIndicator size="large" color="#000" style={{ marginTop: 30 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', marginTop: 20, textAlign: 'center' },
  successSub: { fontSize: 16, color: '#666', marginTop: 10, textAlign: 'center' }
});

export default LoadingScreen;