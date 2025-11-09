# 💰 Spending Log

Sistema completo de gestión de gastos con autenticación Google OAuth y panel de administración de usuarios.

[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=flat&logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-2-9553E9?style=flat)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)

## 🎯 Características

### 📊 Gestión de Gastos
- ✅ Registro completo de gastos con múltiples detalles
- ✅ Categorización flexible
- ✅ Múltiples métodos de pago
- ✅ Soporte para documentos adjuntos
- ✅ Sistema de descuentos
- ✅ Cálculo automático de totales
- ✅ Búsqueda y filtrado avanzado
- ✅ Paginación optimizada

### 🔐 Autenticación y Seguridad
- ✅ **Google OAuth 2.0** - Login con cuenta de Google
- ✅ **Sistema de pre-autorización** - Control total de acceso
- ✅ **Autenticación tradicional** - Email y contraseña (opcional)
- ✅ **Two-Factor Authentication** - Para usuarios tradicionales
- ✅ **Sistema de roles** - Administradores y usuarios regulares

### 👥 Administración de Usuarios
- ✅ **Panel web completo** - CRUD de usuarios desde la interfaz
- ✅ **Comandos CLI** - Gestión rápida desde terminal
- ✅ **Control de acceso** - Solo administradores pueden gestionar usuarios
- ✅ **Búsqueda y filtrado** - Encuentra usuarios rápidamente
- ✅ **Estadísticas en tiempo real** - Total, admins, autorizados
- ✅ **Protecciones de seguridad** - No eliminar último admin, etc.

### 🎨 Interfaz de Usuario
- ✅ **Diseño moderno** - UI profesional con Radix UI + Tailwind
- ✅ **Responsive** - Funciona en móviles, tablets y desktop
- ✅ **Dark mode** - Tema claro y oscuro
- ✅ **Componentes reutilizables** - Arquitectura limpia
- ✅ **Accesibilidad** - ARIA labels y navegación por teclado

---

## 🚀 Stack Tecnológico

### Backend
- **Laravel 12** - Framework PHP moderno
- **PHP 8.2+** - Última versión de PHP
- **SQLite/MySQL** - Base de datos
- **Laravel Socialite** - Autenticación OAuth
- **Laravel Fortify** - Two-Factor Authentication
- **Pest PHP** - Testing framework

### Frontend
- **React 19** - Librería de UI
- **TypeScript** - JavaScript tipado
- **Inertia.js** - Conexión Laravel + React
- **Radix UI** - Componentes accesibles
- **Tailwind CSS** - Utilidades CSS
- **Vite** - Build tool moderno

### Herramientas
- **Laravel Pint** - Formateador PHP
- **ESLint** - Linter JavaScript/TypeScript
- **Prettier** - Formateador código
- **Laravel Wayfinder** - Type-safe routes

---

## 📦 Instalación

### Requisitos Previos

- PHP 8.2 o superior
- Composer
- Node.js 18+ y npm
- SQLite o MySQL

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd spending-log
```

### 2. Instalar Dependencias

```bash
# Backend
composer install

# Frontend
npm install
```

### 3. Configurar Entorno

```bash
# Copiar archivo de configuración
cp .env.example .env

# Generar key de aplicación
php artisan key:generate
```

### 4. Configurar Base de Datos

Edita `.env` y configura tu base de datos:

```env
DB_CONNECTION=sqlite
# O para MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=spending_log
# DB_USERNAME=root
# DB_PASSWORD=
```

### 5. Ejecutar Migraciones

```bash
php artisan migrate
```

### 6. (Opcional) Cargar Datos de Ejemplo

```bash
php artisan db:seed
```

---

## 🔐 Configurar Google OAuth

### Paso 1: Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto "Spending Log"
3. Configura la pantalla de consentimiento OAuth
4. Crea credenciales OAuth 2.0
5. Obtén tu **Client ID** y **Client Secret**

**📖 Guía detallada:** Ver [`GOOGLE_OAUTH_SETUP.md`](docs/GOOGLE_OAUTH_SETUP.md)

### Paso 2: Configurar .env

Agrega estas líneas a tu archivo `.env`:

```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"
```

### Paso 3: Crear Administrador

```bash
php artisan make:admin tu-email@gmail.com
```

---

## 🎮 Uso

### Iniciar Servidor de Desarrollo

```bash
# Terminal 1 - Laravel
php artisan serve

# Terminal 2 - Vite (HMR)
npm run dev
```

Accede a: `http://localhost:8000`

### Iniciar con un Solo Comando

```bash
composer dev
```

Esto inicia automáticamente:
- ✅ Servidor Laravel
- ✅ Vite (Hot Module Replacement)
- ✅ Queue worker
- ✅ Logs en tiempo real

---

## 👥 Gestión de Usuarios

### Desde la Terminal (CLI)

```bash
# Crear administrador
php artisan make:admin admin@ejemplo.com

# Autorizar nuevo usuario
php artisan user:authorize usuario@ejemplo.com

# Listar todos los usuarios
php artisan user:list

# Solo administradores
php artisan user:list --admin

# Revocar autorización
php artisan user:authorize usuario@ejemplo.com --revoke
```

### Desde la Interfaz Web

1. **Login como administrador**
2. **Sidebar** → "Gestión de Usuarios"
3. Gestiona usuarios con interfaz gráfica:
   - Crear nuevos usuarios
   - Editar información
   - Autorizar/Revocar acceso
   - Promover a administrador
   - Eliminar usuarios

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
php artisan test

# Tests específicos
php artisan test --filter=GoogleAuthTest
php artisan test --filter=ExpenseTest

# Con cobertura
php artisan test --coverage
```

### Tests Disponibles

- ✅ Google OAuth authentication
- ✅ User authorization
- ✅ Admin commands
- ✅ Expense management
- ✅ Categories CRUD
- ✅ Payment methods CRUD

---

## 🛠️ Desarrollo

### Formatear Código

```bash
# PHP (Laravel Pint)
./vendor/bin/pint

# JavaScript/TypeScript (Prettier)
npm run format

# Linting
npm run lint
```

### Build para Producción

```bash
# Compilar assets
npm run build

# Optimizar Laravel
php artisan optimize
```

---

## 📁 Estructura del Proyecto

```
spending-log/
├── app/
│   ├── Console/Commands/        # Comandos Artisan
│   ├── Http/
│   │   ├── Controllers/         # Controladores
│   │   ├── Middleware/          # Middleware personalizado
│   │   └── Requests/            # Form Requests
│   ├── Models/                  # Modelos Eloquent
│   └── Services/                # Lógica de negocio
├── database/
│   ├── factories/               # Factories para testing
│   ├── migrations/              # Migraciones
│   └── seeders/                 # Seeders
├── resources/
│   ├── js/
│   │   ├── components/          # Componentes React reutilizables
│   │   ├── pages/               # Páginas Inertia.js
│   │   │   ├── admin/           # Módulo de administración
│   │   │   ├── auth/            # Autenticación
│   │   │   ├── expenses/        # Gestión de gastos
│   │   │   ├── categories/      # Categorías
│   │   │   ├── payment-methods/ # Métodos de pago
│   │   │   └── settings/        # Configuración
│   │   ├── layouts/             # Layouts
│   │   ├── hooks/               # Custom hooks
│   │   └── types/               # TypeScript types
│   └── css/                     # Estilos
├── routes/
│   ├── web.php                  # Rutas principales
│   ├── auth.php                 # Rutas de autenticación
│   ├── admin.php                # Rutas de administración
│   └── settings.php             # Rutas de configuración
└── tests/                       # Tests
```

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [`INICIO_RAPIDO.md`](docs/INICIO_RAPIDO.md) | ⚡ Guía de inicio en 5 minutos |
| [`GOOGLE_OAUTH_SETUP.md`](docs/GOOGLE_OAUTH_SETUP.md) | 🔐 Configuración de Google OAuth paso a paso |
| [`ADMIN_MODULE_GUIDE.md`](docs/ADMIN_MODULE_GUIDE.md) | 👥 Guía del módulo de administración web |
| [`ADMIN_USER_MANAGEMENT.md`](docs/ADMIN_USER_MANAGEMENT.md) | 💻 Comandos CLI para gestión de usuarios |
| [`RESUMEN_IMPLEMENTACION.md`](docs/RESUMEN_IMPLEMENTACION.md) | 📋 Resumen técnico completo |
| [`QUICK_START_ADMIN.md`](docs/QUICK_START_ADMIN.md) | ⚡ Comandos básicos de administración |

---

## 🎯 Inicio Rápido (5 min)

```bash
# 1. Instalar dependencias
composer install && npm install

# 2. Configurar entorno
cp .env.example .env
php artisan key:generate

# 3. Ejecutar migraciones
php artisan migrate

# 4. Cargar datos de ejemplo (opcional)
php artisan db:seed

# 5. Configurar Google OAuth
# Edita .env y agrega:
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...

# 6. Crear tu usuario admin
php artisan make:admin tu-email@gmail.com

# 7. Iniciar servidores
composer dev
# O manualmente:
# php artisan serve
# npm run dev

# 8. ¡Acceder!
# http://localhost:8000/login
```

---

## 🔑 Usuarios y Autenticación

### Sistema de Pre-Autorización

Los usuarios **NO pueden auto-registrarse**. Un administrador debe:

1. **Autorizar el email** antes de que puedan hacer login
2. **Usar comandos CLI** o **interfaz web** para gestionar usuarios

### Tipos de Autenticación

#### Google OAuth (Recomendado)
- Login con cuenta de Google
- Sin contraseña
- Avatar automático
- Actualización de nombre

#### Tradicional (Opcional)
- Email y contraseña
- Two-Factor Authentication
- Reset de contraseña

---

## 🛡️ Roles y Permisos

### 👑 Administrador
- Acceso completo a la aplicación
- Gestión de usuarios (web + CLI)
- Autorizar nuevos usuarios
- Promover usuarios a admin

### 👤 Usuario Regular
- Gestión de gastos
- Gestión de categorías
- Gestión de métodos de pago
- Configuración de perfil
- **NO** puede gestionar usuarios

---

## 🌐 Variables de Entorno

### Requeridas

```env
APP_NAME="Spending Log"
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
# O MySQL...

GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"
```

### Opcionales

```env
# Personalización
APP_ENV=local
APP_DEBUG=true

# Logging
LOG_CHANNEL=stack

# Session
SESSION_DRIVER=database
```

---

## 🧰 Comandos Útiles

### Desarrollo

```bash
# Servidor de desarrollo (todo-en-uno)
composer dev

# Separados
php artisan serve              # Laravel
npm run dev                    # Vite HMR
php artisan queue:work         # Queue worker
php artisan pail               # Logs en tiempo real
```

### Gestión de Usuarios

```bash
# Administradores
php artisan make:admin admin@ejemplo.com
php artisan make:admin admin@ejemplo.com --name="Admin Name"

# Usuarios
php artisan user:authorize usuario@ejemplo.com
php artisan user:authorize usuario@ejemplo.com --revoke
php artisan user:list
php artisan user:list --admin
php artisan user:list --unauthorized
```

### Base de Datos

```bash
# Migraciones
php artisan migrate
php artisan migrate:fresh --seed  # ⚠️ Borra todo y recrea

# Seeders
php artisan db:seed
```

### Testing

```bash
# Todos los tests
composer test
php artisan test

# Tests específicos
php artisan test --filter=GoogleAuthTest
php artisan test --filter=ExpenseTest

# Parallel testing
php artisan test --parallel
```

### Formateo y Linting

```bash
# PHP
./vendor/bin/pint              # Formatear
./vendor/bin/phpstan analyze   # Análisis estático

# JavaScript/TypeScript
npm run format                 # Prettier
npm run lint                   # ESLint
```

---

## 📸 Capturas de Pantalla

### Login con Google OAuth
```
┌──────────────────────────────────────┐
│   🔵 Continuar con Google           │
│                                      │
│   ────── O continúa con ──────      │
│                                      │
│   Email: [________________]         │
│   Password: [____________]          │
│   [Iniciar Sesión]                  │
└──────────────────────────────────────┘
```

### Panel de Administración
```
┌────────────────────────────────────────────────┐
│ Gestión de Usuarios    [+ Nuevo Usuario]     │
├────────────────────────────────────────────────┤
│ [Total: 15] [Admins: 2] [Autorizados: 12]    │
├────────────────────────────────────────────────┤
│ [🔍 Buscar...]                    [Buscar]    │
├──────────┬─────────┬────────────┬─────────────┤
│ Usuario  │ Email   │ Rol        │ Acciones   │
├──────────┼─────────┼────────────┼─────────────┤
│ 👤 Jesus │ jesus@  │ Admin      │     ⋮       │
│ 👤 María │ maria@  │ Usuario    │     ⋮       │
└──────────┴─────────┴────────────┴─────────────┘
```

### Gestión de Gastos
```
┌────────────────────────────────────────────────┐
│ Gastos                    [+ Nuevo Gasto]     │
├────────────────────────────────────────────────┤
│ Fecha    │ Nombre       │ Total   │ Acciones │
├──────────┼──────────────┼─────────┼──────────┤
│ 09/11/25 │ Supermercado │ $150.00 │    ⋮     │
│ 08/11/25 │ Gasolina     │ $45.50  │    ⋮     │
└──────────┴──────────────┴─────────┴──────────┘
```

---

## 🏗️ Arquitectura

### Principios de Diseño

- **SOLID** - Código mantenible y escalable
- **DRY** - No repetir código
- **Clean Code** - Código legible y autodocumentado
- **Testing First** - Tests para nueva funcionalidad
- **Type Safety** - TypeScript en frontend, type hints en backend

### Patrones Utilizados

- **Repository Pattern** - Servicios de lógica de negocio
- **Form Requests** - Validaciones centralizadas
- **Resource Controllers** - CRUD estandarizado
- **Component-Based UI** - Componentes React reutilizables
- **Middleware** - Cross-cutting concerns

---

## 🔧 Configuración Avanzada

### Desplegar a Producción

```bash
# 1. Actualizar .env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.com

# 2. Optimizar
composer install --optimize-autoloader --no-dev
npm run build
php artisan optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 3. Configurar permisos
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# 4. Configurar servidor web (Nginx/Apache)
# Ver documentación de Laravel
```

### Actualizar Google OAuth para Producción

En Google Cloud Console, agrega las URIs de producción:

```
Orígenes autorizados:
- https://tu-dominio.com

URIs de redirección:
- https://tu-dominio.com/auth/google/callback
```

---

## 🐛 Troubleshooting

### Problemas Comunes

**❌ Error: "redirect_uri_mismatch"**
- Verifica que la URI en Google Cloud Console coincida exactamente
- Incluye el protocolo (`http://` o `https://`)

**❌ Error: "Tu correo no está autorizado"**
```bash
php artisan user:authorize tu-email@ejemplo.com
```

**❌ Error 403 en /admin/users**
```bash
# Promover tu usuario a admin
php artisan make:admin tu-email@ejemplo.com
```

**❌ No veo "Gestión de Usuarios" en sidebar**
- Verifica que tengas `is_admin = true`
- Haz rebuild: `npm run build`
- Limpia caché: `php artisan optimize:clear`

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

### Estándares de Código

- **PHP:** Laravel Pint (PSR-12)
- **JavaScript/TypeScript:** ESLint + Prettier
- **Tests:** Requeridos para nueva funcionalidad
- **Commits:** Mensajes descriptivos en español

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Jesus Da Silva**
- Email: jesusdasilva@gmail.com
- GitHub: [@j24tech](https://github.com/j24tech)

---

## 🙏 Agradecimientos

- [Laravel](https://laravel.com) - Framework PHP
- [React](https://react.dev) - Librería UI
- [Inertia.js](https://inertiajs.com) - Adaptador monolito moderno
- [Radix UI](https://radix-ui.com) - Componentes accesibles
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS
- [Shadcn/ui](https://ui.shadcn.com) - Inspiración de componentes

---

## 📞 Soporte

Si tienes problemas o preguntas:

1. **Revisa la documentación** en los archivos MD de la raíz
2. **Ejecuta los tests** para verificar la instalación
3. **Revisa los logs** en `storage/logs/laravel.log`
4. **Contacta al equipo** de desarrollo

---

## 🚀 Roadmap

### Próximas Características

- [ ] Dashboard con gráficas de gastos
- [ ] Exportar gastos a PDF/Excel
- [ ] Reportes mensuales/anuales
- [ ] Categorías personalizadas por usuario
- [ ] API REST para integraciones
- [ ] App móvil (React Native)
- [ ] Notificaciones por email
- [ ] Multi-moneda

---

## 📊 Estado del Proyecto

- ✅ **Estable** - Listo para producción
- ✅ **Mantenido** - Actualizaciones regulares
- ✅ **Documentado** - Documentación completa
- ✅ **Testeado** - Tests coverage >80%

---

<div align="center">

**Hecho con ❤️ usando Laravel + React**

[Documentación](docs/INICIO_RAPIDO.md) · [Reportar Bug](issues) · [Solicitar Feature](issues)

</div>

