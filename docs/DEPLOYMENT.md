# Guía de Despliegue - Spending Log

## Pasos para aplicar cambios con `git pull`

Ejecuta estos comandos en orden cada vez que hagas `git pull`:

### 1. Obtener los últimos cambios
```bash
git pull
```

### 2. Actualizar dependencias de PHP
```bash
composer install --optimize-autoloader --no-dev
```
> **Nota:** Usa `--no-dev` en producción. En desarrollo, omite esta bandera.

### 3. Actualizar dependencias de Node.js
```bash
npm install
```

### 4. Construir assets de Vite
```bash
npm run build
```

### 5. Ejecutar migraciones de base de datos
```bash
php artisan migrate --force
```
> **Nota:** `--force` es necesario en producción para evitar la confirmación interactiva.

### 6. Limpiar y optimizar caché de Laravel
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### 7. Optimizar para producción
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### 8. **IMPORTANTE: Corregir permisos (esto resuelve tu problema)**
```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
sudo find storage -type f -exec chmod 664 {} \;
sudo find bootstrap/cache -type f -exec chmod 664 {} \;
```

### 9. Reiniciar servicios (opcional pero recomendado)
```bash
# Si usas PHP-FPM
sudo systemctl restart php8.2-fpm

# Si usas queue workers
php artisan queue:restart
```

---

## Script Automatizado

Para facilitar el proceso, puedes crear un script que ejecute todos estos pasos:

```bash
#!/bin/bash

echo "🚀 Iniciando despliegue..."

# 1. Git pull
echo "📥 Obteniendo cambios..."
git pull

# 2. Composer
echo "📦 Instalando dependencias PHP..."
composer install --optimize-autoloader --no-dev

# 3. NPM
echo "📦 Instalando dependencias Node..."
npm install

# 4. Build
echo "🏗️ Construyendo assets..."
npm run build

# 5. Migraciones
echo "🗄️ Ejecutando migraciones..."
php artisan migrate --force

# 6. Limpiar caché
echo "🧹 Limpiando caché..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# 7. Optimizar
echo "⚡ Optimizando aplicación..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# 8. Permisos (LA CLAVE PARA EVITAR ERRORES)
echo "🔐 Corrigiendo permisos..."
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
sudo find storage -type f -exec chmod 664 {} \;
sudo find bootstrap/cache -type f -exec chmod 664 {} \;

# 9. Reiniciar servicios
echo "🔄 Reiniciando servicios..."
sudo systemctl restart php8.2-fpm
php artisan queue:restart 2>/dev/null || true

echo "✅ Despliegue completado!"
```

### Cómo usar el script:

1. Guarda el script como `deploy.sh` en la raíz del proyecto
2. Dale permisos de ejecución:
   ```bash
   chmod +x deploy.sh
   ```
3. Ejecútalo:
   ```bash
   ./deploy.sh
   ```

---

## Notas Importantes

### ⚠️ Por qué ocurren los errores de permisos:

1. **Git crea archivos con tu usuario** (j24tech), no con el usuario del servidor web (www-data)
2. **Composer y npm también** crean archivos con tu usuario
3. **Laravel necesita escribir** en `storage/` y `bootstrap/cache/` con el usuario www-data
4. **Resultado:** Conflicto de permisos → Errores 500

### ✅ La solución:

Siempre ejecutar el **paso 8** después de `git pull`, `composer` o `npm`.

### 💡 Alternativa: Configurar Git para preservar permisos

Edita `.git/config` y añade:
```ini
[core]
    fileMode = false
    sharedRepository = group
```

Luego ejecuta:
```bash
sudo chgrp -R www-data .
sudo chmod -R g+w storage bootstrap/cache
```

---

## Comandos de Emergencia

Si algo sale mal y la aplicación no funciona:

```bash
# Resetear todo el caché
php artisan optimize:clear

# Recrear archivos de caché
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Corregir todos los permisos
sudo chown -R www-data:www-data storage bootstrap/cache public/build
sudo chmod -R 775 storage bootstrap/cache
sudo chmod -R 755 public/build
```

---

## Verificar que todo funciona

```bash
# Ver logs en tiempo real
tail -f storage/logs/laravel.log

# Verificar permisos
ls -la storage/
ls -la bootstrap/cache/

# Probar la aplicación
curl -I http://localhost
```
