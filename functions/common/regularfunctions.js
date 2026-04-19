const fetch = require('node-fetch');
const CryptoJS = require('crypto-js');

/**
 * Valida la autenticación básica con encriptación AES
 * @param {string} authHeader - Header de autorización Basic Auth
 * @param {Object} config - Configuración con firebaseProjectId y encryptionKey
 * @returns {Promise<boolean>} True si la autenticación es válida
 */
async function validateBasicAuth(authHeader, config) {
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  try {
    // Decodificar Basic Auth
    const base64Credentials = authHeader.split(' ')[1] || '';
    const credentials = Buffer.from(base64Credentials, 'base64').toString();
    const colonIndex = credentials.indexOf(':');
    
    const username = credentials.substring(0, colonIndex);
    const receivedPassword = credentials.substring(colonIndex + 1);
    
    // El AccessKey ya viene encriptado desde el cliente
    // Intentar desencriptar para obtener la clave real
    let decryptedPassword;
    try {
      decryptedPassword = CryptoJS.AES.decrypt(
        receivedPassword,
        config.encryptionKey
      ).toString(CryptoJS.enc.Utf8);
    } catch (decryptError) {
      // Si falla la desencriptación, asumir que es la clave directa
      decryptedPassword = receivedPassword;
    }
    
    // Validar credenciales - verificar tanto la clave encriptada como desencriptada
    const isValidProject = username === config.firebaseProjectId;
    const isValidKey = decryptedPassword === config.encryptionKey || 
                      receivedPassword === config.encryptionKey;
    
    return isValidProject && isValidKey;
  } catch (error) {
    console.log('🔐 AUTH DEBUG - Error en validateBasicAuth:', error);
    return false;
  }
}

/**
 * Formatea el perfil de usuario con datos adicionales
 * @param {Object} request - Objeto de petición HTTP
 * @param {Object} config - Configuración del proyecto
 * @param {Object} userData - Datos del usuario
 * @param {Object} [options] - Opciones adicionales
 * @param {string} [options.appVariant] - 'driver' | 'rider' | undefined (legacy web)
 * @returns {Promise<Object>} Perfil formateado o error
 */
async function formatUserProfile(request, config, userData, options) {
  const isAuthorized = await validateBasicAuth(
    request.headers.authorization,
    config
  );

  if (!isAuthorized) {
    return { error: 'Unauthorized api call' };
  }

  // Generar ID de referido aleatorio
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const referralId = Array.from({ length: 5 }, () => 
    alphabet[Math.floor(Math.random() * alphabet.length)]
  ).join('');

  const appVariant = options && options.appVariant;
  let usertype = 'customer';
  if (appVariant === 'driver') {
    usertype = 'driver';
  } else if (appVariant && appVariant !== 'rider') {
    return { error: 'Invalid appVariant' };
  }

  // Crear perfil base
  const userProfile = {
    uid: userData.uid,
    createdAt: new Date().getTime(),
    firstName: userData.firstName,
    lastName: userData.lastName,
    mobile: userData.mobile,
    email: userData.email,
    usertype: usertype,
    referralId: referralId,
    approved: true,
    walletBalance: 0,
    verifyId: userData.verifyId,
  };

  // Agregar datos del país si existen
  if (userData.countryDetail) {
    const { country, country_code, currency_code, swipe_symbol, symbol } = userData.countryDetail;
    
    if (country) userProfile.country = country;
    if (country_code) userProfile.country_code = country_code;
    if (currency_code) userProfile.currency_code = currency_code;
    if (swipe_symbol) userProfile.swipe_symbol = swipe_symbol;
    if (symbol) userProfile.symbol = symbol;
  }

  // Agregar imagen de perfil si existe
  if (userData.profile_image) {
    userProfile.profile_image = userData.profile_image;
  }

  return userProfile;
}

/**
 * Realiza llamadas a las APIs de Google Maps
 * @param {Object} request - Objeto de petición HTTP
 * @param {Object} mapConfig - Configuración de mapas
 * @param {Object} config - Configuración general
 * @returns {Promise<Object>} Resultado de la API o error
 */
async function apiCallGoogle(request, mapConfig, config) {
  const isAuthorized = await validateBasicAuth(
    request.headers.authorization,
    config
  );

  if (!isAuthorized || !mapConfig) {
    return { error: 'Unauthorized API call' };
  }

  let apiUrl = '';
  let requestOptions = {};
  
  // Headers comunes
  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': config.googleApiKeys.server
  };

  const {
    searchKeyword,
    place_id,
    latlng,
    start,
    dest,
    calltype,
    waypoints,
    sessiontoken
  } = request.body;

  // Autocompletado de lugares
  if (searchKeyword) {
    apiUrl = 'https://places.googleapis.com/v1/places:autocomplete';
    headers['X-Goog-FieldMask'] = 'suggestions.placePrediction.text,suggestions.placePrediction.placeId';
    
    const requestBody = {
      input: searchKeyword,
      sessionToken: sessiontoken,
    };

    if (mapConfig.restrictCountry) {
      requestBody.includedRegionCodes = [mapConfig.restrictCountry];
    }
    if (mapConfig.mapLanguage) {
      requestBody.languageCode = mapConfig.mapLanguage;
    }

    requestOptions = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    };
  }

  // Detalles de lugar por ID
  if (place_id) {
    apiUrl = `https://places.googleapis.com/v1/places/${place_id}${
      mapConfig.mapLanguage ? `?languageCode=${mapConfig.mapLanguage}` : ''
    }`;
    headers['X-Goog-FieldMask'] = 'id,displayName,location';
    
    requestOptions = {
      method: 'GET',
      headers: headers,
    };
  }

  // Geocodificación inversa
  if (latlng) {
    apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=${config.googleApiKeys.server}`;
    requestOptions = { method: 'GET' };
  }

  // Cálculo de rutas
  if (start && dest && calltype === 'direction') {
    apiUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';
    headers['X-Goog-FieldMask'] = 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.travelAdvisory.tollInfo,routes.legs.travelAdvisory.tollInfo';
    
    const routeModifiers = {
      avoidTolls: false,
      avoidHighways: false,
      avoidFerries: false,
    };

    const [startLat, startLng] = start.split(',').map(parseFloat);
    const [destLat, destLng] = dest.split(',').map(parseFloat);

    const requestBody = {
      origin: {
        location: {
          latLng: {
            latitude: startLat,
            longitude: startLng,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destLat,
            longitude: destLng,
          },
        },
      },
      computeAlternativeRoutes: false,
      routeModifiers: routeModifiers,
      travelMode: 'DRIVE',
    };

    // Agregar puntos intermedios si existen
    if (waypoints) {
      requestBody.intermediates = waypoints.split('|').map(waypoint => {
        const [lat, lng] = waypoint.split(',').map(parseFloat);
        return {
          location: {
            latLng: {
              latitude: lat,
              longitude: lng,
            },
          },
        };
      });
    }

    requestOptions = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    };
  }

  // Matriz de distancias
  if (start && dest && calltype === 'matrix') {
    apiUrl = 'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix';
    headers['X-Goog-FieldMask'] = 'originIndex,destinationIndex,duration,distanceMeters,status,condition';
    
    const destinations = dest.split('|').map(destination => {
      const [lat, lng] = destination.split(',').map(Number);
      return {
        waypoint: {
          location: {
            latLng: {
              latitude: lat,
              longitude: lng,
            },
          },
        },
      };
    });

    const [startLat, startLng] = start.split(',').map(parseFloat);

    const requestBody = {
      origins: {
        waypoint: {
          location: {
            latLng: {
              latitude: startLat,
              longitude: startLng,
            },
          },
        },
      },
      destinations: destinations,
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
    };

    requestOptions = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    };
  }

  try {
    const response = await fetch(apiUrl, requestOptions);
    const result = await response.json();

    // Procesar respuestas según el tipo
    if (result.suggestions) {
      const searchResults = result.suggestions.map(suggestion => ({
        place_id: suggestion.placePrediction.placeId,
        description: suggestion.placePrediction.text.text,
      }));
      return { searchResults };
    }

    if (result.location) {
      return {
        coords: {
          lat: result.location.latitude,
          lng: result.location.longitude,
        },
      };
    }

    if (result.results && result.results.length > 0 && result.results[0].formatted_address && request.body.latlng) {
      return { address: result.results[0].formatted_address };
    }

    if (result.routes && result.routes.length > 0 && calltype === 'direction') {
      const route = result.routes[0];
      return {
        distance_in_km: route.distanceMeters / 1000,
        time_in_secs: parseInt(route.duration.split('s')[0]),
        polylinePoints: route.polyline.encodedPolyline,
      };
    }

    if (result && result.length > 0 && calltype === 'matrix') {
      return result.map(item => ({
        found: item.condition === 'ROUTE_EXISTS',
        distance_in_km: item.distanceMeters ? item.distanceMeters / 1000 : 0,
        time_in_secs: parseInt(item.duration.split('s')[0]) || 0,
        timein_text: `${Math.round((parseInt(item.duration.split('s')[0]) || 0) / 60)} mins`,
      }));
    }

    return { error: 'No results found' };
  } catch (error) {
    return { error: 'Google API call failed' };
  }
}

/**
 * Valida y formatea datos de registro de usuario
 * @param {Object} config - Configuración del proyecto
 * @param {Object} userData - Datos del usuario a registrar
 * @param {Object} appSettings - Configuraciones de la aplicación
 * @returns {Promise<Object>} Datos de usuario formateados o error
 */
async function validateSignupData(config, userData, appSettings) {
  // Generar ID de referido aleatorio
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const referralId = Array.from({ length: 5 }, () => 
    alphabet[Math.floor(Math.random() * alphabet.length)]
  ).join('');

  const userProfile = {
    createdAt: new Date().getTime(),
    firstName: userData.firstName,
    lastName: userData.lastName,
    mobile: userData.mobile,
    email: userData.email,
    usertype: userData.usertype,
    referralId: referralId,
    approved: true,
    walletBalance: 0,
    pushToken: 'init',
    signupViaReferral: userData.signupViaReferral || ' ',
  };

  // Agregar datos del país
  if (userData.country) userProfile.country = userData.country;
  if (userData.country_code) userProfile.country_code = userData.country_code;
  if (userData.currency_code) userProfile.currency_code = userData.currency_code;
  if (userData.swipe_symbol) userProfile.swipe_symbol = userData.swipe_symbol;
  if (userData.symbol) userProfile.symbol = userData.symbol;
  if (userData.term === true) userProfile.term = true;
  if (userData.socialSecurity !== undefined && userData.socialSecurity !== null && userData.socialSecurity !== '') {
    userProfile.socialSecurity = userData.socialSecurity;
  }
  if (userData.ageRange !== undefined && userData.ageRange !== null && userData.ageRange !== '') {
    userProfile.ageRange = userData.ageRange;
  }

  // Validar tipo de usuario
  const validUserTypes = ['driver', 'customer', 'fleetadmin'];
  if (!validUserTypes.includes(userProfile.usertype)) {
    return { error: 'Usertype not valid' };
  }

  // Configuraciones específicas para conductores
  if (userData.usertype === 'driver') {
    userProfile.queue = false;
    userProfile.driverActiveStatus = false;
    
    if (appSettings.driver_approval) {
      userProfile.approved = false;
    }
  }

  return userProfile;
}

/**
 * Verifica códigos OTP
 * @param {Object} config - Configuración del proyecto
 * @param {string} mobile - Número de teléfono
 * @param {Object} otpDatabase - Base de datos de OTPs
 * @returns {Promise<Object>} Resultado de la verificación
 */
async function checkOTP(config, mobile, otpDatabase) {
  const otpKeys = Object.keys(otpDatabase || {});
  
  for (const key of otpKeys) {
    const otpData = otpDatabase[key];
    
    if (otpData.mobile === mobile) {
      // Verificar máximo de intentos
      if (otpData.count >= 2) {
        return { errorStr: 'Maximum tries exceeded' };
      }

      // Verificar expiración (5 minutos)
      const currentTime = new Date();
      const otpTime = new Date(otpData.dated);
      const timeDiffMinutes = (currentTime - otpTime) / 60000;
      
      if (timeDiffMinutes > 5) {
        return { errorStr: 'OTP is valid for 5 mins only' };
      }

      return {
        data: otpData,
        key: key,
      };
    }
  }

  return { errorStr: 'No db match for OTP' };
}

/**
 * Verifica códigos OTP de email
 * @param {Object} config - Configuración del proyecto
 * @param {string} email - Dirección de email
 * @param {Object} otpDatabase - Base de datos de OTPs
 * @param {Object} language - Traducciones del idioma
 * @returns {Promise<Object>} Resultado de la verificación
 */
async function checkEmailOtp(config, email, otpDatabase, language = {}) {
  const otpKeys = Object.keys(otpDatabase || {});
  
  for (const key of otpKeys) {
    const otpData = otpDatabase[key];
    
    if (otpData.email === email) {
      if (otpData.count >= 2) {
        return { errorStr: language.maximum_tries_exceeded || 'Maximum tries exceeded' };
      }

      const currentTime = new Date();
      const otpTime = new Date(otpData.dated);
      const timeDiffMinutes = (currentTime - otpTime) / 60000;
      
      if (timeDiffMinutes > 5) {
        return { errorStr: language.otp_valid_5_mins_only || 'OTP is valid for 5 mins only' };
      }

      return {
        data: otpData,
        key: key,
      };
    }
  }

  return { errorStr: language.no_db_match_otp || 'No db match for OTP' };
}

/**
 * Envía SMS a través de gateway externo
 * @param {Object} config - Configuración del proyecto
 * @param {Object} smsConfig - Configuración del SMS
 * @param {Object} messageData - Datos del mensaje (mobile, otp)
 * @returns {Promise<Object>} Resultado del envío
 */
async function callMessageAPI(config, smsConfig, messageData) {
  if (!smsConfig.apiUrl || smsConfig.apiUrl.length === 0) {
    return { error: 'SMS Settings not found' };
  }

  try {
    // Preparar headers
    const headers = {
      'Content-Type': smsConfig.contentType,
    };

    if (smsConfig.authorization && smsConfig.authorization.length > 0) {
      headers.Authorization = smsConfig.authorization;
    }

    // Preparar URL con reemplazos
    const apiUrl = smsConfig.apiUrl
      .replace(/{mobile}/gi, messageData.mobile)
      .replace(/{otp}/gi, messageData.otp);

    const method = smsConfig.method && smsConfig.method.length > 1 ? smsConfig.method : 'POST';

    // Preparar body con reemplazos
    const requestBody = smsConfig.body && smsConfig.body.length > 1
      ? smsConfig.body
          .replace(/{mobile}/gi, messageData.mobile)
          .replace(/{otp}/gi, messageData.otp)
          .replace(/\+/gi, '%2B')
      : null;

    const requestOptions = {
      method: method,
      headers: headers,
      body: requestBody,
    };

    await fetch(apiUrl, requestOptions);
    return { success: true };
  } catch (error) {
    return { error: 'SMS Gateway Error' };
  }
}

// Exportar todas las funciones
module.exports = {
  validateBasicAuth,
  formatUserProfile,
  apiCallGoogle,
  validateSignupData,
  checkOTP,
  checkEmailOtp,
  callMessageAPI
};