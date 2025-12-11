import { supabase } from './supabaseClient';

/**
 * Registra un nuevo usuario en Supabase Auth y crea su perfil
 */
export const registerUser = async (nombre, apellido, usuario, correo, telefono, password) => {
    try {
        console.log('=== INICIANDO REGISTRO ===');
        console.log('Datos:', { nombre, apellido, usuario, correo, telefono });

        // 1. Crear usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: correo,
            password: password,
        });

        if (authError) {
            console.error('Error en Auth signUp:', authError);
            throw authError;
        }

        if (!authData.user) {
            throw new Error('No se pudo crear el usuario');
        }

        console.log('✅ Usuario Auth creado:', authData.user.id);

        // 2. Crear perfil en la tabla usuarios
        console.log('Intentando crear perfil en tabla usuarios...');
        const profileToInsert = {
            nombre,
            apellido,
            usuario,
            correo,
            telefono,
            auth_user_id: authData.user.id,
        };
        console.log('Datos del perfil:', profileToInsert);

        const { data: profileData, error: profileError } = await supabase
            .from('usuarios')
            .insert([profileToInsert])
            .select()
            .single();

        if (profileError) {
            console.error('❌ Error al crear perfil:', profileError);
            console.error('Detalles del error:', JSON.stringify(profileError, null, 2));

            // No podemos eliminar el usuario de Auth desde el cliente
            // El usuario quedará en Auth pero sin perfil
            // Instrucción: eliminar manualmente desde Supabase Dashboard si es necesario

            throw profileError;
        }

        console.log('✅ Perfil creado exitosamente:', profileData);

        return {
            success: true,
            user: authData.user,
            profile: profileData,
        };
    } catch (error) {
        console.error('❌ Error en registerUser:', error);
        return {
            success: false,
            error: error.message || 'Error al registrar usuario',
        };
    }
};

/**
 * Inicia sesión con email y contraseña
 */
export const loginUser = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // Obtener el perfil del usuario
        const profile = await getUserProfileByAuthId(data.user.id);

        return {
            success: true,
            session: data.session,
            user: data.user,
            profile,
        };
    } catch (error) {
        console.error('Error en loginUser:', error);
        return {
            success: false,
            error: error.message || 'Error al iniciar sesión',
        };
    }
};

/**
 * Cierra la sesión del usuario actual
 */
export const logoutUser = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error en logoutUser:', error);
        return {
            success: false,
            error: error.message || 'Error al cerrar sesión',
        };
    }
};

/**
 * Obtiene la sesión actual del usuario
 */
export const getCurrentUser = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;
        if (!session) return { success: false, session: null };

        // Obtener el perfil del usuario
        const profile = await getUserProfileByAuthId(session.user.id);

        return {
            success: true,
            session,
            user: session.user,
            profile,
        };
    } catch (error) {
        console.error('Error en getCurrentUser:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Obtiene el perfil de un usuario por su ID de autenticación
 */
export const getUserProfileByAuthId = async (authUserId) => {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('auth_user_id', authUserId)
            .single();

        if (error) {
            // Si el error es PGRST116 (0 rows), retornar null sin mostrar error
            // Esto ocurre durante el registro cuando Auth se crea antes que el perfil
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error en getUserProfileByAuthId:', error);
        return null;
    }
};

/**
 * Obtiene el perfil de un usuario por su ID
 */
export const getUserProfile = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        return { success: true, profile: data };
    } catch (error) {
        console.error('Error en getUserProfile:', error);
        return {
            success: false,
            error: error.message || 'Error al obtener perfil',
        };
    }
};

/**
 * Actualiza el perfil de un usuario
 */
export const updateUserProfile = async (userId, updates) => {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, profile: data };
    } catch (error) {
        console.error('Error en updateUserProfile:', error);
        return {
            success: false,
            error: error.message || 'Error al actualizar perfil',
        };
    }
};

/**
 * Envía un correo para recuperar contraseña
 */
export const resetPassword = async (email) => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'travelapp://reset-password',
        });

        if (error) throw error;

        return {
            success: true,
            message: 'Correo de recuperación enviado',
        };
    } catch (error) {
        console.error('Error en resetPassword:', error);
        return {
            success: false,
            error: error.message || 'Error al enviar correo de recuperación',
        };
    }
};
