# Travel App - Configuración de Supabase

Este archivo contiene las instrucciones para configurar la base de datos de Supabase para la aplicación Travel App.

## 📋 Requisitos Previos

- Proyecto Supabase activo
- Acceso al Supabase Dashboard: https://lxehiodrlbntbsijhchh.supabase.co

## 🚀 Pasos de Configuración

### 1. Crear las Tablas en Supabase

1. Accede a tu proyecto en Supabase Dashboard
2. Ve a **SQL Editor** (icono de tabla en el menú lateral)
3. Crea un nuevo query
4. Copia y pega el contenido completo del archivo `supabase_setup.sql`
5. Haz clic en **Run** para ejecutar el script

El script creará automáticamente:
- ✅ Tabla `usuarios` con todos los campos necesarios
- ✅ Tabla `rutas` para el historial de viajes
- ✅ Tabla `historial_pagos` para los pagos
- ✅ Índices para mejorar el rendimiento
- ✅ Políticas de Row Level Security (RLS) para proteger los datos

### 2. Verificar la Creación de Tablas

Después de ejecutar el script, verifica que las tablas se crearon correctamente:

1. Ve a **Table Editor** en Supabase Dashboard
2. Deberías ver tres nuevas tablas:
   - `usuarios`
   - `rutas`
   - `historial_pagos`

### 3. Iniciar la Aplicación

```bash
npm install
npm start
```

La aplicación está configurada con las credenciales de Supabase:
- **URL**: https://lxehiodrlbntbsijhchh.supabase.co
- **Anon Key**: (ya configurada en el código)

## 📊 Estructura de las Tablas

### Tabla: usuarios
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único del usuario |
| nombre | TEXT | Nombre del usuario |
| apellido | TEXT | Apellido del usuario |
| usuario | TEXT | Nombre de usuario (único) |
| correo | TEXT | Correo electrónico (único) |
| telefono | TEXT | Número de teléfono |
| auth_user_id | UUID | Referencia a auth.users |
| created_at | TIMESTAMPTZ | Fecha de creación |

### Tabla: rutas
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único de la ruta |
| id_usuario | UUID | Referencia al usuario |
| origen | TEXT | Dirección de origen |
| destino | TEXT | Dirección de destino |
| fecha | DATE | Fecha del viaje |
| hora | TIME | Hora del viaje |
| created_at | TIMESTAMPTZ | Fecha de creación |

### Tabla: historial_pagos
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único del pago |
| id_usuario | UUID | Referencia al usuario |
| metodo_pago | TEXT | Método de pago usado |
| fecha | TIMESTAMPTZ | Fecha del pago |
| referencia | TEXT | Referencia del pago |
| estado | TEXT | Estado: pendiente/completado/fallido |
| created_at | TIMESTAMPTZ | Fecha de creación |

## 🔒 Seguridad (RLS)

Todas las tablas tienen Row Level Security (RLS) habilitado, lo que significa:
- Los usuarios solo pueden ver sus propios datos
- No pueden acceder a información de otros usuarios
- Las operaciones están protegidas a nivel de base de datos

## 📱 Funcionalidades Implementadas

### Autenticación
- ✅ Registro con validación completa de campos
- ✅ Inicio de sesión con email y contraseña
- ✅ Persistencia de sesión automática
- ✅ Cierre de sesión

### Gestión de Perfil
- ✅ Ver información personal
- ✅ Editar nombre, apellido, usuario y teléfono
- ✅ Validaciones en tiempo real

### Historial de Viajes
- ✅ Guardar automáticamente cada viaje completado
- ✅ Ver listado de viajes anteriores
- ✅ Pull-to-refresh para actualizar

### Métodos de Pago
- ✅ Efectivo, Nequi y PSE disponibles
- ✅ Guardar automáticamente cada pago
- ✅ Ver historial de pagos con estado

## 🐛 Solución de Problemas

### Error: "relation does not exist"
- Asegúrate de haber ejecutado el script SQL completo en Supabase
- Verifica que estás en el proyecto correcto

### Error: "new row violates row-level security policy"
- Verifica que las políticas de RLS se crearon correctamente
- Ejecuta nuevamente la sección de políticas del script SQL

### Error: "duplicate key value violates unique constraint"
- El correo o usuario ya existe en la base de datos
- Intenta con un correo/usuario diferente

## 📞 Soporte

Si encuentras algún problema, verifica:
1. Las credenciales de Supabase están correctamente configuradas
2. Las tablas existen en Supabase Dashboard
3. Las políticas de RLS están habilitadas
4. La conexión a internet está activa
