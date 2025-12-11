/**
 * Maneja errores de Supabase y devuelve mensajes en español
 */
export const handleSupabaseError = (error) => {
    if (!error) return 'Error desconocido';

    // Intentar extraer el mensaje del error de diferentes formas
    let errorMessage = '';

    if (typeof error === 'string') {
        errorMessage = error;
    } else if (error.message) {
        errorMessage = error.message;
    } else if (error.error_description) {
        errorMessage = error.error_description;
    } else if (error.error) {
        errorMessage = error.error;
    } else if (error.msg) {
        errorMessage = error.msg;
    } else {
        // Último recurso: intentar convertir a JSON y luego a string
        try {
            errorMessage = JSON.stringify(error);
        } catch {
            errorMessage = 'Error desconocido';
        }
    }

    // Asegurar que errorMessage es string
    errorMessage = String(errorMessage);

    // Errores de autenticación
    if (errorMessage.includes('Invalid login credentials')) {
        return 'Credenciales incorrectas. Verifica tu email y contraseña.';
    }

    if (errorMessage.includes('User already registered') || errorMessage.includes('already registered')) {
        return 'Este correo electrónico ya está registrado.';
    }

    if (errorMessage.includes('Email not confirmed')) {
        return 'Debes confirmar tu correo electrónico antes de iniciar sesión.';
    }

    if (errorMessage.includes('Invalid email')) {
        return 'El formato del correo electrónico es inválido.';
    }

    if (errorMessage.includes('Password should be at least')) {
        return 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (errorMessage.includes('For security purposes')) {
        return 'Por seguridad, espera unos segundos antes de intentar de nuevo.';
    }

    // Errores de red
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network request failed')) {
        return 'Error de conexión. Verifica tu conexión a internet.';
    }

    // Errores de base de datos
    if (errorMessage.includes('duplicate key value violates unique constraint')) {
        if (errorMessage.includes('correo') || errorMessage.includes('email')) {
            return 'Este correo electrónico ya está en uso.';
        }
        if (errorMessage.includes('usuario')) {
            return 'Este nombre de usuario ya está en uso.';
        }
        return 'Ya existe un registro con estos datos.';
    }

    if (errorMessage.includes('violates foreign key constraint')) {
        return 'Error de referencia en la base de datos.';
    }

    if (errorMessage.includes('permission denied')) {
        return 'No tienes permisos para realizar esta acción.';
    }

    // Errores de sesión
    if (errorMessage.includes('not authenticated') || errorMessage.includes('JWT')) {
        return 'Sesión expirada. Por favor inicia sesión nuevamente.';
    }

    // Si el mensaje es muy largo o parece JSON, dar mensaje genérico
    if (errorMessage.length > 200 || errorMessage.startsWith('{')) {
        return 'Ocurrió un error al procesar tu solicitud. Por favor intenta de nuevo.';
    }

    // Error genérico
    return errorMessage || 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
};

/**
 * Maneja errores y muestra alertas apropiadas
 */
export const handleError = (error, defaultMessage = 'Ocurrió un error') => {
    console.error('Error:', error);

    if (error && error.message) {
        return handleSupabaseError(error);
    }

    return defaultMessage;
};

/**
 * Mensajes de error comunes
 */
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
    INVALID_CREDENTIALS: 'Credenciales incorrectas.',
    USER_NOT_FOUND: 'Usuario no encontrado.',
    EMAIL_IN_USE: 'Este correo electrónico ya está en uso.',
    USERNAME_IN_USE: 'Este nombre de usuario ya está en uso.',
    WEAK_PASSWORD: 'La contraseña es muy débil.',
    GENERIC_ERROR: 'Ocurrió un error inesperado.',
    SESSION_EXPIRED: 'Sesión expirada. Por favor inicia sesión nuevamente.',
    PERMISSION_DENIED: 'No tienes permisos para realizar esta acción.',
};
