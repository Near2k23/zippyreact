import React, { useEffect, useState } from 'react';
import { View, Image, Animated, Dimensions } from 'react-native';
import { colors } from '../common/theme';

const { width, height } = Dimensions.get('window');

export default function CustomSplashScreen({ onAnimationComplete, forceShow = false }) {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [backgroundColor] = useState(new Animated.Value(0));
    const [bounceAnim] = useState(new Animated.Value(1));
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Si forceShow es true, siempre mostrar el splash
        if (forceShow) {
            setIsVisible(true);
        }

        // Asegurar que la animación comience inmediatamente
        const startAnimations = () => {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: false,
            }).start();

            Animated.timing(backgroundColor, {
                toValue: 1,
                duration: 1500,
                delay: 500,
                useNativeDriver: false,
            }).start(() => {
                // Iniciar animación de bounce al final
                startBounceAnimation();
            });
        };

        // Pequeño delay para asegurar que el componente esté montado
        const timer = setTimeout(startAnimations, 50);
        
        return () => clearTimeout(timer);
    }, [forceShow]);

    const startBounceAnimation = () => {
        Animated.sequence([
            Animated.timing(bounceAnim, {
                toValue: 1.2,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
                toValue: 0.9,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
                toValue: 1.1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Notificar que la animación está completa después del bounce
            setTimeout(() => {
                if (onAnimationComplete) {
                    onAnimationComplete();
                }
                // Si forceShow es true, ocultar el splash después de la animación
                if (forceShow) {
                    setIsVisible(false);
                }
            }, 300);
        });
    };

    const backgroundColorInterpolate = backgroundColor.interpolate({
        inputRange: [0, 1],
        outputRange: ['#000000', colors.TAXIPRIMARY],
    });

    if (!isVisible) {
        return null;
    }

    return (
        <Animated.View
            style={{
                flex: 1,
                backgroundColor: backgroundColorInterpolate,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [
                        {
                            scale: Animated.multiply(
                                fadeAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.8, 1],
                                }),
                                bounceAnim
                            ),
                        },
                    ],
                }}
            >
                <Image
                    source={require('../../assets/images/logo_splash.png')}
                    style={{
                        width: width * 0.4,
                        height: width * 0.4,
                        resizeMode: 'contain',
                    }}
                />
            </Animated.View>
        </Animated.View>
    );
}
