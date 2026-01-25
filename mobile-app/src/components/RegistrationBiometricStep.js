import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    useColorScheme,
    Image,
    ScrollView,
    Linking,
    Platform,
    AppState,
    ActivityIndicator
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../common/theme';
import { fonts } from '../common/font';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import i18n from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WaygoDialog from './WaygoDialog';

export default function RegistrationBiometricStep({ onContinue, onBiometricEnabled, onAvailabilityChange, mode: propMode, onBack, onNext, loading, nextDisabled }) {
    const { t } = i18n;
    const [biometricType, setBiometricType] = useState(null);
    const [isAvailable, setIsAvailable] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [mode, setMode] = useState(propMode || 'light');
    const colorScheme = useColorScheme();

    useEffect(() => {
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

    useEffect(() => {
        checkBiometricType();
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active' && isEnabled) {
                checkBiometricType();
            }
        });

        return () => {
            subscription?.remove();
        };
    }, [isEnabled]);

    const checkBiometricType = async () => {
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            if (!compatible) {
                return;
            }

            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

            if (types.length > 0) {
                if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                    setBiometricType('Face ID');
                } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                    setBiometricType('Touch ID');
                } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
                    setBiometricType('Iris');
                } else {
                    setBiometricType('Biometric');
                }
            }
        } catch (error) {
            console.log('Error checking biometric type:', error);
        }
    };

    const checkBiometricAvailability = async () => {
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            if (!compatible) {
                setIsAvailable(false);
                if (onAvailabilityChange) {
                    onAvailabilityChange(false);
                }
                return false;
            }

            const enrolled = await LocalAuthentication.isEnrolledAsync();
            setIsAvailable(enrolled);
            
            if (onAvailabilityChange) {
                onAvailabilityChange(enrolled);
            }

            return enrolled;
        } catch (error) {
            console.log('Error checking biometric availability:', error);
            setIsAvailable(false);
            if (onAvailabilityChange) {
                onAvailabilityChange(false);
            }
            return false;
        }
    };

    const openDeviceSettings = async () => {
        try {
            if (Platform.OS === 'ios') {
                await Linking.openSettings();
            } else {
                await Linking.openSettings();
            }
            setShowDialog(false);
            setTimeout(async () => {
                await checkBiometricAvailability();
            }, 1000);
        } catch (error) {
            console.log('Error opening settings:', error);
            Alert.alert(
                t('error') || 'Error',
                t('settings_open_error') || 'No se pudo abrir la configuración del dispositivo.'
            );
        }
    };

    const authenticate = async () => {
        const available = await checkBiometricAvailability();
        
        if (!available) {
            setShowDialog(true);
            return;
        }

        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: t('biometric_auth_message') || 'Autenticación biométrica requerida',
                cancelLabel: t('cancel') || 'Cancelar',
                disableDeviceFallback: false,
            });

            if (result.success) {
                setIsEnabled(true);
                if (onBiometricEnabled) {
                    onBiometricEnabled(true);
                }
                Alert.alert(
                    t('success') || 'Éxito',
                    t('biometric_enabled') || 'Autenticación biométrica habilitada',
                    [{ text: t('ok') || 'OK' }]
                );
            } else {
                if (result.error !== 'user_cancel') {
                    Alert.alert(
                        t('error') || 'Error',
                        t('biometric_auth_failed') || 'La autenticación biométrica falló. Por favor, inténtalo de nuevo.'
                    );
                }
            }
        } catch (error) {
            console.log('Error during authentication:', error);
            Alert.alert(
                t('error') || 'Error',
                t('biometric_auth_error') || 'Ocurrió un error durante la autenticación biométrica.'
            );
        }
    };

    const renderBiometricIcon = () => {
        if (biometricType === 'Face ID') {
            return (
                <Image
                    source={require('../../assets/images/face-id.png')}
                    style={[styles.biometricIcon, { tintColor: isEnabled ? colors.GREEN : (mode === 'dark' ? colors.WHITE : colors.BLACK) }]}
                    resizeMode="contain"
                />
            );
        } else if (biometricType === 'Touch ID') {
            return (
                <Ionicons 
                    name="finger-print" 
                    size={80} 
                    color={isEnabled ? colors.GREEN : (mode === 'dark' ? colors.WHITE : colors.BLACK)} 
                />
            );
        }
        return (
            <Ionicons 
                name="lock-closed" 
                size={80} 
                color={isEnabled ? colors.GREEN : (mode === 'dark' ? colors.WHITE : colors.BLACK)} 
            />
        );
    };


    return (
        <View style={styles.container}>
            <WaygoDialog
                visible={showDialog}
                onClose={() => setShowDialog(false)}
                title={t('biometric_not_available') || 'Autenticación biométrica no disponible'}
                message={t('biometric_not_available_description') || 'Tu dispositivo no tiene autenticación biométrica configurada. Por favor, habilítala en los ajustes de tu dispositivo para continuar.'}
                showButtons={true}
                onConfirm={openDeviceSettings}
                confirmText={t('enable') || 'Habilitar'}
                cancelText={t('cancel') || 'Cancelar'}
                type="info"
            />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    {renderBiometricIcon()}
                    <Text style={[styles.sectionTitle, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                        {t('enable_biometric') || 'Habilita la autenticación biométrica'}
                    </Text>

                    {!isEnabled ? (
                        <TouchableOpacity 
                            style={[styles.authButton, { backgroundColor: colors.TAXIPRIMARY }]}
                            onPress={authenticate}
                        >
                            <Text style={styles.authButtonText}>
                                {t('enable') || 'Habilitar'} {biometricType}
                        </Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={[styles.enabledContainer, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : '#E8F5E9' }]}>
                            <Ionicons name="checkmark-circle" size={24} color={colors.GREEN} />
                            <Text style={[styles.enabledText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                {t('biometric_enabled') || `${biometricType} habilitado`}
                            </Text>
                        </View>
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
                                    {t('back') || 'Volver'}
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
                                        {t('next') || 'Siguiente'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
    },
    section: {
        marginBottom: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: fonts.Bold,
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        marginTop: 10,
        textAlign: 'center',
    },
    icon: {
        marginBottom: 10,
    },
    authButton: {
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 0,
        width: '100%',
    },
    authButtonText: {
        color: colors.WHITE,
        fontSize: 16,
        fontFamily: fonts.Bold,
    },
    enabledContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 15,
        marginBottom: 0,
        width: '100%',
    },
    enabledText: {
        fontSize: 16,
        fontFamily: fonts.Bold,
        marginLeft: 10,
    },
    biometricIcon: {
        width: 120,
        height: 120,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontFamily: fonts.Bold,
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyDescription: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        textAlign: 'center',
        lineHeight: 20,
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

