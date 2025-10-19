import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Dimensions, FlatList, StyleSheet, TouchableOpacity, useColorScheme, Animated } from 'react-native';
import { Icon } from 'react-native-elements'
import { colors } from '../common/theme';
import { useSelector } from 'react-redux';
import i18n from 'i18n-js';
import moment from 'moment/min/moment-with-locales';
import { Ionicons } from '@expo/vector-icons';
import { SECONDORY_COLOR, MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import { fonts } from '../common/font';
import WaygoDialog from '../components/WaygoDialog';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function Notifications(props) {
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const notificationdata = useSelector(state => state.notificationdata);
    const [data, setData] = useState();
    const auth = useSelector((state) => state.auth);
    let colorScheme = useColorScheme();
    const [mode, setMode] = useState();
    const fadeAnim = useRef({}).current;
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);

    useEffect(() => {
        if (auth?.profile?.mode) {
            if (auth.profile.mode === 'system'){
                setMode(colorScheme);
            }else{
                setMode(auth.profile.mode);
            }
        } else {
            setMode('light');
        }
    }, [auth, colorScheme]);

    useEffect(() => {
        if (notificationdata.notifications) {
            const notifications = notificationdata.notifications;
            notifications.forEach((_, index) => {
                fadeAnim[index] = new Animated.Value(0);
            });
            
            const animations = notifications.map((_, index) => {
                return Animated.timing(fadeAnim[index], {
                    toValue: 1,
                    duration: 500,
                    delay: index * 150,
                    useNativeDriver: true
                });
            });
            
            Animated.stagger(100, animations).start();
            setData(notifications);
        } else {
            setData([]);
        }
    }, [notificationdata.notifications]);

    const show = (item) => {
        setSelectedNotification(item);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedNotification(null);
    };

    const getNotificationIcon = (msg) => {
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes('booking') || lowerMsg.includes('ride')) {
            return 'car-outline';
        } else if (lowerMsg.includes('payment') || lowerMsg.includes('wallet') || lowerMsg.includes('paid')) {
            return 'cash-outline';
        } else if (lowerMsg.includes('withdrawal') || lowerMsg.includes('withdraw')) {
            return 'cash-outline';
        } else if (lowerMsg.includes('cancel')) {
            return 'close-circle-outline';
        } else if (lowerMsg.includes('driver') || lowerMsg.includes('captain')) {
            return 'account-outline';
        } else if (lowerMsg.includes('chat') || lowerMsg.includes('message')) {
            return 'message-text-outline';
        } else if (lowerMsg.includes('rating') || lowerMsg.includes('review')) {
            return 'star-outline';
        } else if (lowerMsg.includes('location') || lowerMsg.includes('address')) {
            return 'map-marker-outline';
        } else if (lowerMsg.includes('offer') || lowerMsg.includes('discount')) {
            return 'tag-outline';
        } else {
            return 'notifications-outline';
        }
    };

    const getIconColor = (msg) => {
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes('cancel') || lowerMsg.includes('rejected')) {
            return colors.RED;
        } else if (lowerMsg.includes('success') || lowerMsg.includes('completed') || lowerMsg.includes('approved')) {
            return colors.GREEN;
        } else if (lowerMsg.includes('payment') || lowerMsg.includes('wallet')) {
            return colors.YELLOW;
        } else if (lowerMsg.includes('withdrawal') || lowerMsg.includes('withdraw')) {
            // Para retiros, determinar color basado en el estado
            if (lowerMsg.includes('rejected')) {
                return colors.RED;
            } else if (lowerMsg.includes('approved')) {
                return colors.GREEN;
            } else {
                return colors.YELLOW;
            }
        } else {
            return mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR;
        }
    };

    const newData = ({ item, index }) => {
        const scale = new Animated.Value(1);
        
        const onPressIn = () => {
            Animated.spring(scale, {
                toValue: 0.98,
                useNativeDriver: true,
            }).start();
        };
        
        const onPressOut = () => {
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        };

        return (
            <Animated.View 
                style={[
                    styles.notificationCard,
                    { 
                        backgroundColor: mode === 'dark' ? '#272A2C' : colors.WHITE,
                        opacity: fadeAnim[index] || 1,
                        transform: [
                            { scale },
                            { 
                                translateY: fadeAnim[index] ? 
                                    fadeAnim[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0]
                                    }) : 0
                            }
                        ]
                    }
                ]}
            >
                <TouchableOpacity 
                    onPress={() => show(item)}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    activeOpacity={0.9}
                    style={[styles.cardContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                >
                    {/* Icono principal */}
                    <View style={[styles.mainIconContainer, { 
                        marginRight: isRTL ? 0 : 15, 
                        marginLeft: isRTL ? 15 : 0 
                    }]}>
                        <Ionicons 
                            name={getNotificationIcon(item.msg)} 
                            size={24} 
                            color={mode === 'dark' ? colors.WHITE : colors.BLACK} 
                        />
                    </View>

                    {/* Contenido de la notificación */}
                    <View style={styles.contentContainer}>
                        <Text numberOfLines={1} style={[styles.titleText, { 
                            textAlign: isRTL ? 'right' : 'left', 
                            color: mode === 'dark' ? colors.WHITE : colors.BLACK 
                        }]}>
                            {item.title}
                        </Text>
                        <Text numberOfLines={1} style={[styles.subtitleText, { 
                            textAlign: isRTL ? 'right' : 'left', 
                            color: mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)' 
                        }]}>
                            {item.msg}
                        </Text>
                        <View style={[styles.timeRow, { 
                            flexDirection: isRTL ? 'row-reverse' : 'row',
                            justifyContent: isRTL ? 'flex-end' : 'flex-start' 
                        }]}>
                            <Icon
                                name='clock'
                                type='octicon'
                                size={12}
                                color={mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'}
                            />
                            <Text style={[styles.timeText, { 
                                marginLeft: isRTL ? 0 : 5,
                                marginRight: isRTL ? 5 : 0,
                                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
                            }]}>
                                {moment(item.dated).format('DD MMM YYYY HH:mm')}
                            </Text>
                        </View>
                    </View>

                    {/* Flecha derecha */}
                    <View style={styles.arrowContainer}>
                        <Icon
                            name={isRTL ? 'chevron-left' : 'chevron-right'}
                            type='octicon'
                            size={16}
                            color={mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
                        />
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
         <View style={[styles.container, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND }]}>
            <AnimatedFlatList
                data={data}
                renderItem={newData}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
            />
            
            {/* WaygoDialog para notificaciones */}
            <WaygoDialog
                visible={modalVisible}
                onClose={closeModal}
                title={selectedNotification?.title || ''}
                message={selectedNotification ? 
                    `${selectedNotification.msg}\n\n${moment(selectedNotification.dated).format('DD MMM YYYY HH:mm')}` : 
                    ''
                }
                icon={selectedNotification ? getNotificationIcon(selectedNotification.msg) : 'bell-outline'}
                iconColor={selectedNotification ? getIconColor(selectedNotification.msg) : undefined}
                type="info"
            />
         </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    notificationCard: {
        marginVertical: 6,
        borderRadius: 16,
        shadowColor: colors.BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardContent: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        alignItems: 'center',
    },
    mainIconContainer: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    titleText: {
        fontSize: 16,
        fontFamily: fonts.Bold,
        marginBottom: 4,
        lineHeight: 20,
    },
    subtitleText: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        marginBottom: 8,
        lineHeight: 18,
    },
    timeRow: {
        alignItems: 'center',
        marginTop: 2,
    },
    timeText: {
        fontSize: 12,
        fontFamily: fonts.Regular,
        lineHeight: 16,
    },
    arrowContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 8,
    },
});