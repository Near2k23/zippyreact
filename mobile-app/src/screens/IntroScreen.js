import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    BackHandler,
    Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../common/theme';
import { fonts } from '../common/font';
import { MAIN_COLOR } from '../common/sharedFunctions';
import i18n from 'i18n-js';

const { width, height } = Dimensions.get('window');

const IntroScreen = ({ navigation }) => {
    const { t } = i18n;
    const [currentIndex, setCurrentIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const introData = [
        {
            id: 1,
            image: require('../../assets/images/intro1.png'),
            title: 'Waygo: tu viaje, a un toque',
            description: 'Pide un carro en segundos, con tarifas claras y conductores verificados.'
        },
        {
            id: 2,
            image: require('../../assets/images/intro2.png'),
            title: 'Conductores confiables',
            description: 'Conductores calificados para brindarte la mejor experiencia.'
        },
        {
            id: 3,
            image: require('../../assets/images/intro3.png'),
            title: 'Viaja con comodidad',
            description: 'Disfruta de un viaje seguro con tarifas transparentes.'
        }
    ];

    const completeIntro = async () => {
        try {
            await AsyncStorage.setItem('hasLaunched', 'true');
            navigation.replace('Login');
        } catch (error) {
            console.log('Error saving intro completion:', error);
            navigation.replace('Login');
        }
    };

    const animateTransition = (callback) => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start();
        
        setTimeout(callback, 200);
    };

    const handleNext = () => {
        if (currentIndex < introData.length - 1) {
            animateTransition(() => {
                setCurrentIndex(currentIndex + 1);
            });
        } else {
            completeIntro();
        }
    };

    const handleSkip = () => {
        if (currentIndex === 0) {
            completeIntro();
        } else {
            animateTransition(() => {
                setCurrentIndex(currentIndex - 1);
            });
        }
    };

    useEffect(() => {
        const backAction = () => {
            if (currentIndex > 0) {
                const prevIndex = currentIndex - 1;
                setCurrentIndex(prevIndex);
                flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
            }
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, [currentIndex]);

    const renderContent = () => {
        const currentSlide = introData[currentIndex];
        return (
            <Animated.View style={[styles.slide, { opacity: fadeAnim }]}>
                <View style={styles.imageContainer}>
                    <Image source={currentSlide.image} style={styles.image} resizeMode="contain" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{currentSlide.title}</Text>
                    <Text style={styles.description}>{currentSlide.description}</Text>
                    {renderPagination()}
                </View>
            </Animated.View>
        );
    };

    const renderPagination = () => (
        <View style={styles.paginationContainer}>
            {introData.map((_, index) => (
                <View key={index} style={styles.dotContainer}>
                    {currentIndex === index ? (
                        <View style={styles.activeDotOuter}>
                            <View style={styles.activeDotInner} />
                        </View>
                    ) : (
                        <View style={styles.inactiveDot} />
                    )}
                </View>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={colors.WHITE} barStyle="dark-content" />
            {renderContent()}
            <View style={styles.bottomContainer}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={styles.skipButton}
                        onPress={handleSkip}
                    >
                        <Text style={styles.skipText}>{currentIndex === 0 ? 'Saltar' : 'Atrás'}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.nextButton}
                        onPress={handleNext}
                    >
                        <Text style={styles.nextText}>
                            {currentIndex === introData.length - 1 ? 'Comenzar' : 'Siguiente'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.WHITE,
    },
    slide: {
        width: width,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageContainer: {
        flex: 0.6,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    image: {
        width: width * 0.8,
        height: height * 0.4,
        maxHeight: 300,
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 30,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontFamily: fonts.Bold,
        color: colors.BLACK,
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 26,
        width: '100%',
    },
    description: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        color: colors.SHADOW,
        textAlign: 'center',
        lineHeight: 20,
        width: '100%',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginVertical: 20,
    },
    dotContainer: {
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeDotOuter: {
        width: 32,
        height: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.BLACK,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeDotInner: {
        width: 22,
        height: 6,
        borderRadius: 6,
        backgroundColor: MAIN_COLOR,
    },
    inactiveDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1,
        backgroundColor: 'transparent',
        borderColor: colors.BLACK,
    },
    bottomContainer: {
        width: '100%',
        paddingBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    skipButton: {
        height: 56,
        width: 175,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    skipText: {
        fontSize: 12,
        fontFamily: fonts.Regular,
        color: colors.SHADOW,
        textAlign: 'center',
        includeFontPadding: false,
        textAlignVertical: 'center',
        paddingRight: 2,
    },
    nextButton: {
        backgroundColor: MAIN_COLOR,
        height: 56,
        width: 175,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    nextText: {
        fontSize: 12,
        fontFamily: fonts.Bold,
        color: colors.WHITE,
        textAlign: 'center',
        includeFontPadding: false,
        textAlignVertical: 'center',
        paddingRight: 2,
    },
});

export default IntroScreen;
