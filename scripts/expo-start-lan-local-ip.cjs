/**
 * Expo en --lan a veces elige la IP pública; muchos routers no permiten
 * "hairpin" o bloquean ese tráfico. Forzamos una IPv4 de red local y
 * REACT_NATIVE_PACKAGER_HOSTNAME para que el QR y Metro usen 192.168.x / 10.x.
 *
 * Override manual: REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.50 yarn app:driver-lan
 */
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

function isPrivateIPv4(addr) {
  if (!addr || addr.startsWith('127.') || addr.startsWith('169.254')) return false;
  if (addr.startsWith('10.')) return true;
  if (addr.startsWith('192.168.')) return true;
  const m = /^172\.(\d+)\./.exec(addr);
  if (m) {
    const n = parseInt(m[1], 10);
    return n >= 16 && n <= 31;
  }
  return false;
}

function scorePrivate(addr) {
  if (addr.startsWith('192.168.')) return 300;
  if (addr.startsWith('10.')) return 200;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(addr)) return 100;
  return 0;
}

function pickLanIPv4() {
  const existing = process.env.REACT_NATIVE_PACKAGER_HOSTNAME;
  if (existing && String(existing).trim()) {
    return String(existing).trim();
  }
  const candidates = [];
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    const list = nets[name];
    if (!list) continue;
    for (const net of list) {
      const family = net.family;
      if (family !== 'IPv4' && family !== 4) continue;
      if (net.internal) continue;
      const addr = net.address;
      if (!isPrivateIPv4(addr)) continue;
      candidates.push({ name, addr });
    }
  }
  candidates.sort((a, b) => scorePrivate(b.addr) - scorePrivate(a.addr));
  return candidates[0]?.addr || null;
}

const host = pickLanIPv4();
if (!host) {
  console.error(
    '[expo-lan] No se encontró una IPv4 privada. Indica la IP de tu PC en la WiFi, por ejemplo:\n' +
      '  set REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.10\n' +
      '  yarn app:driver-lan'
  );
  process.exit(1);
}

process.env.REACT_NATIVE_PACKAGER_HOSTNAME = host;
console.log(`[expo-lan] Metro y el dev client usarán la IP local: ${host}\n`);

const mobileAppDir = path.join(__dirname, '..', 'mobile-app');
const expoCli = path.join(__dirname, '..', 'node_modules', 'expo', 'bin', 'cli');

const child = spawn(process.execPath, [expoCli, 'start', '--dev-client', '--lan'], {
  cwd: mobileAppDir,
  env: process.env,
  stdio: 'inherit'
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
