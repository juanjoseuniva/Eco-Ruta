import { supabase } from './supabaseClient';

/**
 * Guarda un nuevo registro de pago
 */
export const savePayment = async (userId, metodoPago, referencia, estado = 'completado') => {
    try {
        const { data, error } = await supabase
            .from('historial_pagos')
            .insert([
                {
                    id_usuario: userId,
                    metodo_pago: metodoPago,
                    referencia,
                    estado,
                },
            ])
            .select()
            .single();

        if (error) throw error;

        return { success: true, payment: data };
    } catch (error) {
        console.error('Error en savePayment:', error);
        return {
            success: false,
            error: error.message || 'Error al guardar pago',
        };
    }
};

/**
 * Obtiene todo el historial de pagos de un usuario
 */
export const getUserPayments = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('historial_pagos')
            .select('*')
            .eq('id_usuario', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return { success: true, payments: data || [] };
    } catch (error) {
        console.error('Error en getUserPayments:', error);
        return {
            success: false,
            error: error.message || 'Error al obtener pagos',
            payments: [],
        };
    }
};

/**
 * Actualiza el estado de un pago
 */
export const updatePaymentStatus = async (paymentId, status) => {
    try {
        const { data, error } = await supabase
            .from('historial_pagos')
            .update({ estado: status })
            .eq('id', paymentId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, payment: data };
    } catch (error) {
        console.error('Error en updatePaymentStatus:', error);
        return {
            success: false,
            error: error.message || 'Error al actualizar estado del pago',
        };
    }
};

/**
 * Obtiene el último método de pago usado por un usuario
 */
export const getLastPaymentMethod = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('historial_pagos')
            .select('metodo_pago')
            .eq('id_usuario', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows returned
            throw error;
        }

        return {
            success: true,
            paymentMethod: data ? data.metodo_pago : 'Efectivo',
        };
    } catch (error) {
        console.error('Error en getLastPaymentMethod:', error);
        return {
            success: false,
            error: error.message || 'Error al obtener último método de pago',
            paymentMethod: 'Efectivo',
        };
    }
};
