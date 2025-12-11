import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import VoiceButton from '../components/common/VoiceButton';
import { useAuth } from '../context/AuthContext';
import { getUserPayments } from '../services/paymentsService';
import { speakGuidance } from '../utils/speechHelper';

const PaymentMethodsScreen = ({ onBack, onVoiceCommand }) => {
    const { profile } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        speakGuidance('Pantalla de métodos de pago e historial');
        loadPayments();
    }, []);

    const loadPayments = async () => {
        if (!profile || !profile.id) {
            setLoading(false);
            return;
        }

        try {
            const result = await getUserPayments(profile.id);
            if (result.success) {
                setPayments(result.payments);
                speakGuidance(`Tienes ${result.payments.length} pagos registrados`);
            }
        } catch (error) {
            console.error('Error loading payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadPayments();
        setRefreshing(false);
    }, [profile]);

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const getPaymentIcon = (method) => {
        const methodLower = method.toLowerCase();
        if (methodLower.includes('efectivo')) return 'cash';
        if (methodLower.includes('nequi')) return 'phone-portrait';
        if (methodLower.includes('pse')) return 'card';
        return 'wallet';
    };

    const getStatusColor = (status) => {
        const statusLower = status.toLowerCase();
        if (statusLower === 'completado') return '#4CAF50';
        if (statusLower === 'pendiente') return '#FF9800';
        if (statusLower === 'fallido') return '#f44336';
        return '#666';
    };

    const renderPaymentItem = ({ item }) => (
        <View style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
                <View style={styles.paymentIcon}>
                    <Ionicons name={getPaymentIcon(item.metodo_pago)} size={24} color="#000" />
                </View>
                <View style={styles.paymentInfo}>
                    <Text style={styles.paymentMethod}>{item.metodo_pago}</Text>
                    <Text style={styles.paymentDate}>{formatDate(item.fecha)}</Text>
                </View>
                <View style={[styles.paymentStatus, { backgroundColor: getStatusColor(item.estado) }]}>
                    <Text style={styles.paymentStatusText}>
                        {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
                    </Text>
                </View>
            </View>

            {item.referencia && (
                <View style={styles.paymentFooter}>
                    <Text style={styles.referenceLabel}>Ref:</Text>
                    <Text style={styles.referenceText}>{item.referencia}</Text>
                </View>
            )}
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No tienes pagos registrados</Text>
            <Text style={styles.emptySubtext}>
                Tu historial de pagos aparecerá aquí
            </Text>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.methodsContainer}>
            <Text style={styles.sectionTitle}>Métodos Disponibles</Text>

            <View style={styles.methodsList}>
                <View style={styles.methodCard}>
                    <Ionicons name="cash" size={40} color="#000" />
                    <Text style={styles.methodName}>Efectivo</Text>
                    <Text style={styles.methodDescription}>Paga al conductor</Text>
                </View>

                <View style={styles.methodCard}>
                    <Ionicons name="phone-portrait" size={40} color="#000" />
                    <Text style={styles.methodName}>Nequi</Text>
                    <Text style={styles.methodDescription}>Pago digital</Text>
                </View>

                <View style={styles.methodCard}>
                    <Ionicons name="card" size={40} color="#000" />
                    <Text style={styles.methodName}>PSE</Text>
                    <Text style={styles.methodDescription}>Transferencia</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Historial de Pagos</Text>
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
            <VoiceButton onCommand={handleVoiceCommand} currentScreen="payments" />

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
                <Text style={styles.title}>Pagos</Text>
                <View style={styles.placeholder} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000" />
                    <Text style={styles.loadingText}>Cargando información...</Text>
                </View>
            ) : (
                <FlatList
                    data={payments}
                    renderItem={renderPaymentItem}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={payments.length === 0 ? renderEmptyState : null}
                    contentContainerStyle={styles.listContainer}
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
    methodsContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
        marginTop: 10,
    },
    methodsList: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    methodCard: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 15,
        marginHorizontal: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    methodName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginTop: 8,
    },
    methodDescription: {
        fontSize: 11,
        color: '#666',
        marginTop: 3,
        textAlign: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
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
    paymentCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    paymentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    paymentInfo: {
        flex: 1,
    },
    paymentMethod: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    paymentDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    paymentStatus: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    paymentStatusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    paymentFooter: {
        flexDirection: 'row',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    referenceLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
        marginRight: 5,
    },
    referenceText: {
        fontSize: 12,
        color: '#666',
    },
});

export default PaymentMethodsScreen;
