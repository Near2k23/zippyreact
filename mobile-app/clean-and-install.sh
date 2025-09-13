#!/bin/bash

echo "🧹 Limpiando dependencias de Firebase..."

# Limpiar cache de npm
npm cache clean --force

# Limpiar cache de yarn
yarn cache clean

# Eliminar node_modules
rm -rf node_modules

# Eliminar package-lock.json si existe
rm -f package-lock.json

# Eliminar yarn.lock si existe
rm -f yarn.lock

# Limpiar cache de Metro
npx react-native start --reset-cache

# Limpiar cache de Expo
npx expo start --clear

echo "📦 Reinstalando dependencias..."

# Reinstalar dependencias
yarn install

echo "✅ Limpieza completada. Las dependencias han sido reinstaladas."
echo "🚀 Ahora puedes ejecutar tu aplicación nuevamente."
