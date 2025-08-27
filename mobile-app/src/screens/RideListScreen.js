import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Dimensions,
    useColorScheme
} from 'react-native';
import { colors } from '../common/theme';
import { fonts } from '../common/font';
import i18n from 'i18n-js';
import { useSelector } from 'react-redux';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import { Ionicons } from '@expo/vector-icons';
import { Icon } from 'react-native-elements';

const { width } = Dimensions.get('window');

export default function RideListPage(props) {
    const bookings = useSelector(state => state.bookinglistdata.bookings);
    const settings = useSelector(state => state.settingsdata.settings);
    const auth = useSelector(state => state.auth);
    const [bookingData, setBookingData] = useState([]);
    const [tabIndex, setTabIndex] = useState(0);
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    let colorScheme = useColorScheme();
    const [mode, setMode] = useState();

    useEffect(() => {
        if (auth?.profile?.mode) {
            if (auth.profile.mode === 'system') {
                setMode(colorScheme);
            } else {
                setMode(auth.profile.mode);
            }
        } else {
            setMode('light');
        }
    }, [auth, colorScheme]);

    useEffect(() => {
        if (bookings) {
            setBookingData(bookings);
        } else {
            setBookingData([]);
        }
    }, [bookings]);

    const goDetails = (item) => {
        if (item && item.trip_cost > 0) {
            item.roundoffCost = Math.round(item.trip_cost).toFixed(settings.decimal);
            item.roundoff = (Math.round(item.roundoffCost) - item.trip_cost).toFixed(settings.decimal);
            props.navigation.push('RideDetails', { data: item });
        } else {
            item.roundoffCost = Math.round(item.estimate).toFixed(settings.decimal);
            item.roundoff = (Math.round(item.roundoffCost) - item.estimate).toFixed(settings.decimal);
            props.navigation.push('RideDetails', { data: item });
        }
    }

    const formatAmount = (value) => {
        const number = parseFloat(value || 0);
        return number.toLocaleString("en-US", {
            minimumFractionDigits: settings?.decimal || 2,
            maximumFractionDigits: settings?.decimal || 2
        });
    }

    const getFilteredData = () => {
        if (tabIndex === 0) {
            return bookingData.filter(item => item.status === 'ACCEPTED' || item.status === 'STARTED' || item.status === 'ARRIVED' || item.status === 'REACHED');
        } else if (tabIndex === 1) {
            return bookingData.filter(item => item.status === 'COMPLETE');
        } else {
            return bookingData.filter(item => item.status === 'CANCELLED');
        }
    }

    const renderTripCard = ({ item }) => {
        const tripCost = item.trip_cost || item.estimate || 0;
        const distance = item.distance || 0;
        const duration = item.total_time || 0;
        
        return (
            <TouchableOpacity 
                style={[styles.tripCard, { 
                    backgroundColor: mode === 'dark' ? '#1C1C1E' : colors.WHITE,
                    borderColor: mode === 'dark' ? '#2C2C2E' : '#E2E9EC'
                }]}
                onPress={() => goDetails(item)}
            >
                <View style={styles.tripHeader}>
                    <Text style={[styles.todayText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                        {t('today_text')}
                    </Text>
                </View>
                
                <View style={styles.tripContent}>
                    <View style={styles.locationContainer}>
                        <View style={styles.iconColumn}>
                            <View style={[styles.pickupIconContainer, { 
                                borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR,
                                backgroundColor: colors.WHITE
                            }]}>
                                <View style={[styles.locationDot, { 
                                    backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR
                                }]} />
                            </View>
                            <View style={[styles.dashedLine, { borderColor: mode === 'dark' ? colors.WHITE : colors.SHADOW }]} />
                            <View style={[styles.locationIcon, { backgroundColor: colors.WHITE }]}>
                                <Icon 
                                    name="location"
                                    type="ionicon"
                                    size={10}
                                    color={colors.RED}
                                />
                            </View>
                        </View>
                        <View style={styles.addressColumn}>
                            <View style={styles.locationRow}>
                                <View style={styles.locationTextContainer}>
                                    <Text style={[styles.locationLabel, { color: colors.SHADOW }]}>
                                        {t('marker_title_1')}
                                    </Text>
                                    <Text style={[styles.locationAddress, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]} numberOfLines={1}>
                                        {item.pickup?.add}
                                    </Text>
                                </View>
                            </View>
                            <View style={[styles.locationRow, { marginTop: 15 }]}>
                                <View style={styles.locationTextContainer}>
                                    <Text style={[styles.locationLabel, { color: colors.SHADOW }]}>
                                        {t('marker_title_2')}
                                    </Text>
                                    <Text style={[styles.locationAddress, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]} numberOfLines={1}>
                                        {item.drop?.add}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    
                    <View style={styles.tripInfo}>
                        <View style={styles.infoItem}>
                            <Ionicons name="location-outline" size={16} color={colors.SHADOW} />
                            <Text style={[styles.infoText, { color: colors.SHADOW }]}>
                                {distance.toFixed(2)} km
                            </Text>
                        </View>
                        
                        <View style={styles.infoItem}>
                            <Ionicons name="time-outline" size={16} color={colors.SHADOW} />
                            <Text style={[styles.infoText, { color: colors.SHADOW }]}>
                                {Math.round(duration)} {t('mins')}
                            </Text>
                        </View>
                        
                        <View style={styles.infoItem}>
                            <Ionicons name="cash-outline" size={16} color={colors.SHADOW} />
                            <Text style={[styles.infoText, { color: colors.SHADOW }]}>
                                $ {formatAmount(tripCost)}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : '#FFF' }]}>
            <View style={[styles.tabContainer, { 
                backgroundColor: mode === 'dark' ? '#1C1C1E' : colors.WHITE, 
                borderColor: mode === 'dark' ? '#2C2C2E' : '#E2E9EC' 
            }]}>
                <TouchableOpacity 
                    style={[styles.tab, tabIndex === 0 && styles.activeTab]}
                    onPress={() => setTabIndex(0)}
                >
                    <Text style={[styles.tabText, tabIndex === 0 && styles.activeTabText]}>
                        {t('actives')}
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.tab, tabIndex === 1 && styles.activeTab]}
                    onPress={() => setTabIndex(1)}
                >
                    <Text style={[styles.tabText, tabIndex === 1 && styles.activeTabText]}>
                        {t('complete')}
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.tab, tabIndex === 2 && styles.activeTab]}
                    onPress={() => setTabIndex(2)}
                >
                    <Text style={[styles.tabText, tabIndex === 2 && styles.activeTabText]}>
                        {t('cancelled')}
                    </Text>
                </TouchableOpacity>
            </View>
            
            <FlatList
                data={getFilteredData()}
                renderItem={renderTripCard}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.SHADOW }]}>
                            {t('no_data_available')}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.WHITE,
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 25,
        padding: 4,
        gap: 8,
        borderWidth: 1,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#007AFF',
    },
    tabText: {
        fontSize: 16,
        fontFamily: fonts.Bold,
        color: colors.SHADOW,
    },
    activeTabText: {
        color: colors.WHITE,
    },
    listContainer: {
        padding: 20,
    },
    tripCard: {
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        borderWidth: 1,
    },
    tripHeader: {
        marginBottom: 12,
    },
    todayText: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        color: colors.SHADOW,
    },
    tripContent: {
        gap: 16,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconColumn: {
        width: 20,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginRight: 15,
        paddingTop: 2,
    },
    pickupIconContainer: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    locationIcon: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.RED,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dashedLine: {
        height: 35,
        width: 2,
        borderStyle: 'dashed',
        borderWidth: 1,
        marginVertical: 12,
    },
    addressColumn: {
        flex: 1,
        justifyContent: 'space-between',
        height: 80,
    },
    locationRow: {
        justifyContent: 'center',
        height: 28,
        marginBottom: 8,
    },
    locationTextContainer: {
        flex: 1,
        gap: 2,
    },
    locationLabel: {
        fontSize: 12,
        fontFamily: fonts.Regular,
    },
    locationAddress: {
        fontSize: 16,
        fontFamily: fonts.Bold,
    },
    tripInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flexShrink: 1,
        justifyContent: 'flex-start',
    },
    infoText: {
        fontSize: 14,
        fontFamily: fonts.Regular,
    },
    priceText: {
        fontSize: 18,
        fontFamily: fonts.Bold,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: fonts.Regular,
    },
});
