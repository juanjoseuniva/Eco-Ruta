import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { getCurrentUser, loginUser, logoutUser, registerUser, updateUserProfile } from '../services/userService';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar sesión actual al montar
        checkUser();

        // Escuchar cambios en la autenticación
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth event:', event);

                if (session) {
                    setSession(session);
                    setUser(session.user);

                    // Obtener perfil cuando hay sesión
                    const result = await getCurrentUser();
                    if (result.success && result.profile) {
                        setProfile(result.profile);
                    }
                } else {
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                }

                setLoading(false);
            }
        );

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);

    const checkUser = async () => {
        try {
            const result = await getCurrentUser();

            if (result.success && result.session) {
                setSession(result.session);
                setUser(result.user);
                setProfile(result.profile);
            } else {
                setSession(null);
                setUser(null);
                setProfile(null);
            }
        } catch (error) {
            console.error('Error checking user:', error);
            setSession(null);
            setUser(null);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (nombre, apellido, usuario, correo, telefono, password) => {
        try {
            setLoading(true);
            const result = await registerUser(nombre, apellido, usuario, correo, telefono, password);

            if (result.success) {
                setUser(result.user);
                setProfile(result.profile);
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
        try {
            setLoading(true);
            const result = await loginUser(email, password);

            if (result.success) {
                setSession(result.session);
                setUser(result.user);
                setProfile(result.profile);
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            setLoading(true);
            const result = await logoutUser();

            if (result.success) {
                setSession(null);
                setUser(null);
                setProfile(null);
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates) => {
        try {
            if (!profile || !profile.id) {
                return { success: false, error: 'No hay perfil para actualizar' };
            }

            const result = await updateUserProfile(profile.id, updates);

            if (result.success) {
                setProfile(result.profile);
                return { success: true, profile: result.profile };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
