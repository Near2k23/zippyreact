import React from 'react';
import { StyleSheet, Platform, StatusBar, Animated as RNAnimated } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Animated from 'react-native-reanimated';
import { colors } from '../common/theme';
import DeviceInfo from 'react-native-device-info';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const hasNotch = DeviceInfo.hasNotch();

export default function HeaderGradient({ mode, style }) {
    const isDark = mode === 'dark';
    const statusBarHeight = StatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 0);
    
    const backgroundColor = isDark ? colors.PAGEBACK : colors.SCREEN_BACKGROUND;
    
    const gradientColors = {
        start: isDark ? colors.TAXIPRIMARYDARK : colors.TAXIPRIMARY,
        middle: isDark ? colors.TAXIPRIMARYDARK + '99' : colors.TAXIPRIMARY + '99',
        end: backgroundColor
    };

    const gradientHeight = Platform.OS === 'ios' ? (hasNotch ? 280 : 260) : 260;

    return (
        <RNAnimated.View style={[styles.container, { marginTop: -statusBarHeight, height: gradientHeight }, style]}>
            <AnimatedSvg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={gradientColors.start} stopOpacity="1" />
                        <Stop offset="0.3" stopColor={gradientColors.middle} stopOpacity="0.8" />
                        <Stop offset="0.6" stopColor={gradientColors.middle} stopOpacity="0.4" />
                        <Stop offset="0.8" stopColor={gradientColors.end} stopOpacity="0.1" />
                        <Stop offset="1" stopColor={gradientColors.end} stopOpacity="1" />
                    </LinearGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
            </AnimatedSvg>
        </RNAnimated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
    }
});