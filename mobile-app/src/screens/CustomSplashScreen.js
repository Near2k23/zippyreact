import React, { useEffect, useState } from 'react';
import { Image, Animated, Dimensions } from 'react-native';
import SplashGradientBackground from '../components/SplashGradientBackground';

const { width } = Dimensions.get('window');

export default function CustomSplashScreen({ onAnimationComplete, forceShow = false }) {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [bounceAnim] = useState(new Animated.Value(1));
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (forceShow) {
            setIsVisible(true);
        }

        const startAnimations = () => {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: false,
            }).start(() => {
                startBounceAnimation();
            });
        };

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
            setTimeout(() => {
                if (onAnimationComplete) {
                    onAnimationComplete();
                }
                if (forceShow) {
                    setIsVisible(false);
                }
            }, 300);
        });
    };

    if (!isVisible) {
        return null;
    }

    return (
        <SplashGradientBackground>
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
        </SplashGradientBackground>
    );
}
