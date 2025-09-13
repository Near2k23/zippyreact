#!/bin/bash

echo "🧹 Limpiando dependencias de Firebase Functions..."

# Navegar al directorio de funciones
cd functions

# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules
rm -rf node_modules

# Eliminar package-lock.json si existe
rm -f package-lock.json

echo "📦 Reinstalando dependencias..."

# Reinstalar dependencias
npm install

echo "✅ Limpieza completada. Las dependencias han sido reinstaladas."
echo "🚀 Ahora puedes desplegar tus funciones nuevamente."
