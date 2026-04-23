import React from 'react';
import { StyleSheet, Platform, StatusBar, Animated as RNAnimated } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Animated from 'react-native-reanimated';
import { colors } from '../common/theme';
import DeviceInfo from 'react-native-device-info';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const hasNotch = DeviceInfo.hasNotch();

export default function HeaderGradient({ mode, style }) {
    return null;
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
