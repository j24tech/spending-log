# ⚡ API REST - Inicio Rápido

## 🚀 Empezar en 3 Pasos

### 1️⃣ Ejecutar Migraciones de Sanctum

```bash
php artisan migrate
```

Esto crea la tabla `personal_access_tokens` para los tokens de API.

---

### 2️⃣ Generar Token de API

```bash
php artisan tinker
```

```php
$user = User::where('email', 'tu-email@gmail.com')->first();
$token = $user->createToken('my-app-token')->plainTextToken;
echo "Token: " . $token;
```

**Copia el token** que se muestra. Ejemplo:
```
1|abc123def456ghi789jkl012mno345pqr678
```

---

### 3️⃣ Hacer tu Primera Petición

```bash
curl -X GET "http://localhost:8000/api/expenses" \
  -H "Authorization: Bearer 1|abc123def456ghi789jkl012mno345pqr678" \
  -H "Accept: application/json"
```

---

## 📍 Endpoints Principales

### Listar Gastos
```bash
GET /api/expenses
```

### Ver Gasto
```bash
GET /api/expenses/{id}
```

### Actualizar Documento
```bash
POST /api/expenses/{id}/document
Body: document_number, document (file)
```

### Estadísticas
```bash
GET /api/expenses/statistics
```

---

## 💻 Ejemplos Rápidos

### JavaScript (Fetch)

```javascript
const API_URL = 'http://localhost:8000/api';
const TOKEN = 'tu-token-aqui';

// Obtener gastos
const response = await fetch(`${API_URL}/expenses`, {
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Accept': 'application/json'
  }
});

const expenses = await response.json();
console.log(expenses);
```

### Python

```python
import requests

url = "http://localhost:8000/api/expenses"
headers = {
    "Authorization": "Bearer tu-token-aqui",
    "Accept": "application/json"
}

response = requests.get(url, headers=headers)
expenses = response.json()
print(expenses)
```

---

## 🎯 Actualizar Documento de Gasto

### Solo Número de Documento

```bash
curl -X POST "http://localhost:8000/api/expenses/1/document" \
  -H "Authorization: Bearer tu-token" \
  -H "Accept: application/json" \
  -F "document_number=FACTURA-001"
```

### Solo Imagen

```bash
curl -X POST "http://localhost:8000/api/expenses/1/document" \
  -H "Authorization: Bearer tu-token" \
  -H "Accept: application/json" \
  -F "document=@/ruta/a/factura.jpg"
```

### Ambos

```bash
curl -X POST "http://localhost:8000/api/expenses/1/document" \
  -H "Authorization: Bearer tu-token" \
  -H "Accept: application/json" \
  -F "document_number=FACTURA-001" \
  -F "document=@/ruta/a/factura.pdf"
```

---

## 🔑 Gestión de Tokens

### Crear Token

```php
// Tinker
$user->createToken('nombre-del-token')->plainTextToken;
```

### Revocar Token

```php
// Revocar token específico
$user->tokens()->where('name', 'nombre-del-token')->delete();

// Revocar todos
$user->tokens()->delete();
```

### Ver Tokens Activos

```php
$user->tokens;
```

---

## 📚 Documentación Completa

Para más detalles, ejemplos y casos de uso:

👉 **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)**

Incluye:
- Todos los endpoints con ejemplos
- Modelos de datos
- Códigos de error
- Ejemplos en JavaScript, Python, PHP
- Postman collection
- Mejores prácticas

---

## 🆘 Problemas Comunes

### "Unauthenticated"
✅ Verifica que el header `Authorization` esté correcto  
✅ Formato: `Bearer {token}` (con espacio)

### "Too Many Attempts"
✅ Esperaste el rate limit (60 peticiones/minuto)

### "The document must be a file of type: jpg, jpeg, png, pdf"
✅ Solo se aceptan imágenes y PDFs  
✅ Máximo 2MB

---

**¡Listo para usar la API!** 🚀

