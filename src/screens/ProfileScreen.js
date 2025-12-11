import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import VoiceButton from '../components/common/VoiceButton';
import { useAuth } from '../context/AuthContext';
import { handleSupabaseError } from '../utils/errorHandler';
import { speakGuidance } from '../utils/speechHelper';
import { validateEmail, validatePhone, validateRequired, validateUsername } from '../utils/validators';

const ProfileScreen = ({ onBack, onLogout, onVoiceCommand }) => {
    const { profile, updateProfile, signOut } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [usuario, setUsuario] = useState('');
    const [correo, setCorreo] = useState('');
    const [telefono, setTelefono] = useState('');

    useEffect(() => {
        if (profile) {
            setNombre(profile.nombre || '');
            setApellido(profile.apellido || '');
            setUsuario(profile.usuario || '');
            setCorreo(profile.correo || '');
            setTelefono(profile.telefono || '');
        }
        speakGuidance('Pantalla de perfil. Aquí puedes ver y editar tu información personal');
    }, [profile]);

    const handleEdit = () => {
        setIsEditing(true);
        speakGuidance('Modo edición activado. Modifica los campos que desees');
    };

    const handleCancel = () => {
        // Restaurar valores originales
        if (profile) {
            setNombre(profile.nombre || '');
            setApellido(profile.apellido || '');
            setUsuario(profile.usuario || '');
            setCorreo(profile.correo || '');
            setTelefono(profile.telefono || '');
        }
        setIsEditing(false);
        speakGuidance('Cambios cancelados');
    };

    const handleSave = async () => {
        // Validaciones
        const nombreValidation = validateRequired(nombre, 'Nombre');
        const apellidoValidation = validateRequired(apellido, 'Apellido');
        const usuarioValidation = validateUsername(usuario);
        const correoValidation = validateEmail(correo);
        const telefonoValidation = validatePhone(telefono);

        if (!nombreValidation.isValid) {
            Alert.alert('Error', nombreValidation.error);
            return;
        }

        if (!apellidoValidation.isValid) {
            Alert.alert('Error', apellidoValidation.error);
            return;
        }

        if (!usuarioValidation.isValid) {
            Alert.alert('Error', usuarioValidation.error);
            return;
        }

        if (!correoValidation.isValid) {
            Alert.alert('Error', correoValidation.error);
            return;
        }

        if (!telefonoValidation.isValid) {
            Alert.alert('Error', telefonoValidation.error);
            return;
        }

        setIsSaving(true);
        speakGuidance('Guardando cambios. Por favor espera');

        try {
            const result = await updateProfile({
                nombre,
                apellido,
                usuario,
                correo,
                telefono,
            });

            if (result.success) {
                setIsEditing(false);
                speakGuidance('Perfil actualizado correctamente');
                Alert.alert('Éxito', 'Tu perfil ha sido actualizado');
            } else {
                const errorMessage = handleSupabaseError(result.error);
                speakGuidance(`Error al actualizar. ${errorMessage}`);
                Alert.alert('Error', errorMessage);
            }
        } catch (error) {
            const errorMessage = handleSupabaseError(error);
            Alert.alert('Error', errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres salir?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Salir',
                style: 'destructive',
                onPress: async () => {
                    speakGuidance('Cerrando sesión');
                    await signOut();
                    onLogout();
                },
            },
        ]);
    };

    const handleVoiceCommand = (command) => {
        if (command === "confirm" && isEditing) {
            handleSave();
        } else if (command === "cancel" && isEditing) {
            handleCancel();
        } else if (command === "goBack") {
            speakGuidance('Volviendo al menú principal');
            onBack();
        } else {
            onVoiceCommand(command);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <VoiceButton onCommand={handleVoiceCommand} currentScreen="profile" />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        speakGuidance('Volviendo al menú principal');
                        onBack();
                    }}
                    style={styles.backButton}
                    disabled={isSaving}
                >
                    <Ionicons name="chevron-back" size={30} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Mi Perfil</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.profileImageContainer}>
                <View style={styles.profileImage}>
                    <Ionicons name="person" size={60} color="#666" />
                </View>
            </View>

            <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nombre</Text>
                    <TextInput
                        style={[styles.input, !isEditing && styles.inputDisabled]}
                        value={nombre}
                        onChangeText={setNombre}
                        editable={isEditing && !isSaving}
                        placeholder="Nombre"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Apellido</Text>
                    <TextInput
                        style={[styles.input, !isEditing && styles.inputDisabled]}
                        value={apellido}
                        onChangeText={setApellido}
                        editable={isEditing && !isSaving}
                        placeholder="Apellido"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Usuario</Text>
                    <TextInput
                        style={[styles.input, !isEditing && styles.inputDisabled]}
                        value={usuario}
                        onChangeText={setUsuario}
                        editable={isEditing && !isSaving}
                        placeholder="Usuario"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Correo Electrónico</Text>
                    <TextInput
                        style={[styles.input, styles.inputDisabled]}
                        value={correo}
                        editable={false}
                        placeholder="Correo Electrónico"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Text style={styles.helperText}>El correo no se puede modificar</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Teléfono</Text>
                    <TextInput
                        style={[styles.input, !isEditing && styles.inputDisabled]}
                        value={telefono}
                        onChangeText={setTelefono}
                        editable={isEditing && !isSaving}
                        placeholder="Teléfono"
                        keyboardType="phone-pad"
                    />
                </View>

                {!isEditing ? (
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleEdit}
                    >
                        <Text style={styles.primaryButtonText}>Editar Perfil</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.secondaryButton, isSaving && styles.disabledButton]}
                            onPress={handleCancel}
                            disabled={isSaving}
                        >
                            <Text style={styles.secondaryButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.primaryButton, { flex: 1, marginLeft: 10 }, isSaving && styles.disabledButton]}
                            onPress={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Guardar</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    disabled={isSaving}
                >
                    <Ionicons name="log-out-outline" size={24} color="#d32f2f" />
                    <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
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
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#000',
    },
    formContainer: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#000',
        backgroundColor: '#fff',
    },
    inputDisabled: {
        backgroundColor: '#f5f5f5',
        color: '#666',
    },
    helperText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        fontStyle: 'italic',
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 10,
    },
    primaryButton: {
        backgroundColor: '#000',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#000',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        marginTop: 10,
    },
    secondaryButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.6,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        padding: 15,
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#d32f2f',
        marginLeft: 10,
    },
});

export default ProfileScreen;
