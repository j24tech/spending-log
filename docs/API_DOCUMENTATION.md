# 🔌 API REST - Spending Log

Documentación completa de la API REST para gestión de gastos.

## 📋 Tabla de Contenidos

- [Autenticación](#autenticación)
- [Endpoints Disponibles](#endpoints-disponibles)
- [Modelos de Datos](#modelos-de-datos)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Códigos de Error](#códigos-de-error)

---

## 🔐 Autenticación

La API utiliza **Laravel Sanctum** para autenticación basada en tokens.

### Obtener un Token de API

**Opción 1: Desde la interfaz web (próximamente)**
```
Settings → API Tokens → Crear nuevo token
```

**Opción 2: Desde Tinker (desarrollo)**
```bash
php artisan tinker
```

```php
$user = User::where('email', 'tu-email@ejemplo.com')->first();
$token = $user->createToken('api-token')->plainTextToken;
echo $token;
```

### Usar el Token

Incluye el token en el header `Authorization` de todas las peticiones:

```bash
Authorization: Bearer {tu-token}
```

---

## 📍 Base URL

```
http://localhost:8000/api
```

En producción:
```
https://tu-dominio.com/api
```

---

## 🛣️ Endpoints Disponibles

### 1. Listar Gastos

**GET** `/api/expenses`

Obtiene una lista paginada de todos los gastos.

**Parámetros de Query:**
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `per_page` | integer | Items por página (default: 15) | `?per_page=20` |
| `page` | integer | Número de página | `?page=2` |

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Compra Supermercado",
      "expense_date": "2025-11-09",
      "document_number": "DOC-001",
      "document_path": "expense-documents/abc123.jpg",
      "discount": "10.00",
      "observation": "Compra mensual",
      "payment_method_id": 1,
      "created_at": "2025-11-09T10:00:00.000000Z",
      "updated_at": "2025-11-09T10:00:00.000000Z",
      "payment_method": {
        "id": 1,
        "name": "Tarjeta de Crédito"
      },
      "expense_details": [
        {
          "id": 1,
          "name": "Frutas",
          "amount": "25.50",
          "quantity": 2,
          "category_id": 1,
          "category": {
            "id": 1,
            "name": "Alimentación"
          }
        }
      ]
    }
  ],
  "current_page": 1,
  "last_page": 5,
  "per_page": 15,
  "total": 75,
  "from": 1,
  "to": 15
}
```

**Ejemplo:**
```bash
curl -X GET "http://localhost:8000/api/expenses?per_page=10" \
  -H "Authorization: Bearer tu-token" \
  -H "Accept: application/json"
```

---

### 2. Ver Gasto Individual

**GET** `/api/expenses/{id}`

Obtiene los detalles de un gasto específico.

**Parámetros de URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | integer | ID del gasto |

**Respuesta exitosa (200):**
```json
{
  "data": {
    "id": 1,
    "name": "Compra Supermercado",
    "expense_date": "2025-11-09",
    "document_number": "DOC-001",
    "document_path": "expense-documents/abc123.jpg",
    "discount": "10.00",
    "observation": "Compra mensual",
    "payment_method_id": 1,
    "payment_method": {
      "id": 1,
      "name": "Tarjeta de Crédito"
    },
    "expense_details": [
      {
        "id": 1,
        "name": "Frutas",
        "amount": "25.50",
        "quantity": 2,
        "category": {
          "id": 1,
          "name": "Alimentación"
        }
      }
    ]
  }
}
```

**Respuesta error (404):**
```json
{
  "message": "No query results for model [App\\Models\\Expense] {id}"
}
```

**Ejemplo:**
```bash
curl -X GET "http://localhost:8000/api/expenses/1" \
  -H "Authorization: Bearer tu-token" \
  -H "Accept: application/json"
```

---

### 3. Actualizar Documento del Gasto ⭐

**POST** `/api/expenses/{id}/document`

Actualiza **únicamente** el número de documento y/o la imagen del documento.

**⚠️ IMPORTANTE:** Solo se pueden modificar estos campos:
- `document_number` - Número de documento
- `document` - Archivo de imagen/PDF

**Parámetros de URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | integer | ID del gasto |

**Body (multipart/form-data):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `document_number` | string | No | Número de documento (max 50 chars) |
| `document` | file | No | Archivo JPG, JPEG, PNG o PDF (max 2MB) |
| `delete_document` | boolean | No | `true` para eliminar documento actual |

**Respuesta exitosa (200):**
```json
{
  "message": "Gasto actualizado exitosamente",
  "data": {
    "id": 1,
    "name": "Compra Supermercado",
    "document_number": "DOC-002",
    "document_path": "expense-documents/nuevo-documento.jpg",
    "payment_method": { ... },
    "expense_details": [ ... ]
  }
}
```

**Respuesta error validación (422):**
```json
{
  "message": "The document must be a file of type: jpg, jpeg, png, pdf.",
  "errors": {
    "document": [
      "El documento debe ser un archivo de tipo: jpg, jpeg, png, pdf."
    ]
  }
}
```

**Ejemplos:**

**Solo actualizar número de documento:**
```bash
curl -X POST "http://localhost:8000/api/expenses/1/document" \
  -H "Authorization: Bearer tu-token" \
  -H "Accept: application/json" \
  -F "document_number=FACTURA-2025-001"
```

**Solo actualizar imagen:**
```bash
curl -X POST "http://localhost:8000/api/expenses/1/document" \
  -H "Authorization: Bearer tu-token" \
  -H "Accept: application/json" \
  -F "document=@/ruta/a/factura.pdf"
```

**Actualizar ambos:**
```bash
curl -X POST "http://localhost:8000/api/expenses/1/document" \
  -H "Authorization: Bearer tu-token" \
  -H "Accept: application/json" \
  -F "document_number=FACTURA-2025-001" \
  -F "document=@/ruta/a/factura.pdf"
```

**Eliminar imagen:**
```bash
curl -X POST "http://localhost:8000/api/expenses/1/document" \
  -H "Authorization: Bearer tu-token" \
  -H "Accept: application/json" \
  -F "delete_document=true"
```

---

### 4. Estadísticas de Gastos

**GET** `/api/expenses/statistics`

Obtiene estadísticas generales de gastos.

**Respuesta exitosa (200):**
```json
{
  "total_expenses": 150,
  "total_amount": "15250.75",
  "this_month_expenses": 12
}
```

**Ejemplo:**
```bash
curl -X GET "http://localhost:8000/api/expenses/statistics" \
  -H "Authorization: Bearer tu-token" \
  -H "Accept: application/json"
```

---

## 📊 Modelos de Datos

### Expense (Gasto)

```json
{
  "id": 1,
  "name": "Nombre del gasto",
  "expense_date": "2025-11-09",
  "document_number": "DOC-001",
  "document_path": "expense-documents/archivo.jpg",
  "discount": "10.00",
  "observation": "Observaciones",
  "payment_method_id": 1,
  "created_at": "2025-11-09T10:00:00.000000Z",
  "updated_at": "2025-11-09T10:00:00.000000Z",
  "payment_method": { ... },
  "expense_details": [ ... ]
}
```

### Payment Method (Método de Pago)

```json
{
  "id": 1,
  "name": "Tarjeta de Crédito",
  "observation": null,
  "tags": ["personal", "visa"]
}
```

### Expense Detail (Detalle del Gasto)

```json
{
  "id": 1,
  "expense_id": 1,
  "name": "Producto o servicio",
  "amount": "25.50",
  "quantity": 2,
  "observation": "Detalles adicionales",
  "category_id": 1,
  "category": {
    "id": 1,
    "name": "Alimentación",
    "observation": null,
    "tags": ["comida"]
  }
}
```

### Category (Categoría)

```json
{
  "id": 1,
  "name": "Alimentación",
  "observation": "Gastos de comida",
  "tags": ["comida", "supermercado"]
}
```

---

## 💻 Ejemplos de Uso

### JavaScript/TypeScript (Fetch API)

```typescript
const API_URL = 'http://localhost:8000/api';
const API_TOKEN = 'tu-token-aqui';

// Listar gastos
async function getExpenses(page = 1, perPage = 15) {
  const response = await fetch(
    `${API_URL}/expenses?page=${page}&per_page=${perPage}`,
    {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Accept': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Error al obtener gastos');
  }
  
  return await response.json();
}

// Ver gasto específico
async function getExpense(id: number) {
  const response = await fetch(`${API_URL}/expenses/${id}`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Error al obtener gasto ${id}`);
  }
  
  return await response.json();
}

// Actualizar documento
async function updateExpenseDocument(
  id: number,
  documentNumber?: string,
  documentFile?: File
) {
  const formData = new FormData();
  
  if (documentNumber) {
    formData.append('document_number', documentNumber);
  }
  
  if (documentFile) {
    formData.append('document', documentFile);
  }
  
  const response = await fetch(`${API_URL}/expenses/${id}/document`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Accept': 'application/json',
    },
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Obtener estadísticas
async function getStatistics() {
  const response = await fetch(`${API_URL}/expenses/statistics`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Accept': 'application/json',
    },
  });
  
  return await response.json();
}
```

### Python

```python
import requests

API_URL = "http://localhost:8000/api"
API_TOKEN = "tu-token-aqui"

headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Accept": "application/json"
}

# Listar gastos
def get_expenses(page=1, per_page=15):
    response = requests.get(
        f"{API_URL}/expenses",
        params={"page": page, "per_page": per_page},
        headers=headers
    )
    response.raise_for_status()
    return response.json()

# Ver gasto
def get_expense(expense_id):
    response = requests.get(
        f"{API_URL}/expenses/{expense_id}",
        headers=headers
    )
    response.raise_for_status()
    return response.json()

# Actualizar documento
def update_expense_document(expense_id, document_number=None, document_file=None):
    data = {}
    files = {}
    
    if document_number:
        data['document_number'] = document_number
    
    if document_file:
        files['document'] = open(document_file, 'rb')
    
    response = requests.post(
        f"{API_URL}/expenses/{expense_id}/document",
        data=data,
        files=files,
        headers=headers
    )
    response.raise_for_status()
    return response.json()

# Estadísticas
def get_statistics():
    response = requests.get(
        f"{API_URL}/expenses/statistics",
        headers=headers
    )
    response.raise_for_status()
    return response.json()
```

### PHP (Guzzle)

```php
use GuzzleHttp\Client;

$client = new Client([
    'base_uri' => 'http://localhost:8000/api/',
    'headers' => [
        'Authorization' => 'Bearer ' . $apiToken,
        'Accept' => 'application/json',
    ]
]);

// Listar gastos
$response = $client->get('expenses', [
    'query' => ['per_page' => 20, 'page' => 1]
]);
$expenses = json_decode($response->getBody(), true);

// Ver gasto
$response = $client->get('expenses/1');
$expense = json_decode($response->getBody(), true);

// Actualizar documento
$response = $client->post('expenses/1/document', [
    'multipart' => [
        [
            'name' => 'document_number',
            'contents' => 'FACTURA-2025-001'
        ],
        [
            'name' => 'document',
            'contents' => fopen('/ruta/factura.pdf', 'r'),
            'filename' => 'factura.pdf'
        ]
    ]
]);
$result = json_decode($response->getBody(), true);
```

---

## ⚡ Ejemplos de Uso Común

### Caso 1: Actualizar solo el número de documento

```bash
curl -X POST "http://localhost:8000/api/expenses/5/document" \
  -H "Authorization: Bearer 1|abc123def456..." \
  -H "Accept: application/json" \
  -F "document_number=FACTURA-NOV-2025-015"
```

**Respuesta:**
```json
{
  "message": "Gasto actualizado exitosamente",
  "data": {
    "id": 5,
    "document_number": "FACTURA-NOV-2025-015",
    ...
  }
}
```

### Caso 2: Subir nueva imagen de factura

```bash
curl -X POST "http://localhost:8000/api/expenses/5/document" \
  -H "Authorization: Bearer 1|abc123def456..." \
  -H "Accept: application/json" \
  -F "document=@./factura.jpg"
```

**Respuesta:**
```json
{
  "message": "Gasto actualizado exitosamente",
  "data": {
    "id": 5,
    "document_path": "expense-documents/GqN8K4mF3nP9xR2tY6vZ.jpg",
    ...
  }
}
```

### Caso 3: Actualizar ambos campos

```bash
curl -X POST "http://localhost:8000/api/expenses/5/document" \
  -H "Authorization: Bearer 1|abc123def456..." \
  -H "Accept: application/json" \
  -F "document_number=FACTURA-NOV-2025-015" \
  -F "document=@./factura.pdf"
```

### Caso 4: Eliminar imagen del documento

```bash
curl -X POST "http://localhost:8000/api/expenses/5/document" \
  -H "Authorization: Bearer 1|abc123def456..." \
  -H "Accept: application/json" \
  -F "delete_document=true"
```

**Respuesta:**
```json
{
  "message": "Gasto actualizado exitosamente",
  "data": {
    "id": 5,
    "document_path": null,
    ...
  }
}
```

---

## 🚫 Limitaciones de la API

### ✅ Lo que SÍ puedes hacer:

- ✅ Listar todos los gastos
- ✅ Ver detalles de un gasto específico
- ✅ Actualizar número de documento
- ✅ Subir/actualizar imagen del documento
- ✅ Eliminar imagen del documento
- ✅ Obtener estadísticas

### ❌ Lo que NO puedes hacer:

- ❌ Crear nuevos gastos (usar interfaz web)
- ❌ Eliminar gastos (usar interfaz web)
- ❌ Modificar nombre, fecha, descuento, etc. (usar interfaz web)
- ❌ Modificar detalles del gasto (usar interfaz web)
- ❌ Modificar método de pago (usar interfaz web)

**Razón:** La API está limitada intencionalmente a operaciones de documentación para mantener la integridad de los datos. Operaciones complejas deben hacerse desde la interfaz web.

---

## 🔒 Seguridad

### Autenticación Requerida

Todos los endpoints requieren un token válido de Sanctum.

**Sin token:**
```json
{
  "message": "Unauthenticated."
}
```

### Validaciones Implementadas

#### Número de Documento:
- Máximo 50 caracteres
- Puede ser null

#### Documento (Archivo):
- Solo formatos: JPG, JPEG, PNG, PDF
- Tamaño máximo: 2MB
- Se elimina el archivo anterior al subir uno nuevo

### Rate Limiting

La API usa el rate limiting por defecto de Laravel:
- **60 peticiones por minuto** por usuario autenticado

Si excedes el límite:
```json
{
  "message": "Too Many Attempts."
}
```

---

## 📝 Códigos de Respuesta HTTP

| Código | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| 200 | OK | Petición exitosa |
| 401 | Unauthorized | Token inválido o ausente |
| 404 | Not Found | Gasto no encontrado |
| 422 | Unprocessable Entity | Errores de validación |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |

---

## 🧪 Testing

### Postman Collection

Puedes importar esta colección en Postman:

```json
{
  "info": {
    "name": "Spending Log API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{api_token}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "List Expenses",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/expenses?per_page=10"
      }
    },
    {
      "name": "Get Expense",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/expenses/1"
      }
    },
    {
      "name": "Update Document",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/expenses/1/document",
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "document_number",
              "value": "DOC-001",
              "type": "text"
            },
            {
              "key": "document",
              "type": "file",
              "src": "/path/to/file.pdf"
            }
          ]
        }
      }
    },
    {
      "name": "Statistics",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/expenses/statistics"
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000"
    },
    {
      "key": "api_token",
      "value": "your-token-here"
    }
  ]
}
```

---

## 🎯 Mejores Prácticas

### 1. Siempre incluir header `Accept`

```bash
-H "Accept: application/json"
```

Esto asegura que Laravel devuelva respuestas JSON en lugar de HTML.

### 2. Manejo de Errores

```javascript
try {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    console.error('Error:', error.message);
    
    if (error.errors) {
      // Errores de validación
      console.error('Detalles:', error.errors);
    }
  }
  
  return await response.json();
} catch (err) {
  console.error('Error de red:', err);
}
```

### 3. Reutilizar el Token

Guarda el token de forma segura:
- ✅ Variables de entorno
- ✅ Almacenamiento seguro
- ❌ NO en el código fuente
- ❌ NO en repositorios git

### 4. Paginación

Para obtener todos los gastos en páginas grandes:

```javascript
async function getAllExpenses() {
  let allExpenses = [];
  let currentPage = 1;
  let lastPage = 1;
  
  do {
    const response = await getExpenses(currentPage);
    allExpenses = allExpenses.concat(response.data);
    lastPage = response.last_page;
    currentPage++;
  } while (currentPage <= lastPage);
  
  return allExpenses;
}
```

---

## 🔧 Configuración

### Generar Token de API (Desarrollo)

```bash
php artisan tinker
```

```php
// Para tu usuario
$user = User::where('email', 'tu-email@gmail.com')->first();
$token = $user->createToken('mobile-app')->plainTextToken;
echo "Token: " . $token . "\n";

// Guardar el token - lo necesitarás para las peticiones
```

### Revocar Token

```php
// Revocar token específico
$user->tokens()->where('name', 'mobile-app')->delete();

// Revocar todos los tokens
$user->tokens()->delete();
```

---

## 📞 Soporte

Si tienes problemas con la API:

1. **Verifica el token** - Asegúrate que sea válido
2. **Revisa los headers** - Authorization y Accept correctos
3. **Valida el formato** - multipart/form-data para archivos
4. **Consulta los logs** - `storage/logs/laravel.log`

---

## 🚀 Próximas Características

- [ ] Endpoint para crear gastos
- [ ] Endpoint para eliminar gastos
- [ ] Filtros avanzados (por fecha, categoría, método de pago)
- [ ] Búsqueda por texto
- [ ] Ordenamiento personalizado
- [ ] Webhooks para notificaciones
- [ ] Rate limiting personalizable

---

**Versión:** 1.0  
**Última actualización:** Noviembre 9, 2025  
**Protocolo:** REST  
**Autenticación:** Laravel Sanctum (Bearer Token)  
**Formato:** JSON

