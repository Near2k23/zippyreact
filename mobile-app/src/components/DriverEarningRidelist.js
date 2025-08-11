import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, Animated } from 'react-native';
import { colors } from '../common/theme';
import i18n from 'i18n-js';
import { useSelector } from 'react-redux';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
var { width, height } = Dimensions.get('window');
import moment from 'moment/min/moment-with-locales';
import { fonts } from '../common/font';
import { Ionicons, AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function DriverEarningRidelist(props) {
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const settings = useSelector(state => state.settingsdata.settings);
    const [tabIndex, setTabIndex] = useState(props.tabIndex);
    const auth = useSelector(state => state.auth);
    let colorScheme = useColorScheme();
    const [mode, setMode] = useState();

    function formatAmount(value, decimal, country) {
        const number = parseFloat(value || 0);
        if (country === "Vietnam") {
          return number.toLocaleString("vi-VN", {
            minimumFractionDigits: decimal,
            maximumFractionDigits: decimal
          });
        } else {
          return number.toLocaleString("en-US", {
            minimumFractionDigits: decimal,
            maximumFractionDigits: decimal
          });
        }
    }

    useEffect(() => {
        if (auth && auth.profile && auth.profile.mode) {
            if (auth.profile.mode === 'system'){
                setMode(colorScheme);
            }else{
                setMode(auth.profile.mode);
            }
        } else {
            setMode(colorScheme);
        }
    }, [auth, colorScheme]);

    const [scaleAnim] = useState(new Animated.Value(0))
    useEffect(() => {
        Animated.spring(
            scaleAnim,
            {
                toValue: 1,
                friction: 3,
                useNativeDriver: true
            }
        ).start();
    }, [])

    const [role, setRole] = useState();

    useEffect(() => {
        if (auth.profile && auth.profile.usertype) {
            setRole(auth.profile.usertype);
        } else {
            setRole(null);
        }
    }, [auth.profile]);

    const renderData = ({ item, index }) => {
        return (
            <View activeOpacity={0.8} style={[styles.BookingContainer, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack]} >
                <View style={[styles.box,{  padding: 5 },]}>
                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', flex: 1, margin: 10, justifyContent:'space-between'}}>
                        <View style={{justifyContent: 'center'}}>
                            <Text style={mode === 'dark' ? styles.textStyleBoldDark : styles.textStyleBold}>{item.endTime ? moment(item.endTime).format('lll') : ''}</Text>
                        </View>
                        <View style={{justifyContent: 'center'}}>
                            {item.payment_mode == 'cash' ?
                                <MaterialCommunityIcons name="cash" size={28} color={mode === 'dark' ? colors.WHITE : colorScheme.BLACK} />
                                : item.payment_mode == 'card' ?
                                    <Feather name="credit-card" size={24} color={mode === 'dark' ? colors.WHITE : colorScheme.BLACK} />
                                    :
                                    <AntDesign name="wallet" size={24} color={mode === 'dark' ? colors.WHITE : colorScheme.BLACK} />
                            }
                        </View>
                        <View style={{ justifyContent: 'center'}}>
                            {settings.swipe_symbol === false ?
                                <Text style={mode === 'dark' ? styles.textStyleBoldDark :styles.textStyleBold}>{settings.symbol}{item.driver_share? formatAmount(item.driver_share, settings.decimal, settings.country) :'0'}</Text>
                            :
                                <Text style={mode === 'dark' ? styles.textStyleBoldDark :styles.textStyleBold}>{item.driver_share? formatAmount(item.driver_share, settings.decimal, settings.country) :'0'}{settings.symbol}</Text>
                            }
                        </View>
                    </View>
                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', flex: 1, marginTop: 5 }}>
                        <View style={{ flexDirection: 'column', flex: 1 }}>
                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                <View style={{ width: 30, alignItems: 'center' }}>
                                    <Ionicons name="location-outline" size={24} color={colors.GREEN} />
                                    <View style={[styles.hbox, { flex: 1, minHeight: 5 }]} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 10 }}>
                                    <Text style={[mode === 'dark' ? styles.textStyleDark : styles.textStyle, isRTL ? { marginRight: 6, textAlign: 'right' } : { marginLeft: 6, textAlign: 'left' }]}>{item.pickup.add} </Text>
                                </View>
                            </View>

                            {item && item.waypoints && item.waypoints.length > 0 ?
                                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                    <View style={{ width: 30, alignItems: 'center' }}>
                                        <Ionicons name="location-outline" size={24} color={colors.YELLOW} />
                                        <View style={[styles.hbox, { flex: 1, minHeight: 5 }]} />
                                    </View>
                                    <View style={{ flex: 1, marginBottom: 10 }}>
                                        <Text style={[mode === 'dark' ? styles.textStyleDark : styles.textStyle, isRTL ? { marginRight: 6, textAlign: 'right' } : { marginLeft: 6, textAlign: 'left' }]}>{item.waypoints.length} {t('stops')}</Text>
                                    </View>
                                </View>
                                : null}

                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                <View style={{ width: 30, alignItems: 'center' }}>
                                    <Ionicons name="location-outline" size={24} color={colors.ORANGE} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 10 }}>
                                    <Text style={[mode === 'dark' ? styles.textStyleDark : styles.textStyle, isRTL ? { marginRight: 6, textAlign: 'right' } : { marginLeft: 6, textAlign: 'left' }]}>{item.drop.add}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                </View>
            </View>
        )
    }

    return (
        <View style={{flex: 1}}>
            <SegmentedControlTab
                values={[t('daily'), t('thismonth'), t('thisyear')]}
                selectedIndex={tabIndex}
                onTabPress={(index) => setTabIndex(index)}
                borderRadius={0}
                tabsContainerStyle={[styles.segmentcontrol, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                tabStyle={{
                    borderWidth: 0,
                    backgroundColor: 'transparent',
                    borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR
                }}
                activeTabStyle={{ borderBottomColor: colors.RED, backgroundColor: 'transparent', borderBottomWidth: 1.5 }}
                tabTextStyle={{ color: colors.SHADOW, fontFamily:fonts.Bold }}
                activeTabTextStyle={{ color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }}
            />

            <View style={{flex: 1}}>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={true}
                    keyExtractor={(item, index) => index.toString()}
                    data={tabIndex === 0 ? props.data.filter(item => ((new Date(item.endTime).getDate() == new Date().getDate()) && (item.status === 'PAID' || item.status === 'COMPLETE'))) : (tabIndex === 1 ? props.data.filter(item => ((new Date(item.endTime).getMonth() == new Date().getMonth()) && (item.status === 'PAID' || item.status === 'COMPLETE'))) : props.data.filter(item => ((new Date(item.endTime).getFullYear() == new Date().getFullYear()) && (item.status === 'PAID' || item.status === 'COMPLETE'))))}
                    renderItem={renderData}
                    ListEmptyComponent={
                        <View style={{marginTop: height/3.5, justifyContent:'center', alignItems:'center' }}>
                            <View style={{height: 50, minWidth: 150, borderRadius: 10, backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, justifyContent:'center', alignItems:'center' }}>
                                <Text style={[styles.textStyleBold,{color: colors.WHITE}]}>{t('no_data_available')}</Text>
                            </View>
                        </View>
                    }
                />
            </View>
        </View>
    );

};

const styles = StyleSheet.create({
    BookingContainer:{
        margin:10,
        borderRadius:10,
        shadowColor: colors.BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 1,
        backgroundColor: colors.WHITE,
        elevation:2
    },
    shadowBack: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.WHITE,
    },
    shadowBackDark: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.PAGEBACK,
    },
    box: {
        borderRadius: 10,
    },
    segmentcontrol: {
        color: colors.WHITE,
        fontSize: 18,
        fontFamily:fonts.Regular,
        marginTop: 0,
        alignSelf: "center",
        height: 50
    },
    fare: {
        width: (width - 35) / 4,
        backgroundColor: colors.WHITE,
        borderRadius: 5,
        paddingHorizontal: 3,
        height: 'auto',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingVertical: 5
    },
    hbox: {
        width: 1,
        backgroundColor: colors.SHADOW
    },
    textStyle: {
        fontSize: 15,
        fontFamily: fonts.Regular
    },
    textStyleDark: {
        fontSize: 15,
        fontFamily: fonts.Regular,
        color: colors.WHITE
    },
    textStyleBold: {
        fontSize: 15,
        fontFamily: fonts.Bold
    },
    textStyleBoldDark: {
        fontSize: 15,
        fontFamily: fonts.Bold,
        color: colors.WHITE
    },
});