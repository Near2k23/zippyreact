import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Linking,
    Switch,
    useColorScheme,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../common/theme';
import { fonts } from '../common/font';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import i18n from 'i18n-js';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegistrationTermsStep({ onTermsAccepted, mode: propMode, onBack, onNext, loading, nextButtonText }) {
    const { t } = i18n;
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [mode, setMode] = useState(propMode || 'light');
    const settings = useSelector(state => state.settingsdata.settings);
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

    const handleToggle = (value) => {
        setTermsAccepted(value);
        if (onTermsAccepted) {
            onTermsAccepted(value);
        }
    };

    const handleOpenTerms = () => {
        if (settings && settings.CompanyTermCondition) {
            Linking.openURL(settings.CompanyTermCondition).catch(err => 
                console.error("Couldn't load page", err)
            );
        } else {
            Alert.alert(t('alert') || 'Alerta', t('terms_not_available') || 'Los términos y condiciones no están disponibles');
        }
    };


    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.iconContainer}>
                    <Ionicons name="document-text" size={60} color={mode === 'dark' ? colors.WHITE : colors.BLACK} />
                </View>
                
                <Text style={[styles.title, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                    {t('term_condition') || 'Términos y Condiciones'}
                </Text>
                
                <Text style={[styles.description, { color: mode === 'dark' ? '#A7A9AC' : '#A7A9AC' }]}>
                    {t('terms_description') || 'Por favor, lee y acepta nuestros términos y condiciones para continuar con el registro.'}
                </Text>

                <TouchableOpacity 
                    style={[styles.termsLinkContainer, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : '#F5F5F5' }]}
                    onPress={handleOpenTerms}
                >
                    <Ionicons name="open-outline" size={20} color={colors.BLUE} />
                    <Text style={[styles.termsLinkText, { color: colors.BLUE }]}>
                        {t('view_terms') || 'Ver términos y condiciones'}
                    </Text>
                </TouchableOpacity>

                <View style={[styles.toggleContainer, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}>
                    <View style={styles.toggleContent}>
                        <Switch
                            value={termsAccepted}
                            onValueChange={handleToggle}
                            trackColor={{ false: '#CCCCCC', true: colors.TAXIPRIMARY }}
                            thumbColor={termsAccepted ? colors.WHITE : '#f4f3f4'}
                            ios_backgroundColor="#CCCCCC"
                        />
                        <Text style={[styles.toggleText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                            {t('accept_terms_confirmation') || 'Al seleccionar acepto a continuación, confirmo que revisé y acepto los términos y condiciones'}
                        </Text>
                    </View>
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
                                style={[styles.navigationButtonPrimary, { flex: 1, backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}
                                onPress={onNext}
                                activeOpacity={0.8}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={colors.WHITE} />
                                ) : (
                                    <Text style={styles.navigationButtonPrimaryText}>
                                        {nextButtonText || t('next') || 'Siguiente'}
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
    iconContainer: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontFamily: fonts.Bold,
        textAlign: 'center',
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    description: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    termsLinkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginHorizontal: 20,
        marginBottom: 30,
    },
    termsLinkText: {
        fontSize: 14,
        fontFamily: fonts.Bold,
        marginLeft: 8,
        textDecorationLine: 'underline',
    },
    toggleContainer: {
        borderRadius: 10,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 30,
    },
    toggleContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    toggleText: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        marginLeft: 12,
        flex: 1,
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

