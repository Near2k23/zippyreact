import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Dimensions,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
    Share,
    TextInput,
    useColorScheme
} from 'react-native';
import { Icon, Input } from 'react-native-elements'
import ActionSheet from "react-native-actions-sheet";
import { colors } from '../common/theme';
import * as ImagePicker from 'expo-image-picker';
import i18n from 'i18n-js';
var { width, height } = Dimensions.get('window');
import { useSelector, useDispatch } from 'react-redux';
import { api, FirebaseContext } from 'common';
import StarRating from 'react-native-star-rating-widget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from '../components/RNPickerSelect';
import moment from 'moment/min/moment-with-locales';
import { MaterialIcons, Ionicons, Entypo, MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import Dialog from "react-native-dialog";
import { FontAwesome5 } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import { fonts } from '../common/font';
import { getLangKey } from 'common/src/other/getLangKey';
import WaygoDialog from '../components/WaygoDialog';

export default function ProfileScreen(props) {
    const { authRef, mobileAuthCredential, updatePhoneNumber } = useContext(FirebaseContext);
    const { t } = i18n;
    const [isRTL, setIsRTL] = useState();
    const {
        updateProfileImage,
        deleteUser,
        updateProfile,
        updateProfileWithEmail,
        checkUserExists,
        requestMobileOtp,
        updateAuthMobile,
        countries
    } = api;
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const settings = useSelector(state => state.settingsdata.settings);
    const [profileData, setProfileData] = useState(null);
    const [loader, setLoader] = useState(false);
    const actionSheetRef = useRef(null);
    const [langSelection, setLangSelection] = useState();
    const languagedata = useSelector(state => state.languagedata);
    const pickerRef1 = React.createRef();
    const pickerRef2 = React.createRef();
    const [countrycodeFocus, setCountryCodeFocus] = useState(false)
    const [countryCode, setCountryCode] = useState();
    const [userMobile, setUserMobile] = useState('');

    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        showButtons: false,
        onConfirm: null,
        onClose: () => setAlertConfig(prev => ({ ...prev, visible: false })),
        confirmText: '',
        cancelText: ''
    });

    const fromPage = props.route.params && props.route.params.fromPage ? props.route.params.fromPage : null;

    let colorScheme = useColorScheme();
    const [mode, setMode] = useState();

    useEffect(() => {
        if (auth?.profile?.mode) {
            if (auth.profile.mode === 'system') {
                setMode(colorScheme);
            } else {
                setMode(auth.profile.mode);
            }
        } else {
            setMode('light');
        }
    }, [auth, colorScheme]);

    const formatCountries = useMemo(() => {
        let arr = [];
        for (let i = 0; i < countries.length; i++) {
            let txt = "(+" + countries[i].phone + ") " + countries[i].label;
            arr.push({ label: txt, value: txt, key: txt, inputLabel: " +" + countries[i].phone });
        }
        return arr;
    }, [countries]);

    const showAlert = (message) => {
        setAlertConfig({
            visible: true,
            title: t('alert'),
            message: message,
            type: 'warning',
            showButtons: true,
            confirmText: t('ok'),
            cancelText: null,
            onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
            onClose: () => setAlertConfig(prev => ({ ...prev, visible: false }))
        });
    }
    useEffect(() => {
        if (settings) {
            for (let i = 0; i < countries.length; i++) {
                if (countries[i].label == settings.country) {
                    setCountryCode("(+" + countries[i].phone + ") " + countries[i].label);
                    setUserMobile("")
                }
            }
        }

    }, [settings]);


    const upDateCountry = (text) => {
        setCountryCode(text);
        setProfileData({ ...profileData, mobile: "" })
    }


    useEffect(() => {
        setLangSelection(i18n.locale);
        setIsRTL(i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0);
    }, []);

    useEffect(() => {
        if (auth.profile && auth.profile.uid) {
            setProfileData(auth.profile);
        }
    }, [auth.profile]);

    const showActionSheet = () => {
        actionSheetRef.current?.setModalVisible(true);
    }

    const uploadImage = () => {
        return (
            <ActionSheet ref={actionSheetRef}>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, borderColor: colors.SHADOW, borderBottomWidth: 1, height: 60, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { _pickImage('CAMERA', ImagePicker.launchCameraAsync) }}
                >
                    <Text style={{ color: colors.BLUE, fontWeight: 'bold' }}>{t('camera')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, borderBottomWidth: 1, borderColor: colors.SHADOW, height: 60, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { _pickImage('MEDIA', ImagePicker.launchImageLibraryAsync) }}
                >
                    <Text style={{ color: colors.BLUE, fontWeight: 'bold' }}>{t('medialibrary')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, height: 50, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { actionSheetRef.current?.setModalVisible(false); }}>
                    <Text style={{ color: 'red', fontWeight: 'bold' }}>{t('cancel')}</Text>
                </TouchableOpacity>
            </ActionSheet>
        )
    }

    const _pickImage = async (permissionType, res) => {
        var pickFrom = res;
        let permisions;
        if (permissionType == 'CAMERA') {
            permisions = await ImagePicker.requestCameraPermissionsAsync();
        } else {
            permisions = await ImagePicker.requestMediaLibraryPermissionsAsync();
        }
        const { status } = permisions;

        if (status == 'granted') {
            setLoader(true);
            let result = await pickFrom({
                allowsEditing: true,
                aspect: [3, 3]
            });
            actionSheetRef.current?.setModalVisible(false);
            if (!result.canceled) {
                setProfileData({
                    ...profileData,
                    profile_image: result.assets[0].uri
                })
                const blob = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        resolve(xhr.response);
                    };
                    xhr.onerror = function () {
                        showAlert(t('image_upload_error'));
                        setLoader(false);
                    };
                    xhr.responseType = 'blob';
                    xhr.open('GET', result.assets[0].uri, true);
                    xhr.send(null);
                });
                if (blob) {
                    try {
                        await updateProfileImage(blob);
                        Alert.alert(t('alert'), t('profile_updated'));
                    } catch (error) {
                        console.error('Error updating profile image:', error);
                        showAlert(t('image_upload_error'));
                    }
                }
                setLoader(false);
            }
            else {
                setLoader(false);
            }
        } else {
            showAlert(t('camera_permission_error'))
        }
    };

    const deleteAccount = () => {
        setDLoading(true);
        setAlertConfig({
            visible: true,
            title: t('delete_account_modal_title'),
            message: t('delete_account_modal_subtitle'),
            type: 'warning',
            showButtons: true,
            confirmText: t('yes'),
            cancelText: t('cancel'),
            onConfirm: () => {
                setAlertConfig(prev => ({ ...prev, visible: false }));
                dispatch(deleteUser(auth.profile.uid));
            },
            onClose: () => {
                setDLoading(false);
                setAlertConfig(prev => ({ ...prev, visible: false }));
            }
        });
    }

    const [otp, setOtp] = useState("");
    const [editName, setEditName] = useState(false);
    const [editEmail, setEditEmail] = useState(false);
    const [editMobile, setEditMobile] = useState(false);
    const [confirmCode, setConfirmCode] = useState(null);

    const [updateCalled, setUpdateCalled] = useState(false);
    const [otpCalled, setOtpCalled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dloading, setDLoading] = useState(false);

    const [emailLoading, setEmailLoading] = useState(false)
    const [mobileLoading, setmobileLoading] = useState(false)
    useEffect(() => {
        if (auth.profile && auth.profile.uid) {
            setProfileData({ ...auth.profile });
            if (updateCalled) {

                setAlertConfig({
                    visible: true,
                    title: t('alert'),
                    message: t('profile_updated'),
                    type: 'success',
                    showButtons: true,
                    confirmText: t('ok'),
                    onConfirm: () => {
                        setAlertConfig(prev => ({ ...prev, visible: false }));
                        setUpdateCalled(false);
                        setEmailLoading(false);
                        setmobileLoading(false);
                    },
                    onClose: () => {
                        setAlertConfig(prev => ({ ...prev, visible: false }));
                        setUpdateCalled(false);
                        setEmailLoading(false);
                        setmobileLoading(false);
                    }
                });
                setUpdateCalled(false);
            }
        }
    }, [auth.profile, updateCalled]);

    const saveName = async () => {

        if (profileData.firstName.length > 0 && profileData.lastName.length > 0) {
            let userData = {
                firstName: profileData.firstName,
                lastName: profileData.lastName
            }
            setUpdateCalled(true);
            dispatch(updateProfile(userData));
            setEditName(false);
        } else {
            setEditName(true)
            showAlert(t('proper_input_name'));
        }
    }

    const validateEmail = (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        const emailValid = re.test(email)
        return emailValid;
    }

    const completeSubmit = () => {
        setLoading(true);
        let userData = {
            mobile: profileData.mobile,
            email: profileData.email
        }
        setUpdateCalled(true);
        dispatch(updateProfile(userData));
        setLoading(false);
        setEditMobile(false);
    }



    const saveProfile = async (set) => {
        if (profileData.email === auth.profile.email && set === 1) {
            setEditEmail(false);
            setLoading(false)
            setEmailLoading(false)
        } else if (profileData.mobile === auth.profile.mobile && set === 2) {
            setEditMobile(false);
            setLoading(false)
            setmobileLoading(false)
            setUserMobile("")
        } else if (profileData.email !== auth.profile.email) {
            if (validateEmail(profileData.email)) {
                setEmailLoading(true)
                checkUserExists({ email: profileData.email }).then((res) => {
                    if (res.users && res.users.length > 0) {
                        showAlert(t('user_exists'));
                        setLoading(false)
                        setEmailLoading(false)
                    }
                    else if (res.error) {
                        showAlert(t('email_or_mobile_issue'));
                        setLoading(false)
                        setEmailLoading(false)
                    } else {
                        setEditEmail(false);
                        profileData['uid'] = auth.profile.uid;
                        dispatch(updateProfileWithEmail(profileData));
                        setUpdateCalled(true);
                        setEmailLoading(false)
                    }
                });
            } else {
                showAlert(t('proper_email'));
                setLoading(false);
            }
        } else {
            if (profileData.mobile !== auth.profile.mobile && profileData.mobile && profileData.mobile.length > 6) {
                checkUserExists({ mobile: profileData.mobile }).then(async (res) => {
                    setmobileLoading(true)
                    if (res.users && res.users.length > 0) {
                        showAlert(t('user_exists'));
                        setLoading(false);
                        setmobileLoading(false)
                        setEditMobile(false);
                    }
                    else if (res.error) {
                        showAlert(t('email_or_mobile_issue'));
                        setLoading(false);
                        setEditMobile(false);
                        setEmailLoading(false)
                    } else {
                        if (settings.customMobileOTP) {
                            setOtpCalled(true);
                            dispatch(requestMobileOtp(profileData.mobile));
                            if (!settings.AllowCriticalEditsAdmin) {
                                showAlert(t('in_demo_mobile_login'));
                            }
                            setmobileLoading(false)
                        } else {
                            const snapshot = await auth()
                                .verifyPhoneNumber(profileData.mobile)
                                .on('state_changed', (phoneAuthSnapshot) => {
                                    if (phoneAuthSnapshot && phoneAuthSnapshot.state === "error") {
                                        setLoading(false);
                                        setEditMobile(false);
                                        setEmailLoading(false);
                                        setmobileLoading(false);
                                        showAlert(t('email_or_mobile_issue'));
                                    }
                                });
                            if (snapshot) {
                                setConfirmCode(snapshot);
                                setOtpCalled(true);
                            }
                        }
                        setUserMobile("")
                    }
                });
            } else {
                showAlert(t('mobile_no_blank_error'))
                setLoading(false)
                setEditMobile(false);
            }
        }
    }

    const handleVerify = async () => {
        setOtpCalled(false);
        if (otp && otp.length === 6 && !isNaN(otp)) {
            if (settings.customMobileOTP) {
                const res = await updateAuthMobile(profileData.mobile, otp);
                if (res.success) {
                    completeSubmit();
                } else {
                    setOtp('');
                    setUserMobile("")
                    setLoading(false);
                    setEmailLoading(false)
                    if (res.error === 'Error updating user') {
                        showAlert(t('user_exists'));
                    } else {
                        showAlert(t('otp_validate_error'));
                    }
                }
            } else {
                const credential = await mobileAuthCredential(
                    confirmCode.verificationId,
                    otp
                );
                updatePhoneNumber(authRef().currentUser, credential).then((res) => {
                    completeSubmit();
                }).catch((error) => {
                    setOtp('');
                    setOtpCalled(true);
                    showAlert(t('otp_validate_error'));
                });
            }
        } else {
            setOtp('');
            setOtpCalled(true);
            showAlert(t('otp_validate_error'));
        }
    }

    const handleClose = () => {
        setOtpCalled(false);
        setLoading(false);
        setEmailLoading(false);
        setEditMobile(false);
        setmobileLoading(false);
    }
    const cancle = (set) => {
        if (set === 0) {
            setEditName(false);
            setProfileData({ ...profileData, firstName: auth.profile.firstName, lastName: auth.profile.lastName })
        } else if (set === 1) {
            setEditEmail(false);
            setProfileData({ ...profileData, email: auth.profile.email })
        } else if (set === 2) {
            setEditMobile(false);
            setProfileData({ ...profileData, mobile: auth.profile.mobile })
            setUserMobile('')
        }
    }

    const onPressBack = () => {
        if (fromPage == 'DriverTrips' || fromPage == 'Map' || fromPage == 'Wallet') {
            props.navigation.navigate('TabRoot', { screen: fromPage });
        } else {
            props.navigation.goBack()
        }
    }

    React.useEffect(() => {
        props.navigation.setOptions({
            headerShown: false,
        });
    }, [props.navigation]);

    const CustomHeader = ({ title, navigation }) => (
        <View style={{
            backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND,
            paddingTop: Platform.OS === 'ios' ? 50 : 30,
            paddingHorizontal: 20,
            paddingBottom: 15,
            elevation: 0,
            shadowOpacity: 0,
        }}>
            <TouchableOpacity
                onPress={onPressBack}
                style={{
                    width: 40,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: isRTL ? 'flex-end' : 'flex-start'
                }}
            >
                <Icon
                    name={isRTL ? 'arrow-right' : 'arrow-back'}
                    type='ionicon'
                    color={mode === 'dark' ? colors.WHITE : colors.BLACK}
                    size={24}
                />
            </TouchableOpacity>
            <Text style={{
                fontFamily: fonts.Bold,
                color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                fontSize: 20,
                marginTop: 8,
                marginLeft: isRTL ? 0 : 0,
                textAlign: isRTL ? 'right' : 'left',
            }}>
                {title}
            </Text>
        </View>
    );


    return (
        <View style={[styles.mainView, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND }]}>
            <CustomHeader title={t('profile_setting_menu')} navigation={props.navigation} />

            <View style={styles.profileImageSection}>
                <TouchableOpacity style={styles.profileImageContainer} onPress={showActionSheet}>
                    {loader ? (
                        <View style={styles.profileImageLoader}>
                            <ActivityIndicator size="large" color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} />
                        </View>
                    ) : (
                        <View style={styles.profileImageWrapper}>
                            <Image
                                source={profileData && profileData.profile_image ?
                                    { uri: profileData.profile_image } :
                                    require('../../assets/images/profilePic.png')
                                }
                                style={styles.profileImage}
                            />
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.userNameSection}>
                <Text style={[styles.userName, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                    {auth.profile && (auth.profile.firstName && auth.profile.lastName)
                        ? `${auth.profile.firstName} ${auth.profile.lastName}`
                        : ''}
                </Text>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.fieldContainer}>
                    <Text style={[styles.fieldLabel, { color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }]}>
                        {t('first_name')}
                    </Text>
                    <TextInput
                        style={[styles.fieldInput, {
                            color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                            backgroundColor: mode === 'dark' ? '#3A3A3A' : '#F5F5F5'
                        }]}
                        value={profileData?.firstName || ''}
                        onChangeText={(text) => {
                            setProfileData({
                                ...profileData,
                                firstName: text
                            });
                        }}
                        placeholder={t('first_name')}
                        placeholderTextColor={mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
                        autoCapitalize="words"
                        autoCorrect={false}
                        keyboardType="default"
                    />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={[styles.fieldLabel, { color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }]}>
                        {t('last_name')}
                    </Text>
                    <TextInput
                        style={[styles.fieldInput, {
                            color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                            backgroundColor: mode === 'dark' ? '#3A3A3A' : '#F5F5F5'
                        }]}
                        value={profileData?.lastName || ''}
                        onChangeText={(text) => {
                            setProfileData({
                                ...profileData,
                                lastName: text
                            });
                        }}
                        placeholder={t('last_name')}
                        placeholderTextColor={mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
                        autoCapitalize="words"
                        autoCorrect={false}
                        keyboardType="default"
                    />
                </View>

                {/* Email Field */}
                <View style={styles.fieldContainer}>
                    <Text style={[styles.fieldLabel, { color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }]}>
                        {t('email')}
                    </Text>
                    <TextInput
                        style={[styles.fieldInput, {
                            color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                            backgroundColor: mode === 'dark' ? '#3A3A3A' : '#F5F5F5'
                        }]}
                        value={profileData?.email}
                        onChangeText={(text) => setProfileData({ ...profileData, email: text })}
                        placeholder={t('email')}
                        placeholderTextColor={mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={[styles.fieldLabel, { color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }]}>
                        {t('mobile')}
                    </Text>
                    <TextInput
                        style={[styles.fieldInput, {
                            color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                            backgroundColor: mode === 'dark' ? '#3A3A3A' : '#F5F5F5'
                        }]}
                        value={profileData?.mobile || ''}
                        onChangeText={(text) => setProfileData({ ...profileData, mobile: text })}
                        placeholder={t('mobile')}
                        placeholderTextColor={mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
                        keyboardType="phone-pad"
                    />
                </View>

                {((auth.profile && auth.profile.usertype === 'driver' && settings && settings.showSocialSecurityDrivers) ||
                    (auth.profile && auth.profile.usertype === 'customer' && settings && settings.showSocialSecurityRiders)) ?
                    <View style={styles.fieldContainer}>
                        <Text style={[styles.fieldLabel, { color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }]}>
                            {t('social_security')}
                        </Text>
                        <TextInput
                            style={[styles.fieldInput, {
                                color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                backgroundColor: mode === 'dark' ? '#3A3A3A' : '#F5F5F5'
                            }]}
                            value={profileData?.socialSecurity || ''}
                            onChangeText={(text) => {
                                const numericValue = text.replace(/\D/g, '');
                                setProfileData({ ...profileData, socialSecurity: numericValue });
                            }}
                            placeholder={t('social_security')}
                            placeholderTextColor={mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
                            keyboardType="numeric"
                        />
                    </View>
                    : null}

                {langSelection && languagedata && languagedata.langlist && languagedata.langlist.length > 1 && (
                    <View style={styles.fieldContainer}>
                        <Text style={[styles.fieldLabel, { color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }]}>
                            {t('language')}
                        </Text>
                        <View style={[styles.fieldInput, {
                            backgroundColor: mode === 'dark' ? '#3A3A3A' : '#F5F5F5',
                            paddingVertical: 0,
                            paddingHorizontal: 0,
                        }]}>
                            <RNPickerSelect
                                pickerRef={pickerRef1}
                                placeholder={{}}
                                value={langSelection}
                                useNativeAndroidPickerStyle={false}
                                style={{
                                    inputIOS: {
                                        fontSize: 14,
                                        fontFamily: fonts.Regular,
                                        color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                        paddingVertical: 12,
                                        paddingHorizontal: 12,
                                    },
                                    inputAndroid: {
                                        fontSize: 14,
                                        fontFamily: fonts.Regular,
                                        color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                        paddingVertical: 12,
                                        paddingHorizontal: 12,
                                    },
                                    placeholder: {
                                        color: mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'
                                    }
                                }}
                                onValueChange={(text) => {
                                    let defl = null;
                                    for (const value of Object.values(languagedata.langlist)) {
                                        if (value.langLocale == text) {
                                            defl = value;
                                        }
                                    }
                                    setLangSelection(text);
                                    i18n.locale = text;
                                    moment.locale(defl.dateLocale);
                                    setIsRTL(text == 'he' || text == 'ar')
                                    AsyncStorage.setItem('lang', JSON.stringify({ langLocale: text, dateLocale: defl.dateLocale }));
                                    dispatch(updateProfile({ lang: { langLocale: text, dateLocale: defl.dateLocale } }));
                                }}
                                items={Object.values(languagedata.langlist).map(function (value) {
                                    return { label: value.langName, value: value.langLocale };
                                })}
                                Icon={() => {
                                    return (
                                        <MaterialIcons
                                            name="keyboard-arrow-down"
                                            size={20}
                                            color={mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'}
                                            style={{ marginRight: 12, marginTop: 12 }}
                                        />
                                    );
                                }}
                                mode={mode}
                            />
                        </View>
                    </View>
                )}

                {profileData && profileData.referralId && (
                    <View style={styles.fieldContainer}>
                        <Text style={[styles.fieldLabel, { color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }]}>
                            {t('referralId')}
                        </Text>
                        <TextInput
                            style={[styles.fieldInput, {
                                color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                backgroundColor: mode === 'dark' ? '#3A3A3A' : '#F5F5F5'
                            }]}
                            value={profileData.referralId}
                            editable={false}
                            placeholder={t('referralId')}
                            placeholderTextColor={mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
                        />
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.updateButton, { backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}
                    onPress={() => {
                        if (profileData.firstName && profileData.lastName) {
                            if (settings && settings.socialSecurityRequired) {
                                const shouldShowField = (auth.profile && auth.profile.usertype === 'driver' && settings.showSocialSecurityDrivers) ||
                                    (auth.profile && auth.profile.usertype === 'customer' && settings.showSocialSecurityRiders);
                                if (shouldShowField && (!profileData.socialSecurity || profileData.socialSecurity.trim() === '')) {
                                    showAlert(t('social_security_required') || 'Social Security es requerido');
                                    return;
                                }
                            }
                            let userData = {
                                firstName: profileData.firstName,
                                lastName: profileData.lastName,
                                email: profileData.email,
                                mobile: profileData.mobile,
                                socialSecurity: profileData.socialSecurity || ''
                            };
                            setUpdateCalled(true);
                            dispatch(updateProfile(userData));
                        }
                    }}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.WHITE} size="small" />
                    ) : (
                        <Text style={styles.updateButtonText}>{t('save')}</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.updateButton, { backgroundColor: colors.RED, marginTop: 10 }]}
                    onPress={deleteAccount}
                >
                    {dloading ? (
                        <ActivityIndicator color={colors.WHITE} size="small" />
                    ) : (
                        <Text style={styles.updateButtonText}>{t('delete_account_lebel')}</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {uploadImage()}
            <WaygoDialog
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                showButtons={alertConfig.showButtons}
                onConfirm={alertConfig.onConfirm}
                onClose={alertConfig.onClose}
                confirmText={alertConfig.confirmText}
                cancelText={alertConfig.cancelText}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    mainView: {
        flex: 1,
    },
    profileImageSection: {
        alignItems: 'center',
        marginVertical: 16,
    },
    profileImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#E2E6EA',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    profileImageWrapper: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    profileImageLoader: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userNameSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    userName: {
        fontSize: 18,
        fontFamily: fonts.Bold,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 12,
        fontFamily: fonts.Regular,
        marginBottom: 6,
    },
    fieldInput: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 0,
    },
    updateButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        marginBottom: 30,
    },
    updateButtonText: {
        fontSize: 14,
        fontFamily: fonts.Bold,
        color: colors.WHITE,
    },
});