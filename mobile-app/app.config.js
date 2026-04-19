import { AppConfig } from './config/AppConfig';
import { GoogleMapApiConfig } from './config/GoogleMapApiConfig';

const APP_VARIANT = process.env.APP_VARIANT || 'rider';
const isDriver = APP_VARIANT === 'driver';
const iosGoogleServicesFile = isDriver ? './GoogleService-Info.driver.plist' : './GoogleService-Info.plist';

const locationPermissionText = 'For a reliable ride, App collects location data from the time you open the app until a trip ends. This improves pickups, support, and more.';
const backgroundLocationPermissionText = 'This app uses the always location access in the background for improved pickups and dropoffs, customer support and safety purpose.';

const androidPermissions = [
  'CAMERA',
  'READ_EXTERNAL_STORAGE',
  'WRITE_EXTERNAL_STORAGE',
  'ACCESS_FINE_LOCATION',
  'ACCESS_COARSE_LOCATION',
  'CAMERA_ROLL',
  'FOREGROUND_SERVICE',
  'SCHEDULE_EXACT_ALARM'
];

if (isDriver) {
  androidPermissions.push('FOREGROUND_SERVICE_LOCATION', 'ACCESS_BACKGROUND_LOCATION');
}

const iosInfoPlist = {
  NSLocationWhenInUseUsageDescription: locationPermissionText,
  NSCameraUsageDescription: 'This app uses the camera to take your profile picture.',
  NSPhotoLibraryUsageDescription: 'This app uses Photo Library for uploading your profile picture.',
  NSFaceIDUsageDescription: 'This app uses Face ID for secure authentication.',
  ITSAppUsesNonExemptEncryption: false,
  UIBackgroundModes: isDriver
    ? ['location', 'fetch', 'remote-notification', 'audio']
    : ['fetch', 'remote-notification']
};

if (isDriver) {
  iosInfoPlist.NSLocationAlwaysUsageDescription = backgroundLocationPermissionText;
  iosInfoPlist.NSLocationAlwaysAndWhenInUseUsageDescription = backgroundLocationPermissionText;
}

const expoLocationPlugin = [
  'expo-location',
  {
    locationWhenInUsePermission: locationPermissionText,
    isIosBackgroundLocationEnabled: isDriver,
    isAndroidBackgroundLocationEnabled: isDriver,
    isAndroidForegroundServiceEnabled: isDriver
  }
];

if (isDriver) {
  expoLocationPlugin[1].locationAlwaysAndWhenInUsePermission = backgroundLocationPermissionText;
  expoLocationPlugin[1].locationAlwaysPermission = backgroundLocationPermissionText;
}

export default {
  name: isDriver ? `${AppConfig.app_name} Driver` : AppConfig.app_name,
  description: AppConfig.app_description,
  owner: AppConfig.expo_owner,
  slug: AppConfig.expo_slug,
  scheme: AppConfig.expo_slug,
  privacy: 'public',
  runtimeVersion: {
    policy: 'appVersion'
  },
  userInterfaceStyle: 'automatic',
  platforms: ['ios', 'android'],
  androidStatusBar: {
    hidden: true,
    translucent: true
  },
  version: AppConfig.ios_app_version,
  orientation: 'portrait',
  icon: './assets/images/logo1024x1024.png',
  splash: {
    image: './assets/images/logo_splash.png',
    resizeMode: 'contain',
    backgroundColor: '#000000'
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: 'https://u.expo.dev/' + AppConfig.expo_project_id
  },
  extra: {
    appVariant: APP_VARIANT,
    eas: {
      projectId: AppConfig.expo_project_id
    }
  },
  assetBundlePatterns: ['**/*'],
  packagerOpts: {
    config: 'metro.config.js'
  },
  ios: {
    associatedDomains: ['applinks:' + AppConfig.expo_slug + '.page.link'],
    newArchEnabled: false,
    splash: {
      image: './assets/images/logo_splash.png',
      resizeMode: 'contain',
      backgroundColor: '#000000'
    },
    supportsTablet: true,
    usesAppleSignIn: true,
    // Debe coincidir con el `BUNDLE_ID` del `GoogleService-Info*.plist` seleccionado.
    bundleIdentifier: isDriver ? 'com.waygo.driver' : AppConfig.app_identifier,
    entitlements: {
      'com.apple.developer.devicecheck.appattest-environment': 'production'
    },
    infoPlist: iosInfoPlist,
    privacyManifests: {
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
          NSPrivacyAccessedAPITypeReasons: ['CA92.1']
        },
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp',
          NSPrivacyAccessedAPITypeReasons: ['3B52.1']
        },
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryDiskSpace',
          NSPrivacyAccessedAPITypeReasons: ['E174.1']
        },
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime',
          NSPrivacyAccessedAPITypeReasons: ['35F9.1']
        }
      ]
    },
    config: {
      googleMapsApiKey: GoogleMapApiConfig.ios
    },
    googleServicesFile: iosGoogleServicesFile,
    buildNumber: AppConfig.ios_app_version
  },
  android: {
    // El `google-services.json` incluye clientes distintos por paquete.
    // Para driver usamos el package registrado en Firebase: `com.waygo.driver`.
    // Para rider mantenemos el identificador base del proyecto.
    package: isDriver ? 'com.waygo.driver' : AppConfig.app_identifier,
    versionCode: AppConfig.android_app_version,
    newArchEnabled: false,
    edgeToEdgeEnabled: false,
    splash: {
      image: './assets/images/logo_splash.png',
      resizeMode: 'contain',
      backgroundColor: '#000000'
    },
    permissions: androidPermissions,
    blockedPermissions: ['com.google.android.gms.permission.AD_ID'],
    googleServicesFile: './google-services.json',
    config: {
      googleMaps: {
        apiKey: GoogleMapApiConfig.android
      }
    }
  },
  plugins: [
    'expo-asset',
    'expo-font',
    'expo-audio',
    'expo-apple-authentication',
    'expo-local-authentication',
    'expo-localization',
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#000000',
        image: './assets/images/logo_splash.png',
        imageWidth: 200,
        resizeMode: 'contain'
      }
    ],
    [
      'expo-notifications',
      {
        sounds: ['./assets/sounds/horn.wav', './assets/sounds/repeat.wav']
      }
    ],
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static'
        }
      }
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'This app uses Photo Library for uploading your profile picture.',
        cameraPermission: 'This app uses the camera to take your profile picture.'
      }
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'This app uses the camera to take your identity document photo.'
      }
    ],
    expoLocationPlugin
  ]
};
