# 🔐 Módulo de Administración de Usuarios - Guía Completa

## 📋 Descripción

Módulo web completo para que los administradores gestionen usuarios desde la interfaz de la aplicación. Solo accesible para usuarios con rol de administrador.

---

## 🎯 Características

### ✅ Funcionalidades Disponibles

- **Listar usuarios** con búsqueda y paginación
- **Crear nuevos usuarios** pre-autorizados
- **Editar usuarios** existentes
- **Eliminar usuarios** con protecciones de seguridad
- **Autorizar/Revocar** acceso con un click
- **Promover/Degradar** usuarios a administrador
- **Estadísticas** en tiempo real (total, admins, autorizados)
- **Búsqueda** por nombre o email
- **Interfaz moderna** con React + Radix UI

### 🛡️ Seguridad Implementada

- ✅ Middleware `admin` protege todas las rutas
- ✅ No puedes eliminar al último administrador
- ✅ No puedes eliminarte a ti mismo
- ✅ No puedes quitar admin al último admin
- ✅ Validaciones en backend y frontend

---

## 🚀 Acceso al Módulo

### Para Usuarios Admin

1. **Login** con tu cuenta de Google (debes ser admin)
2. En el **sidebar** verás una sección "Administración"
3. Click en **"Gestión de Usuarios"**
4. ¡Listo! Ya puedes administrar usuarios

### Para Usuarios No-Admin

Si intentas acceder a `/admin/users` sin ser admin:
- ❌ Verás un error 403: "Solo los administradores pueden acceder a esta sección."

---

## 📍 Rutas Disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/admin/users` | Listado de usuarios |
| GET | `/admin/users/create` | Formulario crear usuario |
| POST | `/admin/users` | Guardar nuevo usuario |
| GET | `/admin/users/{id}/edit` | Formulario editar usuario |
| PUT | `/admin/users/{id}` | Actualizar usuario |
| DELETE | `/admin/users/{id}` | Eliminar usuario |
| POST | `/admin/users/{id}/toggle-authorization` | Autorizar/Revocar |
| POST | `/admin/users/{id}/toggle-admin` | Promover/Degradar admin |

---

## 🎨 Interfaz de Usuario

### Página Principal (`/admin/users`)

**Características:**
- 📊 **3 tarjetas de estadísticas** (Total, Admins, Autorizados)
- 🔍 **Barra de búsqueda** en tiempo real
- 📋 **Tabla ordenada** por rol → autorización → fecha
- ⚡ **Paginación** con selector de items por página
- 🎨 **Badges de colores** para roles y estados

**Vista de tabla:**
```
┌──────────────────────────────────────────────────────────────────┐
│ Usuario       │ Email         │ Rol           │ Estado    │ ...  │
├──────────────────────────────────────────────────────────────────┤
│ 👤 Jesus      │ jesus@...     │ Administrador │ Autorizado│  ⋮   │
│ 👤 María      │ maria@...     │ Usuario       │ Autorizado│  ⋮   │
│ 👤 Juan       │ juan@...      │ Usuario       │ No autor. │  ⋮   │
└──────────────────────────────────────────────────────────────────┘
```

### Acciones Disponibles (Menú ⋮)

1. **✏️ Editar** - Modificar información
2. **✅/❌ Autorizar/Revocar** - Toggle estado
3. **🛡️ Promover/Degradar** - Toggle admin
4. **🗑️ Eliminar** - Borrar usuario (con confirmación)

### Crear Usuario (`/admin/users/create`)

**Formulario:**
- Nombre completo
- Email (debe ser Google account)
- ☑️ Usuario autorizado (checkbox)
- ☑️ Administrador (checkbox)

**Botones:**
- Cancelar (vuelve a la lista)
- Crear Usuario (guarda)

### Editar Usuario (`/admin/users/{id}/edit`)

Similar al crear, pero:
- Muestra avatar de Google si está vinculado
- Indica si usa Google OAuth
- Pre-llena los datos actuales
- Validaciones adicionales para evitar quedarse sin admins

---

## 💻 Ejemplos de Uso

### Ejemplo 1: Crear un Nuevo Usuario

```
1. Ve a /admin/users
2. Click "Nuevo Usuario"
3. Completa:
   - Nombre: María López
   - Email: maria@ejemplo.com
   - ✓ Usuario autorizado
   - ☐ Administrador
4. Click "Crear Usuario"
5. ✓ Usuario creado exitosamente
```

El usuario María puede ahora hacer login con Google.

### Ejemplo 2: Promover a Administrador

```
1. Ve a /admin/users
2. Busca al usuario
3. Click menú ⋮
4. Click "Promover a admin"
5. ✓ Usuario promovido exitosamente
```

### Ejemplo 3: Revocar Acceso

```
1. Ve a /admin/users
2. Busca al usuario
3. Click menú ⋮
4. Click "Revocar autorización"
5. ✓ Usuario desautorizado
```

El usuario ya no podrá hacer login.

---

## 🔧 Estructura Técnica

### Backend

**Archivos PHP:**
```
app/
├── Http/
│   ├── Middleware/
│   │   └── EnsureUserIsAdmin.php (Middleware de protección)
│   └── Controllers/
│       └── Admin/
│           └── UserManagementController.php (CRUD completo)
├── Models/
│   └── User.php (Campo is_admin agregado)
routes/
└── admin.php (Rutas protegidas con middleware)
```

**Middleware Registrado:**
```php
// bootstrap/app.php
$middleware->alias([
    'admin' => EnsureUserIsAdmin::class,
]);
```

### Frontend

**Archivos React/TypeScript:**
```
resources/js/
├── pages/
│   └── admin/
│       └── users/
│           ├── index.tsx (Lista)
│           ├── create.tsx (Crear)
│           ├── edit.tsx (Editar)
│           └── components/
│               ├── users-table.tsx (Tabla)
│               ├── user-actions.tsx (Menú acciones)
│               └── delete-user-dialog.tsx (Diálogo confirmación)
├── components/
│   ├── app-sidebar.tsx (Enlace admin agregado)
│   ├── nav-main.tsx (Soporta múltiples grupos)
│   └── ui/
│       └── alert-dialog.tsx (Componente nuevo)
```

**Navegación:**
- Enlace en sidebar solo visible para admins
- Ícono: 🛡️ Shield
- Label: "Gestión de Usuarios"

---

## 🎯 Validaciones Implementadas

### Backend (Laravel)

```php
// Al crear/editar
'name' => 'required|string|max:255',
'email' => 'required|email|unique:users',
'authorized' => 'boolean',
'is_admin' => 'boolean',

// Al eliminar
- No puedes eliminar al último admin
- No puedes eliminarte a ti mismo

// Al quitar admin
- Verifica que no sea el último admin
```

### Frontend (React)

```tsx
// Validaciones HTML5
required, type="email"

// Validaciones de negocio
- Mensajes de error de Inertia
- Diálogos de confirmación
- Feedback visual con estados
```

---

## 📊 Datos Compartidos (Inertia)

El campo `is_admin` está disponible globalmente:

```typescript
// En cualquier componente
const { auth } = usePage<SharedData>().props;
const isAdmin = auth.user?.is_admin;

if (isAdmin) {
  // Mostrar opciones de admin
}
```

---

## 🧪 Testing

### Probar el Módulo

1. **Ejecutar migraciones:**
   ```bash
   php artisan migrate
   ```

2. **Crear admin:**
   ```bash
   php artisan make:admin tu-email@gmail.com
   ```

3. **Iniciar servidor:**
   ```bash
   php artisan serve
   npm run dev
   ```

4. **Acceder:**
   - Ve a `http://localhost:8000/login`
   - Login con Google
   - Verás "Gestión de Usuarios" en sidebar

### Verificar Protección

Intenta acceder a `/admin/users` con un usuario no-admin:
- Deberías ver error 403

---

## 🎨 Personalización

### Cambiar Permisos del Enlace

En `resources/js/components/app-sidebar.tsx`:

```typescript
const isAdmin = auth.user?.is_admin ?? false;

{isAdmin && <NavMain items={adminNavItems} label="Administración" />}
```

### Agregar Más Opciones Admin

En `resources/js/components/app-sidebar.tsx`:

```typescript
const adminNavItems: NavItem[] = [
    {
        title: 'Gestión de Usuarios',
        href: '/admin/users',
        icon: Shield,
    },
    {
        title: 'Configuración',
        href: '/admin/settings',
        icon: Settings,
    },
    // Agregar más...
];
```

---

## 🚨 Solución de Problemas

### "403: Solo los administradores pueden acceder"

**Causa:** Tu usuario no tiene `is_admin = true`

**Solución:**
```bash
php artisan make:admin tu-email@gmail.com
```

### No veo el enlace de "Gestión de Usuarios"

**Causa:** El campo `is_admin` no está en shared data o no eres admin

**Solución:**
1. Verifica en consola: `page.props.auth.user.is_admin`
2. Si es `undefined`, haz rebuild: `npm run build`
3. Verifica que tengas `is_admin = true` en BD

### Error al eliminar usuario

**Causa:** Intentas eliminar al último admin o a ti mismo

**Solución:** Estas son protecciones de seguridad, son intencionales

---

## 📝 Flujo Completo de Usuario

```
Admin Login
    ↓
Ve Sidebar → "Gestión de Usuarios"
    ↓
Lista de usuarios con búsqueda
    ↓
Opciones:
    ├→ Crear nuevo usuario → Formulario → Guardar
    ├→ Editar usuario → Formulario → Actualizar
    ├→ Toggle autorización → Confirmación → Update
    ├→ Toggle admin → Confirmación → Update
    └→ Eliminar → Diálogo → Confirmar → Delete
```

---

## 🎉 Resumen

Has recibido un **módulo completo de administración de usuarios** que incluye:

- ✅ Interfaz web moderna y responsive
- ✅ CRUD completo con validaciones
- ✅ Seguridad a nivel middleware
- ✅ Protecciones contra errores críticos
- ✅ Búsqueda y paginación
- ✅ Estadísticas en tiempo real
- ✅ Componentes reutilizables
- ✅ Build exitoso y listo para usar

**¡Todo funcionando y listo para producción!** 🚀

---

**Última actualización:** Noviembre 9, 2025  
**Stack:** Laravel 12 + React 19 + Inertia.js + Radix UI  
**Autor:** Cursor AI Assistant

