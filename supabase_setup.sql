-- ============================================
-- TRAVEL APP - SUPABASE DATABASE SETUP
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase Dashboard
-- URL: https://lxehiodrlbntbsijhchh.supabase.co

-- ============================================
-- 1. TABLA DE USUARIOS
-- ============================================
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

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id ON usuarios(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_usuarios_usuario ON usuarios(usuario);

-- ============================================
-- 2. TABLA DE RUTAS
-- ============================================
CREATE TABLE IF NOT EXISTS rutas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
  origen TEXT NOT NULL,
  destino TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_rutas_id_usuario ON rutas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_rutas_fecha ON rutas(fecha DESC);

-- ============================================
-- 3. TABLA DE HISTORIAL DE PAGOS
-- ============================================
CREATE TABLE IF NOT EXISTS historial_pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
  metodo_pago TEXT NOT NULL,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  referencia TEXT,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'fallido')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_historial_pagos_id_usuario ON historial_pagos(id_usuario);
CREATE INDEX IF NOT EXISTS idx_historial_pagos_fecha ON historial_pagos(fecha DESC);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================
-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE rutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_pagos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. POLÍTICAS DE SEGURIDAD - USUARIOS
-- ============================================
-- Los usuarios solo pueden ver su propio perfil
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON usuarios;
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON usuarios
  FOR SELECT USING (auth.uid() = auth_user_id);

-- Los usuarios pueden insertar su propio perfil al registrarse
-- NOTA: Durante el registro, permitimos cualquier inserción porque la sesión
-- puede no estar activa aún. En producción, considera usar una función de base de datos.
DROP POLICY IF EXISTS "Los usuarios pueden insertar su propio perfil" ON usuarios;
CREATE POLICY "Los usuarios pueden insertar su propio perfil" ON usuarios
  FOR INSERT WITH CHECK (true);

-- Los usuarios pueden actualizar su propio perfil
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON usuarios;
CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON usuarios
  FOR UPDATE USING (auth.uid() = auth_user_id) WITH CHECK (auth.uid() = auth_user_id);

-- ============================================
-- 6. POLÍTICAS DE SEGURIDAD - RUTAS
-- ============================================
-- Los usuarios solo pueden ver sus propias rutas
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias rutas" ON rutas;
CREATE POLICY "Los usuarios pueden ver sus propias rutas" ON rutas
  FOR SELECT USING (
    id_usuario IN (SELECT id FROM usuarios WHERE auth_user_id = auth.uid())
  );

-- Los usuarios pueden insertar sus propias rutas
DROP POLICY IF EXISTS "Los usuarios pueden insertar sus propias rutas" ON rutas;
CREATE POLICY "Los usuarios pueden insertar sus propias rutas" ON rutas
  FOR INSERT WITH CHECK (
    id_usuario IN (SELECT id FROM usuarios WHERE auth_user_id = auth.uid())
  );

-- Los usuarios pueden eliminar sus propias rutas
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propias rutas" ON rutas;
CREATE POLICY "Los usuarios pueden eliminar sus propias rutas" ON rutas
  FOR DELETE USING (
    id_usuario IN (SELECT id FROM usuarios WHERE auth_user_id = auth.uid())
  );

-- ============================================
-- 7. POLÍTICAS DE SEGURIDAD - HISTORIAL DE PAGOS
-- ============================================
-- Los usuarios solo pueden ver su propio historial de pagos
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio historial de pagos" ON historial_pagos;
CREATE POLICY "Los usuarios pueden ver su propio historial de pagos" ON historial_pagos
  FOR SELECT USING (
    id_usuario IN (SELECT id FROM usuarios WHERE auth_user_id = auth.uid())
  );

-- Los usuarios pueden insertar en su propio historial de pagos
DROP POLICY IF EXISTS "Los usuarios pueden insertar en su propio historial de pagos" ON historial_pagos;
CREATE POLICY "Los usuarios pueden insertar en su propio historial de pagos" ON historial_pagos
  FOR INSERT WITH CHECK (
    id_usuario IN (SELECT id FROM usuarios WHERE auth_user_id = auth.uid())
  );

-- Los usuarios pueden actualizar su propio historial de pagos
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio historial de pagos" ON historial_pagos;
CREATE POLICY "Los usuarios pueden actualizar su propio historial de pagos" ON historial_pagos
  FOR UPDATE USING (
    id_usuario IN (SELECT id FROM usuarios WHERE auth_user_id = auth.uid())
  ) WITH CHECK (
    id_usuario IN (SELECT id FROM usuarios WHERE auth_user_id = auth.uid())
  );

-- ============================================
-- 8. VERIFICACIÓN
-- ============================================
-- Verifica que las tablas se crearon correctamente
SELECT 
  tablename,
  schemaname
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('usuarios', 'rutas', 'historial_pagos')
ORDER BY tablename;

-- Verifica las políticas de RLS
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('usuarios', 'rutas', 'historial_pagos')
ORDER BY tablename, policyname;
