#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const fetch = require('node-fetch');
const open = require('open');
const CryptoJS = require('crypto-js');
const client = require('firebase-tools');
const { exec } = require('child_process');

const cmd = process.argv[2];
const workDir = process.cwd();

function logStep(message) {
  console.log(`[waygo] ${message}`);
}

async function readJson(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

async function writeText(filePath, content) {
  await fs.outputFile(filePath, content, 'utf8');
  logStep(`${path.relative(workDir, filePath)} actualizado`);
}

async function writeFirebaseWebConfigs(sdkConfig) {
  const mobilePath = path.join(workDir, 'mobile-app/config/FirebaseConfig.js');
  const webPath = path.join(workDir, 'web-app/src/config/FirebaseConfig.js');
  const jsonPretty = JSON.stringify(sdkConfig, null, 2);
  await writeText(mobilePath, `module.exports.FirebaseConfig = ${jsonPretty};\n`);
  await writeText(webPath, `export const FirebaseConfig = ${jsonPretty};\n`);
}

async function writeAndroidClientIdsFromFileContent(fileContents) {
  try {
    const parsed = JSON.parse(fileContents);
    const oauthClients = parsed.client?.[0]?.oauth_client || [];
    const otherPlatform = parsed.client?.[0]?.services?.appinvite_service?.other_platform_oauth_client || [];
    let androidClientId = '';
    let iosClientId = '';
    let webClientId = '';
    for (const item of oauthClients) {
      if (item.client_type === 1) {
        androidClientId = item.client_id;
        break;
      }
    }
    for (const item of otherPlatform) {
      if (item.client_type === 2) iosClientId = item.client_id;
      if (item.client_type === 3) webClientId = item.client_id;
    }
    const mobileOut = path.join(workDir, 'mobile-app/config/ClientIds.js');
    const webOut = path.join(workDir, 'web-app/src/config/ClientIds.js');
    await writeText(mobileOut, `module.exports.ClientIds = {\n  iosClientId: "${iosClientId}",\n  androidClientId: "${androidClientId}",\n  webClientId: "${webClientId}"\n}\n`);
    await writeText(webOut, `export const webClientId = '${webClientId}'\n`);
  } catch (e) {
    console.error('\u001b[31m', 'No se pudieron generar ClientIds desde google-services.json:', e?.message || e);
  }
}

async function ensureFirebaseApp(platform, projectId, appIdentifier) {
  const list = await client.apps.list(platform, { project: projectId });
  let match = null;
  if (Array.isArray(list)) {
    match = list.find(a => (
      a.displayName === `${projectId}-${platform}` ||
      a.packageName === appIdentifier ||
      a.bundleId === appIdentifier
    ));
  }
  if (match) return match;
  const createOpts = { project: projectId };
  if (platform === 'android') createOpts.packageName = appIdentifier;
  if (platform === 'ios') {
    createOpts.bundleId = appIdentifier;
    createOpts.appStoreId = null;
  }
  const created = await client.apps.create(platform, `${projectId}-${platform}`, createOpts);
  return created;
}

async function writeSdkConfig(platform, projectId, appId) {
  if (platform === 'web') {
    const res = await client.apps.sdkconfig(platform, appId, { project: projectId });
    await writeFirebaseWebConfigs(res.sdkConfig);
  } else {
    const res = await client.apps.sdkconfig(platform, appId, { project: projectId });
    const outPath = path.join(workDir, 'mobile-app', res.fileName);
    await writeText(outPath, res.fileContents);
    if (platform === 'android') {
      await writeAndroidClientIdsFromFileContent(res.fileContents);
    }
  }
}

async function testGeocodingApi(serverKey) {
  logStep('Probando Google Geocoding API...');
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=37.419857,-122.078827&key=${serverKey}`;
  const resp = await fetch(url);
  const data = await resp.json();
  if (!(data?.results?.[0]?.formatted_address)) {
    throw new Error('Geocoding API no respondió como se esperaba. Verifica facturación y APIs habilitadas.');
  }
  logStep('Geocoding OK');
}

async function install() {
  const appcat = require('../functions/appcat');
  const config = await readJson(path.join(workDir, 'functions/config.json'));

  // AccessKey (encriptado localmente, sin llamadas de licencia)
  const accessKeyCipher = CryptoJS.AES.encrypt(config.encryptionKey || '', config.encryptionKey).toString();
  await writeText(path.join(workDir, 'common/src/other/AccessKey.js'), `export default "${accessKeyCipher}";\n`);

  // .firebaserc
  await writeText(path.join(workDir, '.firebaserc'), JSON.stringify({ projects: { default: config.firebaseProjectId } }, null, 2));

  // Verificación de proyectos Firebase
  logStep('Listando proyectos de Firebase...');
  let projects;
  try {
    projects = await client.projects.list();
  } catch (e) {
    console.error('\u001b[31m', 'No se pudo listar proyectos. Ejecuta: firebase login', e?.message || e);
    process.exit(1);
  }
  if (!Array.isArray(projects) || !projects.some(p => p.projectId === config.firebaseProjectId)) {
    console.error('\u001b[31m', 'Proyecto Firebase no encontrado o mal configurado en functions/config.json');
    process.exit(1);
  }
  logStep(`Proyecto encontrado: ${config.firebaseProjectId}`);

  // Apps: web, ios, android
  for (const platform of ['web', 'ios', 'android']) {
    logStep(`Asegurando app de Firebase: ${platform}`);
    const app = await ensureFirebaseApp(platform, config.firebaseProjectId, config.app_identifier);
    await writeSdkConfig(platform, config.firebaseProjectId, app.appId);
  }

  // AppConfig y Google Maps keys
  const appConfigJs = `module.exports.AppConfig = {\n  app_name: '${config.app_name}',\n  app_description: '${config.app_description}',\n  app_identifier: '${config.app_identifier}',\n  ios_app_version: '${config.ios_app_version}',\n  android_app_version: ${config.android_app_version},\n  expo_owner: '${config.expo_owner}',\n  expo_slug: '${config.expo_slug}',\n  expo_project_id: '${config.expo_project_id}'\n}\n`;
  await writeText(path.join(workDir, 'mobile-app/config/AppConfig.js'), appConfigJs);
  await writeText(path.join(workDir, 'mobile-app/config/GoogleMapApiConfig.js'), `module.exports.GoogleMapApiConfig = {\n  ios: "${config.googleApiKeys.ios}",\n  android: "${config.googleApiKeys.android}"\n};\n`);
  await writeText(path.join(workDir, 'web-app/src/config/GoogleMapApiConfig.js'), `export const GoogleMapApiConfig = '${config.googleApiKeys.web}';\n`);

  // Test Geocoding API (servidor)
  await testGeocodingApi(config.googleApiKeys.server);
}

async function initializeDb() {
  const appcat = require('../functions/appcat');
  const config = await readJson(path.join(workDir, 'functions/config.json'));
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})$/;

  exec('firebase database:get /settings', async (err, stdout, stderr) => {
    if (err) {
      console.error('error:', err.message);
      return;
    }
    if (stderr) {
      console.error('stderr:', stderr);
      return;
    }
    const out = (stdout || '').replace(/\r?\n|\r/g, '');
    if (out === 'null') {
      if (!(config.admin_email && re.test(config.admin_email))) {
        console.error('\u001b[31m', 'Error: Admin email inválido. Revisa functions/config.json');
        process.exit(1);
      }
      const sample = await readJson(path.join(workDir, 'json', `${appcat}-sample-db.json`));
      const lang = await readJson(path.join(workDir, 'json', 'language-en.json'));
      if (sample?.languages?.lang1) {
        sample.languages.lang1.keyValuePairs = lang;
      }
      sample.users = {
        admin0001: {
          firstName: 'Admin',
          lastName: 'Admin',
          email: config.admin_email,
          usertype: 'admin',
          approved: true,
        },
      };
      await client.database.set('/', { data: JSON.stringify(sample), force: true });
      logStep('Usuario Admin y base de datos creados.');
      await open(`https://${config.firebaseProjectId}.web.app`);
    } else {
      console.log('\u001b[33m', 'La base de datos no está vacía. No se crearán datos.');
    }
  });
}

(async () => {
  try {
    if (cmd === 'install') {
      await install();
    } else if (cmd === 'initialize') {
      await initializeDb();
    } else {
      console.log('Uso: node script/install.js [install|initialize]');
      process.exit(1);
    }
  } catch (e) {
    console.error('\u001b[31m', e?.message || e);
    process.exit(1);
  }
})();


