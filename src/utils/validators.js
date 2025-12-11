/**
 * Valida formato de correo electrónico
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
        isValid: emailRegex.test(email),
        error: emailRegex.test(email) ? null : 'Formato de correo inválido',
    };
};

/**
 * Valida que un campo no esté vacío
 */
export const validateRequired = (value, fieldName = 'Campo') => {
    const isValid = value && value.trim().length > 0;
    return {
        isValid,
        error: isValid ? null : `${fieldName} es obligatorio`,
    };
};

/**
 * Valida longitud mínima de contraseña
 */
export const validatePassword = (password, minLength = 6) => {
    if (!password || password.length < minLength) {
        return {
            isValid: false,
            error: `La contraseña debe tener al menos ${minLength} caracteres`,
        };
    }

    // Validaciones adicionales opcionales
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    // Por ahora solo verificamos la longitud mínima
    return {
        isValid: true,
        error: null,
        strength: {
            hasUpperCase,
            hasLowerCase,
            hasNumber,
        },
    };
};

/**
 * Valida que dos contraseñas coincidan
 */
export const validatePasswordMatch = (password, confirmPassword) => {
    const isValid = password === confirmPassword;
    return {
        isValid,
        error: isValid ? null : 'Las contraseñas no coinciden',
    };
};

/**
 * Valida formato básico de teléfono
 */
export const validatePhone = (phone) => {
    // Acepta números con o sin guiones, paréntesis, espacios
    // Mínimo 7 dígitos, máximo 15
    const phoneRegex = /^[\d\s\-\(\)]{7,15}$/;
    const isValid = phoneRegex.test(phone);

    return {
        isValid,
        error: isValid ? null : 'Formato de teléfono inválido',
    };
};

/**
 * Valida longitud mínima de un campo
 */
export const validateMinLength = (value, minLength, fieldName = 'Campo') => {
    const isValid = value && value.trim().length >= minLength;
    return {
        isValid,
        error: isValid ? null : `${fieldName} debe tener al menos ${minLength} caracteres`,
    };
};

/**
 * Valida longitud máxima de un campo
 */
export const validateMaxLength = (value, maxLength, fieldName = 'Campo') => {
    const isValid = !value || value.trim().length <= maxLength;
    return {
        isValid,
        error: isValid ? null : `${fieldName} no puede tener más de ${maxLength} caracteres`,
    };
};

/**
 * Valida que un nombre de usuario no contenga caracteres especiales
 */
export const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    const isValid = usernameRegex.test(username);

    return {
        isValid,
        error: isValid
            ? null
            : 'Usuario debe tener 3-20 caracteres (solo letras, números y guión bajo)',
    };
};

/**
 * Valida múltiples campos a la vez
 */
export const validateForm = (validations) => {
    const errors = {};
    let isValid = true;

    for (const [field, validation] of Object.entries(validations)) {
        if (!validation.isValid) {
            errors[field] = validation.error;
            isValid = false;
        }
    }

    return {
        isValid,
        errors,
    };
};
