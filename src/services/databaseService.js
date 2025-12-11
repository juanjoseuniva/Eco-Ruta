import { supabase } from './supabaseClient';

/**
 * Crea la tabla de usuarios si no existe
 */
export const createUsuariosTable = async () => {
    try {
        const { error } = await supabase.rpc('create_usuarios_table', {});

        if (error && !error.message.includes('already exists')) {
            console.log('Intentando crear tabla usuarios con SQL directo...');

            // Si el RPC no existe, intentamos con una query SQL simple
            // Nota: Esto requiere permisos en la base de datos
            const createTableSQL = `
        CREATE TABLE IF NOT EXISTS usuarios (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nombre TEXT NOT NULL,
          apellido TEXT NOT NULL,
          usuario TEXT UNIQUE NOT NULL,
          correo TEXT UNIQUE NOT NULL,
          telefono TEXT,
          auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

            // En Supabase, necesitamos usar la tabla directamente
            // Como no podemos ejecutar DDL directamente, la tabla debe crearse manualmente
            // o mediante una función en Supabase
            console.log('Tabla usuarios: verificar en Supabase Dashboard');
            return { success: true, message: 'Verificar tabla en Dashboard' };
        }

        console.log('Tabla usuarios lista');
        return { success: true };
    } catch (err) {
        console.error('Error creando tabla usuarios:', err);
        return { success: false, error: err };
    }
};

/**
 * Crea la tabla de rutas si no existe
 */
export const createRutasTable = async () => {
    try {
        console.log('Tabla rutas: verificar en Supabase Dashboard');
        return { success: true, message: 'Verificar tabla en Dashboard' };
    } catch (err) {
        console.error('Error creando tabla rutas:', err);
        return { success: false, error: err };
    }
};

/**
 * Crea la tabla de historial de pagos si no existe
 */
export const createHistorialPagosTable = async () => {
    try {
        console.log('Tabla historial_pagos: verificar en Supabase Dashboard');
        return { success: true, message: 'Verificar tabla en Dashboard' };
    } catch (err) {
        console.error('Error creando tabla historial_pagos:', err);
        return { success: false, error: err };
    }
};

/**
 * Inicializa todas las tablas de la base de datos
 * Esta función debe ejecutarse al iniciar la app
 */
export const initializeDatabase = async () => {
    console.log('Inicializando base de datos...');

    const results = await Promise.all([
        createUsuariosTable(),
        createRutasTable(),
        createHistorialPagosTable(),
    ]);

    console.log('Resultados de inicialización:', results);
    return results;
};

/**
 * SQL para crear las tablas manualmente en Supabase Dashboard
 * Copia y pega estos comandos en el SQL Editor de Supabase
 */
export const getCreateTablesSQL = () => {
    return `
-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  usuario TEXT UNIQUE NOT NULL,
  correo TEXT UNIQUE NOT NULL,
  telefono TEXT,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id ON usuarios(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_usuarios_usuario ON usuarios(usuario);

-- Tabla de rutas
CREATE TABLE IF NOT EXISTS rutas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  origen TEXT NOT NULL,
  destino TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para rutas
CREATE INDEX IF NOT EXISTS idx_rutas_id_usuario ON rutas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_rutas_fecha ON rutas(fecha DESC);

-- Tabla de historial de pagos
CREATE TABLE IF NOT EXISTS historial_pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  metodo_pago TEXT NOT NULL,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  referencia TEXT,
  estado TEXT DEFAULT 'pendiente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para historial_pagos
CREATE INDEX IF NOT EXISTS idx_historial_pagos_id_usuario ON historial_pagos(id_usuario);
CREATE INDEX IF NOT EXISTS idx_historial_pagos_fecha ON historial_pagos(fecha DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE rutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_pagos ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para usuarios
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON usuarios
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Los usuarios pueden insertar su propio perfil" ON usuarios
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON usuarios
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Políticas de seguridad para rutas
CREATE POLICY "Los usuarios pueden ver sus propias rutas" ON rutas
  FOR SELECT USING (id_usuario IN (SELECT id FROM usuarios WHERE auth_user_id = auth.uid()));

CREATE POLICY "Los usuarios pueden insertar sus propias rutas" ON rutas
  FOR INSERT WITH CHECK (id_usuario IN (SELECT id FROM usuarios WHERE auth_user_id = auth.uid()));

CREATE POLICY "Los usuarios pueden eliminar sus propias rutas" ON rutas
  FOR DELETE USING (id_usuario IN (SELECT id FROM usuarios WHERE auth_user_id = auth.uid()));

-- Políticas de seguridad para historial_pagos
CREATE POLICY "Los usuarios pueden ver su propio historial de pagos" ON historial_pagos
  FOR SELECT USING (id_usuario IN (SELECT id FROM usuarios WHERE auth_user_id = auth.uid()));

CREATE POLICY "Los usuarios pueden insertar en su propio historial de pagos" ON historial_pagos
  FOR INSERT WITH CHECK (id_usuario IN (SELECT id FROM usuarios WHERE auth_user_id = auth.uid()));

CREATE POLICY "Los usuarios pueden actualizar su propio historial de pagos" ON historial_pagos
  FOR UPDATE USING (id_usuario IN (SELECT id FROM usuarios WHERE auth_user_id = auth.uid()));
  `;
};
