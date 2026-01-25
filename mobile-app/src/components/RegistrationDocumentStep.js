import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    useColorScheme,
    Modal,
    Dimensions,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import ActionSheet from "react-native-actions-sheet";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../common/theme';
import { fonts } from '../common/font';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import i18n from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function RegistrationDocumentStep({ documentImage, selfieImage, onDocumentImageChange, onSelfieImageChange, mode: propMode, onBack, onNext, loading, nextDisabled }) {
    const { t } = i18n;
    const actionSheetRef = useRef(null);
    const cameraRef = useRef(null);
    const [check, setCheck] = useState(null);
    const [mode, setMode] = useState(propMode || 'light');
    const [showCamera, setShowCamera] = useState(false);
    const [cameraType, setCameraType] = useState('document');
    const [isCapturing, setIsCapturing] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const colorScheme = useColorScheme();

    React.useEffect(() => {
        if (propMode) {
            setMode(propMode);
        } else {
            AsyncStorage.getItem('theme', (err, result) => {
                if (result) {
                    const theme = JSON.parse(result)['mode'];
                    if (theme === 'system') {
                        setMode(colorScheme);
                    } else {
                        setMode(theme);
                    }
                } else {
                    setMode('light');
                }
            });
        }
    }, [propMode, colorScheme]);

    const showActionSheet = (imageType) => {
        setCheck(imageType);
        handleOpenCamera(imageType);
    }

    const handleOpenCamera = async (imageType) => {
        if (!permission) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert(t('alert'), t('camera_permission_error'));
                return;
            }
        }
        setCameraType(imageType);
        setShowCamera(true);
    }

    const handleTakePicture = async () => {
        if (cameraRef.current && !isCapturing) {
            setIsCapturing(true);
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                });
                
                if (photo && photo.uri) {
                    let blob;
                    try {
                        const response = await fetch(photo.uri);
                        blob = await response.blob();
                    } catch (error) {
                        console.error('Error creating blob:', error);
                        Alert.alert(t('alert'), t('image_upload_error'));
                        setIsCapturing(false);
                        return;
                    }
                    
                    if (blob) {
                        if (cameraType === 'document') {
                            onDocumentImageChange(photo.uri, blob);
                        } else if (cameraType === 'selfie') {
                            onSelfieImageChange(photo.uri, blob);
                        }
                        
                        setShowCamera(false);
                        setIsCapturing(false);
                    } else {
                        setIsCapturing(false);
                    }
                } else {
                    setIsCapturing(false);
                }
            } catch (error) {
                console.error('Error taking picture:', error);
                Alert.alert(t('alert'), t('image_upload_error'));
                setIsCapturing(false);
            }
        }
    }

    const handleCloseCamera = () => {
        if (!isCapturing) {
            setShowCamera(false);
        }
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
                let blob;
                try {
                    const response = await fetch(result.assets[0].uri);
                    blob = await response.blob();
                } catch (error) {
                    Alert.alert(t('alert'), t('image_upload_error'));
                    return;
                }
                if (blob) {
                    if (check == 'document') {
                        onDocumentImageChange(result.assets[0].uri, blob);
                    } else if (check == 'selfie') {
                        onSelfieImageChange(result.assets[0].uri, blob);
                    }
                }
            }
        } else {
            Alert.alert(t('alert'), t('camera_permission_error'));
        }
    }

    const cancelDocumentPhoto = () => {
        onDocumentImageChange(null, null);
    }

    const cancelSelfiePhoto = () => {
        onSelfieImageChange(null, null);
    }

    const uploadImage = () => {
        return (
            <ActionSheet ref={actionSheetRef}>
                <TouchableOpacity
                    style={[styles.actionSheetItem, { borderBottomWidth: 1 }]}
                    onPress={() => { _pickImage('CAMERA', ImagePicker.launchCameraAsync) }}
                >
                    <Text style={{ color: colors.BLUE, fontFamily: fonts.Bold }}>{t('camera')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionSheetItem, { borderBottomWidth: 1 }]}
                    onPress={() => { _pickImage('MEDIA', ImagePicker.launchImageLibraryAsync) }}
                >
                    <Text style={{ color: colors.BLUE, fontFamily: fonts.Bold }}>{t('medialibrary')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionSheetItem}
                    onPress={() => { actionSheetRef.current?.setModalVisible(false); }}
                >
                    <Text style={{ color: 'red', fontFamily: fonts.Bold }}>{t('cancel')}</Text>
                </TouchableOpacity>
            </ActionSheet>
        )
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                        {t('identity_document')}
                    </Text>
                    {documentImage ? (
                        <View style={styles.imageContainer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={cancelDocumentPhoto}>
                                <Ionicons name="close-circle" size={30} color={colors.RED} />
                            </TouchableOpacity>
                            <Image source={{ uri: documentImage }} style={styles.image} resizeMode="cover" />
                        </View>
                    ) : (
                        <TouchableOpacity 
                            style={[styles.captureButton, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}
                            onPress={() => showActionSheet('document')}
                        >
                            <Ionicons name="camera" size={40} color={mode === 'dark' ? colors.WHITE : colors.BLACK} />
                            <Text style={[styles.captureButtonText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                {t('take_photo') || 'Tomar foto'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                        {t('selfie') || 'Selfie'}
                    </Text>
                    {selfieImage ? (
                        <View style={styles.imageContainer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={cancelSelfiePhoto}>
                                <Ionicons name="close-circle" size={30} color={colors.RED} />
                            </TouchableOpacity>
                            <Image source={{ uri: selfieImage }} style={styles.image} resizeMode="cover" />
                        </View>
                    ) : (
                        <TouchableOpacity 
                            style={[styles.captureButton, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}
                            onPress={() => showActionSheet('selfie')}
                        >
                            <Ionicons name="person" size={40} color={mode === 'dark' ? colors.WHITE : colors.BLACK} />
                            <Text style={[styles.captureButtonText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                {t('take_selfie') || 'Tomar selfie'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
                {(onBack || onNext) && (
                    <View style={{ width: '100%', flexDirection: 'row', gap: 10, alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 20 }}>
                        {onBack && (
                            <TouchableOpacity 
                                style={[styles.navigationButton, { width: 'auto', paddingHorizontal: 20, backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE, borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}
                                onPress={onBack}
                            >
                                <Text style={[styles.navigationButtonText, { color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}>
                                    {i18n.t('back') || 'Volver'}
                                </Text>
                            </TouchableOpacity>
                        )}
                        {onNext && (
                            <TouchableOpacity 
                                style={[styles.navigationButtonPrimary, { flex: 1, backgroundColor: nextDisabled ? '#CCCCCC' : (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR), opacity: nextDisabled ? 0.5 : 1 }]}
                                onPress={onNext}
                                activeOpacity={0.8}
                                disabled={nextDisabled || loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={colors.WHITE} />
                                ) : (
                                    <Text style={styles.navigationButtonPrimaryText}>
                                        {i18n.t('next') || 'Siguiente'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>
            {uploadImage()}
            <Modal
                visible={showCamera}
                animationType="slide"
                onRequestClose={handleCloseCamera}
            >
                <StatusBar hidden />
                <View style={styles.cameraContainer}>
                    <CameraView
                        ref={cameraRef}
                        style={styles.camera}
                        facing={cameraType === 'selfie' ? 'front' : 'back'}
                    >
                        <View style={styles.cameraOverlay}>
                            <TouchableOpacity
                                style={[styles.closeCameraButton, isCapturing && styles.closeCameraButtonDisabled]}
                                onPress={handleCloseCamera}
                                disabled={isCapturing}
                            >
                                <Ionicons name="close" size={30} color={colors.WHITE} />
                            </TouchableOpacity>
                            <View style={styles.idGuideContainer}>
                                <Image
                                    source={cameraType === 'document' 
                                        ? require('../../assets/images/id.png')
                                        : require('../../assets/images/face-shape.png')
                                    }
                                    style={styles.idGuideImage}
                                    resizeMode="contain"
                                />
                            </View>
                            <TouchableOpacity
                                style={[styles.captureButtonCamera, isCapturing && styles.captureButtonDisabled]}
                                onPress={handleTakePicture}
                                disabled={isCapturing}
                            >
                                <View style={styles.captureButtonInner} />
                            </TouchableOpacity>
                        </View>
                    </CameraView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
    },
    title: {
        fontSize: 24,
        fontFamily: fonts.Bold,
        marginBottom: 8,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: fonts.Bold,
        marginBottom: 12,
    },
    captureButton: {
        height: 150,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E2E9EC',
        borderStyle: 'dashed',
    },
    captureButtonText: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        marginTop: 8,
    },
    imageContainer: {
        position: 'relative',
        borderRadius: 10,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    cancelButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 15,
    },
    actionSheetItem: {
        width: '90%',
        alignSelf: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        borderColor: colors.SHADOW,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
    },
    closeCameraButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    idGuideContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    idGuideImage: {
        width: width * 0.7,
        height: width * 0.7,
        opacity: 0.8,
    },
    captureButtonCamera: {
        alignSelf: 'center',
        marginBottom: 50,
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: colors.WHITE,
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.WHITE,
    },
    captureButtonDisabled: {
        opacity: 0.5,
    },
    closeCameraButtonDisabled: {
        opacity: 0.5,
    },
    navigationButton: {
        backgroundColor: colors.WHITE,
        borderWidth: 2,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navigationButtonText: {
        fontSize: 14,
        fontFamily: fonts.Bold,
    },
    navigationButtonPrimary: {
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navigationButtonPrimaryText: {
        color: colors.WHITE,
        fontSize: 16,
        fontFamily: fonts.Bold,
    },
});

