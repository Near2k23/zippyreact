import React, { useRef, useEffect } from 'react';
import { Animated, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import { fonts } from '../common/font';

const ICON_MAP = {
    Home: { name: 'home', type: 'material' },
    DriverTrips: { name: 'home', type: 'material' },
    RideList: { name: 'history', type: 'material' },
    Settings: { name: 'person', type: 'material' },
};

const LABEL_MAP = {
    Home: 'home',
    DriverTrips: 'task_list',
    RideList: 'ride_list_title',
    Settings: 'profile',
};

export default function TabBarIcon({ routeName, focused, color, size, isRTL, t }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (focused) {
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();

            Animated.timing(opacityAnim, {
                toValue: 0.7,
                duration: 100,
                useNativeDriver: true,
            }).start(() => {
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }).start();
            });
        }
    }, [focused]);

    const icon = ICON_MAP[routeName] || { name: 'help', type: 'material' };
    const labelKey = LABEL_MAP[routeName];

    return (
        <Animated.View
            style={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
            }}
        >
            <Icon
                name={icon.name}
                type={icon.type}
                size={size + 5}
                color={color}
                style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
            />
            <Text
                style={{
                    color: color,
                    fontSize: 10,
                    fontFamily: fonts.Medium,
                    marginTop: 2,
                    textAlign: 'center',
                }}
            >
                {labelKey ? t(labelKey) : ''}
            </Text>
        </Animated.View>
    );
}
