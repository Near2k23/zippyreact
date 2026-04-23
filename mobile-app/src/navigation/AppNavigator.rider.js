import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { Platform, StatusBar, View, Text, TouchableOpacity, Linking, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DriverRating,
  ProfileScreen,
  PaymentDetails,
  RideListPage,
  MapScreen,
  BookedCabScreen,
  RideDetails,
  SearchScreen,
  EditProfilePage,
  AboutPage,
  OnlineChat,
  WalletDetails,
  AddMoneyScreen,
  LoginScreen,
  WithdrawMoneyScreen,
  RegistrationPage,
  Notifications as NotificationsPage,
  SettingsScreen,
  IntroScreen,
  TransactionHistory,
  SelectGatewayPage
} from '../screens/index.rider';
import CustomSplashScreen from '../screens/CustomSplashScreen';
import Complain from '../screens/Complain';
import { useSelector } from 'react-redux';
import i18n from 'i18n-js';
import * as Notifications from 'expo-notifications';
import { colors } from '../common/theme';
import { Icon } from 'react-native-elements';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import { FirebaseConfig } from '../../config/FirebaseConfig';

const Stack = createStackNavigator();
const Tab = createNativeBottomTabNavigator();

export default function AppContainer() {
  const { t } = i18n;
  const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
  const auth = useSelector(state => state.auth);
  const responseListener = useRef();
  const navigationRef = useNavigationContainerRef();
  const colorScheme = useColorScheme();
  const [mode, setMode] = useState();
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        setIsFirstLaunch(hasLaunched === null);
      } catch (error) {
        setIsFirstLaunch(false);
      }
    };
    checkFirstLaunch();
  }, []);

  useEffect(() => {
    if (auth?.profile?.mode) {
      setMode(auth.profile.mode === 'system' ? colorScheme : auth.profile.mode);
    } else {
      setMode('light');
    }
  }, [auth, colorScheme]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBarStyle(mode === 'dark' ? 'white' : 'black');
    }
  }, [mode]);

  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const nData = response?.notification?.request?.content?.data;
      if (nData?.screen) {
        navigationRef.navigate(nData.screen, nData.params || undefined);
      } else {
        navigationRef.navigate('TabRoot');
      }
    });

    return () => {
      responseListener.current?.remove?.();
    };
  }, [navigationRef]);

  if (!auth || typeof auth !== 'object' || isFirstLaunch === null) {
    return <CustomSplashScreen />;
  }

  const linking = {
    prefixes: [`${FirebaseConfig.projectId}://`, `https://${FirebaseConfig.projectId}.page.link`],
    config: {
      screens: {
        TabRoot: {
          screens: {
            Wallet: 'wallet'
          }
        },
        BookedCab: {
          path: 'bookedcab/:bookingId',
          parse: {
            bookingId: bookingId => `${bookingId}`
          }
        },
        paymentMethod: {
          path: 'payment',
          parse: {
            mercadopago_status: String,
            payment_id: String
          }
        },
        PaymentSuccess: 'success',
        PaymentCancel: 'cancel'
      }
    },
    async getInitialURL() {
      return Linking.getInitialURL();
    },
    subscribe(listener) {
      const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
        listener(url);
      });

      return () => {
        linkingSubscription.remove();
      };
    }
  };

  const CustomHeader = ({ title, navigation, showBackButton = true }) => {
    const handleBackPress = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('TabRoot');
      }
    };

    return (
      <View style={{ backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND, paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingHorizontal: 20, paddingBottom: 15, elevation: 0, shadowOpacity: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: showBackButton ? 'space-between' : 'center' }}>
          {showBackButton ? (
            <TouchableOpacity onPress={handleBackPress} style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
              <Icon name={isRTL ? 'arrow-right' : 'arrow-back'} type='ionicon' color={mode === 'dark' ? colors.WHITE : colors.BLACK} size={24} />
            </TouchableOpacity>
          ) : null}
          <Text style={{ fontFamily: 'Inter-Bold', color: mode === 'dark' ? colors.WHITE : colors.BLACK, fontSize: 20, textAlign: 'center', flex: showBackButton ? 1 : 0 }}>
            {title}
          </Text>
          {showBackButton ? <View style={{ width: 40 }} /> : null}
        </View>
      </View>
    );
  };

  const screenOptions = title => ({
    header: ({ navigation }) => <CustomHeader title={title} navigation={navigation} />
  });

  const getNativeTabIcon = (routeName, focused) => {
    const iconMap = {
      Home: { type: 'image', source: require('../../assets/images/y (2).png'), tinted: true },
      RideList: { type: 'image', source: require('../../assets/images/ruta.png'), tinted: true },
      Settings: { type: 'image', source: require('../../assets/images/menu.png'), tinted: true }
    };

    return iconMap[routeName] || { type: 'image', source: require('../../assets/images/ruta.png'), tinted: true };
  };

  const TabRoot = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => getNativeTabIcon(route.name, focused),
        tabBarLabel:
          route.name === 'Home'
            ? t('home')
            : route.name === 'RideList'
              ? t('ride_list_title')
              : t('profile'),
        tabBarActiveTintColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR,
        tabBarInactiveTintColor: colors.SHADOW,
        tabBarStyle: {
          backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND,
          shadowColor: mode === 'dark' ? colors.WHITE : colors.BLACK
        },
        tabBarLabelStyle: { fontFamily: 'Inter-Bold', fontSize: 11 },
        tabBarLabelVisibilityMode: Platform.OS === 'android' ? 'labeled' : undefined,
        tabBarActiveIndicatorEnabled: Platform.OS === 'android',
        tabBarActiveIndicatorColor: `${mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}22`,
        tabBarBlurEffect: Platform.OS === 'ios' ? 'systemChromeMaterial' : undefined
      })}
    >
      <Tab.Screen name='Home' component={MapScreen} options={{ title: t('home'), headerShown: false }} />
      <Tab.Screen name='RideList' component={RideListPage} options={{ headerShown: false }} />
      <Tab.Screen name='Settings' component={SettingsScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );

  const isMismatch = Boolean(
    auth.profile?.uid &&
    auth.profile.usertype &&
    auth.profile.usertype !== 'customer'
  );

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator screenOptions={{ animationTypeForReplace: 'pop' }}>
        {auth.profile?.uid && !isMismatch ? (
          <Stack.Group>
            <Stack.Screen name='TabRoot' component={TabRoot} options={{ headerShown: false }} />
            <Stack.Screen name='Profile' component={ProfileScreen} options={screenOptions(t('profile_setting_menu'))} />
            <Stack.Screen name='editUser' component={EditProfilePage} options={screenOptions(t('update_profile_title'))} />
            <Stack.Screen name='Search' component={SearchScreen} options={screenOptions(t('search'))} />
            <Stack.Screen name='Map' component={MapScreen} options={{ headerShown: false }} />
            <Stack.Screen name='DriverRating' component={DriverRating} options={{ headerShown: false }} />
            <Stack.Screen name='PaymentDetails' component={PaymentDetails} options={screenOptions(t('payment'))} />
            <Stack.Screen name='BookedCab' component={BookedCabScreen} options={{ headerShown: false }} />
            <Stack.Screen name='RideDetails' component={RideDetails} options={screenOptions(t('ride_details_page_title'))} />
            <Stack.Screen name='onlineChat' component={OnlineChat} options={{ headerShown: false }} />
            <Stack.Screen name='WalletDetails' component={WalletDetails} options={screenOptions(t('my_wallet_tile'))} />
            <Stack.Screen name='addMoney' component={AddMoneyScreen} options={screenOptions(t('add_money'))} />
            <Stack.Screen name='paymentMethod' component={SelectGatewayPage} options={screenOptions(t('payment'))} />
            <Stack.Screen name='withdrawMoney' component={WithdrawMoneyScreen} options={screenOptions(t('withdraw_money'))} />
            <Stack.Screen name='About' component={AboutPage} options={screenOptions(t('about_us_menu'))} />
            <Stack.Screen name='Complain' component={Complain} options={screenOptions(t('complain'))} />
            <Stack.Screen name='Notifications' component={NotificationsPage} options={screenOptions(t('push_notification_title'))} />
            <Stack.Screen name='TransactionHistory' component={TransactionHistory} options={({ route }) => screenOptions(route.params?.title || t('transaction_history_title'))} />
          </Stack.Group>
        ) : (
          <Stack.Group screenOptions={{ headerShown: false }}>
            {isFirstLaunch ? <Stack.Screen name='Intro' component={IntroScreen} /> : null}
            <Stack.Screen name='Login' component={LoginScreen} />
            <Stack.Screen name='Register' component={RegistrationPage} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
