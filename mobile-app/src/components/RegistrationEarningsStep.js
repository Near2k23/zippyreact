import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    useColorScheme,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../common/theme';
import { fonts } from '../common/font';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import i18n from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegistrationEarningsStep({ mode: propMode, onBack, onNext, loading }) {
    const { t } = i18n;
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

    const benefits = [
        { icon: 'cash-outline', key: 'driver_registration_earnings_benefit_1' },
        { icon: 'card-outline', key: 'driver_registration_earnings_benefit_2' },
        { icon: 'trending-up-outline', key: 'driver_registration_earnings_benefit_3' },
        { icon: 'gift-outline', key: 'driver_registration_earnings_benefit_4' }
    ];

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.iconContainer}>
                    <Ionicons name="wallet" size={60} color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} />
                </View>
                
                <Text style={[styles.title, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                    {t('driver_registration_earnings_title') || 'Genera ganancia con Waygo'}
                </Text>
                
                <Text style={[styles.description, { color: mode === 'dark' ? '#A7A9AC' : '#A7A9AC' }]}>
                    {t('driver_registration_earnings_description') || 'Únete a nuestra plataforma y comienza a generar ingresos de manera flexible y segura.'}
                </Text>

                <View style={styles.benefitsContainer}>
                    {benefits.map((benefit, index) => (
                        <View 
                            key={index}
                            style={[
                                styles.benefitItem, 
                                { backgroundColor: mode === 'dark' ? colors.PAGEBACK : '#F5F5F5' }
                            ]}
                        >
                            <Ionicons 
                                name={benefit.icon} 
                                size={32} 
                                color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} 
                            />
                            <Text style={[styles.benefitText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                {t(benefit.key) || `Beneficio ${index + 1}`}
                            </Text>
                        </View>
                    ))}
                </View>

                <Text style={[styles.footer, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                    {t('driver_registration_earnings_footer') || 'Comienza tu viaje hacia el éxito financiero'}
                </Text>

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
        lineHeight: 20,
    },
    benefitsContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
        gap: 12,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 10,
        gap: 16,
    },
    benefitText: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        flex: 1,
        lineHeight: 20,
    },
    footer: {
        fontSize: 16,
        fontFamily: fonts.Bold,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
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
