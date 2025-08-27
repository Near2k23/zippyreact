import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    Dimensions,
    Platform,
    Image,
    TouchableOpacity,
    Linking,
    Alert,
    useColorScheme
} from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { Avatar } from 'react-native-elements';
import { colors } from '../common/theme';
import i18n from 'i18n-js';
import StarRating from 'react-native-star-rating-widget';
import { useSelector } from 'react-redux';
import { Ionicons, Fontisto, AntDesign, Octicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment/min/moment-with-locales';
import Button from '../components/Button';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import { fonts } from '../common/font';
import DownloadReceipt from '../components/DownloadReceipt';
import { getLangKey } from 'common/src/other/getLangKey';
import customMapStyle from "../common/mapTheme.json";

const { width } = Dimensions.get('window');

export default function RideDetails(props) {
    const { data } = props.route.params;
    const paramData = data;
    const settings = useSelector(state => state.settingsdata.settings);
    const auth = useSelector(state => state.auth);
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const [coords, setCoords] = useState([]);
    const [role, setRole] = useState();
    const colorScheme = useColorScheme();
    const [mode, setMode] = useState();

    const formatAmount = (value, decimal, country) => {
        const number = parseFloat(value || 0);
        if (country === "Vietnam") {
            return number.toLocaleString("vi-VN", {
                minimumFractionDigits: decimal,
                maximumFractionDigits: decimal
            });
        }
        return number.toLocaleString("en-US", {
            minimumFractionDigits: decimal,
            maximumFractionDigits: decimal
        });
    };

    useEffect(() => {
        if (auth?.profile?.mode) {
            setMode(auth.profile.mode === 'system' ? colorScheme : auth.profile.mode);
        } else {
            setMode('light');
        }
    }, [auth, colorScheme]);

    useEffect(() => {
        setRole(auth.profile?.usertype || null);
    }, [auth.profile]);

    useEffect(() => {
        const arr = [paramData.coords[0]];
        if (paramData?.waypoints) {
            paramData.waypoints.forEach(waypoint => {
                arr.push({ latitude: waypoint.lat, longitude: waypoint.lng });
            });
        }
        arr.push(paramData.coords[1]);
        setCoords(arr);
    }, []);

    const goToBooking = (id) => {
        if (paramData.status === 'PAYMENT_PENDING') {
            props.navigation.navigate('PaymentDetails', { booking: paramData });
        } else {
            props.navigation.replace('BookedCab', { bookingId: id });
        }
    };

    const onPressCall = (phoneNumber) => {
        const allowedStatuses = ['PAYMENT_PENDING', 'NEW', 'ACCEPTED', 'ARRIVED', 'STARTED', 'REACHED', 'PENDING'];
        if (allowedStatuses.includes(paramData.status)) {
            const callLink = Platform.OS === 'android' ? `tel:${phoneNumber}` : `telprompt:${phoneNumber}`;
            Linking.openURL(callLink);
        } else {
            Alert.alert(t('alert'), `${t('booking_is')}${paramData.status}.${t('not_call')}`);
        }
    };

    const onChatAction = () => {
        const allowedStatuses = ['PAYMENT_PENDING', 'NEW', 'ACCEPTED', 'ARRIVED', 'STARTED', 'REACHED', 'PENDING', 'COMPLETE'];
        if (allowedStatuses.includes(paramData.status)) {
            props.navigation.navigate("onlineChat", { bookingId: paramData.id, status: paramData.status });
        } else {
            Alert.alert(t('alert'), `${t('booking_is')}${paramData.status}.${t('not_chat')}`);
        }
    };

    const onAlert = () => {
        Alert.alert(t('alert'), `${t('booking_is')}${paramData.status}.${t('not_call')}`);
    };

    const onChatAlert = () => {
        Alert.alert(t('alert'), `${t('booking_is')}${paramData.status}.${t('not_chat')}`);
    };

    const isDark = mode === 'dark';
    const mainColor = isDark ? MAIN_COLOR_DARK : MAIN_COLOR;
    const backgroundColor = isDark ? colors.PAGEBACK : colors.SCREEN_BACKGROUND;
    const cardBackgroundColor = isDark ? colors.PAGEBACK : colors.WHITE;
    const textColor = isDark ? colors.WHITE : colors.BLACK;

    const MapSection = () => (
        <View style={styles.mapContainer}>
            <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                customMapStyle={isDark ? customMapStyle : []}
                region={{
                    latitude: (paramData.pickup.lat + paramData.drop.lat) / 2,
                    longitude: (paramData.pickup.lng + paramData.drop.lng) / 2,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1
                }}
            >
                <Marker
                    coordinate={{ latitude: paramData.pickup.lat, longitude: paramData.pickup.lng }}
                    title={t('marker_title_1')}
                    description={paramData.pickup.add}
                >
                    <Image source={require("../../assets/images/green_pin.png")} style={styles.markerImage} />
                </Marker>
                
                {paramData.waypoints?.map((point, index) => (
                    <Marker
                        key={index}
                        coordinate={{ latitude: point.lat, longitude: point.lng }}
                        title={t('marker_title_3')}
                        description={point.add}
                    >
                        <Image source={require("../../assets/images/rsz_2red_pin.png")} style={styles.markerImage} />
                    </Marker>
                ))}
                
                <Marker
                    coordinate={{ latitude: paramData.drop.lat, longitude: paramData.drop.lng }}
                    title={t('marker_title_2')}
                    description={paramData.drop.add}
                >
                    <Image source={require("../../assets/images/rsz_2red_pin.png")} style={styles.markerImage} />
                </Marker>
                
                {paramData.coords && (
                    <Polyline
                        coordinates={paramData.coords}
                        strokeWidth={4}
                        strokeColor={colors.BLUE}
                        geodesic
                    />
                )}
            </MapView>
        </View>
    );

    const RouteCard = () => (
        <View style={[styles.card, { backgroundColor: cardBackgroundColor, borderColor: isDark ? '#2C2C2E' : '#E2E9EC' }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>{t('route_details')}</Text>
            <View style={[styles.addressRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={styles.iconColumn}>
                    <View style={[styles.pickupIconContainer, {
                        borderColor: mainColor,
                        backgroundColor: cardBackgroundColor
                    }]}>
                        <View style={[styles.locationDot, { 
                            backgroundColor: mainColor
                        }]} />
                    </View>
                    {paramData?.waypoints?.map((_, index) => (
                        <React.Fragment key={index}>
                            <View style={[styles.dashedLine, { borderColor: isDark ? colors.WHITE : colors.SHADOW }]} />
                            <View style={styles.waypointMarker}>
                                <Text style={[styles.waypointText, { color: textColor }]}>{String.fromCharCode(65 + index)}</Text>
                            </View>
                        </React.Fragment>
                    ))}
                    <View style={[styles.dashedLine, { borderColor: isDark ? colors.WHITE : colors.SHADOW }]} />
                    <View style={[styles.locationIcon, { backgroundColor: cardBackgroundColor }]}>
                        <Ionicons 
                            name="location"
                            size={10}
                            color={colors.RED}
                        />
                    </View>
                </View>
                <View style={styles.addressColumn}>
                    <View style={styles.addressField}>
                        <Text style={[styles.addressText, { color: textColor }]}>{paramData.pickup.add}</Text>
                    </View>
                    {paramData?.waypoints?.map((point, index) => (
                        <React.Fragment key={index}>
                            <View style={[styles.separator, { backgroundColor: isDark ? colors.WHITE + '20' : colors.SHADOW + '20' }]} />
                            <View style={styles.addressField}>
                                <Text style={[styles.addressText, { color: textColor }]}>{point.add}</Text>
                            </View>
                        </React.Fragment>
                    ))}
                    <View style={[styles.separator, { backgroundColor: isDark ? colors.WHITE + '20' : colors.SHADOW + '20' }]} />
                    <View style={styles.addressField}>
                        <Text style={[styles.addressText, { color: textColor }]}>{paramData.drop.add}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const TripInfoCard = () => (
        <View style={[styles.card, { backgroundColor: cardBackgroundColor, borderColor: isDark ? '#2C2C2E' : '#E2E9EC' }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>{t('trip_information')}</Text>
            
            <View style={[styles.vehicleDetails, { flexDirection: isRTL ? 'row-reverse' : 'row', marginBottom: 20 }]}>
                <View style={styles.vehicleDetailItem}>
                    <Text style={[styles.vehicleDetailLabel, { color: textColor }]}>{t('trip_cost')}</Text>
                    <Text style={[styles.vehicleDetailValue, { color: textColor }]}>
                        {settings.symbol} {paramData?.deliveryWithBid && ['NEW', 'PAYMENT_PENDING'].includes(paramData.status)
                            ? t('bid')
                            : formatAmount(
                                paramData?.trip_cost > 0 ? paramData.trip_cost : paramData?.estimate || 0,
                                settings.decimal,
                                settings.country
                            )}
                    </Text>
                </View>
                
                <View style={styles.vehicleDetailItem}>
                    <Text style={[styles.vehicleDetailLabel, { color: textColor }]}>{t('distance')}</Text>
                    <Text style={[styles.vehicleDetailValue, { color: textColor }]}>
                        {parseFloat(paramData?.distance || 0).toFixed(settings.decimal)} {settings?.convert_to_mile ? t("mile") : t("km")}
                    </Text>
                </View>
                
                <View style={styles.vehicleDetailItem}>
                    <Text style={[styles.vehicleDetailLabel, { color: textColor }]}>{t('duration')}</Text>
                    <Text style={[styles.vehicleDetailValue, { color: textColor }]}>
                        {Math.max(1, Math.floor((paramData?.total_trip_time || paramData?.estimateTime || 0) / 60))} {t("mins")}
                    </Text>
                </View>
            </View>
            
            <View style={[styles.statusContainer, { backgroundColor: mainColor, padding: 12, borderRadius: 8, marginBottom: 16 }]}>
                 <Text style={[styles.statusText, { color: colors.WHITE, fontSize: 16, fontFamily: fonts.Bold }]}>
                     {paramData?.reason ? t(getLangKey(paramData.reason)) : t(paramData.status).toUpperCase()}
                 </Text>
             </View>
             
             <Text style={[styles.bookingDate, { color: textColor, marginTop: 0, fontSize: 12, opacity: 0.7 }]}>
                 {t('booking_date')} - {moment(paramData.bookingDate).format('lll')}
             </Text>
        </View>
    );

    const UserCard = () => {
        const isCustomer = auth.profile.usertype === 'customer';
        const userName = isCustomer ? paramData.driver_name : paramData.customer_name;
        const userImage = isCustomer ? paramData.driver_image : paramData.customer_image;
        const userContact = isCustomer ? paramData.driver_contact : paramData.customer_contact;
        
        if (!userName) return null;

        return (
            <View style={[styles.card, { backgroundColor: cardBackgroundColor, borderColor: isDark ? '#2C2C2E' : '#E2E9EC' }]}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                    {isCustomer ? t('driver_details') : t('customer_details')}
                </Text>
                <View style={[styles.userContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Avatar
                        size="medium"
                        rounded
                        source={userImage ? { uri: userImage } : require('../../assets/images/profilePic.png')}
                    />
                    
                    <View style={styles.userInfo}>
                        <Text style={[styles.userName, { color: textColor }]}>{userName}</Text>
                        {paramData.rating > 0 && isCustomer && (
                            <StarRating
                                maxStars={5}
                                starSize={15}
                                enableHalfStar
                                color={mainColor}
                                emptyColor={mainColor}
                                rating={Math.round(parseFloat(paramData.rating) * 2) / 2}
                                style={isRTL ? { transform: [{ scaleX: -1 }] } : {}}
                                onChange={() => {}}
                            />
                        )}
                    </View>
                    
                    {userContact && (
                        <View style={[styles.contactButtons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <TouchableOpacity
                                onPress={() => ['ACCEPTED', 'ARRIVED', 'STARTED', 'REACHED', 'PENDING'].includes(paramData.status)
                                    ? onPressCall(userContact) : onAlert()}
                                style={[styles.contactButton, { backgroundColor: mainColor }]}
                            >
                                <Ionicons name="call" size={20} color={colors.WHITE} />
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                onPress={() => ['ACCEPTED', 'ARRIVED', 'STARTED', 'REACHED', 'PENDING', 'COMPLETE'].includes(paramData.status)
                                    ? onChatAction() : onChatAlert()}
                                style={[styles.contactButton, { backgroundColor: mainColor }]}
                            >
                                <Ionicons name="chatbubble-ellipses-sharp" size={20} color={colors.WHITE} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const VehicleCard = () => {
        if (!paramData.carType) return null;

        return (
            <View style={[styles.card, { backgroundColor: cardBackgroundColor, borderColor: isDark ? '#2C2C2E' : '#E2E9EC' }]}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>{t('car_details_title')}</Text>
                
                <View style={[styles.vehicleHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.carImageContainer, { backgroundColor: `${mainColor}20` }]}>
                        <Image
                            source={paramData.carImage ? { uri: paramData.carImage } : require('../../assets/images/microBlackCar.png')}
                            style={[styles.carImage, { transform: [{ scaleX: isRTL ? -1 : 1 }] }]}
                        />
                    </View>
                    <Text style={[styles.carType, { color: textColor }]}>{t(getLangKey(paramData.carType))}</Text>
                </View>
                
                <View style={[styles.vehicleDetails, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    {paramData.vehicleModel && (
                        <View style={styles.vehicleDetailItem}>
                            <Text style={[styles.vehicleDetailLabel, { color: textColor }]}>{t('vehicle_model')}</Text>
                            <Text style={[styles.vehicleDetailValue, { color: textColor }]}>{paramData.vehicleModel}</Text>
                        </View>
                    )}
                    
                    {paramData.vehicleMake && (
                        <View style={styles.vehicleDetailItem}>
                            <Text style={[styles.vehicleDetailLabel, { color: textColor }]}>{t('vehicle_make')}</Text>
                            <Text style={[styles.vehicleDetailValue, { color: textColor }]}>{paramData.vehicleMake}</Text>
                        </View>
                    )}
                    
                    <View style={styles.vehicleDetailItem}>
                        <Text style={[styles.vehicleDetailLabel, { color: textColor }]}>{t('vehicle_number')}</Text>
                        <Text style={[styles.vehicleDetailValue, { color: textColor }]}>
                            {paramData.vehicle_number || t('car_no_not_found')}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const BillCard = () => {
        if (!['PENDING', 'PAID', 'COMPLETE'].includes(paramData.status)) return null;

        return (
            <View style={[styles.card, { backgroundColor: cardBackgroundColor, borderColor: isDark ? '#2C2C2E' : '#E2E9EC' }]}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>{t('bill_details_title')}</Text>
                
                {paramData.payment_mode && (
                    <View style={[styles.paymentMethodContainer, { marginBottom: 20 }]}>
                        <View style={[styles.paymentMethodItem, { backgroundColor: `${mainColor}10`, borderColor: mainColor }]}>
                            {paramData.payment_mode === 'cash' ? (
                                <MaterialCommunityIcons name="cash" size={24} color={mainColor} />
                            ) : paramData.payment_mode === 'card' ? (
                                <Feather name="credit-card" size={20} color={mainColor} />
                            ) : (
                                <AntDesign name="wallet" size={20} color={mainColor} />
                            )}
                            <Text style={[styles.paymentMethodText, { color: textColor }]}>
                                {t(paramData.payment_mode)}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: mainColor }]}>
                            <Text style={styles.statusBadgeText}>{t(paramData.status)}</Text>
                        </View>
                    </View>
                )}
                
                <View style={[styles.billSummary, { marginBottom: 20 }]}>
                    <View style={styles.billSummaryItem}>
                        <Text style={[styles.billSummaryLabel, { color: textColor }]}>{t("your_trip")}</Text>
                        <Text style={[styles.billSummaryValue, { color: textColor }]}>
                            {settings?.swipe_symbol
                                ? `${formatAmount(paramData.trip_cost, settings.decimal, settings.country)} ${settings.symbol}`
                                : `${settings.symbol} ${formatAmount(paramData.trip_cost, settings.decimal, settings.country)}`}
                        </Text>
                    </View>
                    
                    {paramData?.discount > 0 && (
                        <View style={styles.billSummaryItem}>
                            <Text style={[styles.billSummaryLabel, { color: textColor }]}>{t('discount')}</Text>
                            <Text style={[styles.billSummaryValue, { color: colors.GREEN }]}>
                                -{formatAmount(paramData?.discount || 0, settings.decimal, settings.country)} {settings.symbol}
                            </Text>
                        </View>
                    )}
                </View>
                
                <View style={[styles.totalContainer, { backgroundColor: `${mainColor}08`, borderColor: mainColor }]}>
                    <Text style={[styles.totalLabel, { color: textColor }]}>{t("Customer_paid")}</Text>
                    <Text style={[styles.totalValue, { color: mainColor }]}>
                        {settings?.swipe_symbol
                            ? `${formatAmount(paramData?.customer_paid || 0, settings.decimal, settings.country)} ${settings.symbol}`
                            : `${settings.symbol} ${formatAmount(paramData?.customer_paid || 0, settings.decimal, settings.country)}`}
                    </Text>
                </View>
                
                <View style={[styles.receiptContainer, { marginTop: 16 }]}>
                    <Text style={[styles.receiptLabel, { color: textColor }]}>{t("receipt")}</Text>
                    <DownloadReceipt booking={paramData} settings={settings} />
                </View>
            </View>
        );
    };

    const FeedbackCard = () => {
        if (!paramData.feedback) return null;

        return (
            <View style={[styles.card, { backgroundColor: cardBackgroundColor, borderColor: isDark ? '#2C2C2E' : '#E2E9EC' }]}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>{t('feedback')}</Text>
                <Text style={[styles.feedbackText, { color: textColor }]}>{paramData.feedback}</Text>
            </View>
        );
    };

    const shouldShowButton = () => {
        const customerStatuses = ['PAYMENT_PENDING', 'NEW', 'ACCEPTED', 'ARRIVED', 'STARTED', 'REACHED', 'PENDING', 'PAID'];
        const driverStatuses = ['ACCEPTED', 'ARRIVED', 'STARTED', 'REACHED'];
        
        return (auth.profile.usertype === 'customer' && customerStatuses.includes(paramData.status)) ||
               (auth.profile.usertype === 'driver' && driverStatuses.includes(paramData.status));
    };

    const getButtonTitle = () => {
        if (paramData.status === 'PAID') return t('add_to_review');
        if (paramData.status === 'PAYMENT_PENDING') return t('paynow_button');
        return t('go_to_booking');
    };

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
                <MapSection />
                <RouteCard />
                <TripInfoCard />
                <UserCard />
                <VehicleCard />
                <BillCard />
                <FeedbackCard />
                
            </ScrollView>
            {shouldShowButton() && (
                <Button
                    title={getButtonTitle()}
                    loading={false}
                    style={[styles.actionButton, { backgroundColor: mainColor }]}
                    buttonStyle={{ color: colors.WHITE }}
                    btnClick={() => goToBooking(paramData.id)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollContainer: {
        flex: 1
    },
    mapContainer: {
        height: 250,
        margin: 16,
        borderRadius: 16,
        overflow: 'hidden'
    },
    map: {
        flex: 1
    },
    markerImage: {
        height: 35,
        width: 35
    },
    card: {
        margin: 16,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E2E9EC'
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: fonts.Bold,
        marginBottom: 16
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    iconColumn: {
        width: 20,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginRight: 15,
        paddingTop: 15,
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
        height: 40,
        width: 2,
        borderStyle: 'dashed',
        borderWidth: 1,
        marginVertical: 8,
    },
    addressColumn: {
        flex: 1,
    },
    addressField: {
        paddingVertical: 12,
    },
    addressText: {
        fontSize: 16,
        fontFamily: fonts.Regular,
    },
    waypointMarker: {
        height: 16,
        width: 16,
        borderRadius: 8,
        backgroundColor: colors.SECONDARY,
        justifyContent: 'center',
        alignItems: 'center'
    },
    waypointText: {
        fontSize: 10,
        fontFamily: fonts.Bold
    },
    separator: {
        height: 1,
        marginVertical: 5,
    },
    statusText: {
        fontSize: 14,
        fontFamily: fonts.Bold,
        textAlign: 'center'
    },
    statusContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    bookingDate: {
        fontSize: 14,
        fontFamily: fonts.Bold,
        textAlign: 'center',
        marginTop: 16
    },
    userContainer: {
        alignItems: 'center'
    },
    userInfo: {
        flex: 1,
        marginHorizontal: 16
    },
    userName: {
        fontSize: 18,
        fontFamily: fonts.Bold,
        marginBottom: 4
    },
    contactButtons: {
        gap: 12
    },
    contactButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center'
    },
    vehicleHeader: {
        alignItems: 'center',
        marginBottom: 16
    },
    carImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    carImage: {
        width: 40,
        height: 40,
        resizeMode: 'contain'
    },
    carType: {
        fontSize: 16,
        fontFamily: fonts.Bold
    },
    vehicleDetails: {
        gap: 16
    },
    vehicleDetailItem: {
        flex: 1,
        alignItems: 'center'
    },
    vehicleDetailLabel: {
        fontSize: 12,
        fontFamily: fonts.Regular,
        marginBottom: 4
    },
    vehicleDetailValue: {
        fontSize: 14,
        fontFamily: fonts.Bold
    },
    paymentMethodContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    paymentMethodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        gap: 8
    },
    paymentMethodText: {
        fontSize: 14,
        fontFamily: fonts.Regular
    },
    statusBadge: {
        backgroundColor: colors.GREEN,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12
    },
    statusBadgeText: {
        color: colors.WHITE,
        fontSize: 12,
        fontFamily: fonts.Bold
    },
    billSummary: {
        gap: 12
    },
    billSummaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4
    },
    billSummaryLabel: {
        fontSize: 14,
        fontFamily: fonts.Regular
    },
    billSummaryValue: {
        fontSize: 14,
        fontFamily: fonts.Bold
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1
    },
    totalLabel: {
        fontSize: 16,
        fontFamily: fonts.Bold
    },
    totalValue: {
        fontSize: 18,
        fontFamily: fonts.Bold
    },
    receiptContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    receiptLabel: {
        fontSize: 14,
        fontFamily: fonts.Regular
    },
    feedbackText: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        lineHeight: 20
    },
    actionButton: {
        height: 50,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        marginTop: 8
    }
});