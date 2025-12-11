import { supabase } from './supabaseClient';

/**
 * Guarda una nueva ruta en la base de datos
 */
export const saveRoute = async (userId, origen, destino, fecha, hora) => {
    try {
        const { data, error } = await supabase
            .from('rutas')
            .insert([
                {
                    id_usuario: userId,
                    origen,
                    destino,
                    fecha,
                    hora,
                },
            ])
            .select()
            .single();

        if (error) throw error;

        return { success: true, route: data };
    } catch (error) {
        console.error('Error en saveRoute:', error);
        return {
            success: false,
            error: error.message || 'Error al guardar ruta',
        };
    }
};

/**
 * Obtiene todas las rutas de un usuario
 */
export const getUserRoutes = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('rutas')
            .select('*')
            .eq('id_usuario', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return { success: true, routes: data || [] };
    } catch (error) {
        console.error('Error en getUserRoutes:', error);
        return {
            success: false,
            error: error.message || 'Error al obtener rutas',
            routes: [],
        };
    }
};

/**
 * Elimina una ruta específica
 */
export const deleteRoute = async (routeId) => {
    try {
        const { error } = await supabase
            .from('rutas')
            .delete()
            .eq('id', routeId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error en deleteRoute:', error);
        return {
            success: false,
            error: error.message || 'Error al eliminar ruta',
        };
    }
};

/**
 * Obtiene las últimas N rutas de un usuario
 */
export const getRecentRoutes = async (userId, limit = 10) => {
    try {
        const { data, error } = await supabase
            .from('rutas')
            .select('*')
            .eq('id_usuario', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return { success: true, routes: data || [] };
    } catch (error) {
        console.error('Error en getRecentRoutes:', error);
        return {
            success: false,
            error: error.message || 'Error al obtener rutas recientes',
            routes: [],
        };
    }
};
