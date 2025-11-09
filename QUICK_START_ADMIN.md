# 🚀 Guía Rápida: Crear Administrador

## ⚡ Pasos Rápidos

### 1. Ejecutar Migraciones
```bash
php artisan migrate
```

### 2. Crear el Administrador
```bash
php artisan make:admin jesusdasilva@gmail.com
```

### 3. Probar el Login
1. Ve a `http://localhost:8000/login`
2. Haz clic en "Continuar con Google"
3. Selecciona tu cuenta de Google
4. ¡Listo! Estás dentro como administrador

---

## 📝 Comandos Útiles

```bash
# Crear administrador
php artisan make:admin jesusdasilva@gmail.com

# Autorizar un usuario nuevo
php artisan user:authorize usuario@ejemplo.com

# Listar todos los usuarios
php artisan user:list

# Revocar acceso
php artisan user:authorize usuario@ejemplo.com --revoke
```

---

## 📚 Más Información

- **Configuración de Google:** `GOOGLE_OAUTH_SETUP.md`
- **Gestión de Usuarios:** `ADMIN_USER_MANAGEMENT.md`
- **Implementación Completa:** `IMPLEMENTACION_GOOGLE_OAUTH.md`

---

**¡Ya estás listo para usar la aplicación!** 🎉

