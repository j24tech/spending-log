# Sistema de Administración de Usuarios

Este documento describe el sistema de roles y gestión de usuarios en Spending Log.

## 🎯 Roles de Usuario

La aplicación maneja dos tipos de usuarios:

### 👑 Administrador
- Puede iniciar sesión con Google
- Puede autorizar otros usuarios
- Puede promover usuarios a administrador
- Tiene acceso completo a la aplicación

### 👤 Usuario Regular
- Puede iniciar sesión con Google (si está autorizado)
- Debe ser autorizado por un administrador
- Solo puede usar las funciones de la aplicación

---

## 🚀 Comandos Disponibles

### 1. Crear el Administrador Inicial

**Uso básico:**
```bash
php artisan make:admin jesusdasilva@gmail.com
```

**Con nombre personalizado:**
```bash
php artisan make:admin jesusdasilva@gmail.com --name="Jesus Da Silva"
```

**Interactivo (te preguntará el email y nombre):**
```bash
php artisan make:admin
```

**Salida esperada:**
```
✓ Usuario administrador creado exitosamente.
  Email: jesusdasilva@gmail.com
  Nombre: Jesus Da Silva
  Permisos: Administrador
  Autenticación: Google OAuth

💡 El administrador puede ahora:
   • Iniciar sesión con Google
   • Autorizar otros usuarios con: php artisan user:authorize {email}
```

---

### 2. Autorizar Usuarios

Este comando permite al administrador pre-autorizar usuarios para que puedan hacer login.

**Crear y autorizar un nuevo usuario:**
```bash
php artisan user:authorize juan.perez@ejemplo.com
```

El comando te preguntará el nombre del usuario.

**Autorizar usuario existente:**
```bash
php artisan user:authorize maria.lopez@ejemplo.com
```

Si el usuario ya existe, solo actualizará su estado de autorización.

**Revocar autorización:**
```bash
php artisan user:authorize maria.lopez@ejemplo.com --revoke
```

**Ejemplos de salida:**

✅ **Usuario nuevo:**
```
Nombre del usuario [juan.perez@ejemplo.com]: Juan Pérez

✓ Usuario juan.perez@ejemplo.com creado y autorizado exitosamente.
  El usuario podrá hacer login con Google.
```

✅ **Usuario existente:**
```
✓ Usuario maria.lopez@ejemplo.com autorizado exitosamente.
```

✅ **Revocar autorización:**
```
✓ Autorización revocada para maria.lopez@ejemplo.com.
```

---

### 3. Listar Usuarios

Comando para ver todos los usuarios registrados en la aplicación.

**Listar todos los usuarios:**
```bash
php artisan user:list
```

**Solo administradores:**
```bash
php artisan user:list --admin
```

**Solo usuarios no autorizados:**
```bash
php artisan user:list --unauthorized
```

**Salida esperada:**
```
┌────┬────────────────┬───────────────────────────┬─────────┬────────────┬────────┬──────────────────┐
│ ID │ Nombre         │ Email                     │ Rol     │ Autorizado │ Google │ Creado           │
├────┼────────────────┼───────────────────────────┼─────────┼────────────┼────────┼──────────────────┤
│ 1  │ Jesus Da Silva │ jesusdasilva@gmail.com    │ ✓ Admin │ ✓          │ ✓      │ 2025-11-09 01:30 │
│ 2  │ Juan Pérez     │ juan.perez@ejemplo.com    │         │ ✓          │ ✗      │ 2025-11-09 02:15 │
│ 3  │ María López    │ maria.lopez@ejemplo.com   │         │ ✗          │ ✗      │ 2025-11-09 02:20 │
└────┴────────────────┴───────────────────────────┴─────────┴────────────┴────────┴──────────────────┘

Total de usuarios: 3
Administradores: 1
Autorizados: 2
No autorizados: 1
```

---

## 📋 Flujo de Trabajo Típico

### Configuración Inicial

1. **Configurar Google OAuth** (ver `GOOGLE_OAUTH_SETUP.md`)
2. **Ejecutar migraciones:**
   ```bash
   php artisan migrate
   ```

3. **Crear el administrador:**
   ```bash
   php artisan make:admin jesusdasilva@gmail.com
   ```

### Autorizar Nuevos Usuarios

Cuando alguien necesite acceso a la aplicación:

1. **Obtener el email del usuario** (debe ser una cuenta de Google)

2. **Autorizar el usuario:**
   ```bash
   php artisan user:authorize nuevo.usuario@gmail.com
   ```

3. **Informar al usuario** que ya puede hacer login con Google

### Gestión de Usuarios

```bash
# Ver todos los usuarios
php artisan user:list

# Ver solo administradores
php artisan user:list --admin

# Ver usuarios pendientes de autorización
php artisan user:list --unauthorized

# Revocar acceso a un usuario
php artisan user:authorize usuario@ejemplo.com --revoke
```

---

## 🔐 Permisos y Seguridad

### ¿Quién puede ejecutar estos comandos?

Estos comandos son **comandos de consola** que se ejecutan directamente en el servidor. Por lo tanto:

- ✅ Solo personas con acceso SSH/terminal al servidor pueden ejecutarlos
- ✅ Requieren acceso al código fuente
- ✅ No están expuestos a través de la web

### Seguridad de Datos

- Los usuarios **sin contraseña** solo pueden autenticarse con Google OAuth
- Los usuarios **no autorizados** no pueden hacer login aunque tengan cuenta de Google
- El campo `is_admin` está protegido y solo puede modificarse por comandos

---

## 🎯 Casos de Uso

### Caso 1: Empresa Pequeña

```bash
# Crear el administrador (dueño de la empresa)
php artisan make:admin dueno@empresa.com

# Autorizar a los empleados
php artisan user:authorize empleado1@empresa.com
php artisan user:authorize empleado2@empresa.com
php artisan user:authorize contador@empresa.com

# Ver todos los usuarios autorizados
php artisan user:list
```

### Caso 2: Equipo Freelance

```bash
# Crear el administrador (líder del proyecto)
php artisan make:admin lider@proyecto.com

# Autorizar miembros del equipo temporalmente
php artisan user:authorize freelancer1@gmail.com
php artisan user:authorize freelancer2@gmail.com

# Cuando termine el proyecto, revocar acceso
php artisan user:authorize freelancer1@gmail.com --revoke
php artisan user:authorize freelancer2@gmail.com --revoke
```

### Caso 3: Promover Usuario a Administrador

```bash
# Si un usuario regular necesita ser administrador
php artisan make:admin empleado@empresa.com

# El comando detectará que ya existe y preguntará si quieres promoverlo
# Responde "yes" para convertirlo en administrador
```

---

## 🗄️ Estructura de Base de Datos

### Campos Relevantes en la Tabla `users`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `email` | string | Email del usuario (único) |
| `name` | string | Nombre completo |
| `google_id` | string | ID de Google (cuando hace login) |
| `avatar` | string | URL del avatar de Google |
| `authorized` | boolean | Si puede hacer login |
| `is_admin` | boolean | Si es administrador |
| `password` | string | Nullable - solo Google OAuth |

---

## 💡 Tips y Buenas Prácticas

1. **Siempre crear el administrador primero:**
   ```bash
   php artisan make:admin tu-email@gmail.com
   ```

2. **Verificar usuarios autorizados regularmente:**
   ```bash
   php artisan user:list
   ```

3. **Revocar acceso cuando sea necesario:**
   ```bash
   php artisan user:authorize usuario@ejemplo.com --revoke
   ```

4. **Backup antes de cambios importantes:**
   ```bash
   # Hacer backup de la base de datos antes de operaciones masivas
   php artisan db:backup  # (si tienes configurado backup)
   ```

5. **Documentar quién tiene acceso:**
   - Mantén una lista de usuarios autorizados
   - Revisa periódicamente con `php artisan user:list`
   - Revoca acceso cuando alguien deje el equipo

---

## ❓ Preguntas Frecuentes

### ¿Puedo tener múltiples administradores?

Sí, puedes crear múltiples administradores:
```bash
php artisan make:admin admin1@empresa.com
php artisan make:admin admin2@empresa.com
```

### ¿Cómo quito el rol de administrador a alguien?

Actualmente, no hay un comando para remover el rol de admin. Puedes hacerlo con tinker:
```bash
php artisan tinker
$user = User::where('email', 'usuario@ejemplo.com')->first();
$user->update(['is_admin' => false]);
```

### ¿Qué pasa si pierdo acceso al administrador?

Puedes crear un nuevo administrador desde la terminal:
```bash
php artisan make:admin nuevo-admin@gmail.com
```

### ¿Los usuarios necesitan contraseña?

No. La aplicación usa **solo Google OAuth**. No se requieren contraseñas.

### ¿Puedo usar email que no sea de Gmail?

Sí, siempre que sea una cuenta de Google Workspace o una cuenta de Google vinculada a ese email.

---

## 🔄 Migración y Actualización

Si actualizas desde una versión anterior sin el campo `is_admin`:

```bash
# Ejecutar la migración
php artisan migrate

# Crear el administrador
php artisan make:admin tu-email@gmail.com

# Verificar que todo funciona
php artisan user:list
```

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que las migraciones estén ejecutadas: `php artisan migrate:status`
2. Lista los usuarios actuales: `php artisan user:list`
3. Revisa los logs: `storage/logs/laravel.log`

---

**Última actualización:** Noviembre 9, 2025  
**Versión:** 1.0  
**Stack:** Laravel 12 + Google OAuth

