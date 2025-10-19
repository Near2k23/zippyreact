import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    View,
    Text,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    useColorScheme
} from 'react-native';
import { Icon, Button, Input } from 'react-native-elements'
import { colors } from '../common/theme';
import ActionSheet from "react-native-actions-sheet";
import i18n from 'i18n-js';
var { height } = Dimensions.get('window');
import { useSelector, useDispatch } from 'react-redux';
import { api, FirebaseContext } from 'common';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons, Entypo, Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { fonts } from '../common/font';

export default function EditProfilePage(props) {
    const { config } = useContext(FirebaseContext);
    const {
        updateProfile
    } = api;
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const settings = useSelector(state => state.settingsdata.settings);
    const [profileData, setProfileData] = useState(null);
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const actionSheetRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [capturedImageBack, setCapturedImageback] = useState(null);
    const [capturedIdImage, setCapturedIdImage] = useState(null);
    const [capturedVehicleRegistrationCard, setCapturedVehicleRegistrationCard] = useState(null);
    const [check, setCheck] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updateCalled,setUpdateCalled] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const fromPage  = props.route.params && props.route.params.fromPage ? props.route.params.fromPage: null;
    let colorScheme = useColorScheme();
    const [mode, setMode] = useState();

    useEffect(() => {
        if (auth?.profile?.mode) {
            if (auth.profile.mode === 'system'){
                setMode(colorScheme);
            }else{
                setMode(auth.profile.mode);
            }
        } else {
            setMode('light');
        }
    }, [auth, colorScheme]);
    
    const onPressBack = () => {
        if(fromPage == 'DriverTrips' || fromPage == 'Map' || fromPage == 'Wallet'){
            props.navigation.replace('TabRoot', { screen: fromPage });
        }else{
            props.navigation.goBack() 
        }
    }

    useEffect(() => {
        if (auth.profile && auth.profile.uid) {
            setProfileData({ ...auth.profile });
    
            if (updateSuccess) {
                setLoading(false);
                Alert.alert(
                    t('alert'),
                    t('profile_updated'),
                    [{ 
                        text: t('ok'), 
                        onPress: () => { 
                            onPressBack();
                        } 
                    }],
                    { cancelable: true }
                );
                setUpdateCalled(false);
                setUpdateSuccess(false);
            }
        }
    }, [auth.profile, updateSuccess]);

    const showActionSheet = (text) => {
        setCheck(text);
        actionSheetRef.current?.setModalVisible(true);
    }

    const getDocumentStatus = (docType) => {
        if (!auth.profile.documentStatus) return null;
        return auth.profile.documentStatus[docType];
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'approved': return colors.GREEN;
            case 'rejected': return colors.RED;
            case 'pending': 
            default: return colors.ORANGE;
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'approved': return t('approved');
            case 'rejected': return t('rejected');
            case 'pending':
            default: return t('pending_approval');
        }
    };

    const DocumentStatusBadge = ({ status }) => {
        if (!status) return null;
        
        return (
            <View style={[styles.statusBadge, {
                backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE,
                borderColor: getStatusColor(status.status),
                shadowColor: mode === 'dark' ? colors.WHITE : colors.BLACK,
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
            }]}>
                <Ionicons 
                    name={status.status === 'approved' ? 'checkmark' : 
                          status.status === 'rejected' ? 'close' : 'time'}
                    size={18}
                    color={getStatusColor(status.status)}
                />
            </View>
        );
    };

    const [state, setState] = useState({
        licenseImage: null,
        licenseImageBack: null,
        verifyIdImage: null,
        vehicleRegistrationCard: null
    });

    const uploadImage = () => {
        return (
            <ActionSheet ref={actionSheetRef}>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, borderColor: colors.SHADOW, borderBottomWidth: 1, height: 60, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { _pickImage('CAMERA', ImagePicker.launchCameraAsync) }}
                >
                    <Text style={{ color: colors.BLUE, fontFamily:fonts.Bold }}>{t('camera')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, borderBottomWidth: 1, borderColor: colors.SHADOW, height: 60, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { _pickImage('MEDIA', ImagePicker.launchImageLibraryAsync) }}
                >
                    <Text style={{ color: colors.BLUE, fontFamily:fonts.Bold }}>{t('medialibrary')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, height: 50, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { actionSheetRef.current?.setModalVisible(false); }}>
                    <Text style={{ color: 'red', fontFamily:fonts.Bold }}>{t('cancel')}</Text>
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

            let result = await pickFrom({
                allowsEditing: true,
                aspect: [4, 3]
            });

            actionSheetRef.current?.setModalVisible(false);

            if (!result.canceled) {
                if (check == 0) {
                    setCapturedImage(result.assets[0].uri);
                }
                else if (check == 1) {
                    setCapturedImageback(result.assets[0].uri);
                }
                else if (check == 2) {
                    setCapturedIdImage(result.assets[0].uri);
                }
                else if (check == 3) {
                    setCapturedVehicleRegistrationCard(result.assets[0].uri);
                }

                let blob;
                try {
                    const response = await fetch(result.assets[0].uri);
                    blob = await response.blob();
                } catch (error) {
                    Alert.alert(t('alert'), t('image_upload_error'));
                    return;
                }
                if (blob) {
                    if (check == 0) {
                        setState({ ...state, licenseImage: blob });
                    }
                    else if (check == 1) {
                        setState({ ...state, licenseImageBack: blob });
                    }
                    else if (check == 2) {
                        setState({ ...state, verifyIdImage: blob });
                    }
                    else if (check == 3) {
                        setState({ ...state, vehicleRegistrationCard: blob });
                    }
                }
            }
        } else {
            Alert.alert(t('alert'), t('camera_permission_error'))
        }
    }

    const cancelPhoto = () => {
        setCapturedImage(null);
    }

    const cancelPhotoback = () => {
        setCapturedImageback(null);
    }

    const cancelIdPhoto = () => {
        setCapturedIdImage(null);
    }

    const cancelVehicleRegistrationCardPhoto = () => {
        setCapturedVehicleRegistrationCard(null);
    }

    const completeSubmit = async () => {
        let userData = {
            verifyId: profileData.verifyId ? profileData.verifyId : null
        };
        setUpdateCalled(true);
        if ((auth.profile.usertype == 'driver' && settings.bank_fields) || (auth.profile.usertype == 'customer' && settings.bank_fields && settings.RiderWithDraw) && profileData.bankAccount && profileData.bankAccount.length &&
            profileData.bankCode && profileData.bankCode.length &&
            profileData.bankName && profileData.bankName.length) {
            userData.bankAccount = profileData.bankAccount,
                userData.bankCode = profileData.bankCode,
                userData.bankName = profileData.bankName
        }
        if (auth.profile.usertype == 'driver') {
            if (capturedImage) {
                userData.licenseImage = state ? state.licenseImage : profileData.licenseImage ? profileData.licenseImage : null;
            }
            if (capturedImageBack) {
                userData.licenseImageBack = state ? state.licenseImageBack : profileData.licenseImageBack ? profileData.licenseImageBack : null;
            }
        }
        if (capturedIdImage) {
            userData.verifyIdImage = state ? state.verifyIdImage : profileData.verifyIdImage ? profileData.verifyIdImage : null;
        }
        if (capturedVehicleRegistrationCard) {
            userData.vehicleRegistrationCard = state ? state.vehicleRegistrationCard : profileData.vehicleRegistrationCard ? profileData.vehicleRegistrationCard : null;
        }
    
        await dispatch(updateProfile(userData));
        
        setUpdateSuccess(true);
    };
    
    const saveProfile = async () => {
        if(((auth.profile.usertype == 'driver' && settings.bank_fields) || (auth.profile.usertype == 'customer' && settings.bank_fields && settings.RiderWithDraw)) && !(profileData.bankAccount && profileData.bankCode && profileData.bankName)){
            Alert.alert(t('alert'), t('no_details_error'));
        }
        else {
            setLoading(true);
            await completeSubmit();
        }
    };

    const lCom = () => {
        return (
          <TouchableOpacity style={{ marginLeft: 10}} onPress={onPressBack}>
            <FontAwesome5 name="arrow-left" size={24} color={colors.WHITE} />
          </TouchableOpacity>
        );
      }
    
    React.useEffect(() => {
        props.navigation.setOptions({
            headerLeft: lCom,
        });
    }, [props.navigation]);


    return (
        <View style={{flex:1}}>
                <View style={{backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE, width: '100%', height:'100%'}}>
                    <View style={styles.containerStyle}>
                        <ScrollView style={styles.scrollViewStyle} showsVerticalScrollIndicator={false}>
                            {(auth.profile.usertype == 'driver' && settings.bank_fields) || (auth.profile.usertype == 'customer' && settings.bank_fields && settings.RiderWithDraw) ?
                            <View style={[styles.textInputContainerStyle, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack]}>
                                <Text style={[mode === 'dark' ? styles.textTitleDark : styles.textTitle,isRTL? {textAlign: 'right', marginRight: 30} : {textAlign: 'left', marginLeft: 7}]} >{t('bankName')}</Text>
                                <View style={[styles.textInputContainerStyle1, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <View style={styles.iconContainer}>
                                        <MaterialCommunityIcons name="bank-outline" size={24} color={colors.SHADOW} />
                                    </View>
                                    <View style={{ flex: 1}}>
                                        <Input
                                            editable={true}
                                            underlineColorAndroid={colors.TRANSPARENT}
                                            placeholder={t('bankName')}
                                            placeholderTextColor={colors.SHADOW}
                                            value={profileData && profileData.bankName ? profileData.bankName : ''}
                                            keyboardType={'email-address'}
                                            inputStyle={[mode === 'dark' ? styles.inputTextDark : styles.inputText, isRTL ? { textAlign: 'right', fontSize: 13, } : { textAlign: 'left', fontSize: 13, }]}
                                            onChangeText={(text) => { setProfileData({ ...profileData, bankName: text }) }}
                                            secureTextEntry={false}
                                            errorStyle={styles.errorMessageStyle}
                                            inputContainerStyle={styles.inputContainerStyle}
                                            containerStyle={[styles.textInputStyle, { marginLeft: 0 }]}
                                        />
                                    </View>
                                </View>
                            </View>
                            : null}
                            {(auth.profile.usertype == 'driver' && settings.bank_fields) || (auth.profile.usertype == 'customer' && settings.bank_fields && settings.RiderWithDraw) ?
                           <View style={[styles.textInputContainerStyle, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack]}>
                                <Text style={[mode === 'dark' ? styles.textTitleDark : styles.textTitle,isRTL? {textAlign: 'right', marginRight: 30} : {textAlign: 'left', marginLeft: 7}]} >{t('bankCode')}</Text>
                                <View style={[styles.textInputContainerStyle1, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <Icon
                                        name='numeric'
                                        type='material-community'
                                        color={colors.SHADOW}
                                        size={30}
                                        containerStyle={styles.iconContainer}
                                    />
                                    <View style={{ flex: 1}}>
                                        <Input
                                            editable={true}
                                            underlineColorAndroid={colors.TRANSPARENT}
                                            placeholder={t('bankCode')}
                                            placeholderTextColor={colors.SHADOW}
                                            value={profileData && profileData.bankCode ? profileData.bankCode : ''}
                                            keyboardType={'email-address'}
                                            inputStyle={[mode === 'dark' ? styles.inputTextDark : styles.inputText, isRTL ? { textAlign: 'right', fontSize: 13, } : { textAlign: 'left', fontSize: 13, }]}
                                            onChangeText={(text) => { setProfileData({ ...profileData, bankCode: text }) }}
                                            secureTextEntry={false}
                                            errorStyle={styles.errorMessageStyle}
                                            inputContainerStyle={styles.inputContainerStyle}
                                            containerStyle={[styles.textInputStyle, { marginLeft: 0 }]}
                                        />
                                    </View>
                                </View>
                            </View>
                            : null}
                            {(auth.profile.usertype == 'driver' && settings.bank_fields) || (auth.profile.usertype == 'customer' && settings.bank_fields && settings.RiderWithDraw) ?
                            <View style={[styles.textInputContainerStyle, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack]}>
                                <Text style={[mode === 'dark' ? styles.textTitleDark : styles.textTitle,isRTL? {textAlign: 'right', marginRight: 30} : {textAlign: 'left', marginLeft: 7}]} >{t('bankAccount')}</Text>
                                <View style={[styles.textInputContainerStyle1, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <Icon
                                        name='numeric'
                                        type='material-community'
                                        color={colors.SHADOW}
                                        size={30}
                                        containerStyle={styles.iconContainer}
                                    />
                                    <View style={{ flex: 1}}>
                                        <Input
                                            editable={true}
                                            underlineColorAndroid={colors.TRANSPARENT}
                                            placeholder={t('bankAccount')}
                                            placeholderTextColor={colors.SHADOW}
                                            value={profileData && profileData.bankAccount ? profileData.bankAccount : ''}
                                            keyboardType={'email-address'}
                                            inputStyle={[mode === 'dark' ? styles.inputTextDark : styles.inputText, isRTL ? { textAlign: 'right', fontSize: 13, } : { textAlign: 'left', fontSize: 13, }]}
                                            onChangeText={(text) => { setProfileData({ ...profileData, bankAccount: text }) }}
                                            secureTextEntry={false}
                                            errorStyle={styles.errorMessageStyle}
                                            inputContainerStyle={styles.inputContainerStyle}
                                            containerStyle={[styles.textInputStyle, { marginLeft: 0 }]}
                                        />
                                    </View>
                                </View>
                            </View>
                            : null}

                            {settings && settings.imageIdApproval ?
                            <View style={[styles.textInputContainerStyle, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack]}>
                                <Text style={[mode === 'dark' ? styles.textTitleDark : styles.textTitle,isRTL? {textAlign: 'right', marginRight: 35} : {textAlign: 'left', marginLeft: 10}]} >{t('verify_id')}</Text>
                                <View style={[styles.textInputContainerStyle1, { flexDirection: isRTL ? 'row-reverse' : 'row'}]}>
                                    <View style={styles.iconContainer}>
                                        <MaterialCommunityIcons name="cellphone-information" size={24} color={colors.SHADOW} />
                                    </View>
                                    <View style={{ flex: 1}}>
                                        <Input
                                            underlineColorAndroid={colors.TRANSPARENT}
                                            placeholder={t('verify_id')}
                                            placeholderTextColor={colors.SHADOW}
                                            value={profileData && profileData.verifyId ? profileData.verifyId : ''}
                                            keyboardType={'email-address'}
                                            inputStyle={[mode === 'dark' ? styles.inputTextDark : styles.inputText, isRTL ? { textAlign: 'right', fontSize: 13, } : { textAlign: 'left', fontSize: 13, }]}
                                            onChangeText={(text) => {
                                                setProfileData({ ...profileData, verifyId: text })
                                            }}
                                            secureTextEntry={false}
                                            errorStyle={styles.errorMessageStyle}
                                            inputContainerStyle={styles.inputContainerStyle}
                                            containerStyle={styles.textInputStyle}
                                        />
                                    </View>
                                </View>
                            </View>
                            : null }
                                   
                            {settings && settings.imageIdApproval ? (
                                <View style={styles.documentContainer}>
                                    {!auth.profile.verifyIdImage ?
                                    capturedIdImage ?
                                        <View style={styles.imagePosition}>
                                            <DocumentStatusBadge 
                                                status={getDocumentStatus('verifyIdImage')}
                                            />
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelIdPhoto}>
                                                <Image source={require('../../assets/images/cross.png')} resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            <Image source={{ uri: capturedIdImage }} style={styles.photoResult} resizeMode={'cover'} />
                                        </View>
                                        :
                                        <View style={[styles.capturePhoto, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack]}>
                                            <View>
                                                {
                                                    state.imageValid ?
                                                        <Text style={styles.capturePhotoTitle}>{t('upload_verifyIdImage')}</Text>
                                                        :
                                                        <Text style={styles.errorPhotoTitle}>{t('upload_verifyIdImage')}</Text>
                                                }

                                            </View>
                                            <View style={[styles.capturePicClick, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                <TouchableOpacity style={styles.flexView1} onPress={() => showActionSheet('2')}>
                                                    <View>
                                                        <View style={styles.imageFixStyle}>
                                                            <Image source={require('../../assets/images/camera.png')} resizeMode={'contain'} style={styles.imageStyle2} />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                <View style={styles.myView}>
                                                    <View style={styles.myView1} />
                                                </View>
                                                <View style={styles.myView2}>
                                                    <View style={styles.myView3}>
                                                        <Text style={mode === 'dark' ? styles.textStyleDark : styles.textStyle}>{t('image_size_warning')}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    :
                                    <View style={styles.imagePosition}>
                                        <DocumentStatusBadge 
                                            status={getDocumentStatus('verifyIdImage')}
                                        />
                                        <View style={{padding:5, alignItems: 'center'}}>
                                            <Text style={mode === 'dark' ? styles.textDark : styles.text}>{t('verifyid_image')}</Text>
                                        </View>
                                        {capturedIdImage ?
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelIdPhoto}>
                                                <Image source={require('../../assets/images/cross.png')} resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            : null}

                                        {capturedIdImage ?
                                            <TouchableOpacity onPress={() => showActionSheet('2')}>
                                                <Image source={{ uri: capturedIdImage }} style={styles.photoResult} resizeMode={'cover'} />
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => showActionSheet('2')}>
                                                <Image source={{ uri: auth.profile.verifyIdImage }} style={styles.photoResult} resizeMode={'cover'} />
                                            </TouchableOpacity>
                                        }
                                    </View>
                                    }
                                    
                                    {/* Nota del administrador si existe */}
                                    {getDocumentStatus('verifyIdImage')?.note && (
                                        <View style={[styles.noteContainer, {
                                            backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE
                                        }]}>
                                            <View style={styles.noteHeader}>
                                                <Ionicons 
                                                    name={getDocumentStatus('verifyIdImage').status === 'rejected' 
                                                        ? 'warning' 
                                                        : 'information-circle'}
                                                    size={20}
                                                    color={getStatusColor(getDocumentStatus('verifyIdImage').status)}
                                                />
                                                <Text style={[styles.noteTitle, {
                                                    color: getStatusColor(getDocumentStatus('verifyIdImage').status)
                                                }]}>
                                                    {t('admin_note')}
                                                </Text>
                                            </View>
                                            <Text style={styles.noteText}>
                                                {getDocumentStatus('verifyIdImage').note}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ) : null}

                            {auth.profile.usertype == 'driver' && settings.license_image_required ? (
                                <View style={styles.documentContainer}>
                                    {!auth.profile.licenseImage ?
                                    capturedImage ?
                                        <View style={styles.imagePosition}>
                                            <DocumentStatusBadge 
                                                status={getDocumentStatus('licenseImageFront')}
                                            />
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelPhoto}>
                                                <Image source={require('../../assets/images/cross.png')} resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            <Image source={{ uri: capturedImage }} style={styles.photoResult} resizeMode={'cover'} />
                                        </View>
                                        :
                                        <View style={[styles.capturePhoto, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack]}>
                                            <View>
                                                {
                                                    state.imageValid ?
                                                        <Text style={styles.capturePhotoTitle}>{t('upload_driving_license_front')}</Text>
                                                        :
                                                        <Text style={styles.errorPhotoTitle}>{t('upload_driving_license_front')}</Text>
                                                }

                                            </View>
                                            <View style={[styles.capturePicClick, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                <TouchableOpacity style={styles.flexView1} onPress={() => showActionSheet('0')}>
                                                    <View>
                                                        <View style={styles.imageFixStyle}>
                                                            <Image source={require('../../assets/images/camera.png')} resizeMode={'contain'} style={styles.imageStyle2} />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                <View style={styles.myView}>
                                                    <View style={styles.myView1} />
                                                </View>
                                                <View style={styles.myView2}>
                                                    <View style={styles.myView3}>
                                                        <Text style={mode === 'dark' ? styles.textStyleDark : styles.textStyle}>{t('image_size_warning')}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    :
                                    <View style={styles.imagePosition}>
                                        <DocumentStatusBadge 
                                            status={getDocumentStatus('licenseImageFront')}
                                        />
                                        <View style={{padding:5, alignItems: 'center'}}>
                                            <Text style={mode === 'dark' ? styles.textDark : styles.text}>{t('driving_license_font')}</Text>
                                        </View>
                                        {capturedImage ?
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelPhoto}>
                                                <Image source={require('../../assets/images/cross.png')} resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            : null}

                                        {capturedImage ?
                                            <TouchableOpacity onPress={() => showActionSheet('0')}>
                                                <Image source={{ uri: capturedImage }} style={styles.photoResult} resizeMode={'cover'} />
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => showActionSheet('0')}>
                                                <Image source={{ uri: auth.profile.licenseImage }} style={styles.photoResult} resizeMode={'cover'} />
                                            </TouchableOpacity>
                                        }
                                    </View>
                                    }
                                    
                                    {/* Nota del administrador si existe */}
                                    {getDocumentStatus('licenseImageFront')?.note && (
                                        <View style={[styles.noteContainer, {
                                            backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE
                                        }]}>
                                            <View style={styles.noteHeader}>
                                                <Ionicons 
                                                    name={getDocumentStatus('licenseImageFront').status === 'rejected' 
                                                        ? 'warning' 
                                                        : 'information-circle'}
                                                    size={20}
                                                    color={getStatusColor(getDocumentStatus('licenseImageFront').status)}
                                                />
                                                <Text style={[styles.noteTitle, {
                                                    color: getStatusColor(getDocumentStatus('licenseImageFront').status)
                                                }]}>
                                                    {t('admin_note')}
                                                </Text>
                                            </View>
                                            <Text style={styles.noteText}>
                                                {getDocumentStatus('licenseImageFront').note}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ) : null}

                            {auth.profile.usertype == 'driver' && settings.license_image_required ? (
                                <View style={styles.documentContainer}>
                                    {!auth.profile.licenseImageBack ?
                                    capturedImageBack ?
                                        <View style={styles.imagePosition}>
                                            <DocumentStatusBadge 
                                                status={getDocumentStatus('licenseImageBack')}
                                            />
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelPhotoback}>
                                                <Image source={require('../../assets/images/cross.png')} resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            <Image source={{ uri: capturedImageBack }} style={styles.photoResult} resizeMode={'cover'} />
                                        </View>
                                        :
                                        <View style={[styles.capturePhoto, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack]}>
                                            <View>
                                                {
                                                    state.imageValid ?
                                                        <Text style={styles.capturePhotoTitle}>{t('upload_driving_license_back')}</Text>
                                                        :
                                                        <Text style={styles.errorPhotoTitle}>{t('upload_driving_license_back')}</Text>
                                                }

                                            </View>
                                            <View style={[styles.capturePicClick, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                <TouchableOpacity style={styles.flexView1} onPress={() => showActionSheet('1')}>
                                                    <View>
                                                        <View style={styles.imageFixStyle}>
                                                            <Image source={require('../../assets/images/camera.png')} resizeMode={'contain'} style={styles.imageStyle2} />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                <View style={styles.myView}>
                                                    <View style={styles.myView1} />
                                                </View>
                                                <View style={styles.myView2}>
                                                    <View style={styles.myView3}>
                                                        <Text style={mode === 'dark' ? styles.textStyleDark : styles.textStyle}>{t('image_size_warning')}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    :
                                    <View style={styles.imagePosition}>
                                        <DocumentStatusBadge 
                                            status={getDocumentStatus('licenseImageBack')}
                                        />
                                        <View style={{padding:5, alignItems: 'center'}}>
                                            <Text style={mode === 'dark' ? styles.textDark : styles.text}>{t('driving_license_back')}</Text>
                                        </View>
                                        {capturedImageBack ?
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelPhotoback}>
                                                <Image source={require('../../assets/images/cross.png')} resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            : null}

                                        {capturedImageBack ?
                                            <TouchableOpacity onPress={() => showActionSheet('1')}>
                                                <Image source={{ uri: capturedImageBack }} style={styles.photoResult} resizeMode={'cover'} />
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => showActionSheet('1')}>
                                                <Image source={{ uri: auth.profile.licenseImageBack }} style={styles.photoResult} resizeMode={'cover'} />
                                            </TouchableOpacity>
                                        }
                                    </View>
                                    }
                                    
                                    {/* Nota del administrador si existe */}
                                    {getDocumentStatus('licenseImageBack')?.note && (
                                        <View style={[styles.noteContainer, {
                                            backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE
                                        }]}>
                                            <View style={styles.noteHeader}>
                                                <Ionicons 
                                                    name={getDocumentStatus('licenseImageBack').status === 'rejected' 
                                                        ? 'warning' 
                                                        : 'information-circle'}
                                                    size={20}
                                                    color={getStatusColor(getDocumentStatus('licenseImageBack').status)}
                                                />
                                                <Text style={[styles.noteTitle, {
                                                    color: getStatusColor(getDocumentStatus('licenseImageBack').status)
                                                }]}>
                                                    {t('admin_note')}
                                                </Text>
                                            </View>
                                            <Text style={styles.noteText}>
                                                {getDocumentStatus('licenseImageBack').note}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ) : null}

                            {auth.profile.usertype == 'driver' && settings.vehicle_registration_card_required ? (
                                <View style={styles.documentContainer}>
                                    {!auth.profile.vehicleRegistrationCard ?
                                    capturedVehicleRegistrationCard ?
                                        <View style={styles.imagePosition}>
                                            <DocumentStatusBadge 
                                                status={getDocumentStatus('vehicleRegistrationCard')}
                                            />
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelVehicleRegistrationCardPhoto}>
                                                <Image source={require('../../assets/images/cross.png')} resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            <Image source={{ uri: capturedVehicleRegistrationCard }} style={styles.photoResult} resizeMode={'cover'} />
                                        </View>
                                        :
                                        <View style={[styles.capturePhoto, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack]}>
                                            <View>
                                                {
                                                    state.imageValid ?
                                                        <Text style={styles.capturePhotoTitle}>{t('upload_vehicle_registration_card')}</Text>
                                                        :
                                                        <Text style={styles.errorPhotoTitle}>{t('upload_vehicle_registration_card')}</Text>
                                                }

                                            </View>
                                            <View style={[styles.capturePicClick, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                <TouchableOpacity style={styles.flexView1} onPress={() => showActionSheet('3')}>
                                                    <View>
                                                        <View style={styles.imageFixStyle}>
                                                            <Image source={require('../../assets/images/camera.png')} resizeMode={'contain'} style={styles.imageStyle2} />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                <View style={styles.myView}>
                                                    <View style={styles.myView1} />
                                                </View>
                                                <View style={styles.myView2}>
                                                    <View style={styles.myView3}>
                                                        <Text style={mode === 'dark' ? styles.textStyleDark : styles.textStyle}>{t('image_size_warning')}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    :
                                    <View style={styles.imagePosition}>
                                        <DocumentStatusBadge 
                                            status={getDocumentStatus('vehicleRegistrationCard')}
                                        />
                                        <View style={{padding:5, alignItems: 'center'}}>
                                            <Text style={mode === 'dark' ? styles.textDark : styles.text}>{t('vehicle_registration_card_image')}</Text>
                                        </View>
                                        {capturedVehicleRegistrationCard ?
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelVehicleRegistrationCardPhoto}>
                                                <Image source={require('../../assets/images/cross.png')} resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            : null}

                                        {capturedVehicleRegistrationCard ?
                                            <TouchableOpacity onPress={() => showActionSheet('3')}>
                                                <Image source={{ uri: capturedVehicleRegistrationCard }} style={styles.photoResult} resizeMode={'cover'} />
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => showActionSheet('3')}>
                                                <Image source={{ uri: auth.profile.vehicleRegistrationCard }} style={styles.photoResult} resizeMode={'cover'} />
                                            </TouchableOpacity>
                                        }
                                    </View>
                                    }
                                    
                                    {/* Nota del administrador si existe */}
                                    {getDocumentStatus('vehicleRegistrationCard')?.note && (
                                        <View style={[styles.noteContainer, {
                                            backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE
                                        }]}>
                                            <View style={styles.noteHeader}>
                                                <Ionicons 
                                                    name={getDocumentStatus('vehicleRegistrationCard').status === 'rejected' 
                                                        ? 'warning' 
                                                        : 'information-circle'}
                                                    size={20}
                                                    color={getStatusColor(getDocumentStatus('vehicleRegistrationCard').status)}
                                                />
                                                <Text style={[styles.noteTitle, {
                                                    color: getStatusColor(getDocumentStatus('vehicleRegistrationCard').status)
                                                }]}>
                                                    {t('admin_note')}
                                                </Text>
                                            </View>
                                            <Text style={styles.noteText}>
                                                {getDocumentStatus('vehicleRegistrationCard').note}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ) : null}

                            {/* Mostrar notas del conductor */}
                            {auth.profile.usertype === 'driver' && auth.profile.driver_notes && (
                                <View style={[styles.driverNotesContainer, {
                                    backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE
                                }]}>
                                    <View style={styles.notesHeader}>
                                        <Ionicons name="document-text" size={24} color={colors.MAIN_COLOR} />
                                        <Text style={[styles.notesTitle, {
                                            color: mode === 'dark' ? colors.WHITE : colors.BLACK
                                        }]}>
                                            {t('admin_note')}
                                        </Text>
                                    </View>
                                    <Text style={[styles.notesContent, {
                                        color: mode === 'dark' ? colors.WHITE : colors.BLACK
                                    }]}>
                                        {auth.profile.driver_notes}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.buttonContainer}>
                                <Button
                                    loading={loading}
                                    onPress={saveProfile}
                                    title={t('update_button')}
                                    titleStyle={styles.buttonTitle}
                                    buttonStyle={[styles.registerButton, { backgroundColor: colors.GREEN }]}
                                />
                            </View>
                            <View style={styles.gapView} />
                        </ScrollView>
                    </View>
                </View>
                {
                    uploadImage()
                }
        </View>
       
    );

}


const styles = StyleSheet.create({
    pickerStyle: {
        color: colors.HEADER,
        width: 200,
        fontSize: 15,
        height: 40,
        marginBottom: 27,
        margin: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.HEADER,
        
    },
    container: {
        height: '100%',
        width: '100%',
    },
    vew: {
        borderTopLeftRadius: 130,
        height: '100%',
        alignItems: 'flex-end'
    },
    textInputContainerStyle: {
        flex: 1,
        height: 82,
        borderRadius: 10,
        marginVertical: 10,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
        marginHorizontal: 5
    },
    shadowBack: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.WHITE,
    },
    shadowBackDark: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.PAGEBACK,
    },
    textInputContainerStyle1: {
        width: '100%',
        height: 60,
        borderRadius: 10,
        marginVertical:-3,
        alignItems: 'center',
    },
    vew1: {
        height: '100%',
        borderBottomRightRadius: 120,
        overflow: 'hidden',
        backgroundColor: colors.WHITE,
        width: '100%'
    },
    textInputStyle: {
    },
    inputContainerStyle: {
        width: "100%",
    },
    iconContainer: {
        width: '15%',
        alignItems: 'center'
    },
    gapView: {
        height: 40,
        width: '100%'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderRadius: 40
    },
    registerButton: {
        width: 150,
        height: 50,
        borderColor: colors.TRANSPARENT,
        borderWidth: 0,
        marginTop: 30,
        borderRadius: 10,
        padding:2
    },
    buttonTitle: {
        fontSize: 16,
        fontFamily:fonts.Regular

    },
    inputText: {
        color: colors.BLACK,
        fontSize: 13,
        height: 32,
        fontFamily:fonts.Regular
    },
    inputTextDark: {
        color: colors.WHITE,
        fontSize: 13,
        height: 32,
        fontFamily:fonts.Regular
    },
    errorMessageStyle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 0
    },
    containerStyle: {
        flexDirection: 'column',
        width: '100%'
    },
    logo: {
        width: '65%',
        justifyContent: "center",
        height: '15%',
        borderBottomRightRadius: 150,
        shadowColor: "black",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 5,
        marginBottom: 5,
    },
    headerStyle: {
        fontSize: 25,
        color: colors.WHITE,
        flexDirection: 'row',
        width: '80%'
    },
    imagePosition: {
        position: 'relative',
    },
    imageStyle: {
        width: 30,
        height: height / 15
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
    capturePhoto: {
        width: '70%',
        height: 150,
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 10,
        marginTop: 15,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
        padding:2
    },
    capturePhotoTitle: {
        color: colors.BLACK,
        fontSize: 16,
        textAlign: 'center',
        paddingBottom: 15,
        fontFamily:fonts.Regular

    },
    errorPhotoTitle: {
        color: colors.RED,
        fontSize: 13,
        textAlign: 'center',
        paddingBottom: 15,
        fontFamily:fonts.Regular
    },
    photoClick: {
        paddingRight: 48,
        position: 'absolute',
        zIndex: 1,
        marginTop: 18,
        alignSelf: 'flex-end'
    },
    capturePicClick: {
        //backgroundColor: colors.WHITE,
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
    myView1: {
        height: height / 18,
        width: 1.5,
        backgroundColor: colors.SHADOW,
        alignItems: 'center',
        marginTop: 10
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
    segmentcontrol: {
        color: colors.WHITE,
        fontSize: 18,
        fontFamily: fonts.Regular,
        marginTop: 0,
        alignSelf: "center",
        height: 50
    },
    textTitle: {
        fontSize: 17,
        left: 10,
        color: colors.BLACK,
        fontFamily:fonts.Bold,
        marginTop: 5
    },
    textTitleDark: {
        fontSize: 17,
        left: 10,
        color: colors.WHITE,
        fontFamily:fonts.Bold,
        marginTop: 5
    },
    text: {
        color: colors.BLACK,
        fontSize: 18,
        textAlign: 'center',
        fontFamily:fonts.Bold
    },
    textDark: {
        color: colors.WHITE,
        fontSize: 18,
        textAlign: 'center',
        fontFamily:fonts.Bold
    },
    textStyle:{
        fontFamily:fonts.Regular,
        color: colors.BLACK
    },
    textStyleDark:{
        fontFamily:fonts.Regular,
        color: colors.WHITE
    },
    documentContainer: {
        marginBottom: 15
    },
    statusBadge: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        position: 'absolute',
        top: 40,
        right: 30,
        zIndex: 2,
        width: 32,
        height: 32
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: fonts.Bold
    },
    noteContainer: {
        marginTop: 15,
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 8,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 6
    },
    noteTitle: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: fonts.Bold
    },
    noteText: {
        fontSize: 13,
        lineHeight: 18,
        fontFamily: fonts.Regular,
        color: colors.DARK_GRAY
    },
    driverNotesContainer: {
        marginTop: 20,
        marginBottom: 10,
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 8,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    notesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 8
    },
    notesTitle: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: fonts.Bold
    },
    notesContent: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: fonts.Regular
    }
});
