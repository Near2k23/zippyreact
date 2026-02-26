import React, { useEffect, useState, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Dimensions,
    useColorScheme,
    Platform,
    Animated
} from 'react-native';
import { colors } from '../common/theme';
import { fonts } from '../common/font';
import i18n from 'i18n-js';
import { useSelector } from 'react-redux';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import { Ionicons } from '@expo/vector-icons';
import { Icon } from 'react-native-elements';
import HeaderGradient from '../components/HeaderGradient';

const { width } = Dimensions.get('window');

export default function RideListPage(props) {
    const bookings = useSelector(state => state.bookinglistdata.bookings);
    const settings = useSelector(state => state.settingsdata.settings);
    const auth = useSelector(state => state.auth);
    const [bookingData, setBookingData] = useState([]);
    const [tabIndex, setTabIndex] = useState(0);
    const [headerSolid, setHeaderSolid] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;
    const gradientOpacity = scrollY.interpolate({
        inputRange: [0, 50],
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });

    const handleScroll = (event) => {
        const y = event.nativeEvent.contentOffset.y;
        setHeaderSolid(y > 50);
        scrollY.setValue(y);
    };
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

    const getActiveTrips = () => {
        return bookingData.filter(item => item.status === 'ACCEPTED' || item.status === 'STARTED' || item.status === 'ARRIVED' || item.status === 'REACHED');
    }

    const getFilteredData = () => {
        const activeTrips = getActiveTrips();
        const hasActiveTrips = activeTrips.length > 0;
        
        if (hasActiveTrips) {
            // Si hay viajes activos, usar los índices originales
            if (tabIndex === 0) {
                return activeTrips;
            } else if (tabIndex === 1) {
                return bookingData.filter(item => item.status === 'COMPLETE');
            } else {
                return bookingData.filter(item => item.status === 'CANCELLED');
            }
        } else {
            // Si no hay viajes activos, ajustar los índices
            if (tabIndex === 0) {
                return bookingData.filter(item => item.status === 'COMPLETE');
            } else {
                return bookingData.filter(item => item.status === 'CANCELLED');
            }
        }
    }

    useEffect(() => {
        const activeTrips = getActiveTrips();
        // Si no hay viajes activos y estamos en el tab 0 (que ahora sería "Completados"), no hacer nada
        // Si hay viajes activos y estamos en un tab inválido, resetear a 0
        if (activeTrips.length > 0 && tabIndex > 2) {
            setTabIndex(0);
        }
    }, [bookingData]);

    const renderTripCard = ({ item }) => {
        const tripCost = item.trip_cost || item.estimate || 0;
        const distance = item.distance || 0;
        const duration = item.total_time || 0;
        const status = item.status;
        
        const getStatusInfo = () => {
            switch(status) {
                case 'ACCEPTED':
                    return { color: '#3B82F6', text: t('accepted'), icon: 'checkmark-circle', bgColor: '#EFF6FF' };
                case 'STARTED':
                    return { color: '#F59E0B', text: t('started'), icon: 'play-circle', bgColor: '#FFFBEB' };
                case 'ARRIVED':
                    return { color: '#10B981', text: t('arrived'), icon: 'location', bgColor: '#ECFDF5' };
                case 'REACHED':
                    return { color: '#10B981', text: t('reached'), icon: 'flag', bgColor: '#ECFDF5' };
                case 'COMPLETE':
                    return { color: '#10B981', text: t('complete'), icon: 'checkmark-circle', bgColor: '#ECFDF5' };
                case 'CANCELLED':
                    return { color: '#EF4444', text: t('cancelled'), icon: 'close-circle', bgColor: '#FEF2F2' };
                default:
                    return { color: colors.SHADOW, text: status, icon: 'help-circle', bgColor: '#F3F4F6' };
            }
        };

        const statusInfo = getStatusInfo();
        
        return (
            <TouchableOpacity 
                style={[styles.tripCard, { 
                    backgroundColor: mode === 'dark' ? '#1C1C1E' : colors.WHITE,
                }]}
                onPress={() => goDetails(item)}
            >
                {/* Header con estado y fecha */}
                <View style={styles.tripHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                        <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.text}
                        </Text>
                    </View>
                    <Text style={[styles.tripDate, { color: colors.SHADOW }]}>
                        {(() => {
                            const dateString = item.tripdate;
                            
                            if (!dateString) {
                                return t('no_date');
                            }
                            
                            const date = new Date(dateString);
                            if (isNaN(date.getTime())) {
                                return t('no_date');
                            }
                            
                            return date.toLocaleDateString();
                        })()}
                    </Text>
                </View>
                
                {/* Ruta simplificada */}
                <View style={styles.routeContainer}>
                    <View style={styles.routePoint}>
                        <View style={[styles.routeDot, { backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]} />
                        <Text style={[styles.routeAddress, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]} numberOfLines={1}>
                            {item.pickup?.add}
                        </Text>
                    </View>
                    
                    <View style={[styles.routeLine, { backgroundColor: mode === 'dark' ? colors.WHITE + '30' : colors.SHADOW + '30' }]} />
                    
                    <View style={styles.routePoint}>
                        <View style={[styles.routeDot, { backgroundColor: colors.RED }]} />
                        <Text style={[styles.routeAddress, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]} numberOfLines={1}>
                            {item.drop?.add}
                        </Text>
                    </View>
                </View>
                
                {/* Footer con información */}
                <View style={styles.tripFooter}>
                    <View style={styles.tripMetrics}>
                        <View style={styles.metricItem}>
                            <Ionicons name="location-outline" size={14} color={colors.SHADOW} />
                            <Text style={[styles.metricText, { color: colors.SHADOW }]}>
                                {distance.toFixed(1)} km
                            </Text>
                        </View>
                        
                        <View style={styles.metricItem}>
                            <Ionicons name="time-outline" size={14} color={colors.SHADOW} />
                            <Text style={[styles.metricText, { color: colors.SHADOW }]}>
                                {Math.round(duration)} {t('mins')}
                            </Text>
                        </View>
                    </View>
                    
                    <View style={[styles.priceBadge, { backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK + '20' : MAIN_COLOR + '20' }]}>
                        <Text style={[styles.priceText, { color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}>
                            ${formatAmount(tripCost)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    const renderFilterHeader = () => {
        const activeTrips = getActiveTrips();
        const completeTrips = bookingData.filter(item => item.status === 'COMPLETE');
        const cancelledTrips = bookingData.filter(item => item.status === 'CANCELLED');
        
        const filterOptions = [];
        
        // Solo agregar "Activos" si hay viajes activos
        if (activeTrips.length > 0) {
            filterOptions.push({ key: 0, label: t('actives'), count: activeTrips.length, icon: 'time-outline' });
        }
        
        // Siempre agregar "Completados" y "Cancelados"
        filterOptions.push(
            { key: 1, label: t('complete'), count: completeTrips.length, icon: 'checkmark-circle-outline' },
            { key: 2, label: t('cancelled'), count: cancelledTrips.length, icon: 'close-circle-outline' }
        );

        return (
            <View style={styles.filterContainer}>
                <Text style={[styles.filterTitle, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                    {t('filter_trips')}
                </Text>
                <View style={styles.filterChips}>
                    {filterOptions.map((option) => (
                        <TouchableOpacity
                            key={option.key}
                            style={[
                                styles.filterChip,
                                tabIndex === option.key && styles.activeFilterChip,
                                {
                                    backgroundColor: tabIndex === option.key 
                                        ? (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR)
                                        : (mode === 'dark' ? '#2C2C2E' : '#F5F5F5'),
                                    borderColor: tabIndex === option.key 
                                        ? (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR)
                                        : (mode === 'dark' ? '#2C2C2E' : '#E2E9EC')
                                }
                            ]}
                            onPress={() => setTabIndex(option.key)}
                        >
                            <Ionicons 
                                name={option.icon} 
                                size={16} 
                                color={tabIndex === option.key ? colors.WHITE : (mode === 'dark' ? colors.WHITE : colors.BLACK)} 
                            />
                            <Text style={[
                                styles.filterChipText,
                                {
                                    color: tabIndex === option.key ? colors.WHITE : (mode === 'dark' ? colors.WHITE : colors.BLACK)
                                }
                            ]}>
                                {option.label}
                            </Text>
                            {option.count > 0 && (
                                <View style={[
                                    styles.countBadge,
                                    {
                                        backgroundColor: tabIndex === option.key ? colors.WHITE : (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR)
                                    }
                                ]}>
                                    <Text style={[
                                        styles.countText,
                                        {
                                            color: tabIndex === option.key ? (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR) : colors.WHITE
                                        }
                                    ]}>
                                        {option.count}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : '#FFF' }]}>
            <HeaderGradient mode={mode} style={{ opacity: gradientOpacity }} />
            <View style={[styles.customHeader, { 
                backgroundColor: headerSolid ? (mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND) : 'transparent',
                paddingTop: Platform.OS === 'ios' ? 50 : 30,
                paddingHorizontal: 20,
                paddingBottom: 15,
                zIndex: 2,
            }]}>
                <Text style={{
                    fontFamily: 'Inter-Bold',
                    color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                    fontSize: 20,
                    textAlign: 'center',
                    marginTop: 8,
                }}>
                    {t('ride_list_title')}
                </Text>
            </View>
            
            <FlatList
                data={getFilteredData()}
                renderItem={renderTripCard}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={[styles.listContainer, { paddingTop: Platform.OS === 'ios' ? 100 : 80 }]}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderFilterHeader}
                onScroll={handleScroll}
                scrollEventThrottle={16}
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
    customHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2,
    },

    filterContainer: {
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    filterTitle: {
        fontSize: 18,
        fontFamily: fonts.Bold,
        marginBottom: 16,
    },
    filterChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 1,
        gap: 8,
        shadowColor: colors.BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activeFilterChip: {
        shadowOpacity: 0.2,
        elevation: 6,
    },
    filterChipText: {
        fontSize: 14,
        fontFamily: fonts.Medium,
    },
    countBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    countText: {
        fontSize: 12,
        fontFamily: fonts.Bold,
    },
    listContainer: {
        padding: 20,
    },
    tripCard: {
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        shadowColor: colors.BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    tripHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontFamily: fonts.Medium,
    },
    tripDate: {
        fontSize: 11,
        fontFamily: fonts.Regular,
    },
    routeContainer: {
        marginBottom: 12,
        gap: 8,
    },
    routePoint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    routeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    routeAddress: {
        flex: 1,
        fontSize: 14,
        fontFamily: fonts.Medium,
    },
    routeLine: {
        height: 1,
        marginLeft: 4,
        marginVertical: 4,
    },
    tripFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    tripMetrics: {
        flexDirection: 'row',
        gap: 16,
    },
    metricItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metricText: {
        fontSize: 11,
        fontFamily: fonts.Medium,
    },
    priceBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    priceText: {
        fontSize: 14,
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
