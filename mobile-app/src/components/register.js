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
    SafeAreaView,
    useColorScheme,
    Animated
} from 'react-native';
import { colors } from '../common/theme';
var { height,width } = Dimensions.get('window');
import i18n from 'i18n-js';

import RNPickerSelect from './RNPickerSelect';
import { useSelector,useDispatch } from 'react-redux';
import { api } from 'common';
import { Feather, Ionicons, AntDesign } from '@expo/vector-icons';
import { Keyboard } from 'react-native';
import { Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectItem, ChevronDownIcon } from '@gluestack-ui/themed';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import Button from './Button';
import { fonts } from '../common/font';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

const hasNotch = DeviceInfo.hasNotch();

export default function Registration(props) {
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const {
        countries,
        editreferral
    } = api;
    const [state, setState] = useState({
        usertype: 'customer',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        mobile: '',
        referralId: ''
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
    const pickerRef1 = React.createRef();
    const useduserReferral = useSelector(state => state.usedreferralid.usedreferral);
    let colorScheme = useColorScheme();
    const [mode, setMode] = useState('');

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
            // Set initial user type
            setState(prev => ({...prev, usertype: 'customer'}));
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
   


    const onPressRegister = () => {
        const { onPressRegister } = props;
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        const validatePassword = checkPasswordValidity(state.password);
        if (re.test(state.email)) {
            if (/\S/.test(state.firstName) && state.firstName.length > 0 && /\S/.test(state.lastName) && state.lastName.length > 0) {
                if (!validatePassword) {
                    if (mobileWithoutCountry && mobileWithoutCountry.length > 6) {
                        console.log('📋 REGISTER - Datos de registro:', {
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
                        
                        console.log('🚀 REGISTER - Enviando userData:', userData);
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
                    <Text style={[styles.headerStyle, {color: mode === 'dark' ? colors.WHITE: colors.BLACK}]}>{t('registration_title')}</Text>
                    <Text style={styles.headerSubtitle}>{t('registration_subtitle')}</Text>
                </Animated.View>
                <View style={{ height: '85%' }}>
                    <KeyboardAvoidingView style={styles.form} behavior={Platform.OS === 'ios' ? 'padding' : (__DEV__ ? null : "padding")} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} >
                        <Animated.View style={{ transform: [{ translateY: formTranslateY }] }}>
                            <ScrollView style={styles.scrollViewStyle} showsVerticalScrollIndicator={false}>
                            <View style={[styles.containerStyle,{backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>

                                <View style={[styles.textInputBoxStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <View style={{width: "47%"}}>
                                        <Text style={styles.inputLabel}>{t('first_name_placeholder')}</Text>
                                        <TextInput
                                            placeholder={''}
                                            onFocus={() => setFirstNameFocus(!firstNameFocus)}
                                            onBlur={() => setFirstNameFocus(!firstNameFocus)}
                                            value={state.firstName}
                                            onChangeText={(text) => { setState({ ...state, firstName: text }) }}
                                            textAlign={isRTL ? 'right' : 'left'}
                                            placeholderTextColor={colors.SHADOW}
                                            style={[styles.textInputStyle, { width: "100%", color: mode === 'dark' ? colors.WHITE : colors.BLACK }, (firstNameFocus === true || state.firstName.length > 0) ? [styles.inputFocused, {borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}] : styles.textInputStyle]}
                                            keyboardType={'email-address'}
                                        />
                                    </View>
                                    <View style={{width: "47%"}}>
                                        <Text style={styles.inputLabel}>{t('last_name_placeholder')}</Text>
                                        <TextInput
                                            placeholder={''}
                                            onFocus={() => setlastNameFocus(!lastNameFocus)}
                                            onBlur={() => setlastNameFocus(!lastNameFocus)}
                                            value={state.lastName}
                                            textAlign={isRTL ? 'right' : 'left'}
                                            onChangeText={(text) => { setState({ ...state, lastName: text }) }}
                                            placeholderTextColor={colors.SHADOW}
                                            style={[styles.textInputStyle, { width: "100%", color: mode === 'dark' ? colors.WHITE : colors.BLACK }, (lastNameFocus === true || state.lastName.length > 0) ? [styles.inputFocused, {borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}] : styles.textInputStyle]}
                                            keyboardType={'email-address'}
                                        />
                                    </View>

                                </View>
                                <View style={[styles.textInputBoxStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <View style={{width: "100%"}}>
                                        <Text style={styles.inputLabel}>{t('email_placeholder')}</Text>
                                        <TextInput
                                            placeholder={''}
                                            onFocus={() => setEmailFocus(!EmailFocus)}
                                            onBlur={() => setEmailFocus(!EmailFocus)}
                                            value={state.email}
                                            placeholderTextColor={colors.SHADOW}
                                            textAlign={isRTL ? 'right' : 'left'}
                                            style={[styles.textInputStyle, { width: "100%", color: mode === 'dark' ? colors.WHITE : colors.BLACK }, (EmailFocus === true || state.email.length > 0) ? [styles.inputFocused, {borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}] : styles.textInputStyle]}
                                            onChangeText={(text) => { setState({ ...state, email: text }) }}
                                            keyboardType={'email-address'}
                                        />
                                    </View>
                                </View>
                                <View style={styles.contactRow}>
                                    <View style={styles.countryBoxSmall}>
                                        <Text style={styles.inputLabel}>{t('country')}</Text>
                                        <RNPickerSelect
                                            pickerRef={pickerRef1}
                                            placeholder={settings?.restrictCountry ? {} : { label: '+', value: t('select_country') }}
                                            value={countryCode}
                                            useNativeAndroidPickerStyle={false}
                                            onTap={() => {
                                                if (!settings?.AllowCountrySelection && !settings?.restrictCountry) {
                                                    return;
                                                }
                                                Keyboard.dismiss();
                                                pickerRef1.current && pickerRef1.current.focus && pickerRef1.current.focus();
                                            }}
                                            style={{
                                                viewContainer: styles.countryPickerContainer,
                                                inputIOS: [
                                                    styles.countryPickerSmall, 
                                                    { textAlign: 'center' },
                                                    (!settings || (!settings.AllowCountrySelection && !settings.restrictCountry)) && { opacity: 0.5 }
                                                ],
                                                inputAndroid: [
                                                    styles.countryPickerSmall, 
                                                    { textAlign: 'center', textAlignVertical: 'center' },
                                                    (!settings || (!settings.AllowCountrySelection && !settings.restrictCountry)) && { opacity: 0.5 }
                                                ]
                                            }}
                                            onValueChange={(text) => {
                                                if (!settings?.AllowCountrySelection && !settings?.restrictCountry) return;
                                                upDateCountry(text);
                                            }}
                                            items={formatCountries.map((it) => {
                                                const match = it.value && it.value.match(/\(\+(\d+)\)/);
                                                const codePart = match && match[1] ? `+${match[1]}` : (it.label?.startsWith('+') ? it.label : `+${it.label}`);
                                                return { ...it, label: codePart };
                                            })}
                                            disabled={!settings?.AllowCountrySelection && !settings?.restrictCountry}
                                            mode={mode}
                                        />
                                    </View>
                                    <View style={styles.contactInputWrap}>
                                        <Text style={styles.inputLabel}>{t('mobile')}</Text>
                                        <TextInput
                                            placeholder={''}
                                            onFocus={() => setNumberFocus(!numberFocus)}
                                            onBlur={() => setNumberFocus(!numberFocus)}
                                            value={mobileWithoutCountry}
                                            placeholderTextColor={colors.SHADOW}
                                            textAlign={isRTL ? 'right' : 'left'}
                                            style={[styles.textInputStyle, (state.mobile && /^\d+$/.test(state.mobile)) ? styles.inputPhone : null, { width: "100%", color: mode === 'dark' ? colors.WHITE : colors.BLACK }, (numberFocus === true || mobileWithoutCountry.length > 0) ? [styles.inputFocused, {borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}] : styles.textInputStyle]}
                                            onChangeText={(text) => {
                                                const numericValue = text.replace(/\D/g, '');
                                                setMobileWithoutCountry(numericValue);
                                                if (countryCode) {
                                                    const countryPart = countryCode.split("(")[1].split(")")[0];
                                                    const fullMobile = countryPart + numericValue;
                                                    
                                                    console.log('📱 REGISTER - Actualizando teléfono:', {
                                                        originalText: text,
                                                        numericValue: numericValue,
                                                        countryCode: countryCode,
                                                        countryPart: countryPart,
                                                        fullMobile: fullMobile
                                                    });
                                                    
                                                    setState({ ...state, mobile: fullMobile });
                                                }
                                            }}
                                            keyboardType="numeric"
                                            maxLength={10}
                                        />
                                    </View>
                                </View>
                                <View style={{width: "100%"}}>
                                    <Text style={styles.inputLabel}>{t('password')}</Text>
                                    <View style={[styles.passWordBox, { flexDirection: isRTL ? 'row-reverse' : 'row' },(passwordFocus === true || state.password.length > 0) ? [styles.passwordBoxFocused, {borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}] : styles.passWordBox]}>
                                        <TextInput
                                            placeholder={''}
                                            onFocus={() => setpasswordFocus(!passwordFocus)}
                                            onBlur={() => setpasswordFocus(!passwordFocus)}
                                            placeholderTextColor={colors.SHADOW}
                                            value={state.password}
                                            textAlign={isRTL ? 'right' : 'left'}
                                            style={[ styles.passwordInput,{paddingRight:isRTL?10:0, color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}
                                            onChangeText={(text) => setState({ ...state, password: text })}
                                            keyboardType="default"
                                            secureTextEntry={eyePass}
                                        />
                                    <TouchableOpacity onPress={() => setEyePass(!eyePass)} style={styles.passwordIcon}>
                                        <Feather name={eyePass === true ? "eye-off" : "eye"} size={22} color={(passwordFocus === true || state.password.length > 0) ? mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR : colors.SHADOW} />
                                    </TouchableOpacity>
                                </View>
                                </View>
                                <View style={{width: "100%"}}>
                                    <Text style={styles.inputLabel}>{t('confirm_password')}</Text>
                                    <View style={[styles.passWordBox,  { flexDirection: isRTL ? 'row-reverse' : 'row',},(confirmPasswordFocus === true || confirmpassword.length > 0) ? [styles.passwordBoxFocused, {borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}] : styles.passWordBox]}>
                                        <TextInput
                                            placeholder={''}
                                            secureTextEntry={eyeConfirmPass}
                                            onFocus={() => setconfirmPasswordFocus(!confirmPasswordFocus)}
                                            onBlur={() => setconfirmPasswordFocus(!confirmPasswordFocus)}
                                            placeholderTextColor={colors.SHADOW}
                                            value={confirmpassword}
                                            textAlign={isRTL ? 'right' : 'left'}
                                            style={[ styles.passwordInput,{paddingRight:isRTL?10:0, color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}
                                            onChangeText={(text) => setConfirmPassword(text)}
                                            keyboardType="default"
                                        />
                                    <TouchableOpacity onPress={() => setEyeConfirmPass(!eyeConfirmPass)} style={styles.passwordIcon}>
                                        <Feather name={eyeConfirmPass === true ? "eye-off" : "eye"} size={22} color={(confirmPasswordFocus === true || confirmpassword.length > 0) ? mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR : colors.SHADOW} />
                                    </TouchableOpacity>
                                </View>
                                </View>
                                <View style={[styles.textInputBoxStyle, { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 10 }]}>
                                    <View style={{width: "35%"}}>
                                        <Text style={styles.inputLabel}>{t('user_type')}</Text>
                                        <TouchableOpacity 
                                            style={[styles.textInputStyle, {
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }]}
                                            onPress={() => {
                                                setState(prev => ({
                                                    ...prev, 
                                                    usertype: prev.usertype === 'customer' ? 'driver' : 'customer'
                                                }));
                                            }}
                                        >
                                            <Text style={{
                                                fontSize: 14,
                                                color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                                fontFamily: fonts.Regular
                                            }}>
                                                {state.usertype === 'customer' ? t('customer') : t('driver')}
                                            </Text>
                                            <Ionicons name="chevron-down" size={14} color={colors.SHADOW} />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{width: "60%"}}>
                                        <Text style={styles.inputLabel}>{t('referral_id_placeholder')}</Text>
                                        <TextInput
                                            editable={true}
                                            placeholder={''}
                                            onFocus={() => setreferralIdFocus(!referralIdFocus)}
                                            onBlur={() => setreferralIdFocus(!referralIdFocus)}
                                            placeholderTextColor={colors.SHADOW}
                                            value={state.referralId}
                                            textAlign={isRTL ? 'right' : 'left'}
                                            style={[styles.textInputStyle, { width: "100%", color: mode === 'dark' ? colors.WHITE : colors.BLACK }, (referralIdFocus === true || state.referralId.length > 0) ? [styles.inputFocused, {borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}] : styles.textInputStyle]}
                                            onChangeText={(text) => { setState({ ...state, referralId: text }) }}
                                            keyboardType={'email-address'}
                                        />
                                    </View>
                                </View>
                                <View style={[styles.buttonContainer]}>
                                    <Button
                                        title={t('register_button')}
                                        style={[styles.registerButton, {backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}, loading === true ? [styles.registerButtonClicked,{backgroundColor: colors.WHITE, borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}] : styles.registerButton]}
                                        buttonStyle={[styles.buttonStyle]}
                                        btnClick={onPressRegister}
                                        activeOpacity={0.8}
                                        loading= {loading=== true ? true : false}
                                        loadingColor={{ color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }}
                                    />
                                   
                                </View>
                            </View>
                            </ScrollView>
                        </Animated.View>
                    </KeyboardAvoidingView>
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
        height: 50,
    },
    countryPickerContainer: {
        height: '100%',
        justifyContent: 'center'
    },
    countryPickerSmall: {
        height: 50,
        color: colors.BLACK,
        fontFamily: fonts.Regular,
        fontSize: 13,
        width: '100%',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E9EC',
        backgroundColor: colors.WHITE,
        textAlignVertical: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center'
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
        width: '100%',
        gap:10
    },
    textInputBoxStyle: {
        width: width-25,
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
        width: width-25,
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
        width: width-25,
        position: 'relative',
        marginBottom: 30,
        marginTop:10
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
    },
    headerStyle: {
        fontSize: 28,
        color: colors.BLACK,
        fontFamily: fonts.Bold,
        width: '100%'
    },
    headerContainer: {
        marginBottom: 20,
        width: width-25,
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
    }
});


