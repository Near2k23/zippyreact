import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    useColorScheme,
    ActivityIndicator,
    Switch,
    Linking,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../common/theme';
import { fonts } from '../common/font';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import i18n from 'i18n-js';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegistrationBackgroundCheckStep({ 
    onBackgroundCheckAccepted,
    onTermsAccepted,
    onFinalSubmit,
    termsAccepted: propTermsAccepted,
    mode: propMode, 
    onBack, 
    loading 
}) {
    const { t } = i18n;
    const [backgroundCheckAccepted, setBackgroundCheckAccepted] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(propTermsAccepted || false);
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

    useEffect(() => {
        if (propTermsAccepted !== undefined) {
            setTermsAccepted(propTermsAccepted);
        }
    }, [propTermsAccepted]);

    const handleBackgroundCheckToggle = (value) => {
        setBackgroundCheckAccepted(value);
        if (onBackgroundCheckAccepted) {
            onBackgroundCheckAccepted(value);
        }
    };

    const handleTermsToggle = (value) => {
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

    const handleOpenDriverAgreement = () => {
        Linking.openURL('https://waygodriver.com/driver-agreement').catch(err => 
            console.error("Couldn't load page", err)
        );
    };

    const handleFinalSubmit = () => {
        if (backgroundCheckAccepted && termsAccepted && onFinalSubmit) {
            onFinalSubmit();
        }
    };

    const renderTextWithLineBreaks = (textKey) => {
        const text = t(textKey) || '';
        const lines = text.split('\\n');
        return lines.map((line, index) => (
            <Text 
                key={index} 
                style={[styles.infoText, { color: mode === 'dark' ? '#A7A9AC' : '#666' }]}
            >
                {line}
                {index < lines.length - 1 && '\n'}
            </Text>
        ));
    };

    return (
        <View style={styles.container}>
            <ScrollView 
                style={[styles.scrollView, { marginBottom: 10 }]} 
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name="shield-checkmark" size={120} color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} />
                </View>
                
                <View style={styles.contentContainer}>
                    <Text style={[styles.introText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                        {t('driver_registration_background_check_intro') || 'Para usar Waygo como conductor, necesitamos verificar tu identidad y antecedentes.'}
                    </Text>
                    
                    <Text style={[styles.descriptionText, { color: mode === 'dark' ? '#A7A9AC' : '#666' }]}>
                        {t('driver_registration_background_check_description') || 'Esto nos ayuda a mantener la seguridad de todos en la plataforma'}
                    </Text>

                    <View style={[styles.infoBox, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : '#F5F5F5' }]}>
                        {renderTextWithLineBreaks('driver_registration_background_check_checks_list')}
                    </View>

                    <Text style={[styles.purposeText, { color: mode === 'dark' ? '#A7A9AC' : '#666' }]}>
                        {t('driver_registration_background_check_purpose') || 'Estas verificaciones se usan únicamente para evaluar tu elegibilidad como conductor independiente en Waygo.'}
                    </Text>

                    <View style={[styles.noteBox, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : '#F5F5F5' }]}>
                        {renderTextWithLineBreaks('driver_registration_background_check_security_note')}
                    </View>

                    <View style={[styles.noteBox, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : '#F5F5F5' }]}>
                        {renderTextWithLineBreaks('driver_registration_background_check_credit_note')}
                    </View>

                    <View style={styles.authorizationSection}>
                        <Text style={[styles.authorizationTitle, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                            {t('driver_registration_background_check_authorization_title') || '✍️ Autorización'}
                        </Text>
                        
                        <View style={[styles.infoBox, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : '#F5F5F5' }]}>
                            {renderTextWithLineBreaks('driver_registration_background_check_authorization_text')}
                            
                            <View style={[styles.termsToggleContainer, { backgroundColor: 'transparent', padding: 0, marginTop: 8 }]}>
                                <Switch
                                    value={backgroundCheckAccepted}
                                    onValueChange={handleBackgroundCheckToggle}
                                    trackColor={{ false: '#CCCCCC', true: colors.TAXIPRIMARY }}
                                    thumbColor={backgroundCheckAccepted ? colors.WHITE : '#f4f3f4'}
                                    ios_backgroundColor="#CCCCCC"
                                />
                                <View style={styles.termsTextContainer}>
                                    <Text style={[styles.termsText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                        {t('driver_registration_background_check_accept_button') || 'Acepto y reconozco'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.termsSection}>
                        <View style={[styles.termsToggleContainer, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : '#F5F5F5' }]}>
                            <Switch
                                value={termsAccepted}
                                onValueChange={handleTermsToggle}
                                trackColor={{ false: '#CCCCCC', true: colors.TAXIPRIMARY }}
                                thumbColor={termsAccepted ? colors.WHITE : '#f4f3f4'}
                                ios_backgroundColor="#CCCCCC"
                            />
                            <Text style={[styles.termsText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK, flex: 1, flexShrink: 1 }]}>
                                {t('accept_terms_confirmation')}{' '}
                                <Text 
                                    style={[styles.termsLinkText, { color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}
                                    onPress={handleOpenTerms}
                                >
                                    {t('term_condition')}
                                </Text>
                                {' ' + t('and_the') + ' '}
                                <Text 
                                    style={[styles.termsLinkText, { color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}
                                    onPress={handleOpenDriverAgreement}
                                >
                                    {t('driver_agreement')}
                                </Text>
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ width: '100%', flexDirection: 'row', gap: 10, alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 30, paddingBottom: 10 }}>
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
                    <TouchableOpacity
                        style={[
                            styles.finalSubmitButton,
                            {
                                flex: 1,
                                backgroundColor: (backgroundCheckAccepted && termsAccepted && !loading)
                                    ? (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR)
                                    : '#CCCCCC',
                                opacity: (backgroundCheckAccepted && termsAccepted && !loading) ? 1 : 0.6
                            }
                        ]}
                        onPress={handleFinalSubmit}
                        activeOpacity={0.8}
                        disabled={!backgroundCheckAccepted || !termsAccepted || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.WHITE} />
                        ) : (
                            <Text style={styles.finalSubmitButtonText}>
                                {t('register_button') || 'Registrarse'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
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
        fontSize: 20,
        fontFamily: fonts.Bold,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    contentContainer: {
        paddingHorizontal: 20,
        gap: 16,
    },
    introText: {
        fontSize: 16,
        fontFamily: fonts.Bold,
        lineHeight: 24,
    },
    descriptionText: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        lineHeight: 20,
    },
    infoBox: {
        padding: 16,
        borderRadius: 10,
        marginTop: 8,
    },
    infoText: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        lineHeight: 20,
    },
    purposeText: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        lineHeight: 20,
        marginTop: 8,
    },
    noteBox: {
        padding: 16,
        borderRadius: 10,
        marginTop: 8,
    },
    authorizationSection: {
        marginTop: 8,
        gap: 12,
    },
    authorizationTitle: {
        fontSize: 16,
        fontFamily: fonts.Bold,
        marginTop: 8,
    },
    acceptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 2,
        marginTop: 8,
    },
    acceptButtonText: {
        fontSize: 16,
        fontFamily: fonts.Bold,
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
    termsSection: {
        marginTop: 20,
        gap: 12,
    },
    termsToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 10,
        gap: 12,
    },
    termsTextContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        flex: 1,
        flexShrink: 1,
    },
    termsText: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        marginRight: 4,
    },
    termsLinkText: {
        fontSize: 14,
        fontFamily: fonts.Bold,
        textDecorationLine: 'underline',
    },
    finalSubmitButton: {
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    finalSubmitButtonText: {
        color: colors.WHITE,
        fontSize: 16,
        fontFamily: fonts.Bold,
    },
});
