import React, { useState, useRef, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    Alert,
    TextInput,
    Image,
    Platform,
    Linking,
    Keyboard,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    useColorScheme,
    SafeAreaView
} from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { api } from 'common';
import { colors } from '../common/theme';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from "expo-crypto";
import i18n from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import moment from 'moment/min/moment-with-locales';
import rnauth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
var { width,height } = Dimensions.get('window');
import ClientIds from '../../config/ClientIds';
import { MAIN_COLOR, MAIN_COLOR_DARK } from "../common/sharedFunctions";
import { fonts } from "../common/font";
import { Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectItem, ChevronDownIcon } from '@gluestack-ui/themed';
import RNPickerSelect from '../components/RNPickerSelect';

GoogleSignin.configure(ClientIds);

export default function LoginScreen(props) {
    const {
        clearLoginError,
        requestPhoneOtpDevice,
        mobileSignIn,
        googleLogin,
        countries,
        appleSignIn,
        verifyEmailPassword,
        sendResetMail,
        checkUserExists,
        requestMobileOtp,
        verifyMobileOtp
    } = api;
    const auth = useSelector(state => state.auth);
    const settings = useSelector(state => state.settingsdata.settings);
    const dispatch = useDispatch();

    const formatCountries = () => {
        let arr = [];
        for (let i = 0; i < countries.length; i++) {
            let txt = countries[i].label + " (+" + countries[i].phone + ")";
            arr.push({ label: txt, value: txt, key: txt });
        }
        return arr;
    }

    const [state, setState] = useState({
        entryType: null,
        contact: null,
        verificationId: null,
        verificationCode: null,
        countryCodeList: formatCountries(),
        countryCode: null
    });

    const pageActive = useRef(false);
    const [loading, setLoading] = useState(false);
    const [newUserText, setNewUserText] = useState(false);

    const { t } = i18n;
    const [isRTL, setIsRTL] = useState();
    const [langSelection, setLangSelection] = useState();
    const languagedata = useSelector(state => state.languagedata);
    const [eyePass, setEyePass] = useState(true);
    const [isNewUser, setIsNewUser] = useState(false);
    const pickerRef1 = React.createRef();
    const pickerRef2 = React.createRef();
    const [keyboardStatus, setKeyboardStatus] = useState("Keyboard Hidden");
    let colorScheme = useColorScheme();
    const [mode, setMode] = useState();

    useEffect(() => {
        AsyncStorage.getItem('theme', (err, result) => {
            if (result) {
                const theme = JSON.parse(result)['mode']
                if (theme === 'system'){
                    setMode(colorScheme);
                }else{
                    setMode(theme);
                }
            }else{
                setMode('light');
            }
        });
    }, [colorScheme]);

    useEffect(() => {
        AsyncStorage.getItem('lang', (err, result) => {
            if (result) {
                const langLocale = JSON.parse(result)['langLocale']
                setIsRTL(langLocale == 'he' || langLocale == 'ar')
                setLangSelection(langLocale);
            } else {
                setIsRTL(i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0)
                setLangSelection(i18n.locale);
            }
        });
    }, []);

    useEffect(() => {
        if (settings) {
            for (let i = 0; i < countries.length; i++) {
                if (countries[i].label == settings.country) {
                    setState({ ...state, countryCode: settings.country + " (+" + countries[i].phone + ")" })
                }
            }
        }
    }, [settings]);

    useEffect(() => {
        if (auth.profile && pageActive.current) {
            pageActive.current = false;
            setLoading(false);
            setNewUserText(false);
        }
        if (auth.error && auth.error.msg && pageActive.current && auth.error.msg.message !== t('not_logged_in')) {
            pageActive.current = false;
            setState({ ...state, verificationCode: '' });
            Alert.alert(t('alert'), t('login_error'));

            dispatch(clearLoginError());
            setLoading(false);
        }
        if (auth.verificationId) {
            pageActive.current = false;
            setState({ ...state, verificationId: auth.verificationId });
            setLoading(false);
        }
    }, [auth.profile, auth.error, auth.error.msg, auth.verificationId]);

    const onPressLogin = async () => {
        setLoading(true);
        if (state.countryCode && state.countryCode !== t('select_country')) {
            if (state.contact) {
                const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                if (!settings.mobileLogin && !re.test(state.contact)) {
                    Alert.alert(t('alert'), t('proper_email'));
                    setLoading(false);
                    return;
                }else if(re.test(state.contact) && !state.verificationCode){
                    Alert.alert(t('alert'), t('password_blank_messege'));
                    setLoading(false);
                    return;
                } else if (isNaN(state.contact)) {
                    setState({ ...state, entryType: 'email' });
                    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    if (re.test(state.contact)) {
                        pageActive.current = true;
                        dispatch(verifyEmailPassword(
                            state.contact,
                            state.verificationCode
                        ));
                    } else {
                        Alert.alert(t('alert'), t('proper_email'));
                        setLoading(false);
                    }
                } else {
                    setState({ ...state, entryType: 'mobile' });
                    if(!settings.AllowCriticalEditsAdmin){
                        Alert.alert(t('alert'), t('in_demo_mobile_login'));
                    }
                    let formattedNum = state.contact.replace(/ /g, '');
                    formattedNum = state.countryCode.split("(")[1].split(")")[0] + formattedNum.replace(/-/g, '');
                    
                    console.log('🔍 LOGIN - Datos de verificación:', {
                        originalContact: state.contact,
                        countryCode: state.countryCode,
                        formattedNum: formattedNum,
                        formattedNumLength: formattedNum.length
                    });
                    
                    if (formattedNum.length > 6) {
                        console.log('📞 LOGIN - Llamando checkUserExists con:', { mobile: formattedNum });
                        checkUserExists({ mobile: formattedNum }).then(async (res) => {
                            console.log('✅ LOGIN - Respuesta de checkUserExists:', {
                                success: !!res.users,
                                usersCount: res.users ? res.users.length : 0,
                                hasError: !!res.error,
                                errorDetails: res.error,
                                fullResponse: res
                            });
                            
                            if (res.users && res.users.length > 0) {
                                console.log('👤 LOGIN - Usuario existente encontrado:', res.users[0]);
                                setIsNewUser(false);
                                if (auth.verificationId) {
                                    pageActive.current = false;
                                    setState({ ...state, verificationId: auth.verificationId });
                                    setLoading(false);
                                }
                                if (settings.customMobileOTP) {
                                    dispatch(requestMobileOtp(formattedNum));
                                } else {
                                    rnauth().verifyPhoneNumber(formattedNum).then((confirmation) => {
                                        if (confirmation && confirmation.verificationId) {
                                            dispatch(requestPhoneOtpDevice(confirmation.verificationId));
                                        } else {
                                            Alert.alert(t('alert'), t('auth_error'));
                                            setLoading(false);
                                        }
                                    }).catch((error) => {
                                        Alert.alert(t('alert'), t('auth_error'));
                                        setLoading(false);
                                    });
                                }
                            }
                            else if (res.error) {
                                console.error('❌ LOGIN - Error en checkUserExists:', {
                                    error: res.error,
                                    errorType: typeof res.error,
                                    errorMessage: res.error?.message,
                                    errorCode: res.error?.code,
                                    errorStack: res.error?.stack,
                                    fullError: JSON.stringify(res.error, null, 2)
                                });
                                Alert.alert(t('alert'), t('email_or_mobile_issue'));
                                setLoading(false);
                            } else {
                                console.log('🆕 LOGIN - Usuario nuevo, no encontrado en BD');
                                setIsNewUser(true);
                                if (settings.customMobileOTP) {
                                    dispatch(requestMobileOtp(formattedNum));
                                } else {
                                    rnauth().verifyPhoneNumber(formattedNum).then((confirmation) => {
                                        if (confirmation && confirmation.verificationId) {
                                            dispatch(requestPhoneOtpDevice(confirmation.verificationId));
                                        } else {
                                            Alert.alert(t('alert'), t('auth_error'));
                                            setLoading(false);
                                        }
                                    }).catch((error) => {
                                        Alert.alert(t('alert'), t('auth_error'));
                                        setLoading(false);
                                    });
                                }
                            }
                        });
                    } else {
                        Alert.alert(t('alert'), t('mobile_no_blank_error'));
                        setLoading(false);
                    }
                }
            } else {
                Alert.alert(t('alert'), t('contact_input_error'));
                setLoading(false);
            }
        } else {
            Alert.alert(t('alert'), t('country_blank_error'));
            setLoading(false);
        }
    }
    const onSignIn = async () => {
        if (state.verificationCode) {
            setLoading(true);
            if (isNewUser) {
                setNewUserText(true);
            }
            pageActive.current = true;
            if (settings.customMobileOTP) {
                let formattedNum = state.contact.replace(/ /g, '');
                formattedNum = state.countryCode.split("(")[1].split(")")[0] + formattedNum.replace(/-/g, '');
                dispatch(verifyMobileOtp(
                    formattedNum,
                    state.verificationCode
                ));
            } else {
                dispatch(mobileSignIn(
                    state.verificationId,
                    state.verificationCode
                ));
            }
        } else {
            setNewUserText(false);
            Alert.alert(t('alert'), t('otp_blank_error'));
            setLoading(false);
        }
    }

    const CancelLogin = () => {
        setNewUserText(false);
        setState({
            ...state,
            contact: null,
            verificationId: null,
            verificationCode: null
        });
    }
    const GoogleLogin = async () => {
        await GoogleSignin.signOut();
        GoogleSignin.hasPlayServices().then((hasPlayService) => {
            if (hasPlayService) {
                GoogleSignin.signIn().then(async (userInfo) => {
                    if (userInfo.idToken) {
                        pageActive.current = true;
                        dispatch(googleLogin(userInfo.idToken, null))
                        setLoading(true);
                    } else {
                        const { accessToken } = await GoogleSignin.getTokens();
                        if (accessToken) {
                            pageActive.current = true;
                            dispatch(googleLogin(null, accessToken))
                            setLoading(true);
                        } else {
                            console.log("ERROR IS: No Tokens");
                        }
                    }
                }).catch((e) => {
                    console.log("ERROR IS: " + JSON.stringify(e));
                })
            }
        }).catch((e) => {
            console.log("ERROR IS: " + JSON.stringify(e));
        })
    }

    const AppleLogin = async () => {
        const csrf = Math.random().toString(36).substring(2, 15);
        const nonce = Math.random().toString(36).substring(2, 10);
        const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
        try {
            const applelogincredentials = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
                state: csrf,
                nonce: hashedNonce
            });

            pageActive.current = true;
            dispatch(appleSignIn({
                idToken: applelogincredentials.identityToken,
                rawNonce: nonce,
            }));

        } catch (error) {
            if (error.code === 'ERR_CANCELED') {
                console.log(error);
            } else {
                Alert.alert(t('alert'), t('apple_signin_error'));
            }
        }
    }

    const openRegister = () => {
        pageActive.current = false;
        props.navigation.navigate("Register")
    }

    const openTerms = async () => {
        Linking.openURL(settings.CompanyTerms).catch(err => console.error("Couldn't load page", err));
    }

    const forgotPassword = () => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (re.test(state.contact)) {
            Alert.alert(
                t('alert'),
                t('set_link_email'),
                [
                    { text: t('cancel'), onPress: () => { }, style: 'cancel' },
                    {
                        text: t('ok'), onPress: () => {
                            pageActive.current = true;
                            dispatch(sendResetMail(state.contact));
                        },
                    },
                ],
                { cancelable: true },
            );
        } else {
            Alert.alert(t('alert'), t('proper_email'));
            setLoading(false);
        }
    }

    useEffect(() => {

        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardStatus('Keyboard Shown');
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardStatus('Keyboard Hidden');
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.header}> 
                    {langSelection && languagedata && languagedata.langlist && languagedata.langlist.length > 1 ?
                        <View style={[styles.headLanuage, [isRTL ? { left: 20 } : { right: 20 }]]}> 
                            <Select selectedValue={langSelection} onValueChange={(text) => {
                                let defl = null;
                                for (const value of Object.values(languagedata.langlist)) {
                                    if (value.langLocale == text) {
                                        defl = value;
                                    }
                                }
                                setLangSelection(text);
                                i18n.locale = text;
                                moment.locale(defl?.dateLocale || 'en');
                                setIsRTL(text == 'he' || text == 'ar')
                                AsyncStorage.setItem('lang', JSON.stringify({ langLocale: text, dateLocale: defl?.dateLocale || 'en' }));
                            }}>
                                <SelectTrigger size="sm" variant="outline" bg={colors.WHITE} borderColor="#E2E9EC" borderRadius={8} style={{ alignItems: 'center', paddingHorizontal: 8, minWidth: 120, justifyContent: 'space-between' }}>
                                    <View style={styles.selectSpacer} />
                                    <Text style={styles.selectText}>{(Object.values(languagedata.langlist).find((v) => v.langLocale === langSelection))?.langName || t('lang1')}</Text>
                                    <SelectIcon as={ChevronDownIcon} />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                        {Object.values(languagedata.langlist).map(function (value) { 
                                            return (
                                                <SelectItem key={value.langLocale} label={value.langName} value={value.langLocale} />
                                            );
                                        })}
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                        </View>
                     : null}
                </View>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.inputLabel}>{settings.emailLogin && settings.mobileLogin ? t('contact_placeholder') : settings.emailLogin && !settings.mobileLogin ? t('email_id') : t('mobile_number')}</Text>
                    <View style={styles.contactRow}>
                        {(state.contact && /^\d+$/.test(state.contact) && settings.mobileLogin) ? (
                            <View style={styles.countryBoxSmall}>
                                <View style={styles.countryPickerWrapper}>
                                    <RNPickerSelect
                                        pickerRef={pickerRef2}
                                        placeholder={{ label: '+', value: t('select_country') }}
                                        value={state.countryCode}
                                        useNativeAndroidPickerStyle={false}
                                        onTap={() => {
                                            if (settings && settings.AllowCountrySelection) {
                                                Keyboard.dismiss();
                                                pickerRef2.current && pickerRef2.current.focus && pickerRef2.current.focus();
                                            }
                                        }}
                                                                style={{
                            viewContainer: styles.countryPickerContainer,
                            inputIOS: [
                                styles.countryPickerInput,
                                {
                                    paddingVertical: 13,
                                    lineHeight: undefined,
                                    textAlignVertical: undefined
                                }
                            ],
                            inputAndroid: [
                                styles.countryPickerInput,
                                {
                                    paddingVertical: 0,
                                    lineHeight: 44,
                                    textAlignVertical: 'center'
                                }
                            ]
                        }}
                                        onValueChange={(value) => {
                                            if (!settings?.AllowCountrySelection) return;
                                            setState({ ...state, countryCode: value });
                                        }}
                                        items={state.countryCodeList.map((it) => {
                                            const match = it.value && it.value.match(/\(\+(\d+)\)/);
                                            const codePart = match && match[1] ? `+${match[1]}` : (it.label?.startsWith('+') ? it.label : `+${it.label}`);
                                            return { ...it, label: codePart };
                                        })}
                                        disabled={!settings?.AllowCountrySelection}
                                        mode={mode}
                                    />
                                </View>
                            </View>
                        ) : null}
                        <View style={styles.contactInputWrap}>
                            <TextInput
                                style={[styles.input, (state.contact && /^\d+$/.test(state.contact) && settings.mobileLogin) ? styles.inputPhone : null]}
                                placeholder={''}
                                placeholderTextColor={colors.SHADOW}
                                value={state.contact ?? ''}
                                onChangeText={(value) => {
                                    if (!settings.emailLogin) {
                                        const numericValue = value.replace(/[^0-9]/g, '');
                                        setState({ ...state, contact: numericValue });
                                    } else {
                                        setState({ ...state, contact: value });
                                    }
                                }}
                                autoCapitalize="none"
                                keyboardType={(settings.emailLogin && settings.mobileLogin) ? 'default' : settings.emailLogin ? 'email-address' : 'number-pad'}
                            />
                        </View>
                    </View>

                    { (isNaN(state.contact) || (settings.emailLogin && !settings.mobileLogin)) ? (
                        <View style={styles.passwordContainer}>
                            <Text style={styles.inputLabel}>{t('password')}</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={''}
                                    placeholderTextColor={colors.SHADOW}
                                    secureTextEntry={eyePass}
                                    value={state.verificationCode ?? ''}
                                    onChangeText={(value) => setState({ ...state, verificationCode: value })}
                                />
                                <TouchableOpacity onPress={() => setEyePass(!eyePass)} style={styles.eyeToggle}>
                                    <Feather name={eyePass ? 'eye-off' : 'eye'} size={20} color={colors.BLACK} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : null }

                    { (isNaN(state.contact) || (settings.emailLogin && !settings.mobileLogin)) ? (
                        <TouchableOpacity style={styles.forgotContainer} onPress={forgotPassword}>
                            <Text style={styles.forgotText}>{t('forgot_password')}</Text>
                        </TouchableOpacity>
                    ) : null }

                    { !!state.verificationId ? (
                        <>
                            <Text style={styles.inputLabel}>{t('otp_here')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={''}
                                placeholderTextColor={colors.SHADOW}
                                value={state.verificationCode ?? ''}
                                onChangeText={(value) => setState({ ...state, verificationCode: value })}
                                keyboardType={'number-pad'}
                                secureTextEntry={true}
                            />
                            <TouchableOpacity style={styles.loginButton} onPress={onSignIn}>
                                {loading ? (
                                    <ActivityIndicator color={colors.WHITE} />
                                ) : (
                                    <Text style={styles.loginButtonText}>{t('verify_otp')}</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity style={styles.loginButton} onPress={onPressLogin}>
                            {loading ? (
                                <ActivityIndicator color={colors.WHITE} />
                            ) : (
                                <Text style={styles.loginButtonText}>
                                    {settings.mobileLogin ? (isNaN(state.contact) ? t('signIn') : t('request_otp')) : t('signIn')}
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {settings.socialLogin ?
                    <View>
                        <View style={styles.seperator}>
                            <View style={styles.lineLeft}></View>
                            <View style={styles.lineLeftFiller}>
                                <Text style={[styles.sepText, {color: colors.BLACK}]}>{t('spacer_message')}</Text>
                            </View>
                            <View style={styles.lineRight}></View>
                        </View>
                        <View style={styles.socialBar}>
                            <TouchableOpacity style={styles.socialIcon} onPress={GoogleLogin}>
                                <Image
                                    source={require("../../assets/images/image_google.png")}
                                    resizeMode="contain"
                                    style={styles.socialIconImage}
                                />
                            </TouchableOpacity>
                            {Platform.OS == 'ios' ?
                                <TouchableOpacity style={styles.socialIcon} onPress={AppleLogin}>
                                    <Image
                                        source={require("../../assets/images/image_apple.png")}
                                        resizeMode="contain"
                                        style={styles.socialIconImage}
                                    />
                                </TouchableOpacity>
                            : null}
                        </View>
                    </View>
                : null}

                <View style={styles.bottomLinksContainer}>
                    <TouchableOpacity onPress={openRegister} style={styles.bottomLinkItem}>
                        <Text style={styles.bottomLinkText}>{t('register_as_driver')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={openTerms} style={styles.bottomLinkItem}>
                        <Text style={styles.bottomLinkText}>{t('terms')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.WHITE
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: colors.WHITE
    },
    logoContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        minHeight: height * 0.32,
        marginTop: height * 0.06,
        marginBottom: 0
    },
    logo: {
        width: Math.min(width * 0.6, 260),
        height: Math.min(height * 0.16, 130)
    },
    formContainer: {
        width: '100%',
        maxWidth: 500,
        alignItems: 'center'
    },
    langRow: {
        width: '100%',
        alignItems: 'flex-end',
        marginBottom: 8
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#E2E9EC',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === 'ios' ? 13 : 0,
        fontSize: 16,
        backgroundColor: colors.WHITE,
        marginBottom: 12,
        fontFamily: fonts.Regular,
        height: 44,
        lineHeight: Platform.OS === 'android' ? 44 : undefined,
        textAlignVertical: Platform.OS === 'android' ? 'center' : undefined
    },
    inputLabel: {
        width: '100%',
        fontSize: 13,
        color: '#A7A9AC',
        marginBottom: 6,
        fontFamily: fonts.Bold
    },
    passwordContainer: {
        width: '100%',
        position: 'relative'
    },
    inputWrapper: {
        position: 'relative',
        width: '100%'
    },
    eyeToggle: {
        position: 'absolute',
        right: 12,
        top: 12,
        height: 24,
        width: 24,
        justifyContent: 'center',
        alignItems: 'center'
    },
    forgotContainer: {
        width: '100%',
        alignItems: 'flex-end',
        marginBottom: 16
    },
    forgotText: {
        fontSize: 12,
        color: '#000000',
        fontFamily: fonts.Regular
    },
    loginButton: {
        width: '100%',
        backgroundColor: '#1369B4',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4
    },
    loginButtonText: {
        color: colors.WHITE,
        fontSize: 16,
        fontFamily: fonts.Bold
    },
    bottomLinksContainer: {
        width: '100%',
        maxWidth: 500,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16
    },
    bottomLinkText: {
        color: '#000000',
        fontSize: 14,
        fontFamily: fonts.Regular
    },
    bottomLinkItem: {
        marginHorizontal: 12
    },
    languageBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0.4,
        borderColor: colors.SHADOW,
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginBottom: 12
    },
    languageLabel: {
        color: colors.BLACK,
        marginRight: 6,
        fontFamily: fonts.Regular,
        fontSize: 12
    },
    languagePickerWrapper: {
        minWidth: 90
    },
    languagePicker: {
        width: 90,
        fontSize: 14,
        height: 28,
        fontFamily: fonts.Bold,
        color: colors.BLACK,
        backgroundColor: colors.WHITE
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 6.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        width: "100%",
        position: 'absolute',
        top: 10,
    },
    container: {
        flex: 1,
        //backgroundColor: colors.BACKGROUND,
        // alignItems: 'center',
        //width: '100%',
        //height: '100%',
        //gap: 5,
    },
    imagebg: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height + (Platform.OS == 'android' && !__DEV__ ? 40 : 40),
    },
    topBar: {
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        height: (Dimensions.get('window').height * 0.52) + (Platform.OS == 'android' && !__DEV__ ? 40 : 0),
    },
    backButton: {
        height: 40,
        width: 40,
        marginTop: 30,
    },
    segmentcontrol: {
        color: colors.WHITE,
        fontSize: 18,
        fontFamily: "Roboto-Regular",
        marginTop: 0,
        alignSelf: "center",
        height: 50,
        marginLeft: 35,
        marginRight: 35
    },
    box2: {
        width: width-25,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        position: 'relative',
    },
    passwordBox:{
        width: width-25,
        alignItems: 'center',
        paddingVertical: 5,
        borderRadius: 10,
        justifyContent:'space-around',
        borderWidth: 1,
        borderColor: colors.SHADOW
    },
    hideButton:{
        height: 40,
        justifyContent:'center', 
        alignItems:'center'
    },
    textInput: {
        fontSize: 18,
        width: '100%',
        fontFamily:fonts.Bold,
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: colors.SHADOW
    },
    pasWordText:{
        fontSize: 18,
        fontFamily: fonts.Bold,
        width:"80%",
    },
    materialButtonDark: {
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        minWidth: "100%"
    },
    onClickButton: {
        backgroundColor: colors.WHITE,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        minWidth: "100%",
        height: 52,
    },
    ButtonText: {
        fontFamily: fonts.Bold,
        color: colors.WHITE,
        fontSize: 18,
        paddingVertical: 6
    },
   
    linkBar: {
        flexDirection: "row",
        marginTop: 30,
        alignSelf: 'center'
    },
    barLinks: {
        marginLeft: 15,
        marginRight: 15,
        alignSelf: "center",
        fontSize: 18,
        fontFamily: fonts.Bold,
    },
    linkText: {
        fontSize: 16,
        color: colors.WHITE,
        fontFamily: fonts.Bold,
    },
    box1: {
        height: 48,
        backgroundColor: colors.WHITE,
        width: '100%',
        justifyContent: 'center',
        borderRadius: 10,
    },
    pickerStyle: {
        height: 48,
        color: colors.BLACK,
        fontFamily:fonts.Bold,
        fontSize: 16,
        width: '100%',
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E9EC'
    },
    actionText: {
        fontSize: 15,
        fontFamily: fonts.Bold
    },
    actionLine: {
        flexDirection: "row",
        justifyContent:"center",
        alignItems:'center',
        backgroundColor:"red"
    },
    actionItem: {
        marginLeft: 15,
        marginRight: 15,
    },
    seperator: {
        width: 250,
        height: 20,
        flexDirection: "row",
        marginTop: 15,
        alignSelf: 'center'
    },
    lineLeft: {
        width: 50,
        height: 1,
        backgroundColor: '#E2E9EC',
        marginTop: 9
    },
    sepText: {
        color: colors.BLACK,
        fontSize: 14,
        fontFamily: fonts.Regular,
        opacity: .8,
    },
    lineLeftFiller: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center"
    },
    lineRight: {
        width: 50,
        height: 1,
        backgroundColor: '#E2E9EC',
        marginTop: 9
    },
    socialBar: {
        height: 40,
        flexDirection: "row",
        marginTop: 10,
        alignSelf: 'center'
    },
    socialIcon: {
        width: 45,
        backgroundColor: colors.WHITE,
        justifyContent: 'center',
        borderRadius: 10,
        marginHorizontal: 2,
        padding: 5 ,
        shadowColor: colors.BLACK,
        shadowOffset: {
        width: 0,
        height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        marginLeft: 15,
        marginRight: 15
        },
        socialIconImage: {
        width: 35,
        height: 35,
        
        },
    footer: {
        marginTop: Platform.OS === 'ios' ? 20 : 12,
        justifyContent: "space-around",
        width:"100%",
        marginBottom: 15,
    },
    terms: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: "center",
        opacity: .65,
        width:100
    },
    pickerStyle1: {
        width: 68,
        fontSize: 15,
        height: 30,
        fontFamily:fonts.Bold,
    },
    headLanuage: {
        position: 'absolute',
        top: Platform.OS == 'android' && !__DEV__ ? 40 : 35,
        flexDirection: 'row',
        borderWidth: 0,
        borderRadius: 0,
        alignItems: 'center',
        paddingHorizontal: 0,
        minWidth: 0,
        borderColor: 'transparent'
    },
    dropdownPrefix: {
        color: '#A7A9AC',
        fontSize: 12,
        marginRight: 6,
        fontFamily: fonts.Regular
    },
    selectText: {
        color: colors.BLACK,
        fontSize: 12,
        textAlign: 'center',
        marginRight: 6,
        fontFamily: fonts.Regular
    },
    selectSpacer: {
        width: 16
    },
    contactRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'stretch',
        columnGap: 8,
        marginBottom: 12
    },
    countryBoxSmall: {
        width: 84,
        height: 44,
    },
    countryPickerWrapper: {
        flex: 1,
        height: 44,
        justifyContent: 'center',
    },
    countryPickerContainer: {
        height: 44,
        justifyContent: 'center'
    },
    countryPickerInput: {
        height: 44,
        color: colors.BLACK,
        fontFamily: fonts.Regular,
        fontSize: 16,
        width: '100%',
        paddingHorizontal: 12,
        paddingVertical: 0,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E9EC',
        backgroundColor: colors.WHITE,
        textAlign: 'center'
    },
    contactInputWrap: {
        flex: 1
    },
    inputPhone: {
        paddingVertical: Platform.OS === 'ios' ? 13 : 0,
        lineHeight: Platform.OS === 'android' ? 44 : undefined,
        textAlignVertical: Platform.OS === 'android' ? 'center' : undefined
    }
});