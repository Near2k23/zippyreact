import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    useColorScheme
} from 'react-native';
import { colors } from '../common/theme';
import { fonts } from '../common/font';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import i18n from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegistrationStepWrapper({
    title,
    step,
    totalSteps,
    content,
    onBack,
    onNext,
    loading = false,
    nextDisabled = false,
    nextButtonText,
    mode: propMode
}) {
    const { t } = i18n;
    const [mode, setMode] = React.useState(propMode || 'light');
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

    return (
        <View style={styles.container}>
            {content}
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={[styles.backButton, { 
                        backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE, 
                        borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR 
                    }]}
                    onPress={onBack}
                >
                    <Text style={[styles.backButtonText, { color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}>
                        {t('back') || 'Volver'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.nextButton, { 
                        flex: 1,
                        backgroundColor: nextDisabled ? '#CCCCCC' : (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR),
                        opacity: nextDisabled ? 0.5 : 1
                    }]}
                    onPress={onNext}
                    activeOpacity={0.8}
                    disabled={nextDisabled || loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.WHITE} />
                    ) : (
                        <Text style={styles.nextButtonText}>
                            {nextButtonText || t('next') || 'Siguiente'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    backButton: {
        width: 'auto',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    backButtonText: {
        fontSize: 16,
        fontFamily: fonts.Bold,
    },
    nextButton: {
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButtonText: {
        color: colors.WHITE,
        fontSize: 16,
        fontFamily: fonts.Bold,
    },
});

