# Testing - Spending Log

Este proyecto utiliza diferentes herramientas de testing para asegurar la calidad del código.

## 🧪 Stack de Testing

### Backend (Laravel)
- **Pest PHP**: Framework de testing moderno y expresivo para PHP
- **PHPUnit**: Motor subyacente de Pest
- **Factories**: Para generar datos de prueba

### Frontend (React)
- **Vitest**: Framework de testing rápido y moderno
- **React Testing Library**: Herramientas para testing de componentes React
- **@testing-library/jest-dom**: Matchers personalizados de Jest DOM
- **@testing-library/user-event**: Simulación de eventos de usuario
- **happy-dom**: Ambiente de DOM ligero y rápido para tests

## 📋 Estructura de Tests

```
tests/
  Feature/                    # Tests de integración (Backend)
    ExpenseTest.php
    CategoryTest.php
    PaymentMethodTest.php
  Unit/                       # Tests unitarios (Backend)
  setup.ts                    # Configuración de tests frontend

resources/js/
  components/
    __tests__/                # Tests de componentes React
      flash-messages.test.tsx
      flash-messages-integration.test.tsx
  pages/
    expenses/
      components/
        __tests__/
          expense-form.test.tsx
          expenses-table.test.tsx
    categories/
      components/
        __tests__/
          categories-table.test.tsx
    payment-methods/
      components/
        __tests__/
          payment-methods-table.test.tsx
```

## 🚀 Comandos Disponibles

### Backend (Pest)

```bash
# Ejecutar todos los tests
composer test

# Ejecutar un archivo específico
./vendor/bin/pest tests/Feature/ExpenseTest.php

# Ejecutar tests con filtro
./vendor/bin/pest --filter=Expense

# Ejecutar con cobertura
composer test -- --coverage
```

### Frontend (Vitest)

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests en modo watch (se actualiza al cambiar archivos)
npm run test -- --watch

# Ejecutar tests con interfaz visual
npm run test:ui

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar un archivo específico
npm run test -- resources/js/components/__tests__/flash-messages.test.tsx

# Ejecutar tests de un directorio
npm run test -- resources/js/components/__tests__/
```

## 📝 Ejemplos de Tests

### Backend - Test de Expense

```php
test('puede crear un gasto con datos válidos', function () {
    $category = Category::factory()->create();
    $paymentMethod = PaymentMethod::factory()->create();
    
    $expenseData = [
        'name' => 'Gasto de prueba',
        'expense_date' => now()->format('Y-m-d'),
        'payment_method_id' => $paymentMethod->id,
        'discount' => 10.50,
        'observation' => 'Observación de prueba',
        'document_number' => 'DOC-12345',
        'details' => [
            [
                'name' => 'Detalle 1',
                'amount' => 100.00,
                'quantity' => 2,
                'category_id' => $category->id,
                'observation' => 'Observación del detalle',
            ],
        ],
    ];
    
    $response = $this->actingAs($this->user)->post('/expenses', $expenseData);
    
    $response->assertRedirect('/expenses');
    $response->assertSessionHas('success', 'Gasto creado exitosamente');
    
    $this->assertDatabaseHas('expenses', [
        'name' => 'Gasto de prueba',
        'payment_method_id' => $paymentMethod->id,
    ]);
});
```

### Frontend - Test de Componente Simple

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlashMessages } from '../flash-messages';

describe('FlashMessages', () => {
  it('renders correctly', () => {
    render(<FlashMessages />);
    // Verificar comportamiento
  });
});
```

### Frontend - Test con Mocks

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlashMessages } from '../flash-messages';
import * as usePage from '@inertiajs/react';

// Mock Inertia's usePage hook
vi.mock('@inertiajs/react', () => ({
  usePage: vi.fn(),
}));

describe('FlashMessages', () => {
  it('displays success message when provided', () => {
    vi.mocked(usePage.usePage).mockReturnValue({
      props: {
        flash: {
          success: 'Operación exitosa',
        },
      },
    } as any);

    render(<FlashMessages />);
    // Verificar que el toast se llama con los datos correctos
  });
});
```

## 🎯 Cobertura de Tests

### Módulos Cubiertos

#### Backend
- ✅ **Expenses**: CRUD completo, validaciones, documentos, detalles
- ⏳ **Categories**: Tests pendientes
- ⏳ **Payment Methods**: Tests pendientes

#### Frontend
- ✅ **FlashMessages**: Componente de mensajes flash
- ✅ **ExpensesTable**: Tabla de gastos con paginación y detalles
- ✅ **ExpenseForm**: Formulario de creación/edición con archivos
- ✅ **CategoriesTable**: Tabla de categorías
- ✅ **PaymentMethodsTable**: Tabla de métodos de pago

## 🔧 Configuración

### vite.config.ts

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './tests/setup.ts',
    include: ['resources/js/**/*.{test,spec}.{ts,tsx}'],
    css: true,
  },
});
```

### tests/setup.ts

```typescript
import '@testing-library/jest-dom/vitest';
```

### phpunit.xml

```xml
<testsuite name="Feature">
    <directory suffix="Test.php">./tests/Feature</directory>
</testsuite>
```

## 🎓 Mejores Prácticas

### Backend

1. **Usar Factories**: Generar datos de prueba con factories
2. **RefreshDatabase**: Limpiar la base de datos antes de cada test
3. **Acting As**: Simular autenticación con `actingAs()`
4. **AssertRedirect**: Verificar redirecciones
5. **AssertSessionHas**: Verificar mensajes flash

### Frontend

1. **Testea el Comportamiento**: Prioriza cómo funciona, no cómo está implementado
2. **Queries Accesibles**: Usa `getByRole`, `getByLabelText`, etc.
3. **Mock de Dependencias**: Mock Inertia, APIs, etc.
4. **Limpieza**: Limpia mocks en `afterEach`

## 🐛 Debugging

### Backend

```bash
# Ejecutar un test específico con debug
./vendor/bin/pest --filter=Expense --stop-on-failure

# Ver logs durante tests
./vendor/bin/pest --filter=Expense --no-coverage
```

### Frontend

```tsx
// Usar screen.debug() para ver el DOM
render(<Component />);
screen.debug();

// Usar logRoles() para ver roles accesibles
import { logRoles } from '@testing-library/react';
const { container } = render(<Component />);
logRoles(container);
```

## 📊 Coverage

```bash
# Ver cobertura completa
composer test -- --coverage
npm run test:coverage
```

## 🔄 CI/CD

Los tests se ejecutan automáticamente en CI/CD para garantizar que:
- El código cumple con los estándares de calidad
- No se rompe funcionalidad existente
- Las nuevas features funcionan correctamente
- Los mensajes flash se muestran apropiadamente
- Las validaciones funcionan en frontend y backend

## 📚 Recursos

- [Pest PHP](https://pestphp.com/)
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Playground](https://testing-playground.com/)

