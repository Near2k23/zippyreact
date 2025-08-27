import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert, Share, Pressable, Linking, ActivityIndicator, Dimensions, Platform, useColorScheme, Modal, Image, Animated, ScrollView } from "react-native";
import { Icon } from "react-native-elements";
import i18n from 'i18n-js';
import { colors } from '../common/theme';
import { useSelector, useDispatch } from "react-redux";
import { api } from 'common';
import { MaterialIcons, Entypo, Ionicons } from '@expo/vector-icons';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { MAIN_COLOR, MAIN_COLOR_DARK, SECONDORY_COLOR } from "../common/sharedFunctions";
import { appConsts } from '../common/sharedFunctions';
var { width, height } = Dimensions.get('window');
import { fonts } from "../common/font";
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WaygoDialog from '../components/WaygoDialog';

export default function SettingsScreen(props) {
    const { t } = i18n;
    const { signOff, updateProfile,editSos } = api;
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const settings = useSelector(state => state.settingsdata.settings);
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const [loading, setLoading] = useState(false);
    const [loader, setLoader] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const [theme, setTheme] = useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const [convertModalVisible, setConvertModalVisible] = useState(false);
    const [sosModalVisible, setSosModalVisible] = useState(false);

    let colorScheme = useColorScheme();
    const [mode, setMode] = useState();

    useEffect(() => {
        if (auth?.profile?.mode) {
            if (auth.profile.mode === 'system'){
                setMode(colorScheme);
                setTheme('system');
            }else{
                setMode(auth.profile.mode);
                setTheme(auth.profile.mode);
            }
        } else {
            setMode('light');
            setTheme('light');
        }
    }, [auth, colorScheme]);

    const menuList = [
        // { name: t('profile_setting_menu'), navigationName: 'Profile', icon: 'account-cog-outline', type: 'material-community' },
        { name: t('documents'), navigationName: 'editUser', icon: 'description', type: 'materialIcons' },
        { name: t('incomeText'), navigationName: 'MyEarning', icon: 'attach-money', type: 'materialIcons' },
        { name: auth.profile && auth.profile && auth.profile.usertype == "driver" ? t('convert_to_rider') : t('convert_to_driver'), navigationName: 'Convert', icon: 'account-convert-outline', type: 'material-community' },
        { name: t('cars'), navigationName: 'Cars', icon: 'car-cog', type: 'material-community' },
        { name: t('refer_earn'), navigationName: 'Refer', icon: 'cash-outline', type: 'ionicon' },
        { name: t('sos'), navigationName: 'Sos', icon: 'alert-circle-outline', type: 'ionicon' },
        { name: t('push_notification_title'), navigationName: 'Notifications', icon: 'notifications-outline', type: 'ionicon' },
        { name: t('complain'), navigationName: 'Complain', icon: 'chatbox-ellipses-outline', type: 'ionicon' },
        { name: t('theme'), navigationName: 'Theme', icon: 'sun', type: 'feather' },
        { name: t('about_us_menu'), navigationName: 'About', icon: 'info', type: 'entypo' },
        { name: t('logout'), icon: 'logout', navigationName: 'Logout', type: 'antdesign' }
    ];

    const fadeAnims = useRef({}).current;
    const profileAnim = useRef(new Animated.Value(0)).current;
    const [animationComplete, setAnimationComplete] = useState(false);

    useEffect(() => {
        // Initialize animations
        menuList.forEach((_, index) => {
            fadeAnims[index] = new Animated.Value(0);
        });

        // Animate everything together
        Animated.parallel([
            // Profile animation
            Animated.spring(profileAnim, {
                toValue: 1,
                friction: 8,
                tension: 50,
                useNativeDriver: true
            }),
            // Menu items animation - all at once
            ...menuList.map((_, index) => 
                Animated.spring(fadeAnims[index], {
                    toValue: 1,
                    friction: 8,
                    tension: 50,
                    useNativeDriver: true
                })
            )
        ]).start();
    }, []);

    useEffect(() => {
        if (auth.profile && auth.profile.uid) {
            setProfileData(auth.profile);
        }else{
            setLoader(true);
        }
    }, [auth.profile]);

    const showSosModal = () => {
        setSosModalVisible(true);
    };

    const executeSos = async () => {
        setSosModalVisible(false);
                        let call_link = Platform.OS == 'android' ? 'tel:' + settings.panic : 'telprompt:' + settings.panic;
                        Linking.openURL(call_link);

                        let obj = {};
                        obj.bookingId = null,
                            obj.user_name = auth.profile && auth.profile && auth.profile.firstName ? auth.profile.firstName + " " + auth.profile.lastName : null;
                        obj.contact = auth.profile && auth.profile && auth.profile.mobile ? auth.profile.mobile : null;
                        obj.user_type = auth.profile && auth.profile && auth.profile.usertype ? auth.profile.usertype : null;
                        obj.complainDate = new Date().getTime();
                        dispatch(editSos(obj, "Add"));
    };

    const sos = () => {
        showSosModal();
    }

    const showConvertModal = () => {
        setConvertModalVisible(true);
    };

    const convertUserType = async () => {
        setConvertModalVisible(false);
                        let userData = {
                            approved: (auth.profile && auth.profile.usertype == "driver" ? true : auth.profile && auth.profile.adminApprovedTrue == true ? true : settings && settings.driver_approval ? false : true),
                            usertype: auth.profile && auth.profile.usertype == "driver" ? "customer" : "driver",
                            queue: (auth.profile && auth.profile.queue === true) ? true : false,
                            driverActiveStatus: false
                        }
                        dispatch(updateProfile(userData));
                        setTimeout(() => {
                            if (userData.usertype == 'driver') {
                                dispatch(api.fetchBookings());
                                dispatch(api.fetchTasks());
                                dispatch(api.fetchCars());
                            } else {
                                StopBackgroundLocation();
                                dispatch(api.fetchAddresses());
                                dispatch(api.fetchBookings());
                            }
                        }, 3000);
    };

    const convert = () => {
        showConvertModal();
    }

    const StopBackgroundLocation = async () => {
        TaskManager.getRegisteredTasksAsync().then((res) => {
            if (res.length > 0) {
                for (let i = 0; i < res.length; i++) {
                    if (res[i].taskName == 'background-location-task') {
                        Location.stopLocationUpdatesAsync('background-location-task');
                        break;
                    }
                }
            }
        });
    }

    const refer = () => {
        settings.bonus > 0 ?
            Share.share({
                message: t('share_msg') + settings.code + ' ' + settings.bonus + ".\n" + t('code_colon') + auth.profile.referralId + "\n" + t('app_link') + (Platform.OS == "ios" ? settings.AppleStoreLink : settings.PlayStoreLink)
            })
            :
            Share.share({
                message: t('share_msg_no_bonus') + "\n" + t('app_link') + (Platform.OS == "ios" ? settings.AppleStoreLink : settings.PlayStoreLink)
            })
    }

    const showLogoutModal = () => {
        setLogoutModalVisible(true);
    };

    const logOff = () => {
        setLogoutModalVisible(false);
        auth && auth.profile && auth.profile.usertype == 'driver' ? StopBackgroundLocation() : null;
        setLoading(true);
        if (auth && auth.profile && auth.profile.usertype === 'driver') { StopBackgroundLocation() };

        setTimeout(() => {
            if (auth && auth.profile && auth.profile.pushToken) {
                dispatch(updateProfile({ pushToken: null }));
            }
            dispatch(signOff());
        }, 1000);
    }

    const applyTheme = () => {
                    setThemeModalVisible(false);
        dispatch(updateProfile({ mode: theme }));
        AsyncStorage.setItem('theme', JSON.stringify({ mode: theme }));
    };



    return (
        <ScrollView 
            style={[styles.mainView,{ backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND}]}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Profile Section */}
            <Animated.View 
                style={[styles.profileSection, {
                    opacity: profileAnim,
                    transform: [{
                        translateY: profileAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-50, 0]
                        })
                    }]
                }]}
            >
                <View style={styles.profileContainer}>
                    <View style={styles.profileInfo}>
                        <View style={styles.profileTextContainer}>
                            <Text style={[styles.profileName, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                {auth.profile && (auth.profile.firstName && auth.profile.lastName) ? 
                                    auth.profile.firstName + " " + auth.profile.lastName : t('no_name')}
                            </Text>
                            <Text style={[styles.profilePhone, { color: mode === 'dark' ? colors.WHITE : colors.BLACK + '80' }]}>
                                {auth.profile && auth.profile.mobile ? auth.profile.mobile : '300-000-0000'}
                            </Text>
                        </View>
                        
                        <TouchableOpacity 
                            onPress={() => props.navigation.navigate("Profile")}
                            style={styles.profileImageContainer}
                        >
                            {loader ?
                                <View style={[styles.loadingcontainer, styles.horizontal]}>
                                    <ActivityIndicator size="large" color={colors.INDICATOR_BLUE} />
                                </View>
                                : <View style={styles.profileImageWrapper}>
                                    <Image 
                                        source={profileData && profileData.profile_image ? { uri: profileData.profile_image } : require('../../assets/images/profilePic.png')} 
                                        style={styles.profileImage} 
                                    />
                                    <View style={[styles.editBadge, { 
                                        backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR 
                                    }]}>
                                        <MaterialIcons name="edit" size={12} color={colors.WHITE} />
                                    </View>
                                </View>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
            
            {/* Configuration Section */}
            <View style={styles.configurationSection}>
                <Text style={[styles.sectionTitle, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                    Configuración
                </Text>
            
            <View style={[styles.menuContainer, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND }]}>
                {menuList.map((item, index) => {
                    // Conditional rendering logic
                        if (auth.profile && auth.profile.usertype == "customer" && (item.navigationName == "Cars" || item.navigationName == "MyEarning")) {
                            return null;
                        }
                        else if (auth.profile && (auth.profile.usertype == "driver") && (item.navigationName == "Sos") && !(settings && settings.panic && settings.panic.length > 0)) {
                            return null;
                        } else if (auth.profile && auth.profile.usertype == "customer" && (item.navigationName == "Sos") && appConsts.hasOptions) {
                            return null;
                        } else if (auth.profile && auth.profile.usertype == "customer" && (item.navigationName == "Sos") && !(settings && settings.panic && settings.panic.length > 0)) {
                            return null;
                        } else if (auth.profile && auth.profile.usertype == "customer" && (item.navigationName == "editUser") && !(settings && ((settings.bank_fields && settings.RiderWithDraw) || settings.imageIdApproval))) {
                            return null;
                        } else if (auth.profile && auth.profile.usertype == "driver" && (item.navigationName == "editUser") && !(settings && (settings.bank_fields || settings.imageIdApproval || settings.license_image_required))) {
                            return null;
                        } else {
                            return (
                                <Animated.View 
                                    key={index}
                                    style={[
                                        styles.menuItem,
                                        {
                                            opacity: fadeAnims[index] || 1,
                                            transform: [
                                                {
                                                    translateY: fadeAnims[index] ? 
                                                        fadeAnims[index].interpolate({
                                                            inputRange: [0, 1],
                                                            outputRange: [50, 0]
                                                        }) : new Animated.Value(0)
                                                }
                                            ]
                                        }
                                    ]}
                                >
                                    <TouchableOpacity
                                        style={[styles.menuItemButton, { 
                                            flexDirection: isRTL ? 'row-reverse' : 'row' 
                                        }]}
                                        key={item.navigationName}
                                        onPress={() => {
                                            Animated.sequence([
                                                Animated.timing(fadeAnims[index], {
                                                    toValue: 0.8,
                                                    duration: 100,
                                                    useNativeDriver: true
                                                }),
                                                Animated.timing(fadeAnims[index], {
                                                    toValue: 1,
                                                    duration: 100,
                                                    useNativeDriver: true
                                                })
                                            ]).start(() => {
                                                if (item.navigationName === 'Sos') {
                                                    sos();
                                                } else if (item.navigationName === 'Refer') {
                                                    refer();
                                                } else if (item.navigationName === 'Logout') {
                                                    showLogoutModal();
                                                } else if (item.navigationName === 'Theme') {
                                                    setThemeModalVisible(true);
                                                } else if (item.navigationName === 'Convert') {
                                                    convert();
                                                } else {
                                                    props.navigation.navigate(item.navigationName)
                                                }
                                            });
                                        }}
                                    >
                                        <View style={styles.menuItemIcon}>
                                            <Icon
                                                name={item.icon}
                                                type={item.type}
                                                color={mode === 'dark' ? colors.WHITE : colors.BLACK}
                                                size={22}
                                            />
                                        </View>
                                        
                                        <View style={styles.menuItemContent}>
                                            {loading && item.navigationName === 'Logout' ?
                                                <ActivityIndicator color={mode === 'dark' ? colors.WHITE : colors.BLACK} size='small' />
                                                : <Text style={[styles.menuItemText, { 
                                                    color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                                    textAlign: isRTL ? 'right' : 'left' 
                                                }]}>
                                                    {item.name}
                                                </Text>
                                            }
                                        </View>
                                        
                                        <View style={styles.menuItemArrow}>
                                            <MaterialIcons 
                                                name={isRTL ? "keyboard-arrow-left" : "keyboard-arrow-right"} 
                                                size={24} 
                                                color={mode === 'dark' ? colors.WHITE : colors.BLACK + '60'} 
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            )
                        }
                })}
            </View>
            </View>
            
            <WaygoDialog
                visible={themeModalVisible}
                onClose={() => setThemeModalVisible(false)}
                title={t('theme')}
                showIcon={false}
                showButtons={true}
                onConfirm={() => {
                    setThemeModalVisible(false);
                    dispatch(updateProfile({ mode: theme }));
                    AsyncStorage.setItem('theme', JSON.stringify({ mode: theme }));
                }}
                confirmText={t('ok')}
                cancelText={t('cancel')}
                customContent={
                    <View style={styles.themeOptionsContainer}>
                        <TouchableOpacity 
                            onPress={() => setTheme('light')} 
                            style={[styles.themeOption, {
                                backgroundColor: theme === 'light' ? 
                                    (mode === 'dark' ? MAIN_COLOR_DARK + '20' : MAIN_COLOR + '20') : 
                                    'transparent'
                            }]}
                        >
                            <Entypo 
                                name="light-down" 
                                size={22} 
                                color={theme === 'light' ? 
                                    (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR) : 
                                    (mode === 'dark' ? colors.WHITE : colors.BLACK)
                                } 
                            />
                            <Text style={[styles.themeOptionText, {
                                color: theme === 'light' ? 
                                    (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR) : 
                                    (mode === 'dark' ? colors.WHITE : colors.BLACK)
                            }]}>
                                {t('light')}
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={() => setTheme('dark')} 
                            style={[styles.themeOption, {
                                backgroundColor: theme === 'dark' ? 
                                    (mode === 'dark' ? MAIN_COLOR_DARK + '20' : MAIN_COLOR + '20') : 
                                    'transparent'
                            }]}
                        >
                            <MaterialIcons 
                                name="dark-mode" 
                                size={22} 
                                color={theme === 'dark' ? 
                                    (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR) : 
                                    (mode === 'dark' ? colors.WHITE : colors.BLACK)
                                } 
                            />
                            <Text style={[styles.themeOptionText, {
                                color: theme === 'dark' ? 
                                    (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR) : 
                                    (mode === 'dark' ? colors.WHITE : colors.BLACK)
                            }]}>
                                {t('dark')}
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={() => setTheme('system')} 
                            style={[styles.themeOption, {
                                backgroundColor: theme === 'system' ? 
                                    (mode === 'dark' ? MAIN_COLOR_DARK + '20' : MAIN_COLOR + '20') : 
                                    'transparent'
                            }]}
                        >
                            <Ionicons 
                                name="settings-outline" 
                                size={22} 
                                color={theme === 'system' ? 
                                    (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR) : 
                                    (mode === 'dark' ? colors.WHITE : colors.BLACK)
                                } 
                            />
                            <Text style={[styles.themeOptionText, {
                                color: theme === 'system' ? 
                                    (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR) : 
                                    (mode === 'dark' ? colors.WHITE : colors.BLACK)
                            }]}>
                                {t('system')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                }
            />
            
            <WaygoDialog
                visible={logoutModalVisible}
                onClose={() => setLogoutModalVisible(false)}
                title={t('logout')}
                message={t('logout_message')}
                type="warning"
                showButtons={true}
                showIcon={false}
                onConfirm={logOff}
                confirmText={t('yes')}
                cancelText={t('cancel')}
            />
            
            <WaygoDialog
                visible={convertModalVisible}
                onClose={() => setConvertModalVisible(false)}
                title={t('convert_button')}
                message={auth.profile && auth.profile.usertype == "driver" ? t('convert_to_rider') : t('convert_to_driver')}
                icon="account-convert-outline"
                iconColor={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                type="confirm"
                showButtons={true}
                showIcon={true}
                onConfirm={convertUserType}
                confirmText={t('ok')}
                cancelText={t('cancel')}
            />
            
            <WaygoDialog
                visible={sosModalVisible}
                onClose={() => setSosModalVisible(false)}
                title={t('panic_text')}
                message={t('panic_question')}
                icon="alert-circle-outline"
                iconColor={colors.RED}
                type="warning"
                showButtons={true}
                showIcon={true}
                onConfirm={executeSos}
                confirmText={t('ok')}
                cancelText={t('cancel')}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    mainView: {
        flex: 1
    },
    vew: {
        flex: 1,
        height: 50,
        width: width - 20,
        marginVertical: 6,
        alignSelf: 'center'
    },
    vew1: {
        width: '88%',
        backgroundColor: colors.WHITE,
        height: '100%',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        borderRadius: 10,
    },
    vew2: {
        padding: 6,
        marginHorizontal: 5,
        backgroundColor: colors.BGTAXIPRIMARY,
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center'
    },
    pickerStyle: {
        color: colors.BLACK,
        width: 45,
        marginRight: 3,
        fontSize: 15,
        height: 30,
        fontWeight: 'bold',
    },
    pickerStyle1: {
        color: colors.BLACK,
        width: 68,
        fontSize: 15,
        height: 30,
        fontWeight: 'bold',
        marginLeft: 3,
    },
    headerTitleStyle: {
        color: colors.WHITE,
        fontFamily: 'Roboto-Bold',
    },
    imageViewStyle: {
        backgroundColor: colors.WHITE,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
        width: 70,
        height: 70,
        alignSelf: 'center',
        borderRadius: 70 / 2,
        overflow: 'hidden',
        justifyContent: 'center'
    },
    textPropStyle: {
        flex: 1,
        fontSize: 21,
        fontFamily: fonts.Bold
    },
    box:{
        width: (width-30)/3,
        height: (width-60)/3,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
        marginVertical: 6,
        alignItems: 'center',
        justifyContent:'space-evenly',
        backgroundColor: colors.WHITE,
        borderRadius: 10,
        padding: 5
    },
    darkBox:{
        width: (width-30)/3,
        height: (width-60)/3,
        shadowColor: "#fff",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
        marginVertical: 6,
        alignItems: 'center',
        justifyContent:'space-evenly',
        backgroundColor: colors.BLACK,
        borderRadius: 10,
        padding: 5
    },
    bigbox:{
        width: width-10,
        alignItems: 'center',
        justifyContent:'space-evenly',
        borderRadius: 10,
        margin: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    pickerStyle: {
        color: colors.BLACK,
        width: width - 100,
        fontSize: 15,
        height: 30,
        fontWeight: 'bold',
        padding:2

    },
    pickerStyle1: {
        color: colors.HEADER,
        width: width - 80,
        fontSize: 15,
        height: 30,
        fontFamily:fonts.Bold
    },
    RnpickerBox: {
        width: "100%",
        height:"50%",
        overflow: 'hidden',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.CONVERTDRIVER_TEXT,
        borderRadius: 10,
        alignItems: 'center',
        marginRight:5,
        paddingHorizontal:5
    },
    myViewStyle: {
        flex: 1,
        borderBottomColor: colors.BORDER_TEXT,
        height: 54,
        width: width-30
    },
    // okButtonContainer: {
    //     width:'100%',
    //     height: 50,
    //     flexDirection: 'row',
    //     alignSelf: 'center',
    // },
    okButtonContainerStyle: {
        width: '100%',
        height: 45,
        backgroundColor: MAIN_COLOR,
        borderRadius: 10
    },
    okButtonStyle: {
        flexDirection: 'row',
        backgroundColor: MAIN_COLOR,
        alignItems: 'center',
        justifyContent: 'center',
        height: 45,
    },
    clearButton:{
        padding: 5,
        borderRadius: 10,
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.SHADOW,
    },
    // Estilos para opciones de tema
    themeOptionsContainer: {
        marginBottom: 20,
        marginTop: 8,
    },
    themeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginVertical: 4,
    },
    themeOptionText: {
        fontSize: 16,
        fontFamily: fonts.Medium,
        marginLeft: 12,
        flex: 1,
    },
    // Nuevos estilos para el diseño actualizado
    profileSection: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profileImageContainer: {
        marginLeft: 16,
    },
    profileImageWrapper: {
        position: 'relative',
        width: 60,
        height: 60,
        borderRadius: 0,
        overflow: 'hidden',
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 0,
        overflow: 'hidden',
    },
    editBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.WHITE,
    },
    profileTextContainer: {
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontFamily: fonts.Bold,
        marginBottom: 4,
    },
    profilePhone: {
        fontSize: 14,
        fontFamily: fonts.Regular,
    },
    profileEditButton: {
        marginLeft: 12,
    },
    profileEditIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    configurationSection: {
        flex: 1,
        paddingHorizontal: 12,
        paddingBottom: 40
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: fonts.Bold,
        marginBottom: 16,
    },
    menuContainer: {
        flex: 1,
    },
    menuItem: {
        marginBottom: 2,
    },
    menuItemButton: {
        paddingVertical: 16,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    menuItemIcon: {
        width: 32,
        alignItems: 'center',
        marginRight: 16,
    },
    menuItemContent: {
        flex: 1,
    },
    menuItemText: {
        fontSize: 16,
        fontFamily: fonts.Regular,
    },
    menuItemArrow: {
        width: 24,
        alignItems: 'center',
    },
})