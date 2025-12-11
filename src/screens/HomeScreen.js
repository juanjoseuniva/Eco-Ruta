import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import VoiceButton from '../components/common/VoiceButton';
import { useAuth } from '../context/AuthContext';
import { speakGuidance } from '../utils/speechHelper';

const HomeScreen = ({ onNavigateToMap, onNavigateToProfile, onNavigateToHistory, onNavigateToPayments, onVoiceCommand }) => {
    const { profile } = useAuth();

    useEffect(() => {
        const userName = profile?.nombre || 'Usuario';
        speakGuidance(`Bienvenido ${userName}. Pantalla de inicio. Selecciona una opción del menú`);
    }, [profile]);

    const handleVoiceCommand = (command) => {
        onVoiceCommand(command);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <VoiceButton onCommand={handleVoiceCommand} currentScreen="home" />

            <View style={styles.header}>
                <Image source={require('../../assets/logo-ecoruta.png')} style={styles.logo} resizeMode="contain" />
                <Text style={styles.welcomeText}>
                    Hola, {profile?.nombre || 'Usuario'}
                </Text>
                <Text style={styles.subtitle}>¿A dónde quieres ir hoy?</Text>
            </View>

            <View style={styles.menuContainer}>
                <TouchableOpacity
                    style={styles.menuCard}
                    onPress={() => {
                        speakGuidance('Navegando al mapa para solicitar viaje');
                        onNavigateToMap();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Solicitar viaje"
                >
                    <Ionicons name="car" size={50} color="#000" />
                    <Text style={styles.menuCardTitle}>Solicitar Viaje</Text>
                    <Text style={styles.menuCardDescription}>Inicia un nuevo viaje</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuCard}
                    onPress={() => {
                        speakGuidance('Navegando a tu perfil');
                        onNavigateToProfile();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Ver perfil"
                >
                    <Ionicons name="person" size={50} color="#000" />
                    <Text style={styles.menuCardTitle}>Mi Perfil</Text>
                    <Text style={styles.menuCardDescription}>Ver y editar información</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuCard}
                    onPress={() => {
                        speakGuidance('Navegando al historial de viajes');
                        onNavigateToHistory();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Ver historial de viajes"
                >
                    <Ionicons name="time" size={50} color="#000" />
                    <Text style={styles.menuCardTitle}>Mis Viajes</Text>
                    <Text style={styles.menuCardDescription}>Historial de rutas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuCard}
                    onPress={() => {
                        speakGuidance('Navegando a métodos de pago');
                        onNavigateToPayments();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Ver métodos de pago"
                >
                    <Ionicons name="card" size={50} color="#000" />
                    <Text style={styles.menuCardTitle}>Pagos</Text>
                    <Text style={styles.menuCardDescription}>Métodos e historial</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    menuContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    menuCard: {
        width: '48%',
        backgroundColor: '#f5f5f5',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#000',
    },
    menuCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 10,
        textAlign: 'center',
    },
    menuCardDescription: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
});

export default HomeScreen;
