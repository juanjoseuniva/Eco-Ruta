import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLOMBIAN_BANKS } from '../../utils/constants';
import { formatCOP, validateEmail } from '../../utils/formatters';
import { speakGuidance } from '../../utils/speechHelper';
import VoiceButton from '../common/VoiceButton';

const { height } = Dimensions.get('window');

const PaymentScreen = ({ tripData, onBack, onConfirmPayment, onVoiceCommand }) => {
  const [paymentMethod, setPaymentMethod] = useState(''); 
  const [nequiPhone, setNequiPhone] = useState('');
  const [nequiKey, setNequiKey] = useState('');
  const [nequiEmail, setNequiEmail] = useState('');
  const [pseBank, setPseBank] = useState('');
  const [pseClientType, setPseClientType] = useState('');
  const [pseEmail, setPseEmail] = useState('');
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);

  useEffect(() => {
    const price = formatCOP(tripData.price);
    speakGuidance(`Método de pago. Total a pagar: ${price} pesos. Viaje en ${tripData.name}. Di nequi, pse o efectivo para seleccionar. Di confirmar cuando estés listo`);
  }, []);

  const handleValidateAndPay = () => {
    if (!paymentMethod) { 
      speakGuidance('Error. Debes seleccionar un método de pago');
      Alert.alert("Error", "Selecciona un método de pago"); 
      return; 
    }
    if (paymentMethod === 'nequi') {
      if (!nequiPhone || !nequiKey || !nequiEmail) {
        speakGuidance('Error. Completa todos los campos de Nequi');
        return Alert.alert("Error", "Todos los campos de Nequi son obligatorios");
      }
      if (!/^\d+$/.test(nequiPhone)) {
        speakGuidance('Error. El número de celular debe contener solo dígitos');
        return Alert.alert("Error", "El celular solo debe contener números");
      }
      if (!/^\d+$/.test(nequiKey)) {
        speakGuidance('Error. La clave dinámica debe contener solo dígitos');
        return Alert.alert("Error", "La clave solo debe contener números");
      }
      if (!validateEmail(nequiEmail)) {
        speakGuidance('Error. Formato de correo inválido');
        return Alert.alert("Error", "Formato de correo inválido");
      }
    }
    if (paymentMethod === 'pse') {
      if (!pseBank || !pseClientType || !pseEmail) {
        speakGuidance('Error. Completa todos los campos de PSE');
        return Alert.alert("Error", "Todos los campos de PSE son obligatorios");
      }
      if (!validateEmail(pseEmail)) {
        speakGuidance('Error. Formato de correo inválido');
        return Alert.alert("Error", "Formato de correo inválido");
      }
    }
    speakGuidance('Pago confirmado. Procesando solicitud de viaje');
    onConfirmPayment(paymentMethod); 
  };

  const handleVoiceCommand = (command, extra) => {
    if (command === "goBack") {
      speakGuidance('Volviendo a detalles del viaje');
      onBack();
    } else if (command === "selectPayment") {
      const method = extra === 'nequi' ? 'nequi' : extra === 'pse' ? 'pse' : 'cash';
      setPaymentMethod(method);
      const methodName = method === 'nequi' ? 'Nequi' : method === 'pse' ? 'PSE' : 'Efectivo';
      speakGuidance(`${methodName} seleccionado. ${method !== 'cash' ? 'Completa los datos requeridos' : 'Pagarás al conductor'}`);
    } else if (command === "confirm") {
      handleValidateAndPay();
    } else {
      onVoiceCommand(command, extra);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <VoiceButton onCommand={handleVoiceCommand} currentScreen="payment" />
      <View style={styles.headerSimple}>
        <TouchableOpacity onPress={() => { speakGuidance('Volviendo a detalles del viaje'); onBack(); }} style={{padding: 10}}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerSimpleTitle}>Método de Pago</Text>
        <View style={{width: 44}} />
      </View>
      <ScrollView contentContainerStyle={{padding: 20}}>
        <View style={styles.paymentSummaryCard}>
          <Text style={styles.paymentTotalLabel}>Total a Pagar</Text>
          <Text style={styles.paymentTotalAmount}>{formatCOP(tripData.price)}</Text>
          <Text style={styles.paymentCarName}>Viaje en {tripData.name}</Text>
        </View>
        <Text style={styles.sectionTitle}>Elige cómo pagar</Text>
        <TouchableOpacity 
          style={[styles.paymentOption, paymentMethod === 'nequi' && styles.paymentOptionSelected]} 
          onPress={() => { setPaymentMethod('nequi'); speakGuidance('Nequi seleccionado. Completa los datos de tu cuenta'); }}
        >
          <View style={styles.paymentIconContainer}><Text style={{fontWeight: '900', color: '#200020'}}>N</Text></View>
          <Text style={styles.paymentText}>Nequi</Text>
          {paymentMethod === 'nequi' && <Ionicons name="checkmark-circle" size={24} color="#000" />}
        </TouchableOpacity>
        {paymentMethod === 'nequi' && (
          <View style={styles.paymentFormContainer}>
            <Text style={styles.formLabel}>Valor a pagar</Text>
            <TextInput style={[styles.input, {backgroundColor: '#eee', color: '#666'}]} value={formatCOP(tripData.price)} editable={false} />
            <Text style={styles.formLabel}>Número de Celular</Text>
            <TextInput 
              style={styles.input} 
              placeholder="300 123 4567" 
              keyboardType="numeric" 
              value={nequiPhone} 
              onChangeText={setNequiPhone} 
              maxLength={10}
              onFocus={() => speakGuidance('Campo número de celular')}
            />
            <Text style={styles.formLabel}>Clave Dinámica</Text>
            <TextInput 
              style={styles.input} 
              placeholder="123456" 
              keyboardType="numeric" 
              secureTextEntry 
              value={nequiKey} 
              onChangeText={setNequiKey} 
              maxLength={6}
              onFocus={() => speakGuidance('Campo clave dinámica')}
            />
            <Text style={styles.formLabel}>Correo</Text>
            <TextInput 
              style={styles.input} 
              placeholder="ejemplo@correo.com" 
              keyboardType="email-address" 
              autoCapitalize="none" 
              value={nequiEmail} 
              onChangeText={setNequiEmail}
              onFocus={() => speakGuidance('Campo correo electrónico')}
            />
          </View>
        )}
        <TouchableOpacity 
          style={[styles.paymentOption, paymentMethod === 'pse' && styles.paymentOptionSelected]} 
          onPress={() => { setPaymentMethod('pse'); speakGuidance('PSE seleccionado. Selecciona tu banco y completa los datos'); }}
        >
          <View style={styles.paymentIconContainer}><Ionicons name="globe-outline" size={24} color="#000" /></View>
          <Text style={styles.paymentText}>PSE</Text>
          {paymentMethod === 'pse' && <Ionicons name="checkmark-circle" size={24} color="#000" />}
        </TouchableOpacity>
        {paymentMethod === 'pse' && (
          <View style={styles.paymentFormContainer}>
            <Text style={styles.formLabel}>Valor a pagar</Text>
            <TextInput style={[styles.input, {backgroundColor: '#eee', color: '#666'}]} value={formatCOP(tripData.price)} editable={false} />
            <Text style={styles.formLabel}>Banco</Text>
            <TouchableOpacity 
              style={styles.dropdownButton} 
              onPress={() => { speakGuidance('Abriendo lista de bancos'); setBankModalVisible(true); }}
            >
              <Text style={{color: pseBank ? '#000' : '#888'}}>{pseBank || "Selecciona tu banco"}</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            <Text style={styles.formLabel}>Tipo Cliente</Text>
            <TouchableOpacity 
              style={styles.dropdownButton} 
              onPress={() => { speakGuidance('Abriendo tipo de cliente'); setTypeModalVisible(true); }}
            >
              <Text style={{color: pseClientType ? '#000' : '#888'}}>{pseClientType || "Selecciona tipo"}</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            <Text style={styles.formLabel}>Correo</Text>
            <TextInput 
              style={styles.input} 
              placeholder="ejemplo@correo.com" 
              keyboardType="email-address" 
              autoCapitalize="none" 
              value={pseEmail} 
              onChangeText={setPseEmail}
              onFocus={() => speakGuidance('Campo correo electrónico')}
            />
          </View>
        )}
        <TouchableOpacity 
          style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionSelected]} 
          onPress={() => { setPaymentMethod('cash'); speakGuidance('Efectivo seleccionado. Pagarás al conductor al finalizar el viaje'); }}
        >
          <View style={styles.paymentIconContainer}><Ionicons name="cash-outline" size={24} color="#000" /></View>
          <Text style={styles.paymentText}>Efectivo</Text>
          {paymentMethod === 'cash' && <Ionicons name="checkmark-circle" size={24} color="#000" />}
        </TouchableOpacity>
        {paymentMethod === 'cash' && (
           <View style={styles.paymentFormContainer}><Text style={styles.formLabel}>Valor a pagar: {formatCOP(tripData.price)}</Text></View>
        )}
        <View style={{height: 100}} />
      </ScrollView>
      <View style={styles.bottomSheet}>
        <TouchableOpacity style={styles.confirmTripButton} onPress={handleValidateAndPay}>
          <Text style={styles.confirmTripText}>Confirmar y Pedir Viaje</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={bankModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona tu Banco</Text>
            <FlatList data={COLOMBIAN_BANKS} keyExtractor={(item) => item} renderItem={({item}) => (
                <TouchableOpacity 
                  style={styles.modalItem} 
                  onPress={() => { 
                    setPseBank(item); 
                    speakGuidance(`Banco ${item} seleccionado`);
                    setBankModalVisible(false); 
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={() => { speakGuidance('Cerrando selección de banco'); setBankModalVisible(false); }}
            >
              <Text style={{color:'#fff'}}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={typeModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tipo de Cliente</Text>
            {['Persona Natural', 'Persona Jurídica'].map(type => (
               <TouchableOpacity 
                 key={type} 
                 style={styles.modalItem} 
                 onPress={() => { 
                   setPseClientType(type); 
                   speakGuidance(`${type} seleccionado`);
                   setTypeModalVisible(false); 
                 }}
               >
                 <Text style={styles.modalItemText}>{type}</Text>
               </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={() => { speakGuidance('Cerrando selección de tipo de cliente'); setTypeModalVisible(false); }}
            >
              <Text style={{color:'#fff'}}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  headerSimple: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: '#fff' },
  headerSimpleTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  paymentSummaryCard: { backgroundColor: '#000', borderRadius: 15, padding: 25, marginBottom: 30, alignItems: 'center' },
  paymentTotalLabel: { color: '#aaa', fontSize: 14, textTransform: 'uppercase' },
  paymentTotalAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginVertical: 5 },
  paymentCarName: { color: '#fff', fontSize: 16, opacity: 0.8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#000' },
  paymentOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#eee', elevation: 2, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity:0.05, shadowRadius:2 },
  paymentOptionSelected: { borderColor: '#000', backgroundColor: '#f9f9f9', borderWidth: 2 },
  paymentIconContainer: { width: 40, height: 40, backgroundColor: '#f0f0f0', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  paymentText: { fontSize: 18, marginLeft: 10, fontWeight: '600', flex: 1 },
  paymentFormContainer: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#eee' },
  formLabel: { fontSize: 14, fontWeight: 'bold', color: '#000', marginBottom: 5, marginTop: 10 },
  input: { height: 55, borderColor: '#000', borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, fontSize: 16, marginBottom: 15, color: '#000', backgroundColor: '#fff' },
  dropdownButton: { height: 55, borderColor: '#000', borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff' },
  bottomSheet: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  confirmTripButton: { backgroundColor: '#000', height: 55, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  confirmTripText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: height * 0.7 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalItemText: { fontSize: 16, color: '#333' },
  modalCloseButton: { marginTop: 20, backgroundColor: '#000', padding: 15, borderRadius: 10, alignItems: 'center' }
});

export default PaymentScreen;