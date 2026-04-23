import React, { useState, useEffect } from 'react';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import {
  LogBox,
  Animated
} from "react-native";
import { Provider } from "react-redux";
import {
  FirebaseProvider,
  store
} from 'common';
import { FirebaseConfig } from './config/FirebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { isDriver } from './src/appVariant';
import SplashGradientBackground from './src/components/SplashGradientBackground';

const AppContainer = isDriver
  ? require('./src/navigation/AppNavigator.driver').default
  : require('./src/navigation/AppNavigator.rider').default;

const AppCommon = isDriver
  ? require('./AppCommon.driver').default
  : require('./AppCommon.rider').default;

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 2000,
  fade: true,
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [bounceAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    LogBox.ignoreAllLogs(true);
    LogBox.ignoreLogs([
      'Setting a timer',
      'SplashScreen.show'
    ])

    const ReactNative = require('react-native');
    try {
        ReactNative.I18nManager.allowRTL(false);
    } catch (e) {
        console.log(e);
    }

    startSplashAnimations();
    onLoad();
  }, []);

  const startSplashAnimations = () => {
    SplashScreen.hideAsync();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start(() => {
      startBounceAnimation();
    });
  };

  const startBounceAnimation = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setShowCustomSplash(false);
      }, 300);
    });
  };

  const _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/background.jpg'),
        require('./assets/images/logo_splash.png'),
        require('./assets/images/g4.gif'),
        require('./assets/images/lodingDriver.gif')
      ]),
      Font.loadAsync({
        'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
        'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
        'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
        'Roboto-Light': require('./assets/fonts/Roboto-Light.ttf'),
        'Ubuntu-Regular': require('./assets/fonts/Ubuntu-Regular.ttf'),
        'Ubuntu-Medium': require('./assets/fonts/Ubuntu-Medium.ttf'),
        'Ubuntu-Light': require('./assets/fonts/Ubuntu-Light.ttf'),
        'Ubuntu-Bold': require('./assets/fonts/Ubuntu-Bold.ttf'),
        "DancingScript-Bold":require('./assets/fonts/DancingScript-Bold.ttf'),
        "DancingScript-Medium":require('./assets/fonts/DancingScript-Medium.ttf'),
        "DancingScript-SemiBold":require('./assets/fonts/DancingScript-SemiBold.ttf'),
        "Inter-Bold":require('./assets/fonts/Inter-Bold.otf'),
      }),
    ]);
  };

  const onLoad = async () => {
    if (__DEV__) {
      _loadResourcesAsync().then(() => {
        setAssetsLoaded(true);
      });
    } else {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
        _loadResourcesAsync().then(() => {
          setAssetsLoaded(true);
        })
      } catch (error) {
        _loadResourcesAsync().then(() => {
          setAssetsLoaded(true);
        })
      }
    }
  }

  if (showCustomSplash || !assetsLoaded) {
    return (
      <SplashGradientBackground>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              {
                scale: Animated.multiply(
                  fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                  bounceAnim
                ),
              },
            ],
          }}
        >
          <Animated.Image
            source={require('./assets/images/logo_splash.png')}
            style={{
              width: 200,
              height: 200,
              resizeMode: 'contain',
            }}
          />
        </Animated.View>
      </SplashGradientBackground>
    );
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <FirebaseProvider
          config={FirebaseConfig}
          AsyncStorage={AsyncStorage}
        >
          <GluestackUIProvider config={config}>
            <AppCommon>
              <AppContainer />
            </AppCommon>
          </GluestackUIProvider>
        </FirebaseProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

