# Configuración de Google OAuth para Spending Log

Este documento describe los pasos necesarios para configurar Google OAuth en tu aplicación Spending Log.

## 📋 Tabla de Contenidos

1. [Configuración en Google Cloud Console](#configuración-en-google-cloud-console)
2. [Configuración en Laravel](#configuración-en-laravel)
3. [Migrar la Base de Datos](#migrar-la-base-de-datos)
4. [Autorizar Usuarios](#autorizar-usuarios)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## 1. Configuración en Google Cloud Console

### Paso 1.1: Crear un Proyecto

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Click en el selector de proyectos en la parte superior
3. Click en **"Nuevo Proyecto"**
4. Ingresa un nombre para tu proyecto (ej: "Spending Log")
5. Click en **"Crear"**

### Paso 1.2: Configurar la Pantalla de Consentimiento OAuth

1. En el menú lateral, ve a **"APIs y servicios"** > **"Pantalla de consentimiento de OAuth"**
2. Selecciona **"Externo"** (o "Interno" si tienes Google Workspace)
3. Click en **"Crear"**

4. **Información de la aplicación:**
   - **Nombre de la aplicación:** Spending Log
   - **Correo electrónico de asistencia:** Tu correo
   - **Logotipo de la aplicación:** (Opcional) Sube un logo

5. **Información de contacto del desarrollador:**
   - Ingresa tu correo electrónico

6. Click en **"Guardar y continuar"**

7. **Ámbitos (Scopes):**
   - Click en **"Agregar o quitar ámbitos"**
   - Selecciona los siguientes ámbitos:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Click en **"Actualizar"**
   - Click en **"Guardar y continuar"**

8. **Usuarios de prueba** (si seleccionaste "Externo"):
   - Click en **"Agregar usuarios"**
   - Agrega los correos electrónicos que podrán probar la aplicación
   - Click en **"Guardar y continuar"**

9. Click en **"Volver al panel"**

### Paso 1.3: Crear Credenciales OAuth 2.0

1. Ve a **"APIs y servicios"** > **"Credenciales"**
2. Click en **"Crear credenciales"** > **"ID de cliente de OAuth"**
3. Selecciona **"Aplicación web"**

4. **Configuración:**
   - **Nombre:** Spending Log Web Client
   
   - **Orígenes autorizados de JavaScript:**
     ```
     http://localhost:8000
     https://tu-dominio.com (para producción)
     ```
   
   - **URIs de redirección autorizadas:**
     ```
     http://localhost:8000/auth/google/callback
     https://tu-dominio.com/auth/google/callback (para producción)
     ```

5. Click en **"Crear"**

6. **Guarda las credenciales:**
   - Se mostrará un modal con tu **Client ID** y **Client Secret**
   - ⚠️ **IMPORTANTE:** Copia estos valores, los necesitarás en el siguiente paso

---

## 2. Configuración en Laravel

### Paso 2.1: Configurar Variables de Entorno

Abre tu archivo `.env` y agrega las siguientes variables:

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id-aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret-aqui
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"
```

**Ejemplo:**
```env
GOOGLE_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"
```

### Paso 2.2: Configurar Socialite en config/services.php

Verifica que el archivo `config/services.php` tenga la configuración de Google:

```php
'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URI'),
],
```

Si no existe, agrégalo dentro del array de retorno.

---

## 3. Migrar la Base de Datos

Ejecuta las migraciones para agregar los campos necesarios a la tabla `users`:

```bash
php artisan migrate
```

Esto agregará los siguientes campos:
- `google_id` - ID único de Google del usuario
- `avatar` - URL del avatar de Google
- `authorized` - Booleano que indica si el usuario está autorizado
- `password` - Ahora es nullable (usuarios de Google no necesitan contraseña)

---

## 4. Autorizar Usuarios

### Comando Artisan para Autorizar Usuarios

La aplicación incluye un comando artisan para pre-autorizar usuarios:

#### Crear y autorizar un nuevo usuario:

```bash
php artisan user:authorize jesusdasilva@gmail.com
```

El comando te preguntará el nombre del usuario. El usuario será creado con:
- Email especificado
- Autorizado = true
- Sin contraseña (solo login con Google)

#### Autorizar un usuario existente:

```bash
php artisan user:authorize usuario@ejemplo.com
```

Si el usuario ya existe, solo se actualizará su estado de autorización.

#### Revocar autorización:

```bash
php artisan user:authorize usuario@ejemplo.com --revoke
```

### Verificar Usuarios Autorizados

Puedes verificar los usuarios autorizados con tinker:

```bash
php artisan tinker
```

```php
// Listar todos los usuarios autorizados
User::where('authorized', true)->get(['email', 'name', 'authorized']);

// Listar todos los usuarios NO autorizados
User::where('authorized', false)->get(['email', 'name', 'authorized']);
```

---

## 5. Testing

### Ejecutar los Tests

```bash
php artisan test --filter=GoogleAuthTest
```

### Tests Incluidos

- ✅ Redirección a Google para autenticación
- ✅ Usuario autorizado puede hacer login con Google
- ✅ Usuario no existente NO puede hacer login
- ✅ Usuario no autorizado NO puede hacer login
- ✅ Comando `user:authorize` puede crear y autorizar usuarios
- ✅ Comando `user:authorize` puede autorizar usuarios existentes
- ✅ Comando `user:authorize` puede revocar autorizaciones

---

## 6. Troubleshooting

### Error: "redirect_uri_mismatch"

**Causa:** La URI de redirección no coincide con las configuradas en Google Cloud Console.

**Solución:**
1. Verifica que la URI en `.env` coincida exactamente con la configurada en Google Cloud Console
2. Asegúrate de incluir el protocolo (`http://` o `https://`)
3. No incluyas slash al final de la URL
4. Verifica que el dominio sea exactamente el mismo

### Error: "Tu correo no está autorizado"

**Causa:** El usuario intenta hacer login pero su email no existe en la base de datos.

**Solución:**
```bash
php artisan user:authorize correo@usuario.com
```

### Error: "Tu cuenta no ha sido autorizada aún"

**Causa:** El usuario existe en la BD pero `authorized = false`.

**Solución:**
```bash
php artisan user:authorize correo@usuario.com
```

### Error: "Access blocked: This app's request is invalid"

**Causa:** La configuración de OAuth en Google Cloud Console está incompleta.

**Solución:**
1. Verifica que hayas completado la pantalla de consentimiento OAuth
2. Si tu app está en modo "Testing", agrega el usuario como "Test User"
3. Verifica que los scopes estén correctamente configurados

### Usuarios de Prueba en Modo "Testing"

Si tu aplicación está en modo "Testing" en Google Cloud Console:

1. Ve a **"APIs y servicios"** > **"Pantalla de consentimiento de OAuth"**
2. En la sección **"Usuarios de prueba"**, click en **"Agregar usuarios"**
3. Agrega los correos que necesiten acceso
4. Los usuarios agregados podrán hacer login incluso en modo testing

### Publicar la Aplicación (Producción)

Para usar la aplicación con cualquier usuario de Google:

1. Ve a **"Pantalla de consentimiento de OAuth"**
2. Click en **"Publicar aplicación"**
3. Completa el proceso de verificación de Google (puede tomar varios días)

---

## 📝 Notas Importantes

1. **Usuarios deben estar pre-autorizados**: A diferencia de otras aplicaciones, los usuarios NO pueden auto-registrarse. Deben ser agregados explícitamente por un administrador usando el comando `user:authorize`.

2. **Autenticación dual**: La aplicación soporta tanto login con Google como login tradicional con email/contraseña. Los usuarios creados con `user:authorize` solo pueden usar Google OAuth (no tienen contraseña).

3. **Seguridad**: Nunca compartas tu `GOOGLE_CLIENT_SECRET`. Mantenlo seguro en tu archivo `.env` y no lo commitees a git.

4. **Producción**: Recuerda actualizar las URIs autorizadas en Google Cloud Console cuando despliegues a producción.

---

## 📞 Soporte

Si tienes problemas con la configuración, contacta al equipo de desarrollo o revisa la documentación oficial:

- [Laravel Socialite - Google](https://laravel.com/docs/11.x/socialite)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

---

**Fecha de última actualización:** Noviembre 2025
**Versión:** 1.0

