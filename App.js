import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, StyleSheet, UIManager, Vibration } from 'react-native';
import LegalScreen from './src/components/auth/LegalScreen';
import LoginScreen from './src/components/auth/LoginScreen';
import RegisterScreen from './src/components/auth/RegisterScreen';
import LoadingScreen from './src/components/common/LoadingScreen';
import MainMapScreen from './src/components/map/MainMapScreen';
import TripDetailsScreen from './src/components/map/TripDetailsScreen';
import PaymentScreen from './src/components/payment/PaymentScreen';
import SearchingDriverScreen from './src/components/trip/SearchingDriverScreen';
import TripStatusScreen from './src/components/trip/TripStatusScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { changeScreen } from './src/navigation/navigationHelper';
import HistoryScreen from './src/screens/HistoryScreen';
import HomeScreen from './src/screens/HomeScreen';
import PaymentMethodsScreen from './src/screens/PaymentMethodsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { initializeDatabase } from './src/services/databaseService';
import { savePayment } from './src/services/paymentsService';
import { saveRoute } from './src/services/routesService';
import { INITIAL_HISTORY } from './src/utils/constants';
import { speakGuidance } from './src/utils/speechHelper';

// Configuración de animaciones para Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

/**
 * Componente principal de la aplicación que maneja la navegación y el estado
 */
function MainApp() {
  const { user, profile, loading: authLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('login');
  const [globalPaymentMethod, setGlobalPaymentMethod] = useState('Efectivo');
  const [destination, setDestination] = useState(null);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [tripStatus, setTripStatus] = useState('searching');
  const [tripData, setTripData] = useState(null);
  const [paymentType, setPaymentType] = useState('');
  const [tripHistory, setTripHistory] = useState(INITIAL_HISTORY);
  const [dbInitialized, setDbInitialized] = useState(false);
  const timerRef = useRef([]);

  // Inicializar base de datos al montar la app
  useEffect(() => {
    const setupDatabase = async () => {
      console.log('Inicializando base de datos Supabase...');
      const results = await initializeDatabase();
      console.log('Resultados de inicialización de BD:', results);
      setDbInitialized(true);
    };

    setupDatabase();
  }, []);

  // Actualizar pantalla cuando cambia el estado de autenticación
  useEffect(() => {
    if (authLoading) {
      // Mientras se carga la autenticación, mantener la pantalla actual
      return;
    }

    if (user && profile) {
      // Usuario autenticado - ir a main (mapa) directamente
      if (currentScreen === 'login' || currentScreen === 'register' || currentScreen === 'success') {
        navigateToScreen('main');
      }
    } else {
      // Usuario no autenticado - ir a login si no está en flujo de auth
      const authScreens = ['login', 'register', 'terms', 'privacy'];
      if (!authScreens.includes(currentScreen)) {
        navigateToScreen('login');
      }
    }
  }, [user, profile, authLoading]);

  const clearSimulation = () => {
    timerRef.current.forEach(id => clearTimeout(id));
    timerRef.current = [];
  };

  const navigateToScreen = (screenName) => changeScreen(setCurrentScreen, screenName);

  const handleLogin = () => {
    // El login ya fue manejado por AuthContext, solo navegar directamente al mapa
    speakGuidance('Inicio de sesión exitoso. Bienvenido a Ecoruta');
    navigateToScreen('main');
  };

  const handleLogout = () => {
    speakGuidance('Sesión cerrada. Hasta pronto');
    setDestination(null);
    setDestinationAddress('');
    setTripData(null);
    clearSimulation();
    navigateToScreen('login');
  };

  const handleRegister = () => {
    navigateToScreen('success');
    setTimeout(() => {
      navigateToScreen('main');
    }, 3000);
  };

  const handleNavigateToMap = () => {
    navigateToScreen('main');
  };

  const handleProceedToPayment = (car) => {
    setTripData(car);
    navigateToScreen('payment');
  };

  const handleFinalizePaymentAndSearch = async (method) => {
    const metodoPago = method === 'cash' ? 'Efectivo' : method === 'nequi' ? 'Nequi' : 'PSE';
    setPaymentType(metodoPago);
    clearSimulation();
    setTripStatus('searching');
    navigateToScreen('searching');

    const t1 = setTimeout(() => {
      setTripStatus('found');
      Vibration.vibrate();
      navigateToScreen('trip_status');

      const t2 = setTimeout(() => {
        setTripStatus('arrived');
        Vibration.vibrate([0, 500]);

        const t3 = setTimeout(() => {
          setTripStatus('riding');
        }, 5000);
        timerRef.current.push(t3);

        const t4 = setTimeout(async () => {
          speakGuidance('Has llegado a tu destino. Viaje completado. Gracias por usar Travel App');
          Alert.alert("¡Llegaste!", "Viaje completado.");

          const newTrip = {
            date: new Date().toISOString().split('T')[0],
            dest: destinationAddress || 'Destino en Mapa',
            price: tripData.price,
            status: 'Completado',
            method: metodoPago
          };

          // Guardar el viaje en Supabase si el usuario está autenticado
          if (profile && profile.id) {
            const origen = 'Ubicación Actual'; // Podrías capturar la ubicación real
            const destino = destinationAddress || 'Destino en Mapa';
            const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const hora = new Date().toTimeString().split(' ')[0]; // HH:MM:SS

            await saveRoute(profile.id, origen, destino, fecha, hora);

            // Guardar el pago en Supabase
            const referencia = `TRV-${Date.now()}`;
            await savePayment(profile.id, metodoPago, referencia, 'completado');
          }

          setTripHistory(prev => [newTrip, ...prev]);
          setDestination(null);
          setDestinationAddress('');
          setTripData(null);
          navigateToScreen('home');
        }, 15000);
        timerRef.current.push(t4);
      }, 5000);
      timerRef.current.push(t2);
    }, 3000);
    timerRef.current.push(t1);
  };

  const handleCancelTrip = () => {
    Alert.alert("Cancelar", "¿Seguro?", [
      { text: "No" },
      {
        text: "Sí", onPress: () => {
          speakGuidance('Viaje cancelado. Volviendo al mapa principal');
          clearSimulation();
          setDestination(null);
          setDestinationAddress('');
          setTripData(null);
          navigateToScreen('main');
        }
      }
    ]);
  };

  const handleGlobalVoiceCommand = (command, extra) => {
    console.log('Comando global:', command, extra);
  };

  // Mostrar loading mientras se inicializa auth
  if (authLoading || !dbInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <LoadingScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        {/* Pantallas de autenticación */}
        {currentScreen === 'login' && (
          <LoginScreen
            onLogin={handleLogin}
            onNavigateToRegister={() => navigateToScreen('register')}
            onNavigateToLegal={(type) => navigateToScreen(type)}
            onVoiceCommand={handleGlobalVoiceCommand}
          />
        )}
        {currentScreen === 'register' && (
          <RegisterScreen
            onRegister={handleRegister}
            onBack={() => navigateToScreen('login')}
            onNavigateToLegal={(type) => navigateToScreen(type)}
            onVoiceCommand={handleGlobalVoiceCommand}
          />
        )}
        {currentScreen === 'success' && <LoadingScreen />}

        {/* Pantallas principales (requieren autenticación) */}
        {currentScreen === 'home' && user && (
          <HomeScreen
            onNavigateToMap={handleNavigateToMap}
            onNavigateToProfile={() => navigateToScreen('profile')}
            onNavigateToHistory={() => navigateToScreen('history')}
            onNavigateToPayments={() => navigateToScreen('payments')}
            onVoiceCommand={handleGlobalVoiceCommand}
          />
        )}
        {currentScreen === 'profile' && user && (
          <ProfileScreen
            onBack={() => navigateToScreen('home')}
            onLogout={handleLogout}
            onVoiceCommand={handleGlobalVoiceCommand}
          />
        )}
        {currentScreen === 'history' && user && (
          <HistoryScreen
            onBack={() => navigateToScreen('home')}
            onVoiceCommand={handleGlobalVoiceCommand}
          />
        )}
        {currentScreen === 'payments' && user && (
          <PaymentMethodsScreen
            onBack={() => navigateToScreen('home')}
            onVoiceCommand={handleGlobalVoiceCommand}
          />
        )}

        {/* Pantallas de viaje */}
        {currentScreen === 'main' && (
          <MainMapScreen
            onNavigateToTrip={() => navigateToScreen('trip_details')}
            destination={destination}
            setDestination={setDestination}
            setDestinationAddress={setDestinationAddress}
            onLogout={handleLogout}
            tripHistory={tripHistory}
            onVoiceCommand={handleGlobalVoiceCommand}
          />
        )}
        {currentScreen === 'trip_details' && destination && (
          <TripDetailsScreen
            destination={destination}
            destinationAddress={destinationAddress}
            onBack={() => navigateToScreen('main')}
            onProceedToPayment={handleProceedToPayment}
            onVoiceCommand={handleGlobalVoiceCommand}
          />
        )}
        {currentScreen === 'payment' && tripData && (
          <PaymentScreen
            tripData={tripData}
            onBack={() => navigateToScreen('trip_details')}
            initialPaymentMethod={globalPaymentMethod}
            onConfirmPayment={handleFinalizePaymentAndSearch}
            onVoiceCommand={handleGlobalVoiceCommand}
          />
        )}
        {currentScreen === 'searching' && (
          <SearchingDriverScreen
            onCancel={handleCancelTrip}
            onVoiceCommand={handleGlobalVoiceCommand}
          />
        )}
        {currentScreen === 'trip_status' && (
          <TripStatusScreen
            status={tripStatus}
            onCancel={handleCancelTrip}
            onVoiceCommand={handleGlobalVoiceCommand}
          />
        )}

        {/* Pantallas legales */}
        {(currentScreen === 'terms' || currentScreen === 'privacy') && (
          <LegalScreen
            type={currentScreen}
            onBack={() => navigateToScreen('login')}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/**
 * Componente raíz que envuelve la app con AuthProvider
 */
export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }
});
