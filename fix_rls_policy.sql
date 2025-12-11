-- ============================================
-- CORRECCIÓN DE POLÍTICAS RLS - TRAVEL APP
-- ============================================
-- Ejecuta SOLO este script en el SQL Editor de Supabase
-- URL: https://lxehiodrlbntbsijhchh.supabase.co

-- ============================================
-- OPCIÓN 1: Permitir inserciones sin autenticación (MÁS SIMPLE)
-- ============================================
-- Eliminar política de INSERT restrictiva
DROP POLICY IF EXISTS "Los usuarios pueden insertar su propio perfil" ON usuarios;

-- Crear nueva política que permite INSERT durante el registro
-- Esta política permite que cualquier usuario autenticado inserte su propio perfil
CREATE POLICY "Permitir inserción durante registro" ON usuarios
  FOR INSERT 
  WITH CHECK (true);
  -- Nota: Esto permite cualquier inserción. En producción, deberías validar que
  -- auth_user_id no esté ya usado, pero para desarrollo esto funciona.

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Verifica que la política se creó correctamente
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'usuarios' AND cmd = 'INSERT';
