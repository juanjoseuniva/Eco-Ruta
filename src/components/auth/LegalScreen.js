import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { speakGuidance } from '../../utils/speechHelper';

const LegalScreen = ({ type, onBack }) => {
  const isTerms = type === 'terms';

  useEffect(() => {
    if (isTerms) {
      speakGuidance('Términos de servicio. Lee los términos y condiciones de uso de la aplicación');
    } else {
      speakGuidance('Política de privacidad. Información sobre cómo manejamos tus datos personales');
    }
  }, []);

  const privacyText = `En Eco-Ruta Accesible, valoramos y respetamos su privacidad. Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos su información personal.\n\n1. INFORMACIÓN QUE RECOPILAMOS\nPodemos recopilar información personal que usted nos proporciona voluntariamente, como su nombre, dirección de correo electrónico, número de teléfono y preferencias de accesibilidad visual. Además, recopilamos datos de ubicación en tiempo real para proporcionar las funciones esenciales de navegación asistida.\n\n2. USO DE LA INFORMACIÓN\nUtilizamos la información recopilada para:\n• Proporcionar y operar el servicio de navegación.\n• Personalizar la experiencia del usuario.\n• Mejorar la precisión de nuestros algoritmos.\n• Comunicarnos con usted para enviarle alertas de seguridad.\n\n3. SEGURIDAD DE LOS DATOS\nImplementamos medidas de seguridad técnicas y organizativas robustas para proteger sus datos personales contra el acceso no autorizado.`;

  const termsText = `Bienvenido a Eco-Ruta Accesible. Por favor, lea detenidamente estos Términos de Servicio antes de utilizar nuestra aplicación.\n\n1. ACEPTACIÓN DE LOS TÉRMINOS\nAl descargar, instalar o utilizar la aplicación Eco-Ruta Accesible, usted acepta estar legalmente vinculado por estos términos. Si no está de acuerdo, le rogamos que no utilice la aplicación.\n\n2. DESCRIPCIÓN DEL SERVICIO\nEco-Ruta Accesible es una herramienta de asistencia tecnológica diseñada para facilitar la movilidad de personas con discapacidad visual. No sustituye el uso de bastones blancos, perros guía u otras ayudas de movilidad esenciales.\n\n3. REGISTRO Y SEGURIDAD\nUsted es el único responsable de mantener la confidencialidad de sus credenciales de inicio de sesión.\n\n4. USO ACEPTABLE\nUsted acepta utilizar la aplicación únicamente para fines legales y de acuerdo con estos términos.`;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.legalHeaderRow}>
        <TouchableOpacity 
          onPress={() => { speakGuidance('Volviendo a inicio de sesión'); onBack(); }} 
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.legalHeaderTitle}>{isTerms ? "Términos" : "Privacidad"}</Text>
        <View style={{width: 30}} />
      </View>
      <View style={styles.greyBox}><Text style={styles.greyBoxText}>{isTerms ? termsText : privacyText}</Text></View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingHorizontal: 25, paddingTop: 20, paddingBottom: 40, justifyContent: 'center' },
  legalHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  legalHeaderTitle: { fontSize: 20, fontWeight: 'bold' },
  backButton: { padding: 5 },
  greyBox: { backgroundColor: '#E5E5E5', padding: 20, borderRadius: 10, marginTop: 10 },
  greyBoxText: { fontSize: 14, lineHeight: 22, textAlign: 'justify' }
});

export default LegalScreen;