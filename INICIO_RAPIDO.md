# ⚡ Inicio Rápido - 5 Minutos

## 1️⃣ Configurar Google (15 min primera vez)

Ve a: https://console.cloud.google.com/

- Crea proyecto
- Configura OAuth consent screen
- Crea credenciales OAuth 2.0
- Copia Client ID y Client Secret

**Guía detallada:** `GOOGLE_OAUTH_SETUP.md`

---

## 2️⃣ Configurar .env (1 min)

```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"
```

---

## 3️⃣ Migrar y Crear Admin (2 min)

```bash
php artisan migrate
php artisan make:admin jesusdasilva@gmail.com
```

---

## 4️⃣ Iniciar y Probar (2 min)

```bash
php artisan serve
npm run dev

# Ve a http://localhost:8000/login
# Click "Continuar con Google"
```

---

## 5️⃣ Administrar Usuarios

### Desde Web:
```
Sidebar → "Gestión de Usuarios"
→ Crear, editar, autorizar, eliminar
```

### Desde CLI:
```bash
php artisan user:authorize nuevo@ejemplo.com
php artisan user:list
```

---

## 📚 Más Información

- **Google OAuth Setup:** `GOOGLE_OAUTH_SETUP.md`
- **Módulo Admin:** `ADMIN_MODULE_GUIDE.md`
- **Resumen Completo:** `RESUMEN_IMPLEMENTACION.md`

---

**¡Listo en 20 minutos!** 🚀

