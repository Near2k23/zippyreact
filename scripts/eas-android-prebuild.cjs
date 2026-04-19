/**
 * En EAS (monorepo), a veces la fase que configura expo-updates en Android corre
 * antes de que exista mobile-app/android. Generamos el proyecto nativo aquí,
 * al final de yarn install en la raíz, solo en workers Android de EAS.
 */
const { execSync } = require('child_process');
const path = require('path');

if (process.env.EAS_BUILD !== 'true') {
  process.exit(0);
}

const platform = process.env.EAS_BUILD_PLATFORM;
if (platform && platform !== 'android') {
  process.exit(0);
}

const mobileAppDir = path.join(__dirname, '..', 'mobile-app');

console.log('[eas-android-prebuild] EAS Android: generando mobile-app/android antes de pasos nativos…');

try {
  execSync('npx expo prebuild --platform android --no-install --clean', {
    cwd: mobileAppDir,
    stdio: 'inherit',
    env: process.env
  });
} catch (e) {
  console.error('[eas-android-prebuild] expo prebuild falló:', e?.message || e);
  process.exit(1);
}
