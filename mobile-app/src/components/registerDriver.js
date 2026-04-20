import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    View,
    Text,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Alert,
    TouchableOpacity,
    TextInput,
    useColorScheme,
    Animated,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/ui/input';
import { colors } from '../common/theme';
var { height,width } = Dimensions.get('window');
import i18n from 'i18n-js';

import { useSelector,useDispatch } from 'react-redux';
import { api } from 'common';
import { requestEmailOtp, verifyEmailOtp } from 'common/src/actions/authactions';
import { Feather, Ionicons, AntDesign } from '@expo/vector-icons';
import { Keyboard } from 'react-native';
import { Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectItem, ChevronDownIcon } from '@gluestack-ui/themed';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import Button from './Button';
import { fonts } from '../common/font';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RegistrationDocumentStep from './RegistrationDocumentStep';
import RegistrationBiometricStep from './RegistrationBiometricStep';
import RegistrationEarningsStep from './RegistrationEarningsStep';
import RegistrationBackgroundCheckStep from './RegistrationBackgroundCheckStep';

const hasNotch = DeviceInfo.hasNotch();

export default function RegistrationDriver(props) {
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const {
        countries,
        editreferral
    } = api;
    const [state, setState] = useState({
        usertype: 'driver',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        mobile: '',
        referralId: '',
        socialSecurity: '',
        ageRange: ''
    });
    const dispatch = useDispatch();
    const [countryCode, setCountryCode] = useState();
    const [mobileWithoutCountry, setMobileWithoutCountry] = useState('');
    const settings = useSelector(state => state.settingsdata.settings);
    const [confirmpassword, setConfirmPassword] = useState('');
    const [eyePass, setEyePass] = useState(true);
    const [eyeConfirmPass, setEyeConfirmPass] = useState(true);

    const [firstNameFocus, setFirstNameFocus] = useState(false)
    const [lastNameFocus, setlastNameFocus] = useState(false)
    const [EmailFocus, setEmailFocus] = useState(false)
    const [countrycodeFocus, setCountryCodeFocus] = useState(false)
    const [numberFocus, setNumberFocus] = useState(false)
    const [passwordFocus, setpasswordFocus] = useState(false)
    const [confirmPasswordFocus, setconfirmPasswordFocus] = useState(false)
    const [referralIdFocus, setreferralIdFocus] = useState(false)
    const useduserReferral = useSelector(state => state.usedreferralid.usedreferral);
    let colorScheme = useColorScheme();
    const [mode, setMode] = useState('');
    
    const [currentStep, setCurrentStep] = useState(1);
    const [documentImage, setDocumentImage] = useState(null);
    const [documentImageBlob, setDocumentImageBlob] = useState(null);
    const [selfieImage, setSelfieImage] = useState(null);
    const [selfieImageBlob, setSelfieImageBlob] = useState(null);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [backgroundCheckAccepted, setBackgroundCheckAccepted] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailOtpVerified, setEmailOtpVerified] = useState(false);
    const [emailOtpSending, setEmailOtpSending] = useState(false);
    const [emailOtpVerifying, setEmailOtpVerifying] = useState(false);

    const headerTranslateY = useRef(new Animated.Value(0)).current;
    const formTranslateY = useRef(new Animated.Value(0)).current;
    const headerOpacity = useRef(new Animated.Value(1)).current;
    const headerScale = useRef(new Animated.Value(1)).current;

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
        const keyboardWillShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (event) => {
                const keyboardHeight = event.endCoordinates.height;
                Animated.parallel([
                    Animated.timing(headerTranslateY, {
                        toValue: -50,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(headerOpacity, {
                        toValue: 0.7,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(headerScale, {
                        toValue: 0.8,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(formTranslateY, {
                        toValue: Platform.OS === 'ios' ? -30 : -20,
                        duration: 300,
                        useNativeDriver: true,
                    })
                ]).start();
            }
        );

        const keyboardWillHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                Animated.parallel([
                    Animated.timing(headerTranslateY, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(headerOpacity, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(headerScale, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(formTranslateY, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    })
                ]).start();
            }
        );

        return () => {
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, []);

    const { loading } = props


    const formatCountries = useMemo(() => {
        let arr = [];
        let countriesToShow = countries;
        
        if (settings?.restrictCountry) {
            countriesToShow = countries.filter(country => country.code === "US" || country.code === "CO");
        }
        
        for (let i = 0; i < countriesToShow.length; i++) {
            let txt = countriesToShow[i].label + " (+" + countriesToShow[i].phone + ")";
            arr.push({ label: txt, value: txt, key: txt });
        }
        return arr;
    }, [countries, settings]); 

    useEffect(() => {
        if (settings) {
            // Set initial country code
            if (settings.restrictCountry) {
                for (let i = 0; i < countries.length; i++) {
                    if (countries[i].code === "US" || countries[i].code === "CO") {
                        setCountryCode(countries[i].label + " (+" + countries[i].phone + ")");
                        break;
                    }
                }
            } else {
                for (let i = 0; i < countries.length; i++) {
                    if (countries[i].label == settings.country) {
                        setCountryCode(countries[i].label + " (+" + countries[i].phone + ")");
                    }
                }
            }
        }
    }, [settings]);


    const checkPasswordValidity = value => {
        if (value != confirmpassword) {
            return (t('confirm_password_not_match_err'));
        }

        const isNonWhiteSpace = /^\S*$/;
        if (!isNonWhiteSpace.test(value)) {
            return (t('password_must_not_contain_whitespaces'));
        }

        const isContainsUppercase = /^(?=.*[A-Z]).*$/;
        if (!isContainsUppercase.test(value)) {
            return (t('password_must_have_at_least_one_uppercase_character'));
        }

        const isContainsLowercase = /^(?=.*[a-z]).*$/;
        if (!isContainsLowercase.test(value)) {
            return (t('password_must_have_at_least_one_lowercase_character'));
        }

        const isContainsNumber = /^(?=.*[0-9]).*$/;
        if (!isContainsNumber.test(value)) {
            return (t('password_must_contain_at_least_one_digit'));
        }

        const isValidLength = /^.{8,16}$/;
        if (!isValidLength.test(value)) {
            return (t('password_must_be_8-16_characters_long'));
        }

        return null;
    }

    const validateStep1 = () => {
        if (!/\S/.test(state.firstName) || state.firstName.length === 0 || !/\S/.test(state.lastName) || state.lastName.length === 0) {
            Alert.alert(t('alert'), t('proper_input_name'));
            return false;
        }
        if (!state.ageRange || state.ageRange.length === 0) {
            Alert.alert(t('alert'), t('age_required') || 'Por favor selecciona tu rango de edad');
            return false;
        }
        if (settings && settings.showSocialSecurityDrivers === true && (!state.socialSecurity || state.socialSecurity.length === 0)) {
            Alert.alert(t('alert'), t('social_security_required') || 'La seguridad social es requerida');
            return false;
        }
        return true;
    }

    const validateStep2 = () => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (!re.test(state.email)) {
            Alert.alert(t('alert'), t('proper_email'));
            return false;
        }
        if (!emailOtpVerified) {
            Alert.alert(t('alert'), t('email_verification_required') || 'Por favor verifica tu correo electrónico con el código OTP');
            return false;
        }
        if (!mobileWithoutCountry || mobileWithoutCountry.length <= 6) {
            Alert.alert(t('alert'), t('mobile_no_blank_error'));
            return false;
        }
        return true;
    }

    const handleSendEmailOtp = async () => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (!re.test(state.email)) {
            Alert.alert(t('alert'), t('proper_email'));
            return;
        }
        setEmailOtpSending(true);
        const result = await dispatch(requestEmailOtp(state.email));
        setEmailOtpSending(false);
        if (result.success) {
            setEmailOtpSent(true);
            setEmailOtpVerified(false);
            Alert.alert(t('alert'), t('otp_sent') || 'Código OTP enviado a tu correo electrónico');
        } else {
            Alert.alert(t('alert'), result.error || t('error_sending_otp') || 'Error al enviar el código OTP');
        }
    }

    const handleVerifyEmailOtp = async () => {
        if (!emailOtp || emailOtp.length !== 6 || !/^\d+$/.test(emailOtp)) {
            Alert.alert(t('alert'), t('invalid_otp') || 'Por favor ingresa un código OTP válido de 6 dígitos');
            return;
        }
        setEmailOtpVerifying(true);
        const result = await dispatch(verifyEmailOtp(state.email, emailOtp));
        setEmailOtpVerifying(false);
        if (result.success) {
            setEmailOtpVerified(true);
            Alert.alert(t('alert'), t('email_verified') || 'Correo electrónico verificado correctamente');
        } else {
            Alert.alert(t('alert'), result.error || t('invalid_otp') || 'Código OTP inválido');
        }
    }

    useEffect(() => {
        if (state.email && emailOtpSent) {
            setEmailOtpSent(false);
            setEmailOtpVerified(false);
            setEmailOtp('');
        }
    }, [state.email]);

    const validateStep3 = () => {
        const validatePassword = checkPasswordValidity(state.password);
        if (validatePassword) {
            Alert.alert(t('alert'), validatePassword);
            return false;
        }
        return true;
    }

    const validateStep4 = () => {
        if (!documentImage || !selfieImage) {
            Alert.alert(t('alert'), t('upload_all_documents'));
            return false;
        }
        return true;
    }

    const validateStep5 = () => {
        if (!biometricAvailable) {
            Alert.alert(t('alert'), t('biometric_not_available') || 'La autenticación biométrica no está disponible. Por favor, habilítala en los ajustes de tu dispositivo.');
            return false;
        }
        if (!biometricEnabled) {
            Alert.alert(t('alert'), t('biometric_required') || 'Debes habilitar la autenticación biométrica para continuar.');
            return false;
        }
        return true;
    }

    const validateStep6 = () => {
        return true;
    }

    const validateStep7 = () => {
        if (!backgroundCheckAccepted) {
            Alert.alert(t('alert'), t('background_check_required') || 'Debes aceptar la verificación de antecedentes para continuar');
            return false;
        }
        if (!termsAccepted) {
            Alert.alert(t('alert'), t('terms_required'));
            return false;
        }
        return true;
    }

    const handleNext = () => {
        if (currentStep === 1) {
            if (!validateStep1()) {
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!validateStep2()) {
                return;
            }
            setCurrentStep(3);
        } else if (currentStep === 3) {
            if (!validateStep3()) {
                return;
            }
            setCurrentStep(4);
        } else if (currentStep === 4) {
            if (!validateStep4()) {
                return;
            }
            setCurrentStep(5);
        } else if (currentStep === 5) {
            if (!validateStep5()) {
                return;
            }
            setCurrentStep(6);
        } else if (currentStep === 6) {
            if (!validateStep6()) {
                return;
            }
            setCurrentStep(7);
        } else if (currentStep === 7) {
            if (!validateStep7()) {
                return;
            }
            handleFinalSubmit();
        }
    }

    const handleBack = () => {
        if (currentStep === 7) {
            setCurrentStep(6);
        } else if (currentStep === 6) {
            setCurrentStep(5);
        } else if (currentStep === 5) {
            setCurrentStep(4);
        } else if (currentStep === 4) {
            setCurrentStep(3);
        } else if (currentStep === 3) {
            setCurrentStep(2);
        } else if (currentStep === 2) {
            setCurrentStep(1);
        }
    }

    const handleFinalSubmit = () => {
        const { onPressRegister } = props;
        
        const userData = { 
            ...state,
            verifyIdImage: documentImageBlob,
            selfieImg: selfieImageBlob,
            biometricEnabled: biometricEnabled,
            term: termsAccepted,
            backgroundCheckAccepted: backgroundCheckAccepted
        };
        
        if (userData.usertype == 'customer') delete userData.carType;
        if (!settings || !settings.showReferralField) {
            delete userData.referralId;
        }
        
        console.log('📸 REGISTRO - handleFinalSubmit - Datos a enviar:', {
            hasVerifyIdImage: !!userData.verifyIdImage,
            verifyIdImageType: userData.verifyIdImage?.constructor?.name,
            verifyIdImageSize: userData.verifyIdImage?.size,
            hasSelfieImg: !!userData.selfieImg,
            selfieImgType: userData.selfieImg?.constructor?.name,
            selfieImgSize: userData.selfieImg?.size,
            documentImageUri: documentImage,
            selfieImageUri: selfieImage,
            userDataKeys: Object.keys(userData)
        });
        
        onPressRegister(userData);
    }

    const handleDocumentImageChange = (uri, blob) => {
        setDocumentImage(uri);
        setDocumentImageBlob(blob);
    }

    const handleSelfieImageChange = (uri, blob) => {
        setSelfieImage(uri);
        setSelfieImageBlob(blob);
    }

    const getTotalSteps = () => {
        return 7;
    }

    const getStepTitle = () => {
        switch(currentStep) {
            case 1:
                return t('personal_information');
            case 2:
                return t('contact_information');
            case 3:
                return t('security');
            case 4:
                return t('upload_documents');
            case 5:
                return t('enable_biometric');
            case 6:
                return t('driver_registration_earnings_title') || 'Genera ganancia con Waygo';
            case 7:
                return t('driver_registration_background_check_title') || 'Verificación de antecedentes';
            default:
                return t('registration_title');
        }
    }

    const onPressRegister = () => {
        const { onPressRegister } = props;
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        const validatePassword = checkPasswordValidity(state.password);
        if (re.test(state.email)) {
            if (/\S/.test(state.firstName) && state.firstName.length > 0 && /\S/.test(state.lastName) && state.lastName.length > 0) {
                if (!validatePassword) {
                    if (mobileWithoutCountry && mobileWithoutCountry.length > 6) {
                        console.log('📋 Datos de registro:', {
                            mobileWithoutCountry: mobileWithoutCountry,
                            countryCode: countryCode,
                            fullMobile: state.mobile,
                            email: state.email,
                            firstName: state.firstName,
                            lastName: state.lastName,
                            usertype: state.usertype
                        });
                        
                        const userData = { ...state };
                        if (userData.usertype == 'customer') delete userData.carType;
                        if (!settings || !settings.showReferralField) {
                            delete userData.referralId;
                        }
                        
                        onPressRegister(userData);
                        
                    } else {
                        Alert.alert(t('alert'), t('mobile_no_blank_error'));
                    }
                } else {
                    Alert.alert(t('alert'), validatePassword);
                }
            } else {
                Alert.alert(t('alert'), t('proper_input_name'));
            }
        } else {
            Alert.alert(t('alert'), t('proper_email'));
        }

    }

    const upDateCountry = (text) => {
        setCountryCode(text);
        let extNum = text.split("(")[1].split(")")[0];
        let formattedNum = mobileWithoutCountry.replace(/ /g, '');
        formattedNum = extNum + formattedNum.replace(/-/g, '');
        
        console.log('🌍 REGISTER - Actualizando país:', {
            selectedCountry: text,
            extractedCode: extNum,
            mobileWithoutCountry: mobileWithoutCountry,
            finalFormattedNum: formattedNum
        });
        
        setState({ ...state, mobile: formattedNum })
    }

    const getCountryCode = (value) => {
        if (!value) return '';
        const match = value.match(/\(\+(\d+)\)/);
        return match && match[1] ? `+${match[1]}` : '';
    }

    // const lCom = { icon: 'ios-arrow-back', type: 'ionicon', color: colors.WHITE, size: 35, component: TouchableWithoutFeedback, onPress: props.onPressBack };
    // const rCom = { icon: 'ios-arrow-forward', type: 'ionicon', color: colors.WHITE, size: 35, component: TouchableWithoutFeedback, onPress: props.onPressBack };

    return (
        <View style={{ flex: 1, }}>
            <SafeAreaView style={{ flex: 1, position: 'absolute', backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE, height: '100%', width: '100%' }}>
                <View style={[{ backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}>
                <TouchableOpacity style={isRTL ? { marginRight: 10, alignSelf: 'flex-end', width: 70, padding: 8, marginTop: 12 } : { marginLeft: 10, width: 70, padding: 8, marginTop: Platform.OS == 'android' ? (__DEV__ ? 15 :40) : (hasNotch ? 35 : 30) }} onPress={props.onPressBack} >
                        <Ionicons name={isRTL ? 'arrow-forward-outline' : "arrow-back-outline"} size={30} color={ mode === 'dark' ? colors.WHITE : colors.BLACK} />
                    </TouchableOpacity>
                </View>
                <Animated.View 
                    style={[
                        styles.headerContainer, 
                        isRTL ? { alignItems: 'flex-end' } : null,
                        {
                            transform: [
                                { translateY: headerTranslateY },
                                { scale: headerScale }
                            ],
                            opacity: headerOpacity
                        }
                    ]}
                >
                    <Text style={[styles.headerStyle, {color: mode === 'dark' ? colors.WHITE: colors.BLACK}]}>
                        {getStepTitle()}
                    </Text>
                    <Text style={styles.headerSubtitle}>
                        {(t('step') || 'Paso') + ' ' + currentStep + ' ' + (t('of') || 'de') + ' ' + getTotalSteps()}
                    </Text>
                </Animated.View>
                <View style={{ height: '85%' }}>
                    {currentStep === 1 ? (
                        <KeyboardAvoidingView style={styles.form} behavior={Platform.OS === 'ios' ? 'padding' : (__DEV__ ? null : "padding")} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} >
                            <Animated.View style={{ transform: [{ translateY: formTranslateY }] }}>
                                <ScrollView style={styles.scrollViewStyle} showsVerticalScrollIndicator={false}>
                                <View style={[styles.containerStyle,{backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>

                                    <View style={[styles.textInputBoxStyle, { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 10 }]}>
                                        <View style={{width: "47%"}}>
                                            <Input
                                                value={state.firstName}
                                                onChangeText={(text) => { setState({ ...state, firstName: text }) }}
                                                placeholder={t('first_name_placeholder') || 'First Name'}
                                                variant="outline"
                                                icon={Feather}
                                                iconName="user"
                                                containerStyle={{ marginBottom: 0 }}
                                                mode={mode}
                                            />
                                        </View>
                                        <View style={{width: "47%"}}>
                                            <Input
                                                value={state.lastName}
                                                onChangeText={(text) => { setState({ ...state, lastName: text }) }}
                                                placeholder={t('last_name_placeholder') || 'Last Name'}
                                                variant="outline"
                                                icon={Feather}
                                                iconName="user"
                                                containerStyle={{ marginBottom: 0 }}
                                                mode={mode}
                                            />
                                        </View>
                                    </View>
                                    {settings && settings.showSocialSecurityDrivers === true && (
                                        <View style={{width: "100%"}}>
                                            <Input
                                                value={state.socialSecurity}
                                                onChangeText={(text) => {
                                                    const numericValue = text.replace(/\D/g, '');
                                                    setState({ ...state, socialSecurity: numericValue });
                                                }}
                                                keyboardType={'number-pad'}
                                                placeholder={t('social_security') || 'Social Security'}
                                                variant="outline"
                                                icon={Feather}
                                                iconName="hash"
                                                mode={mode}
                                            />
                                        </View>
                                    )}
                                    <View style={{width: "100%"}}>
                                        <Text style={[styles.ageLabel, { color: mode === 'dark' ? colors.WHITE : '#A7A9AC' }]}>
                                            {t('age') || 'Edad'}
                                        </Text>
                                        <View style={[styles.checkboxContainer, { flexDirection: 'row', gap: 10 }]}>
                                            <TouchableOpacity
                                                style={[styles.checkboxRow, { 
                                                    backgroundColor: mode === 'dark' ? colors.BLACK : colors.WHITE,
                                                    borderWidth: state.ageRange === '21+' ? 2 : 1,
                                                    borderColor: state.ageRange === '21+' ? (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR) : (mode === 'dark' ? '#333' : '#E2E9EC'),
                                                    flex: 1
                                                }]}
                                                onPress={() => setState({ ...state, ageRange: '21+' })}
                                            >
                                                <View style={styles.checkboxContent}>
                                                    {state.ageRange === '21+' ? (
                                                        <Ionicons name="checkbox" size={24} color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} />
                                                    ) : (
                                                        <Ionicons name="checkbox-outline" size={24} color={mode === 'dark' ? colors.SHADOW : '#999'} />
                                                    )}
                                                    <Text style={[styles.checkboxText, { 
                                                        color: mode === 'dark' ? colors.WHITE : (state.ageRange === '21+' ? colors.BLACK : '#666'),
                                                        fontFamily: state.ageRange === '21+' ? fonts.Bold : fonts.Regular
                                                    }]}>
                                                        {t('age_21_plus') || '21 años o más'}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.checkboxRow, { 
                                                    backgroundColor: mode === 'dark' ? colors.BLACK : colors.WHITE,
                                                    borderWidth: state.ageRange === '18-20' ? 2 : 1,
                                                    borderColor: state.ageRange === '18-20' ? (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR) : (mode === 'dark' ? '#333' : '#E2E9EC'),
                                                    flex: 1
                                                }]}
                                                onPress={() => setState({ ...state, ageRange: '18-20' })}
                                            >
                                                <View style={styles.checkboxContent}>
                                                    {state.ageRange === '18-20' ? (
                                                        <Ionicons name="checkbox" size={24} color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} />
                                                    ) : (
                                                        <Ionicons name="checkbox-outline" size={24} color={mode === 'dark' ? colors.SHADOW : '#999'} />
                                                    )}
                                                    <Text style={[styles.checkboxText, { 
                                                        color: mode === 'dark' ? colors.WHITE : (state.ageRange === '18-20' ? colors.BLACK : '#666'),
                                                        fontFamily: state.ageRange === '18-20' ? fonts.Bold : fonts.Regular
                                                    }]}>
                                                        {t('age_18_20') || 'De 18 a 20 años'}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={[styles.buttonContainer]}>
                                        <Button
                                            title={t('next') || 'Siguiente'}
                                            style={[styles.registerButton, {backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}, loading === true ? [styles.registerButtonClicked,{backgroundColor: colors.WHITE, borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}] : styles.registerButton]}
                                            buttonStyle={[styles.buttonStyle]}
                                            btnClick={handleNext}
                                            activeOpacity={0.8}
                                            loading= {loading=== true ? true : false}
                                            loadingColor={{ color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }}
                                        />
                                    </View>
                                </View>
                                </ScrollView>
                            </Animated.View>
                        </KeyboardAvoidingView>
                    ) : currentStep === 2 ? (
                        <KeyboardAvoidingView style={styles.form} behavior={Platform.OS === 'ios' ? 'padding' : (__DEV__ ? null : "padding")} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} >
                            <Animated.View style={{ transform: [{ translateY: formTranslateY }] }}>
                                <ScrollView style={styles.scrollViewStyle} showsVerticalScrollIndicator={false}>
                                <View style={[styles.containerStyle,{backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
                                    <View style={[styles.textInputBoxStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <View style={{width: "100%"}}>
                                            <Input
                                                value={state.email}
                                                onChangeText={(text) => { setState({ ...state, email: text }) }}
                                                keyboardType={'email-address'}
                                                placeholder={t('email_placeholder') || 'Email'}
                                                variant="outline"
                                                icon={Feather}
                                                iconName="mail"
                                                containerStyle={{ marginBottom: 0 }}
                                                mode={mode}
                                                editable={!emailOtpVerified}
                                            />
                                        </View>
                                    </View>
                                    {!emailOtpSent && !emailOtpVerified && (
                                        <View style={{width: "100%", alignItems: 'flex-end', marginTop: -5, marginBottom: 5}}>
                                            <TouchableOpacity 
                                                onPress={handleSendEmailOtp}
                                                disabled={emailOtpSending}
                                                activeOpacity={0.7}
                                            >
                                                {emailOtpSending ? (
                                                    <ActivityIndicator size="small" color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} />
                                                ) : (
                                                    <Text style={{ 
                                                        color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, 
                                                        fontSize: 14, 
                                                        fontFamily: fonts.Bold,
                                                        textDecorationLine: 'underline'
                                                    }}>
                                                        {t('verify_email') || 'Verificar Email'}
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    {emailOtpSent && !emailOtpVerified && (
                                        <View style={{width: "100%", alignItems: 'flex-end', marginTop: -5, marginBottom: 5}}>
                                            <TouchableOpacity 
                                                onPress={handleSendEmailOtp}
                                                disabled={emailOtpSending}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={{ 
                                                    color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, 
                                                    fontSize: 14, 
                                                    fontFamily: fonts.Bold,
                                                    textDecorationLine: 'underline'
                                                }}>
                                                    {t('resend_otp') || 'Reenviar OTP'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    {emailOtpSent && !emailOtpVerified && (
                                        <View style={{width: "100%"}}>
                                            <Input
                                                value={emailOtp}
                                                onChangeText={(text) => {
                                                    const numericValue = text.replace(/\D/g, '').slice(0, 6);
                                                    setEmailOtp(numericValue);
                                                }}
                                                keyboardType="numeric"
                                                maxLength={6}
                                                placeholder={t('otp_placeholder') || 'Código OTP'}
                                                variant="outline"
                                                icon={Feather}
                                                iconName="key"
                                                mode={mode}
                                            />
                                        <TouchableOpacity 
                                            style={[styles.loginButton, { 
                                                marginTop: 10,
                                                backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR
                                            }]}
                                            onPress={handleVerifyEmailOtp}
                                            disabled={emailOtpVerifying || emailOtp.length !== 6}
                                            activeOpacity={0.8}
                                        >
                                            {emailOtpVerifying ? (
                                                <ActivityIndicator color={colors.WHITE} />
                                            ) : (
                                                <Text style={styles.loginButtonText}>
                                                    {t('verify_otp') || 'Verificar OTP'}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                            {emailOtpVerified && (
                                                <View style={{marginTop: 10, padding: 10, backgroundColor: '#d4edda', borderRadius: 5}}>
                                                    <Text style={{color: '#155724', textAlign: 'center'}}>
                                                        {t('email_verified') || '✓ Correo electrónico verificado'}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    )}
                                    {emailOtpVerified && (
                                        <View style={{marginTop: 10, padding: 10, backgroundColor: '#d4edda', borderRadius: 5}}>
                                            <Text style={{color: '#155724', textAlign: 'center'}}>
                                                {t('email_verified') || '✓ Correo electrónico verificado'}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={styles.contactRow}>
                                        <View style={styles.countryBoxSmall}>
                                            <Select 
                                                selectedValue={countryCode} 
                                                onValueChange={(text) => {
                                                    if (!settings?.AllowCountrySelection && !settings?.restrictCountry) return;
                                                    upDateCountry(text);
                                                }}
                                                isDisabled={!settings?.AllowCountrySelection && !settings?.restrictCountry}
                                            >
                                                <SelectTrigger 
                                                    size="md" 
                                                    variant="outline" 
                                                    bg={colors.WHITE} 
                                                    borderColor="#E2E9EC" 
                                                    borderRadius={10}
                                                    style={{ 
                                                        height: 50, 
                                                        width: 84,
                                                        paddingHorizontal: 8,
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        opacity: (!settings || (!settings.AllowCountrySelection && !settings.restrictCountry)) ? 0.5 : 1
                                                    }}
                                                >
                                                    <SelectInput 
                                                        placeholder={settings?.restrictCountry ? '' : '+'} 
                                                        value={getCountryCode(countryCode)}
                                                        style={{ 
                                                            textAlign: 'center', 
                                                            fontSize: 13,
                                                            color: colors.BLACK,
                                                            flex: 0,
                                                            width: 'auto',
                                                            paddingRight: 0
                                                        }}
                                                    />
                                                    <SelectIcon as={ChevronDownIcon} style={{ marginLeft: 2 }} />
                                                </SelectTrigger>
                                                <SelectPortal>
                                                    <SelectBackdrop />
                                                    <SelectContent>
                                                        {formatCountries.map((it) => {
                                                            const match = it.value && it.value.match(/\(\+(\d+)\)/);
                                                            const codePart = match && match[1] ? `+${match[1]}` : (it.label?.startsWith('+') ? it.label : `+${it.label}`);
                                                            return (
                                                                <SelectItem 
                                                                    key={it.key} 
                                                                    label={codePart} 
                                                                    value={it.value} 
                                                                />
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </SelectPortal>
                                            </Select>
                                        </View>
                                        <View style={styles.contactInputWrap}>
                                            <Input
                                                value={mobileWithoutCountry}
                                                onChangeText={(text) => {
                                                    const numericValue = text.replace(/\D/g, '');
                                                    setMobileWithoutCountry(numericValue);
                                                    if (countryCode) {
                                                        const countryPart = countryCode.split("(")[1].split(")")[0];
                                                        const fullMobile = countryPart + numericValue;
                                                        setState({ ...state, mobile: fullMobile });
                                                    }
                                                }}
                                                keyboardType="numeric"
                                                maxLength={10}
                                                placeholder={t('mobile') || 'Mobile Number'}
                                                variant="outline"
                                                icon={Feather}
                                                iconName="phone"
                                                containerStyle={{ marginBottom: 0 }}
                                                mode={mode}
                                            />
                                        </View>
                                    </View>
                                    {settings && settings.showReferralField && (
                                        <View>
                                            <Input
                                                value={state.referralId}
                                                onChangeText={(text) => { setState({ ...state, referralId: text }) }}
                                                placeholder={t('referral_id_placeholder') || 'Referral Id (Optional)'}
                                                variant="outline"
                                                icon={Feather}
                                                iconName="gift"
                                                mode={mode}
                                            />
                                        </View>
                                    )}
                                    <View style={{ width: '100%', flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                        <TouchableOpacity 
                                            style={[styles.loginRegisterButton, { width: 'auto', paddingHorizontal: 20, backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE, borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}
                                            onPress={handleBack}
                                        >
                                            <Text style={[styles.loginRegisterButtonText, { color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}>
                                                {t('back') || 'Volver'}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.loginButton, { 
                                                flex: 1, 
                                                backgroundColor: emailOtpVerified ? (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR) : '#ccc',
                                                opacity: emailOtpVerified ? 1 : 0.6
                                            }]}
                                            onPress={handleNext}
                                            disabled={!emailOtpVerified || loading}
                                            activeOpacity={0.8}
                                        >
                                            {loading ? (
                                                <ActivityIndicator color={colors.WHITE} />
                                            ) : (
                                                <Text style={styles.loginButtonText}>
                                                    {t('next') || 'Siguiente'}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                </ScrollView>
                            </Animated.View>
                        </KeyboardAvoidingView>
                    ) : currentStep === 3 ? (
                        <KeyboardAvoidingView style={styles.form} behavior={Platform.OS === 'ios' ? 'padding' : (__DEV__ ? null : "padding")} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} >
                            <Animated.View style={{ transform: [{ translateY: formTranslateY }] }}>
                                <ScrollView style={styles.scrollViewStyle} showsVerticalScrollIndicator={false}>
                                <View style={[styles.containerStyle,{backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
                                    <View style={{width: "100%"}}>
                                        <Input
                                            value={state.password}
                                            onChangeText={(text) => setState({ ...state, password: text })}
                                            secureTextEntry={eyePass}
                                            placeholder={t('password') || 'Password'}
                                            variant="outline"
                                            icon={Feather}
                                            iconName="lock"
                                            mode={mode}
                                            rightComponent={() => (
                                                <TouchableOpacity onPress={() => setEyePass(!eyePass)}>
                                                    <Feather name={eyePass === true ? "eye-off" : "eye"} size={22} color={colors.SHADOW} />
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </View>
                                    <View style={{width: "100%"}}>
                                        <Input
                                            value={confirmpassword}
                                            onChangeText={(text) => setConfirmPassword(text)}
                                            secureTextEntry={eyeConfirmPass}
                                            placeholder={t('confirm_password') || 'Confirm Password'}
                                            variant="outline"
                                            icon={Feather}
                                            iconName="lock"
                                            mode={mode}
                                            rightComponent={() => (
                                                <TouchableOpacity onPress={() => setEyeConfirmPass(!eyeConfirmPass)}>
                                                    <Feather name={eyeConfirmPass === true ? "eye-off" : "eye"} size={22} color={colors.SHADOW} />
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </View>
                                    <View style={{ width: '100%', flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                        <TouchableOpacity 
                                            style={[styles.loginRegisterButton, { width: 'auto', paddingHorizontal: 20, backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE, borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}
                                            onPress={handleBack}
                                        >
                                            <Text style={[styles.loginRegisterButtonText, { color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}>
                                                {t('back') || 'Volver'}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.loginButton, { flex: 1, backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}
                                            onPress={handleNext}
                                            activeOpacity={0.8}
                                        >
                                            {loading ? (
                                                <ActivityIndicator color={colors.WHITE} />
                                            ) : (
                                                <Text style={styles.loginButtonText}>
                                                    {t('next') || 'Siguiente'}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                </ScrollView>
                            </Animated.View>
                        </KeyboardAvoidingView>
                    ) : currentStep === 4 ? (
                        <RegistrationDocumentStep
                            documentImage={documentImage}
                            selfieImage={selfieImage}
                            onDocumentImageChange={handleDocumentImageChange}
                            onSelfieImageChange={handleSelfieImageChange}
                            mode={mode}
                            onBack={handleBack}
                            onNext={handleNext}
                            loading={loading}
                        />
                    ) : currentStep === 5 ? (
                        <RegistrationBiometricStep
                            onContinue={handleNext}
                            onBiometricEnabled={setBiometricEnabled}
                            onAvailabilityChange={setBiometricAvailable}
                            mode={mode}
                            onBack={handleBack}
                            onNext={handleNext}
                            loading={loading}
                            nextDisabled={!biometricAvailable || !biometricEnabled}
                        />
                    ) : currentStep === 6 ? (
                        <RegistrationEarningsStep
                            mode={mode}
                            onBack={handleBack}
                            onNext={handleNext}
                            loading={loading}
                        />
                    ) : currentStep === 7 ? (
                        <RegistrationBackgroundCheckStep
                            onBackgroundCheckAccepted={setBackgroundCheckAccepted}
                            onTermsAccepted={setTermsAccepted}
                            onFinalSubmit={handleFinalSubmit}
                            mode={mode}
                            onBack={handleBack}
                            loading={loading}
                        />
                    ) : null}
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
    },
    vew: {
        borderTopLeftRadius: 130,
        height: '100%',
        alignItems: 'flex-end',
    },

    headerContainerStyle: {
        backgroundColor: colors.RE_GREEN,
        borderBottomWidth: 0,
        marginTop: 0
    },
    headerInnerContainer: {
        marginLeft: 10,
        marginRight: 10
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
        minHeight: 50,
    },
    contactInputWrap: {
        flex: 1
    },
    inputPhone: {
        paddingVertical: 0,
        lineHeight: 44
    },
    form: {
        alignItems: 'center',
        width: '100%',
        gap: 25,
        marginBottom:25,
        flex: 1
    },
    containerStyle: {
        flexDirection: 'column',
        marginTop: 10,
        width: width - 40,
        alignSelf: 'center',
        gap: 10
    },
    textInputBoxStyle: {
        width: '100%',
        justifyContent: 'space-between',
        alignItems:'center',
        position: 'relative',
        overflow: 'hidden',
    },
    passwordIcon: {
        width:"10%",
        height:45,
        justifyContent:"center",
    },
    passWordBox:{
        borderWidth: 1,
        borderRadius: 10,
        paddingLeft: 10,
        width: '100%',
        borderColor: '#E2E9EC',
        justifyContent:"center",
        height:45
    },
    passwordBoxFocused:{
        //paddingVertical:12,
    },
    passwordInput:{
        width: "90%",
        height:"100%",
        fontFamily:fonts.Bold 
    },
    textInputStyle: {
        borderWidth: 1,
        borderColor: '#E2E9EC',
        paddingVertical: 15,
        borderRadius: 10,
        paddingLeft: 10,
        paddingRight: 10,
        fontFamily: fonts.Regular
    },
    inputFocused: {
        paddingVertical: 14,
    },
    inputContainerStyle: {
        width: "100%",
    },
    iconContainer: {
        width: '15%',
        alignItems: 'center'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        position: 'relative',
        marginBottom: 30,
        marginTop: 10
    },
    registerButton: {
        width: '100%',
        backgroundColor: '#1369B4',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
        marginBottom: 5,
    },
    loadingBox: {
        position: 'absolute',
        top: 10
    },
    registerButtonClicked: {
        width: '100%',
        borderWidth: 1,
        borderRadius: 10,
        elevation: 0
    },
    buttonStyle: {
        color: colors.WHITE,
        fontSize: 16,
        fontFamily: fonts.Bold,
    },
    pickerStyle: {
        fontSize: 15,
        paddingVertical: 12,
        position: 'relative',
        paddingLeft: 10,
        paddingRight: 10,
        fontFamily:fonts.Bold,
        flexWrap: 'wrap', 
        width:"100%",
    },
    RnpickerBox: {
        width: "100%",
        height:50,
        overflow: 'hidden',
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 10,
        alignItems: 'center',
    },
    pickerFocus: {
        borderWidth: 2,
        borderColor: colors.INPUT_FOCUS
    },
    inputTextStyle: {
        color: colors.HEADER,
        fontSize: 13,
        marginLeft: 0,
        height: 32,
    },
    errorMessageStyle: {
        fontSize: 12,
        fontFamily:fonts.Bold,
        marginLeft: 0
    },
    scrollViewStyle: {
        flex: 1,
        width: '100%',
    },
    headerStyle: {
        fontSize: 28,
        color: colors.BLACK,
        fontFamily: fonts.Bold,
        width: '100%'
    },
    headerContainer: {
        marginBottom: 20,
        width: width - 40,
        alignSelf: 'center'
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#A7A9AC',
        marginTop: 4,
        fontFamily: fonts.Regular,
        width: '100%'
    },
    inputLabel: {
        width: '100%',
        fontSize: 13,
        color: '#A7A9AC',
        marginBottom: 6,
        fontFamily: fonts.Bold
    },
    capturePhoto: {
        width: '60%',
        height: 110,
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 10,
        marginTop: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
        backgroundColor: colors.WHITE

    },
    capturePhotoTitle: {
        color: colors.BLACK,
        fontSize: 14,
        textAlign: 'center',
        paddingBottom: 15,

    },
    errorPhotoTitle: {
        color: colors.RED,
        fontSize: 13,
        textAlign: 'center',
        paddingBottom: 15,
    },
    photoResult: {
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 10,
        marginLeft: 20,
        marginRight: 20,
        paddingTop: 15,
        paddingBottom: 10,
        marginTop: 15,
        width: '80%',
        height: height / 4
    },
    imagePosition: {
        position: 'relative'
    },
    photoClick: {
        paddingRight: 48,
        position: 'absolute',
        zIndex: 1,
        marginTop: 18,
        alignSelf: 'flex-end'
    },
    capturePicClick: {
        backgroundColor: colors.WHITE,
        flexDirection: 'row',
        position: 'relative',
        zIndex: 1
    },
    imageStyle: {
        width: 30,
        height: height / 15
    },
    flexView1: {
        flex: 12
    },
    imageFixStyle: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageStyle2: {
        width: 150,
        height: height / 15
    },
    myView: {
        flex: 2,
        height: 50,
        width: 1,
        alignItems: 'center'
    },
    myView2: {
        flex: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    myView3: {
        flex: 2.2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textStyle: {
        color: colors.ProfileDetails_Text,
        fontFamily:fonts.Bold,
        fontSize: 13
    },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
        gap: 10,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        height: 50,
    },
    backButtonText: {
        fontSize: 16,
        fontFamily: fonts.Bold,
        marginLeft: 8,
    },
    nextButton: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
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
    loginRegisterButton: {
        backgroundColor: colors.WHITE,
        borderWidth: 2,
        borderColor: '#1369B4',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4
    },
    loginRegisterButtonText: {
        color: '#1369B4',
        fontSize: 14,
        fontFamily: fonts.Bold
    },
    ageLabel: {
        fontSize: 13,
        fontFamily: fonts.Bold,
        marginBottom: 6,
        width: '100%'
    },
    checkboxContainer: {
        width: '100%',
        flexDirection: 'row',
        gap: 10
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 12,
        minHeight: 50,
        borderRadius: 10
    },
    checkboxContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1
    },
    checkboxText: {
        fontSize: 15,
        fontFamily: fonts.Regular,
        flex: 1
    }
});

