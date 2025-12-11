import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { formatCOP } from '../../utils/formatters';
import { speakGuidance } from '../../utils/speechHelper';
import VoiceButton from '../common/VoiceButton';

const WalletScreen = ({ history, onVoiceCommand }) => {
  const totalSpent = history.reduce((acc, item) => item.status === 'Completado' ? acc + item.price : acc, 0);

  useEffect(() => {
    speakGuidance(`Resumen de gastos. Total gastado este mes: ${totalSpent} pesos. Mostrando historial de viajes recientes`);
  }, []);

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem} accessibilityLabel={`Viaje a ${item.dest}, costo ${item.price} pesos, estado ${item.status}`}>
      <View style={styles.historyIconBox}><Ionicons name="car-sport" size={20} color="#333" /></View>
      <View style={{ flex: 1, paddingHorizontal: 10 }}>
        <Text style={styles.historyDest} numberOfLines={1}>{item.dest}</Text>
        <Text style={styles.historyDate}>{item.date} • {item.method}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.historyPrice}>{formatCOP(item.price)}</Text>
        <Text style={[styles.historyStatus, {color: item.status === 'Cancelado' ? 'red' : 'green'}]}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      <VoiceButton onCommand={onVoiceCommand} currentScreen="wallet" />
      <View style={styles.profileHeader}>
        <Text style={styles.profileName} accessibilityRole="header">Resumen de Gastos</Text>
        <Text style={styles.profileSub}>Control mensual de transporte</Text>
      </View>
      <View style={{flex: 1, paddingHorizontal: 20, paddingTop: 20}}>
        <View style={styles.spendingCard} accessibilityLabel={`Gastado este mes: ${totalSpent} pesos`}>
          <View>
            <Text style={styles.spendingLabel}>Total Gastado (Este Mes)</Text>
            <Text style={styles.spendingAmount}>{formatCOP(totalSpent)}</Text>
          </View>
          <View style={styles.spendingIcon}>
            <Ionicons name="stats-chart" size={30} color="#fff" />
          </View>
        </View>
        <Text style={styles.menuSectionTitle}>Historial Reciente</Text>
        <FlatList 
          data={history} 
          keyExtractor={(item) => item.id} 
          renderItem={renderHistoryItem} 
          contentContainerStyle={{ paddingBottom: 100 }} 
          showsVerticalScrollIndicator={false} 
          ListEmptyComponent={<Text style={{textAlign:'center', marginTop: 20, color:'#999'}}>No tienes viajes registrados aún.</Text>} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileHeader: { backgroundColor: '#fff', padding: 30, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 },
  profileName: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  profileSub: { color: '#666', fontSize: 14, marginTop: 5 },
  spendingCard: { backgroundColor: '#222', borderRadius: 20, padding: 25, marginBottom: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: {width:0, height:4} },
  spendingLabel: { color: '#ccc', fontSize: 14, textTransform: 'uppercase', marginBottom: 5 },
  spendingAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
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