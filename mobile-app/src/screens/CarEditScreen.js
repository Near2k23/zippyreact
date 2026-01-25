import React, { useEffect, useState, useRef, useMemo } from 'react';
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
    ActivityIndicator,
    Image
} from 'react-native';
import { colors } from '../common/theme';
var { height, width } = Dimensions.get('window');
import i18n from 'i18n-js';
import RNPickerSelect from '../components/RNPickerSelect';
import { useSelector, useDispatch } from 'react-redux';
import { api } from 'common';
import { Feather, Ionicons, AntDesign } from '@expo/vector-icons';
import { Keyboard } from 'react-native';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import Button from '../components/Button';
import { fonts } from '../common/font';
import * as ImagePicker from 'expo-image-picker';
import ActionSheet from "react-native-actions-sheet";
import { getLangKey } from 'common/src/other/getLangKey';
import { getFilteredCarTypesByZone } from 'common/src/other/ZonePriceHelper';

export default function CarEditScreen(props) {
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const dispatch = useDispatch();
    const {
        updateUserCar,
        updateUserCarWithImage,
        editCar,
        detectZoneByLocation,
        fetchZones,
        setCurrentZone
    } = api;
    const carlistdata = useSelector(state => state.carlistdata);
    const cartypes = useSelector(state => state.cartypes.cars);
    const settings = useSelector(state => state.settingsdata.settings);
    const auth = useSelector(state => state.auth);
    const gps = useSelector(state => state.gpsdata);
    const zonesdata = useSelector(state => state.zonesdata);
    const [carTypes, setCarTypes] = useState(null);
    const [loading, setLoading] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [focusedInput, setFocusedInput] = useState(null);
    const focusedInputRef = useRef(null);
    const actionSheetRef = useRef(null);
    const scrollViewRef = useRef(null);
    const inputRefs = useRef({});
    const hasScrolledForCurrentInput = useRef(false);
    const scrollOffsetRef = useRef(0);
    const isKeyboardVisible = useRef(false);
    const [currentZone, setCurrentZoneState] = useState(null);
    const [cars, setCars] = useState({});
    const [updateCalled, setUpdateCalled] = useState(false);

    const car = props.route.params && props.route.params.car ? props.route.params.car : null;

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

    const [state, setState] = useState({
        car_image: car && car.car_image ? car.car_image : null,
        vehicleNumber: car && car.vehicleNumber ? car.vehicleNumber : null,
        vehicleMake: car && car.vehicleMake ? car.vehicleMake : null,
        vehicleModel: car && car.vehicleModel ? car.vehicleModel : null,
        carType: car && car.carType ? car.carType : null,
        other_info: car && car.other_info ? car.other_info : "",
        approved: car && car.approved ? car.approved : null,
        active: car && car.active ? car.active : null
    });

    const [blob, setBlob] = useState();
    const pickerRef1 = React.createRef();

    useEffect(() => {
        if (cartypes) {
            let arr = [];
            const filteredCartypes = getFilteredCarTypesByZone(cartypes, currentZone?.id);

            const sorted = filteredCartypes.sort((a, b) => (a.pos || 0) - (b.pos || 0));
            for (let i = 0; i < sorted.length; i++) {
                arr.push({ label: t(getLangKey(sorted[i].name)), value: sorted[i].name });
            }
            
            if (!car || !car.id) {
                const type1Car = sorted.find(carType => carType.id === "type1");
                if (type1Car) {
                    setState(prevState => ({ ...prevState, carType: type1Car.name }));
                } else if (arr.length > 0) {
                    setState(prevState => ({ ...prevState, carType: arr[0].value }));
                }
            }
            
            setCarTypes(arr);
        }
    }, [cartypes, currentZone]);

    useEffect(() => {
        dispatch(fetchZones());
    }, [dispatch, fetchZones]);

    useEffect(() => {
        if (gps.location && zonesdata.zones && zonesdata.zones.length > 0) {
            try{ console.log('ZONES_GPS_CAREDIT', { lat: gps.location.lat, lng: gps.location.lng }); }catch(e){}
            const detectedZone = detectZoneByLocation(gps.location.lat, gps.location.lng, zonesdata.zones);

            const hasGeometryMatch = !!(detectedZone && detectedZone.geometry);

            if (hasGeometryMatch) {
                setCurrentZoneState(detectedZone);
                dispatch(setCurrentZone(detectedZone));
            } else {
                setCurrentZoneState(null);
            }
        }
    }, [gps.location, zonesdata.zones, dispatch, setCurrentZone]);

    useEffect(() => {
        if (carlistdata.cars) {
            setCars(carlistdata.cars);
            if (updateCalled) {
                setLoading(false);
                Alert.alert(
                    t('alert'),
                    t('profile_updated'),
                    [
                        { text: t('ok'), onPress: () => { props.navigation.goBack() } }
                    ],
                    { cancelable: true }
                );
                setUpdateCalled(false);
            }
        } else {
            setCars([]);
        }
    }, [carlistdata.cars, updateCalled]);

    const inputLayouts = useRef({});

    useEffect(() => {
        focusedInputRef.current = focusedInput;
        hasScrolledForCurrentInput.current = false;
    }, [focusedInput]);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        (e) => {
            isKeyboardVisible.current = true;
            const currentFocusedInput = focusedInputRef.current;
            if (currentFocusedInput && inputRefs.current[currentFocusedInput] && scrollViewRef.current && !hasScrolledForCurrentInput.current) {
                inputRefs.current[currentFocusedInput].measure((x, y, width, height, pageX, pageY) => {
                    const keyboardHeight = e.endCoordinates.height;
                    const screenHeight = Dimensions.get('window').height;
                    const visibleHeight = screenHeight - keyboardHeight;
                    
                    if (pageY + height + 50 > visibleHeight) {
                        const inputContainer = inputLayouts.current[currentFocusedInput];
                        if (inputContainer && inputContainer.baseY !== undefined) {
                            const targetScrollY = scrollOffsetRef.current + inputContainer.baseY - 100;
                            hasScrolledForCurrentInput.current = true;
                            setTimeout(() => {
                                if (scrollViewRef.current && isKeyboardVisible.current) {
                                    scrollViewRef.current.scrollTo({
                                        y: Math.max(0, targetScrollY),
                                        animated: true
                                    });
                                }
                            }, Platform.OS === 'ios' ? 100 : 200);
                        }
                    }
                });
            }
        }
    );

    const keyboardDidHideListener = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
        () => {
            isKeyboardVisible.current = false;
            hasScrolledForCurrentInput.current = false;
        }
    );

    return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
    };
}, []);
    
    // Crear blob para la imagen existente cuando se carga el componente
    useEffect(() => {
        const createBlobFromExistingImage = async () => {
            if (state.car_image && !blob) {
                setLoading(true);
                try {
                    const imageBlob = await new Promise((resolve, reject) => {
                        const xhr = new XMLHttpRequest();
                        xhr.onload = function () {
                            resolve(xhr.response);
                        };
                        xhr.onerror = function () {
                            Alert.alert(t('alert'), t('image_upload_error'));
                            setLoading(false);
                            reject(new Error('Error al cargar la imagen'));
                        };
                        xhr.responseType = 'blob';
                        xhr.open('GET', state.car_image, true);
                        xhr.send(null);
                    });
                    if (imageBlob) {
                        setBlob(imageBlob);
                    }
                } catch (error) {
                    console.error('Error al crear blob:', error);
                }
                setLoading(false);
            }
        };
        
        createBlobFromExistingImage();
    }, [state.car_image]);

    const showActionSheet = () => {
        actionSheetRef.current?.setModalVisible(true);
    }

    const uploadImage = () => {
        return (
            <ActionSheet ref={actionSheetRef}>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, borderColor: colors.SHADOW, borderBottomWidth: 1, height: 60, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { _pickImage('CAMERA') }}
                >
                    <Text style={{ color: colors.BLUE,fontFamily:fonts.Bold }}>{t('camera')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, borderBottomWidth: 1, borderColor: colors.SHADOW, height: 60, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { _pickImage('MEDIA') }}
                >
                    <Text style={{ color: colors.BLUE,fontFamily:fonts.Bold}}>{t('medialibrary')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, height: 50, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { actionSheetRef.current?.setModalVisible(false); }}>
                    <Text style={{ color: 'red',fontFamily:fonts.Bold }}>{t('cancel')}</Text>
                </TouchableOpacity>
            </ActionSheet>
        )
    }

    const _pickImage = async (permissionType) => {
        let permisions;
        if (permissionType === 'CAMERA') {
            permisions = await ImagePicker.requestCameraPermissionsAsync();
        } else {
            permisions = await ImagePicker.requestMediaLibraryPermissionsAsync();
        }
        const { status } = permisions;

        if (status === 'granted') {
            let pickFrom = permissionType === 'CAMERA' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
            
            let result = await pickFrom({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8
            });
            
            // Cerrar el ActionSheet después de la selección
            actionSheetRef.current?.setModalVisible(false);
            
            if (!result.canceled && result.assets && result.assets[0]) {
                setLoading(true);
                const imageUri = result.assets[0].uri;
                setCapturedImage(imageUri);
                setState({
                    ...state,
                    car_image: imageUri
                });

                fetch(imageUri)
                    .then(res => res.blob())
                    .then(blob => {
                        if (blob) {
                            setBlob(blob);
                        }
                        setLoading(false);
                    })
                    .catch(error => {
                        Alert.alert(t('alert'), t('image_upload_error'));
                        setLoading(false);
                    });
            }
        } else {
            actionSheetRef.current?.setModalVisible(false);
            Alert.alert(t('alert'), t('camera_permission_error'));
        }
    }

    const cancelPhoto = () => {
        setCapturedImage(null);
    }

    const onSave = () => {
        if (state.carType && state.carType.length > 1 && state.vehicleNumber && state.vehicleNumber.length > 1 && state.vehicleMake && state.vehicleMake.length > 1 && state.vehicleModel && state.vehicleModel.length > 1) {
            if (state.car_image) {
                setLoading(true);
                setUpdateCalled(true);
                let activeCar = null;
                let newData = { ...state };
                for (let i = 0; i < cars.length; i++) {
                    if (cars[i].active) {
                        activeCar = cars[i];
                        break;
                    }
                }
                if (activeCar && state.active) {
                    activeCar.active = false;
                    dispatch(editCar(activeCar, "Update"));
                } else if (activeCar && !newData.active) {
                    newData.active = false;
                } else {
                    newData.active = true;
                }
                newData['createdAt'] = new Date().getTime();
                newData['driver'] = auth.profile.uid;
                newData['fleetadmin'] = auth.profile && auth.profile.fleetadmin ? auth.profile.fleetadmin : null;
                if (!settings.carApproval) {
                    newData['approved'] = true;
                } else {
                    newData['approved'] = false;
                }
                
                // Si tenemos blob, usamos updateUserCarWithImage, de lo contrario usamos updateUserCar
                if (blob) {
                    dispatch(updateUserCarWithImage(newData, blob));
                } else {
                    // Si no hay blob pero hay imagen, actualizamos sin imagen
                    let updateData = {
                        carType: newData.carType,
                        vehicleNumber: newData.vehicleNumber,
                        vehicleMake: newData.vehicleMake,
                        vehicleModel: newData.vehicleModel,
                        other_info: newData.other_info ? newData.other_info : "",
                        car_image: newData.car_image,
                        active: newData.active,
                        approved: newData.approved,
                        createdAt: newData.createdAt,
                        driver: newData.driver,
                        fleetadmin: newData.fleetadmin,
                        updateAt: new Date().getTime()
                    };
                    dispatch(updateUserCar(auth.profile.uid, updateData));
                }
            }
            else {
                Alert.alert(t('alert'), t('proper_input_image'));
            }
        } else {
            Alert.alert(t('alert'), t('no_details_error'));
        }
    }

    const makeActive = () => {
        setLoading(true);
        let activeCar = null;
        for (let i = 0; i < cars.length; i++) {
            if (cars[i].active && cars[i].id != car.id) {
                activeCar = cars[i];
                break;
            }
        }
        if (activeCar) {
            activeCar.active = false;
            dispatch(editCar(activeCar, "Update"));
        }
        car.active = true;
        dispatch(editCar(car, "Update"));
        let updateData = {
            carType: car.carType,
            vehicleNumber: car.vehicleNumber,
            vehicleMake: car.vehicleMake,
            vehicleModel: car.vehicleModel,
            other_info: car.other_info ? car.other_info : "",
            car_image: car.car_image,
            carApproved: car.approved,
            updateAt: new Date().getTime()
        };
        dispatch(updateUserCar(auth.profile.uid, updateData));
        props.navigation.goBack()
    }

    const RemoteImage = React.memo(({ uri, desiredWidth }) => {
        const [desiredHeight, setDesiredHeight] = useState(0);
        
        useEffect(() => {
            if (uri) {
                setDesiredHeight(0);
                Image.getSize(
                    uri,
                    (width, height) => {
                        setDesiredHeight(desiredWidth / width * height);
                    },
                    (error) => {
                        console.error('Error getting image size:', error);
                        setDesiredHeight(desiredWidth * 0.75);
                    }
                );
            }
        }, [uri, desiredWidth]);
        
        return (
            <Image 
                source={{ uri }} 
                style={{ 
                    width: desiredWidth, 
                    height: desiredHeight || desiredWidth * 0.75 
                }} 
            />
        );
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: mode === 'dark' ? colors.BLACK : colors.WHITE }]}>
            <KeyboardAvoidingView 
                style={styles.keyboardAvoidingView} 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                enabled={true}
            >
                <ScrollView 
                    ref={scrollViewRef}
                    style={styles.scrollViewStyle} 
                    showsVerticalScrollIndicator={false} 
                    contentContainerStyle={{ paddingHorizontal: 12.5, paddingBottom: 30 }}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true}
                    onScroll={(event) => {
                        scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
                    }}
                    onContentSizeChange={() => {
                        if (!isKeyboardVisible.current) {
                            hasScrolledForCurrentInput.current = false;
                        }
                    }}
                    scrollEventThrottle={16}
                >
                  
                    <View style={styles.form}>
                        {
                            uploadImage()
                        }
                        <View style={styles.containerStyle}>
                            {loading ? (
                                <View style={styles.loaderContainer}>
                                    <ActivityIndicator size="large" color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} />
                                </View>
                            ) : state.car_image ? (
                                <View style={styles.imageContainer}>
                                    <RemoteImage
                                        uri={state.car_image}
                                        desiredWidth={width * 0.8}
                                    />
                                    {!car || !car.id ? (
                                        <TouchableOpacity onPress={showActionSheet} style={styles.imageOverlay}>
                                            <Feather name="edit-2" size={24} color={colors.WHITE} />
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            ) : capturedImage ? (
                                <View style={styles.imagePosition}>
                                    {!car || !car.id ? (
                                        <TouchableOpacity style={styles.photoClick} onPress={cancelPhoto}>
                                            <Image source={require('../../assets/images/cross.png')} resizeMode={'contain'} style={styles.imageStyle} />
                                        </TouchableOpacity>
                                    ) : null}
                                    <View style={styles.imageContainer}>
                                        <Image source={{ uri: capturedImage }} style={styles.photoResult} resizeMode={'cover'} />
                                        {!car || !car.id ? (
                                            <TouchableOpacity onPress={showActionSheet} style={styles.imageOverlay}>
                                                <Feather name="edit-2" size={24} color={colors.WHITE} />
                                            </TouchableOpacity>
                                        ) : null}
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.capturePhoto}>
                                    <View>
                                        <Text style={[styles.capturePhotoTitle, styles.fontStyle,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>{t('upload_car_image')}</Text>
                                    </View>
                                    {!car || !car.id ? (
                                        <View style={[styles.capturePicClick, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                            <TouchableOpacity style={styles.flexView1} onPress={showActionSheet}>
                                                <View>
                                                    <View style={styles.imageFixStyle}>
                                                        <AntDesign name="clouduploado" size={100} color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} style={styles.imageStyle2} />
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View style={[styles.capturePicClick, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                            <View style={styles.flexView1}>
                                                <View>
                                                    <View style={styles.imageFixStyle}>
                                                        <AntDesign name="clouduploado" size={100} color={colors.SHADOW} style={styles.imageStyle2} />
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}

                        <View style={styles.containerStyle}>
                            {car && car.id ? (
                                <View style={styles.inputContainerStyle}>
                                    <Text style={[styles.inputLabel, { color: mode === 'dark' ? colors.WHITE : '#A7A9AC' }]}>
                                        {t('select_vehicle_type')}
                                    </Text>
                                    <TextInput
                                        editable={false}
                                        value={t(getLangKey(car.carType))}
                                        style={[
                                            styles.textInputStyle,
                                            { 
                                                backgroundColor: mode === 'dark' ? colors.BLACK : colors.WHITE,
                                                color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                                borderColor: '#E2E9EC'
                                            }
                                        ]}
                                    />
                                </View>
                            ) : null}

                            <View 
                                style={styles.inputContainerStyle}
                                onLayout={(event) => {
                                    const layout = event.nativeEvent.layout;
                                    if (inputLayouts.current['vehicleMake']?.baseY !== layout.y) {
                                        inputLayouts.current['vehicleMake'] = { 
                                            baseY: layout.y
                                        };
                                    }
                                }}
                            >
                                <Text style={[styles.inputLabel, { color: mode === 'dark' ? colors.WHITE : '#A7A9AC' }]}>
                                    {t('vehicle_model_name')}
                                </Text>
                                <TextInput
                                    ref={(ref) => inputRefs.current['vehicleMake'] = ref}
                                    editable={!(car && car.id)}
                                    value={state.vehicleMake}
                                    onChangeText={(text) => setState({ ...state, vehicleMake: text })}
                                    onFocus={() => setFocusedInput('vehicleMake')}
                                    onBlur={() => setFocusedInput(null)}
                                    style={[
                                        styles.textInputStyle,
                                        focusedInput === 'vehicleMake' && styles.inputFocused,
                                        {
                                            backgroundColor: mode === 'dark' ? colors.BLACK : colors.WHITE,
                                            color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                            borderColor: focusedInput === 'vehicleMake' ? colors.INPUT_FOCUS : '#E2E9EC'
                                        }
                                    ]}
                                    placeholderTextColor={colors.SHADOW}
                                />
                            </View>

                            <View 
                                style={styles.inputContainerStyle}
                                onLayout={(event) => {
                                    const layout = event.nativeEvent.layout;
                                    if (inputLayouts.current['vehicleModel']?.baseY !== layout.y) {
                                        inputLayouts.current['vehicleModel'] = { 
                                            baseY: layout.y
                                        };
                                    }
                                }}
                            >
                                <Text style={[styles.inputLabel, { color: mode === 'dark' ? colors.WHITE : '#A7A9AC' }]}>
                                    {t('vehicle_model_no')}
                                </Text>
                                <TextInput
                                    ref={(ref) => inputRefs.current['vehicleModel'] = ref}
                                    editable={!(car && car.id)}
                                    value={state.vehicleModel}
                                    onChangeText={(text) => setState({ ...state, vehicleModel: text })}
                                    onFocus={() => setFocusedInput('vehicleModel')}
                                    onBlur={() => setFocusedInput(null)}
                                    style={[
                                        styles.textInputStyle,
                                        focusedInput === 'vehicleModel' && styles.inputFocused,
                                        {
                                            backgroundColor: mode === 'dark' ? colors.BLACK : colors.WHITE,
                                            color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                            borderColor: focusedInput === 'vehicleModel' ? colors.INPUT_FOCUS : '#E2E9EC'
                                        }
                                    ]}
                                    placeholderTextColor={colors.SHADOW}
                                />
                            </View>

                            <View 
                                style={styles.inputContainerStyle}
                                onLayout={(event) => {
                                    const layout = event.nativeEvent.layout;
                                    inputLayouts.current['vehicleNumber'] = { 
                                        baseY: layout.y
                                    };
                                }}
                            >
                                <Text style={[styles.inputLabel, { color: mode === 'dark' ? colors.WHITE : '#A7A9AC' }]}>
                                    {t('vehicle_reg_no')}
                                </Text>
                                <TextInput
                                    ref={(ref) => inputRefs.current['vehicleNumber'] = ref}
                                    editable={!(car && car.id)}
                                    value={state.vehicleNumber}
                                    onChangeText={(text) => setState({ ...state, vehicleNumber: text })}
                                    onFocus={() => setFocusedInput('vehicleNumber')}
                                    onBlur={() => setFocusedInput(null)}
                                    style={[
                                        styles.textInputStyle,
                                        focusedInput === 'vehicleNumber' && styles.inputFocused,
                                        {
                                            backgroundColor: mode === 'dark' ? colors.BLACK : colors.WHITE,
                                            color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                            borderColor: focusedInput === 'vehicleNumber' ? colors.INPUT_FOCUS : '#E2E9EC'
                                        }
                                    ]}
                                    placeholderTextColor={colors.SHADOW}
                                />
                            </View>

                            <View 
                                style={styles.inputContainerStyle}
                                onLayout={(event) => {
                                    const layout = event.nativeEvent.layout;
                                    if (inputLayouts.current['other_info']?.baseY !== layout.y) {
                                        inputLayouts.current['other_info'] = { 
                                            baseY: layout.y
                                        };
                                    }
                                }}
                            >
                                <Text style={[styles.inputLabel, { color: mode === 'dark' ? colors.WHITE : '#A7A9AC' }]}>
                                    {t('other_info')}
                                </Text>
                                <TextInput
                                    ref={(ref) => inputRefs.current['other_info'] = ref}
                                    editable={!(car && car.id)}
                                    value={state.other_info}
                                    onChangeText={(text) => setState({ ...state, other_info: text })}
                                    onFocus={() => setFocusedInput('other_info')}
                                    onBlur={() => setFocusedInput(null)}
                                    multiline
                                    numberOfLines={3}
                                    style={[
                                        styles.textInputStyle,
                                        focusedInput === 'other_info' && styles.inputFocused,
                                        {
                                            backgroundColor: mode === 'dark' ? colors.BLACK : colors.WHITE,
                                            color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                            borderColor: focusedInput === 'other_info' ? colors.INPUT_FOCUS : '#E2E9EC',
                                            height: 80,
                                            textAlignVertical: 'top'
                                        }
                                    ]}
                                    placeholderTextColor={colors.SHADOW}
                                />
                            </View>
                        </View>
                        {!car || !car.id ? (
                            <View style={styles.buttonContainer}>
                                {!car ? (
                                    <TouchableOpacity
                                        style={[
                                            styles.registerButton,
                                            loading && styles.registerButtonClicked,
                                            { backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : '#1369B4' }
                                        ]}
                                        onPress={onSave}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color={colors.WHITE} />
                                        ) : (
                                            <Text style={styles.buttonStyle}>{t('save')}</Text>
                                        )}
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={[
                                            styles.registerButton,
                                            loading && styles.registerButtonClicked,
                                            { backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : '#1369B4' }
                                        ]}
                                        onPress={makeActive}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color={colors.WHITE} />
                                        ) : (
                                            <Text style={styles.buttonStyle}>{t('save')}</Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : null}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    keyboardAvoidingView: {
        flex: 1
    },
    headerContainer: {
        marginBottom: 20,
        width: width - 25,
        alignSelf: 'center'
    },
    headerStyle: {
        fontSize: 28,
        color: colors.BLACK,
        fontFamily: fonts.Bold,
        width: '100%'
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#A7A9AC',
        marginTop: 4,
        fontFamily: fonts.Regular,
        width: '100%'
    },
    form: {
        alignItems: 'center',
        width: '100%',
        gap: 25,
        marginBottom: 25,
        flexGrow: 1
    },
    containerStyle: {
        flexDirection: 'column',
        marginTop: 10,
        width: '100%',
        gap: 10
    },
    inputContainerStyle: {
        width: "100%",
    },
    inputLabel: {
        width: '100%',
        fontSize: 13,
        color: '#A7A9AC',
        marginBottom: 6,
        fontFamily: fonts.Bold
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
    RnpickerBox: {
        width: "100%",
        height: 50,
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
    pickerStyle: {
        fontSize: 15,
        paddingVertical: 12,
        position: 'relative',
        paddingLeft: 10,
        paddingRight: 10,
        fontFamily: fonts.Bold,
        flexWrap: 'wrap',
        width: "100%",
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: width - 25,
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
    scrollViewStyle: {
        flex: 1,
    },
    capturePhoto: {
        width: '95%',
        height: 180,
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 10,
        marginTop: 15,
        borderWidth: 0.8,
        borderColor: colors.SHADOW
    },
    capturePhotoTitle: {
        color: colors.BLACK,
        fontSize: 16,
        textAlign: 'center',
        paddingBottom: 15
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
        paddingTop: 15,
        marginRight: 20,
        paddingBottom: 10,
        marginTop: 15,
        width: '95%',
        height: height / 4
    },
    imagePosition: {
        position: 'relative',
        width: "100%"
    },
    photoClick: {
        paddingRight: 35,
        position: 'absolute',
        zIndex: 1,
        marginTop: 18,
        alignSelf: 'flex-end'
    },
    capturePicClick: {
        justifyContent: "center",
        flexDirection: 'row',
        position: 'relative',
        zIndex: 1
    },
    imageStyle: {
        width: 25,
        height: 25
    },
    flexView1: {
        width: "100%",
        height: "100%"
    },
    imageFixStyle: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageStyle2: {
        opacity: 0.6
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
    imageContainer: {
        alignSelf: 'center',
        marginVertical: 10,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative'
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    loaderContainer: {
        width: '100%',
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    }

});