import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
    Dimensions,
    Platform,
    StatusBar, // Add StatusBar import
    View,
    Text,
    TouchableOpacity,
    Animated
} from 'react-native';
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
    SelectGatewayPage,
    LoginScreen,
    DriverTrips,
    WithdrawMoneyScreen,
    DriverIncomeScreen,
    RegistrationPage,
    Notifications as NotificationsPage,
    SettingsScreen,
    CarsScreen,
    CarEditScreen,
    IntroScreen,
    TransactionHistory,
} from '../screens';
import CustomSplashScreen from '../screens/CustomSplashScreen';
import Complain from '../screens/Complain';
var { height, width } = Dimensions.get('window');
import { useSelector, useDispatch } from "react-redux";
import i18n from 'i18n-js';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../common/theme';
import { Icon } from "react-native-elements";
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import { CommonActions } from '@react-navigation/native';
import { fonts } from '../common/font';
import DeviceInfo from 'react-native-device-info';
import { Linking } from 'react-native';
import { useColorScheme } from 'react-native';
import { FirebaseConfig } from '../../config/FirebaseConfig';


const hasNotch = DeviceInfo.hasNotch();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function AppContainer() {
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const auth = useSelector(state => state.auth);
    const activeBookings = useSelector(state => state.bookinglistdata.active);
    const responseListener = useRef();
    const navigationRef = useNavigationContainerRef();
    
    // All useState hooks called unconditionally
    let colorScheme = useColorScheme();
    const [mode, setMode] = useState();
    const [isFirstLaunch, setIsFirstLaunch] = useState(null);

    // Check if it's first launch
    useEffect(() => {
        const checkFirstLaunch = async () => {
            try {
                const hasLaunched = await AsyncStorage.getItem('hasLaunched');
                if (hasLaunched === null) {
                    setIsFirstLaunch(true);
                } else {
                    setIsFirstLaunch(false);
                }
            } catch (error) {
                setIsFirstLaunch(false);
            }
        };
        checkFirstLaunch();
    }, []);

    // All useEffect hooks called unconditionally
    useEffect(() => {
        if (auth && auth.profile && auth.profile.mode) {
            if (auth.profile.mode === 'system') {
                setMode(colorScheme);
            } else {
                setMode(auth.profile.mode);
            }
        } else {
            setMode('light');
        }
    }, [auth, colorScheme]);

    // Set status bar color based on theme
    useEffect(() => {
        if (Platform.OS === 'android') {
            StatusBar.setBackgroundColor(mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR);
            StatusBar.setBarStyle(mode === 'dark' ? 'white' : 'black');
        }
    }, [mode]);

    // Notification listener effect
    useEffect(() => {
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          if (response && response.notification && response.notification.request && response.notification.request.content && response.notification.request.content.data) {
            const nData = response.notification.request.content.data;
            if (nData.screen) {
              if (nData.params) {
                navigationRef.navigate(nData.screen, nData.params);
              } else {
                navigationRef.navigate(nData.screen);
              }
            } else {
              navigationRef.navigate("TabRoot");
            }
          }
        });
    }, []);

    // Early return after all hooks have been called
    // Check if store is properly initialized - this is safe to do after hooks
    if (!auth || typeof auth !== 'object' || isFirstLaunch === null) {
        return <CustomSplashScreen />;
    }

    const linking = {
        prefixes: [`${FirebaseConfig.projectId}://`, `https://${FirebaseConfig.projectId}.page.link`],
        config: {
            screens: {
                TabRoot: {
                    screens: {
                        Wallet: 'wallet',
                    }
                },
                BookedCab: {
                    path: 'bookedcab/:bookingId',
                    parse: {
                        bookingId: (bookingId) => `${bookingId}`,
                    },
                },
                paymentMethod: {
                    path: 'payment',
                    parse: {
                        mercadopago_status: String,
                        payment_id: String,
                    }
                },
                PaymentSuccess: 'success',
                PaymentCancel: 'cancel'
            }
        },
        async getInitialURL() {
            // First, you would need to get the initial URL from your app state
            const url = await Linking.getInitialURL();
            return url;
        },
        subscribe(listener) {
            // Listen to incoming links from deep linking
            const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
                listener(url);
            });

            return () => {
                // Clean up the event listeners
                linkingSubscription.remove();
            };
        },
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
            <View style={{
                backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND,
                paddingTop: Platform.OS === 'ios' ? 50 : 30,
                paddingHorizontal: 20,
                paddingBottom: 15,
                elevation: 0,
                shadowOpacity: 0,
            }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: showBackButton ? 'space-between' : 'center',
                }}>
                    {showBackButton && (
                        <TouchableOpacity 
                            onPress={handleBackPress}
                            style={{ 
                                width: 40, 
                                height: 40, 
                                justifyContent: 'center', 
                                alignItems: 'center' 
                            }}
                        >
                            <Icon
                                name={isRTL ? 'arrow-right' : 'arrow-back'}
                                type='ionicon'
                                color={mode === 'dark' ? colors.WHITE : colors.BLACK}
                                size={24}
                            />
                        </TouchableOpacity>
                    )}
                    
                    <Text style={{
                        fontFamily: 'Inter-Bold',
                        color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                        fontSize: 20,
                        textAlign: 'center',
                        flex: showBackButton ? 1 : 0,
                    }}>
                        {title}
                    </Text>
                    
                    {showBackButton && <View style={{ width: 40 }} />}
                </View>
            </View>
        );
    };

    const screenOptions = (title) => ({
        header: ({ navigation }) => <CustomHeader title={title} navigation={navigation} />
    });
    
    const TabRoot = () => {
        return (
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    animationEnabled: Platform.OS == 'android' ? false : true,
                    tabBarIcon: ({ focused, color, size }) => {
                        const scaleAnim = useRef(new Animated.Value(1)).current;
                        const opacityAnim = useRef(new Animated.Value(1)).current;

                        useEffect(() => {
                            if (focused) {
                                Animated.sequence([
                                    Animated.timing(scaleAnim, {
                                        toValue: 1.2,
                                        duration: 150,
                                        useNativeDriver: true,
                                    }),
                                    Animated.timing(scaleAnim, {
                                        toValue: 1,
                                        duration: 150,
                                        useNativeDriver: true,
                                    })
                                ]).start();

                                Animated.timing(opacityAnim, {
                                    toValue: 0.7,
                                    duration: 100,
                                    useNativeDriver: true,
                                }).start(() => {
                                    Animated.timing(opacityAnim, {
                                        toValue: 1,
                                        duration: 100,
                                        useNativeDriver: true,
                                    }).start();
                                });
                            }
                        }, [focused]);

                        let iconName, iconType;
                        if (route.name === 'Home') {
                            iconName = 'directions-car';
                            iconType = 'material';
                        } else if (route.name === 'DriverTrips') {
                            iconName = 'directions-car';
                            iconType = 'material';
                        } else if (route.name === 'RideList') {
                            iconName = 'history';
                            iconType = 'material';
                        } else if (route.name === 'Settings') {
                            iconName = 'person';
                            iconType = 'material';
                        }
                        return (
                            <Animated.View style={{ 
                                flexDirection: 'column',
                                alignItems: 'center', 
                                justifyContent: 'center',
                                flex: 1,
                                transform: [{ scale: scaleAnim }],
                                opacity: opacityAnim
                            }}>
                                <Icon
                                    name={iconName}
                                    type={iconType}
                                    size={size + 5}
                                    color={color}
                                    style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
                                />
                                <Text style={{
                                    color: color,
                                    fontSize: 10,
                                    fontFamily: fonts.Medium,
                                    marginTop: 2,
                                    textAlign: 'center',
                                }}>
                                    {route.name === 'Home' ? t('home') : 
                                     route.name === 'DriverTrips' ? t('task_list') :
                                     route.name === 'RideList' ? t('ride_list_title') :
                                     route.name === 'Settings' ? t('profile') : ''}
                                </Text>
                            </Animated.View>
                        );
                    },
                    tabBarActiveTintColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR,
                    tabBarInactiveTintColor: colors.SHADOW,
                    tabBarStyle: {
                        height: hasNotch ? 80 : 60,
                        backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND,
                        direction: isRTL ? 'rtl' : 'ltr',
                        borderTopWidth: 0,
                        elevation: 8,
                        shadowColor: mode === 'dark' ? colors.WHITE : colors.BLACK,
                        shadowOffset: {
                            width: 0,
                            height: -2,
                        },
                        shadowOpacity: mode === 'dark' ? 0.1 : 0.15,
                        shadowRadius: 8,
                        paddingBottom: hasNotch ? 10 : 5,
                        paddingTop: 5,
                    },
                    tabBarLabelStyle: {
                        display: 'none'
                    },
                    tabBarShowLabel: false,
                    tabBarIndicatorStyle: {
                        borderBottomColor: '#C2D5A8',
                        borderBottomWidth: 2,
                        transform: [{ scaleX: isRTL ? -1 : 1 }]
                    },
                })}
            >
                {auth.profile && auth.profile.usertype && auth.profile.usertype == 'customer' ?
                    <Tab.Screen name="Home" 
                        component={MapScreen} 
                        options={{ title: t('home'), headerShown: false }}
                        listeners={({ navigation, route }) => ({
                            tabPress: e => {
                                e.preventDefault()
                                navigation.dispatch(
                                    CommonActions.reset({
                                        index: 0,
                                        routes: [{ name: route.name }]
                                    })
                                )
                            },
                        })}
                    />
                : null}
                {auth.profile && auth.profile.usertype && auth.profile.usertype == 'driver' ?
                    <Tab.Screen 
                        name="DriverTrips" 
                        component={DriverTrips} 
                        options={{
                            header: () => (
                                <View style={{
                                    backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND,
                                    paddingTop: Platform.OS === 'ios' ? 50 : 30,
                                    paddingHorizontal: 20,
                                    paddingBottom: 15,
                                    elevation: 0,
                                    shadowOpacity: 0,
                                }}>
                                    <Text style={{
                                        fontFamily: 'Inter-Bold',
                                        color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                        fontSize: 20,
                                        marginTop: 16,
                                        textAlign: isRTL ? 'right' : 'left',
                                    }}>
                                        {t('task_list')}
                                    </Text>
                                </View>
                            )
                        }}
                        listeners={({ navigation, route }) => ({
                            tabPress: e => {
                                e.preventDefault()
                                navigation.dispatch(
                                    CommonActions.reset({
                                        index: 0,
                                        routes: [{ name: route.name }]
                                    })
                                )
                            },
                        })}
                    />
                : null}
                <Tab.Screen name="RideList"
                    component={RideListPage} 
                    options={{
                        headerShown: false
                    }}
                    listeners={({ navigation, route }) => ({
                        tabPress: e => {
                            e.preventDefault()
                            navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [{ name: route.name }]
                                })
                            )
                        },
                    })}
                />
                <Tab.Screen name="Settings" 
                    component={SettingsScreen} 
                    options={{
                        headerShown: false
                    }}
                    listeners={({ navigation, route }) => ({
                        tabPress: e => {
                            e.preventDefault()
                            navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [{ name: route.name }]
                                })
                            )
                        },
                    })}
                />
            </Tab.Navigator>
        );
    }

    return (
        <NavigationContainer ref={navigationRef} linking={linking}>
            <Stack.Navigator
                screenOptions={{
                    animationTypeForReplace: 'pop',
                    //animationEnabled: false,
                }}
            >
                {auth.profile && auth.profile.uid ?
                    <Stack.Group>
                        <Stack.Screen name="TabRoot" component={TabRoot} options={{ headerShown: false, }} />
                        <Stack.Screen name="Profile" component={ProfileScreen} options={screenOptions(t('profile_setting_menu'))} />
                        <Stack.Screen name="editUser" component={EditProfilePage} options={screenOptions(t('update_profile_title'))} />
                        <Stack.Screen name="Search" component={SearchScreen} options={screenOptions(t('search'))} />
                        <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="DriverRating" component={DriverRating} options={{ headerShown: false }} />
                        <Stack.Screen name="PaymentDetails" component={PaymentDetails} options={screenOptions(t('payment'))} />
                        <Stack.Screen name="BookedCab" component={BookedCabScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="RideDetails" component={RideDetails} options={screenOptions(t('ride_details_page_title'))} />
                        <Stack.Screen name="onlineChat" component={OnlineChat} options={{ headerShown: false }} />
                        <Stack.Screen name="WalletDetails" component={WalletDetails} options={screenOptions(t('my_wallet_tile'))} />
                        <Stack.Screen name="addMoney" component={AddMoneyScreen} options={screenOptions(t('add_money'))} />
                        <Stack.Screen name="paymentMethod" component={SelectGatewayPage} options={screenOptions(t('payment'))} />
                        <Stack.Screen name="withdrawMoney" component={WithdrawMoneyScreen} options={screenOptions(t('withdraw_money'))} />
                        <Stack.Screen name="About" component={AboutPage} options={screenOptions(t('about_us_menu'))} />
                        <Stack.Screen name="Complain" component={Complain} options={screenOptions(t('complain'))} />
                        <Stack.Screen name="MyEarning" component={DriverIncomeScreen} options={screenOptions(t('incomeText'))} />
                        <Stack.Screen name="Notifications" component={NotificationsPage} options={screenOptions(t('push_notification_title'))} />
                        <Stack.Screen name="Cars" component={CarsScreen} options={screenOptions(t('cars'))} />
                        <Stack.Screen name="CarEdit" component={CarEditScreen} options={screenOptions(t('cars'))} />
                        <Stack.Screen 
                            name="TransactionHistory" 
                            component={TransactionHistory} 
                            options={({ route }) => screenOptions(route.params?.title || t('transaction_history_title'))}
                        />
                    </Stack.Group>
                    :
                    <Stack.Group screenOptions={{ headerShown: false }}>
                        {isFirstLaunch ? 
                            <Stack.Screen name="Intro" component={IntroScreen} />
                            : null
                        }
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegistrationPage} />
                    </Stack.Group>
                }
            </Stack.Navigator>
        </NavigationContainer>
    );
}