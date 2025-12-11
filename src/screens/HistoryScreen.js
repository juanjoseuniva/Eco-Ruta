import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import VoiceButton from '../components/common/VoiceButton';
import { useAuth } from '../context/AuthContext';
import { getUserRoutes } from '../services/routesService';
import { speakGuidance } from '../utils/speechHelper';

const HistoryScreen = ({ onBack, onVoiceCommand }) => {
    const { profile } = useAuth();
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        speakGuidance('Pantalla de historial de viajes');
        loadRoutes();
    }, []);

    const loadRoutes = async () => {
        if (!profile || !profile.id) {
            setLoading(false);
            return;
        }

        try {
            const result = await getUserRoutes(profile.id);
            if (result.success) {
                setRoutes(result.routes);
                speakGuidance(`Tienes ${result.routes.length} viajes en tu historial`);
            }
        } catch (error) {
            console.error('Error loading routes:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadRoutes();
        setRefreshing(false);
    }, [profile]);

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.substring(0, 5); // HH:MM
    };

    const renderRouteItem = ({ item }) => (
        <View style={styles.routeCard}>
            <View style={styles.routeHeader}>
                <Ionicons name="navigate-circle" size={24} color="#000" />
                <Text style={styles.routeDate}>
                    {formatDate(item.fecha)} - {formatTime(item.hora)}
                </Text>
            </View>

            <View style={styles.routeDetails}>
                <View style={styles.routeLocation}>
                    <Ionicons name="radio-button-on" size={16} color="#4CAF50" />
                    <Text style={styles.locationText} numberOfLines={1}>
                        {item.origen}
                    </Text>
                </View>

                <View style={styles.routeDivider}>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.routeLocation}>
                    <Ionicons name="location" size={16} color="#f44336" />
                    <Text style={styles.locationText} numberOfLines={1}>
                        {item.destino}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No tienes viajes aún</Text>
            <Text style={styles.emptySubtext}>
                Tus viajes aparecerán aquí
            </Text>
        </View>
    );

    const handleVoiceCommand = (command) => {
        if (command === "goBack") {
            speakGuidance('Volviendo al menú principal');
            onBack();
        } else {
            onVoiceCommand(command);
        }
    };

    return (
        <View style={styles.container}>
            <VoiceButton onCommand={handleVoiceCommand} currentScreen="history" />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        speakGuidance('Volviendo al menú principal');
                        onBack();
                    }}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={30} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Mis Viajes</Text>
                <View style={styles.placeholder} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000" />
                    <Text style={styles.loadingText}>Cargando historial...</Text>
                </View>
            ) : (
                <FlatList
                    data={routes}
                    renderItem={renderRouteItem}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={renderEmptyState}
                    contentContainerStyle={routes.length === 0 ? styles.emptyContainer : styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#000']} />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    placeholder: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
    },
    listContainer: {
        padding: 15,
    },
    emptyContainer: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#666',
        marginTop: 20,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
    routeCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    routeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    routeDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginLeft: 10,
    },
    routeDetails: {
        marginLeft: 34,
    },
    routeLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    locationText: {
        fontSize: 15,
        color: '#333',
        marginLeft: 10,
        flex: 1,
    },
    routeDivider: {
        marginLeft: 7,
        marginVertical: 2,
    },
    dividerLine: {
        width: 2,
        height: 20,
        backgroundColor: '#ccc',
    },
});

export default HistoryScreen;
