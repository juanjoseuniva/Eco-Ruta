import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getUserRoutes } from '../../services/routesService';
import { formatCOP } from '../../utils/formatters';
import { speakGuidance } from '../../utils/speechHelper';
import VoiceButton from '../common/VoiceButton';

const WalletScreen = ({ onVoiceCommand }) => {
  const { profile } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRoutes();
  }, [profile]);

  const loadRoutes = async () => {
    if (!profile || !profile.id) {
      setLoading(false);
      return;
    }

    try {
      const result = await getUserRoutes(profile.id);
      if (result.success) {
        setRoutes(result.routes);
        const totalSpent = result.routes.length * 15000; // Estimación
        speakGuidance(`Resumen de gastos. Tienes ${result.routes.length} viajes registrados. Total estimado: ${totalSpent} pesos`);
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

  // Estimar costo basado en cantidad de viajes (precio promedio)
  const estimatedCost = routes.length * 15000;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short'
      });
    } catch {
      return dateString;
    }
  };

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem} accessibilityLabel={`Viaje a ${item.destino}, fecha ${item.fecha}`}>
      <View style={styles.historyIconBox}><Ionicons name="car-sport" size={20} color="#333" /></View>
      <View style={{ flex: 1, paddingHorizontal: 10 }}>
        <Text style={styles.historyDest} numberOfLines={1}>{item.destino}</Text>
        <Text style={styles.historyDate}>{formatDate(item.fecha)} • Completado</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.historyPrice}>{formatCOP(15000)}</Text>
        <Text style={[styles.historyStatus, { color: 'green' }]}>Completado</Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={{ alignItems: 'center', padding: 40 }}>
      <Ionicons name="car-outline" size={60} color="#ccc" />
      <Text style={{ textAlign: 'center', marginTop: 20, color: '#999', fontSize: 16 }}>
        No tienes viajes registrados aún.
      </Text>
      <Text style={{ textAlign: 'center', marginTop: 10, color: '#bbb', fontSize: 14 }}>
        Tus viajes aparecerán aquí
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VoiceButton onCommand={onVoiceCommand} currentScreen="wallet" />
      <View style={styles.profileHeader}>
        <Text style={styles.profileName} accessibilityRole="header">Resumen de Gastos</Text>
        <Text style={styles.profileSub}>Control mensual de transporte</Text>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
        <View style={styles.spendingCard} accessibilityLabel={`Gastado estimado: ${estimatedCost} pesos`}>
          <View>
            <Text style={styles.spendingLabel}>Total Estimado (Este Mes)</Text>
            <Text style={styles.spendingAmount}>{formatCOP(estimatedCost)}</Text>
            <Text style={styles.spendingSubtext}>{routes.length} viajes realizados</Text>
          </View>
          <View style={styles.spendingIcon}>
            <Ionicons name="stats-chart" size={30} color="#fff" />
          </View>
        </View>
        <Text style={styles.menuSectionTitle}>Historial Reciente</Text>
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#000']} />
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  profileHeader: { backgroundColor: '#fff', padding: 30, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 },
  profileName: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  profileSub: { color: '#666', fontSize: 14, marginTop: 5 },
  spendingCard: { backgroundColor: '#222', borderRadius: 20, padding: 25, marginBottom: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  spendingLabel: { color: '#ccc', fontSize: 14, textTransform: 'uppercase', marginBottom: 5 },
  spendingAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  spendingSubtext: { color: '#999', fontSize: 12, marginTop: 5 },
  spendingIcon: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 50 },
  menuSectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 15, marginTop: 10 },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  historyIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  historyDest: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  historyDate: { fontSize: 12, color: '#888', marginTop: 2 },
  historyPrice: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  historyStatus: { fontSize: 12, fontWeight: 'bold', marginTop: 2 }
});

export default WalletScreen;