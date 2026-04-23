import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Dimensions,
    TouchableOpacity,
    Text,
    Platform,
    Modal,
    Linking,
    Alert,
    Share,
    ScrollView,
    useColorScheme,
    TextInput,
    Keyboard
} from 'react-native';
import { TouchableOpacity as OldTouch } from 'react-native';
import { Icon, Button } from 'react-native-elements';
import MapView, { Polyline, PROVIDER_GOOGLE, Marker, AnimatedRegion } from 'react-native-maps';
import { OtpModal } from '../components';
import StarRating from 'react-native-star-rating-widget';
import RadioForm from 'react-native-simple-radio-button';
import { colors } from '../common/theme';
var { width, height } = Dimensions.get('window');
import i18n from 'i18n-js';
import { useSelector, useDispatch } from 'react-redux';
import * as DecodePolyLine from '@mapbox/polyline';
import carImageIcon from '../../assets/images/track_Car.png';
import { api } from 'common';
import * as ImagePicker from 'expo-image-picker';
import moment from 'moment/min/moment-with-locales';
import { CommonActions } from '@react-navigation/native';
import { appConsts, MAIN_COLOR, MAIN_COLOR_DARK, SECONDORY_COLOR } from '../common/sharedFunctions';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../common/font';
import { getLangKey } from 'common/src/other/getLangKey';
import { getVehicleColorByKey } from 'common/src/other/VehicleColors';
import { ERRAND_PHASES, ERRAND_SERVICE_TYPE, appendErrandPriceHistory, getErrandItemValue, normalizeErrandData } from 'common/src/other/ErrandUtils';
import DeviceInfo from 'react-native-device-info';
import customMapStyle from "../common/mapTheme.json";
import WaygoDialog from '../components/WaygoDialog';

const hasNotch = DeviceInfo.hasNotch();

export default function BookedCabScreen(props) {
    const {
        fetchBookingLocations,
        stopLocationFetch,
        updateBookingImage,
        cancelBooking,
        updateBooking,
        getDirectionsApi,
        editSos
    } = api;
    const dispatch = useDispatch();
    const { bookingId } = props.route.params;
    const latitudeDelta = 0.0922;
    const longitudeDelta = 0.0421;
    const [alertModalVisible, setAlertModalVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
    const activeBookings = useSelector(state => state.bookinglistdata.active);
    const [curBooking, setCurBooking] = useState(null);
    const cancelReasons = useSelector(state => state.cancelreasondata.complex);
    const auth = useSelector(state => state.auth);
    const [cancelReasonSelected, setCancelReasonSelected] = useState(0);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const lastLocation = useSelector(state => state.locationdata.coords);
    const [liveRouteCoords, setLiveRouteCoords] = useState(null);
    const mapRef = useRef();
    const pageActive = useRef();
    const [lastCoords, setlastCoords] = useState();
    const [arrivalTime, setArrivalTime] = useState(0);
    const [loading, setLoading] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [isMessageFocused, setIsMessageFocused] = useState(false);
    const [purchaseInfoModalStatus, setPurchaseInfoModalStatus] = useState(false);
    const settings = useSelector(state => state.settingsdata.settings);

    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

    const [role, setRole] = useState();
    let colorScheme = useColorScheme();
    const [mode, setMode] = useState();
    const [showBottomExpanded, setShowBottomExpanded] = useState(false);
    const [touchY, setTouchY] = useState();
    const [ratingVisible, setRatingVisible] = useState(false);
    const [driverRatingValue, setDriverRatingValue] = useState(0);
    const [driverFeedback, setDriverFeedback] = useState('');
    const [tipOptions, setTipOptions] = useState([10, 15, 25, 40]);
    const [selectedTipPercent, setSelectedTipPercent] = useState(null);
    const [errandPriceModalVisible, setErrandPriceModalVisible] = useState(false);
    const [errandPriceValue, setErrandPriceValue] = useState('');
    const [errandPriceNote, setErrandPriceNote] = useState('');
    const [errandAlternativeNote, setErrandAlternativeNote] = useState('');

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

    const isErrand = curBooking?.serviceType === ERRAND_SERVICE_TYPE;
    const errand = normalizeErrandData(curBooking?.errand, settings || {});
    const errandItemValue = getErrandItemValue(errand);

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
        if (auth.profile && auth.profile.usertype) {
            setRole(auth.profile.usertype);
        } else {
            setRole(null);
        }
    }, [auth.profile]);

    useEffect(() => {
        if (role === 'driver') {
            setShowBottomExpanded(true);
        } else if (role === 'customer') {
            setShowBottomExpanded(false);
        }
    }, [role]);

    useEffect(() => {
        const fallback = [10, 15, 25, 40];
        if (settings && settings.tipMoneyField) {
            const parsed = settings.tipMoneyField
                .split(',')
                .map(v => Number(String(v).trim()))
                .filter(v => Number.isFinite(v) && v > 0);
            setTipOptions(parsed.length > 0 ? parsed : fallback);
        } else {
            setTipOptions(fallback);
        }
    }, [settings]);

    useEffect(() => {
        setInterval(() => {
            if (pageActive.current && curBooking && lastLocation && (curBooking.status == 'ACCEPTED' || curBooking.status == 'STARTED')) {
                if (lastCoords && lastCoords.lat != lastLocation.lat && lastCoords.lat != lastLocation.lng) {
                    if (curBooking.status == 'ACCEPTED') {
                        let point1 = { lat: lastLocation.lat, lng: lastLocation.lng };
                        let point2 = { lat: curBooking.pickup.lat, lng: curBooking.pickup.lng };
                        fitMap(point1, point2);
                    } else {
                        let point1 = { lat: lastLocation.lat, lng: lastLocation.lng };
                        let point2 = { lat: curBooking.drop.lat, lng: curBooking.drop.lng };
                        fitMap(point1, point2);
                    }
                    setlastCoords(lastLocation);
                }
            }
        }, 20000);
    }, []);


    useEffect(() => {
        if (lastLocation && curBooking && curBooking.status == 'ACCEPTED' && pageActive.current) {
            let point1 = { lat: lastLocation.lat, lng: lastLocation.lng };
            let point2 = { lat: curBooking.pickup.lat, lng: curBooking.pickup.lng };
            fitMap(point1, point2);
            setlastCoords(lastLocation);
        }

        if (curBooking && curBooking.status == 'ARRIVED' && pageActive.current && mapRef.current) {
            setlastCoords(null);
            setTimeout(() => {
                if (mapRef.current) {
                    mapRef.current.fitToCoordinates([{ latitude: curBooking.pickup.lat, longitude: curBooking.pickup.lng }, { latitude: curBooking.drop.lat, longitude: curBooking.drop.lng }], {
                        edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
                        animated: true,
                    });
                }
            }, 1000);
        }
        if (lastLocation && curBooking && curBooking.status == 'STARTED' && pageActive.current) {
            let point1 = { lat: lastLocation.lat, lng: lastLocation.lng };
            let point2 = { lat: curBooking.drop.lat, lng: curBooking.drop.lng };
            fitMap(point1, point2);
            setlastCoords(lastLocation);
        }
        if (lastLocation && curBooking && curBooking.status == 'REACHED' && role == 'customer' && pageActive.current) {
            setTimeout(() => {
                if (mapRef.current) {
                    mapRef.current.fitToCoordinates([{ latitude: curBooking.pickup.lat, longitude: curBooking.pickup.lng }, { latitude: lastLocation.lat, longitude: lastLocation.lng }], {
                        edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
                        animated: true,
                    })
                }
            }, 1000);
        }
    }, [lastLocation, curBooking, pageActive.current])

    const fitMap = (point1, point2) => {
        let startLoc = point1.lat + ',' + point1.lng;
        let destLoc = point2.lat + ',' + point2.lng;
        if (settings.showLiveRoute) {
            let waypoints = "";
            if (curBooking.waypoints && curBooking.waypoints.length > 0) {
                const arr = curBooking.waypoints;
                for (let i = 0; i < arr.length; i++) {
                    waypoints = waypoints + arr[i].lat + "," + arr[i].lng;
                    if (i < arr.length - 1) {
                        waypoints = waypoints + "|";
                    }
                }
            }
            getDirectionsApi(startLoc, destLoc, waypoints).then((details) => {
                setArrivalTime(details.time_in_secs ? Math.round(details.time_in_secs / 60) : 0);
                let points = DecodePolyLine.decode(details.polylinePoints);
                let coords = points.map((point, index) => {
                    return {
                        latitude: point[0],
                        longitude: point[1]
                    }
                })
                setLiveRouteCoords(coords);
                if (mapRef.current) {
                    mapRef.current.fitToCoordinates([{ latitude: point1.lat, longitude: point1.lng }, { latitude: point2.lat, longitude: point2.lng }], {
                        edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
                        animated: true,
                    })
                }
            }).catch(() => {

            });
        } else {
            if (mapRef.current) {
                mapRef.current.fitToCoordinates([{ latitude: point1.lat, longitude: point1.lng }, { latitude: point2.lat, longitude: point2.lng }], {
                    edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
                    animated: true,
                })
            }
        }
    }


    useEffect(() => {
        if (activeBookings && activeBookings.length >= 1) {
            let booking = activeBookings.filter(booking => booking.id == bookingId)[0];
            if (booking) {
                setCurBooking(booking);
                let diffMins = ((new Date(booking.tripdate)) - (new Date())) / (1000 * 60);
                if (booking.status == 'NEW' && (booking.bookLater == false || (booking.bookLater && diffMins <= 15))) {
                    if (role == 'customer' && !booking.hasOwnProperty('confirmModal')) setTimeout(() => setConfirmModalVisible(true), Platform.OS === "ios" ? 200 : 0);
                    if (role == 'customer' && booking.driverOffers) setTimeout(() => setSearchModalVisible(true), setConfirmModalVisible(false), Platform.OS === "ios" ? 200 : 0);
                    if (role == 'customer' && booking.selectedBid && !booking.customer_paid) {
                        setTimeout(() => {
                            setConfirmModalVisible(false);
                            setSearchModalVisible(false);
                            props.navigation.navigate('PaymentDetails', { booking: { ...booking, ...booking.selectedBid } });
                        }, 2000)
                    }
                }
                if (booking.status == 'ACCEPTED') {
                    if (role == 'customer') setConfirmModalVisible(false);
                    if (role == 'customer') setSearchModalVisible(false);
                    if (role == 'customer') dispatch(fetchBookingLocations(bookingId));
                }
                if (booking.status == 'ARRIVED') {
                    if (role == 'customer') dispatch(fetchBookingLocations(bookingId));
                }
                if (booking.status == 'STARTED') {
                    if (role == 'customer') dispatch(fetchBookingLocations(bookingId));
                }
                if (booking.status == 'REACHED') {
                    if (role == 'driver') {
                        setTimeout(() => {
                            props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'PaymentDetails', params: { booking: booking } }] }));
                        }, 1000);
                    }
                }
                if (booking.status == 'PENDING') {
                    if (role == 'customer') {
                        setTimeout(() => {
                            props.navigation.navigate('PaymentDetails', { booking: booking });
                        }, 1000);
                    }
                }
                if (booking.status == 'PAID' & pageActive.current) {
                    if (role == 'customer') {
                        setTimeout(() => {
                            setRatingVisible(true);
                        }, 800);
                    }
                    if (role == 'driver') {
                        props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'TabRoot' }] }));
                    }
                }
                if ((booking.status == 'ACCEPTED' || booking.status == 'ARRIVED') && booking.pickup_image) {
                    setLoading(false);
                }
                if (booking.status == 'STARTED' && booking.deliver_image) {
                    setLoading(false);
                }
            }
            else {
                setModalVisible(false);
                setSearchModalVisible(false);
                props.navigation.navigate('TabRoot', { screen: 'RideList', params: { fromBooking: true } });
            }
        }
        else {
            setModalVisible(false);
            setSearchModalVisible(false);
            if (role == 'driver') {
                props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'TabRoot' }] }));
            } else {
                props.navigation.navigate('TabRoot', { screen: 'RideList', params: { fromBooking: true } });
            }
        }
    }, [activeBookings, role, pageActive.current]);

    const renderButtons = () => {
        if (isErrand) {
            return (
                <View style={{ width: '98%', alignSelf: 'center', marginVertical: 5, marginBottom: 15 }}>
                    {(role == 'customer' && (curBooking.status == 'NEW' || curBooking.status == 'ACCEPTED')) ? (
                        <View style={{ height: 50 }}>
                            <Button
                                title={t('cancel_ride')}
                                titleStyle={{ fontFamily: fonts.Bold, fontSize: 13 }}
                                onPress={() => setModalVisible(true)}
                                buttonStyle={{ height: '100%', backgroundColor: colors.RED, borderRadius: 10 }}
                            />
                        </View>
                    ) : null}

                    {role == 'driver' && curBooking.status == 'ACCEPTED' ? (
                        <View style={{ height: 50 }}>
                            <Button
                                title={'Llegue a tienda/zona'}
                                titleStyle={{ color: colors.WHITE, fontFamily: fonts.Bold, fontSize: 13 }}
                                onPress={markErrandArrival}
                                buttonStyle={{ height: '100%', backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, borderRadius: 10 }}
                            />
                        </View>
                    ) : null}

                    {role == 'driver' && curBooking.status == 'ARRIVED' ? (
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 10 }}>
                            <View style={{ flex: 1, height: 50 }}>
                                <Button
                                    title={'Solicitar cambio'}
                                    titleStyle={{ color: colors.WHITE, fontFamily: fonts.Bold, fontSize: 12 }}
                                    onPress={() => setErrandPriceModalVisible(true)}
                                    disabled={!!errand.activePriceChangeRequest}
                                    buttonStyle={{ height: '100%', backgroundColor: colors.BLACK, borderRadius: 10 }}
                                />
                            </View>
                            {errand.phase === ERRAND_PHASES.ITEM_CONFIRMED ? (
                                <View style={{ flex: 1, height: 50 }}>
                                    <Button
                                        title={'Iniciar entrega'}
                                        titleStyle={{ color: colors.WHITE, fontFamily: fonts.Bold, fontSize: 12 }}
                                        onPress={startErrandDelivery}
                                        buttonStyle={{ height: '100%', backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, borderRadius: 10 }}
                                    />
                                </View>
                            ) : (
                                <View style={{ flex: 1, height: 50 }}>
                                    <Button
                                        title={'Producto comprado'}
                                        titleStyle={{ color: colors.WHITE, fontFamily: fonts.Bold, fontSize: 12 }}
                                        onPress={confirmErrandItemPurchased}
                                        disabled={!!errand.activePriceChangeRequest || !!errand.requiresAdditionalPayment}
                                        buttonStyle={{ height: '100%', backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, borderRadius: 10 }}
                                    />
                                </View>
                            )}
                        </View>
                    ) : null}

                    {role == 'driver' && curBooking.status == 'STARTED' ? (
                        <View style={{ height: 50, marginTop: 10 }}>
                            <Button
                                title={'Completar mandado'}
                                loading={loading}
                                titleStyle={{ color: colors.WHITE, fontFamily: fonts.Bold, fontSize: 16 }}
                                onPress={endBooking}
                                buttonStyle={{ height: '100%', backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, borderRadius: 10 }}
                            />
                        </View>
                    ) : null}

                    {role == 'customer' && errand.activePriceChangeRequest && errand.activePriceChangeRequest.status === 'PENDING' ? (
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 10, marginTop: 10 }}>
                            <View style={{ flex: 1, height: 50 }}>
                                <Button
                                    title={'Rechazar cambio'}
                                    titleStyle={{ color: colors.WHITE, fontFamily: fonts.Bold, fontSize: 12 }}
                                    onPress={rejectErrandPriceChange}
                                    buttonStyle={{ height: '100%', backgroundColor: colors.RED, borderRadius: 10 }}
                                />
                            </View>
                            <View style={{ flex: 1, height: 50 }}>
                                <Button
                                    title={'Aceptar cambio'}
                                    titleStyle={{ color: colors.WHITE, fontFamily: fonts.Bold, fontSize: 12 }}
                                    onPress={acceptErrandPriceChange}
                                    buttonStyle={{ height: '100%', backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, borderRadius: 10 }}
                                />
                            </View>
                        </View>
                    ) : null}
                </View>
            );
        }
        return (
            (curBooking && role == 'customer' && (curBooking.status == 'NEW' || curBooking.status == 'ACCEPTED')) ||
                (curBooking && role == 'driver' && (curBooking.status == 'ACCEPTED' || curBooking.status == 'ARRIVED' || curBooking.status == 'STARTED')) ?
                <View style={{ height: 50, flexDirection: isRTL ? 'row-reverse' : 'row', width: '98%', alignSelf: 'center', marginVertical: 5, marginBottom: 15 }}>
                    {(role == 'customer' && !curBooking.pickup_image && (curBooking.status == 'NEW' || curBooking.status == 'ACCEPTED')) ||
                        (role == 'driver' && !curBooking.pickup_image && (curBooking.status == 'ACCEPTED' || curBooking.status == 'ARRIVED')) ?
                        <View style={{ flex: 1 }}>
                            <Button
                                title={t('cancel_ride')}
                                loading={false}
                                loadingProps={{ size: "large" }}
                                titleStyle={{ fontFamily: fonts.Bold, fontSize: 13 }}
                                onPress={() => {
                                    role == 'customer' ?
                                        setModalVisible(true) :
                                        Alert.alert(
                                            t('alert'),
                                            t('cancel_confirm'),
                                            [
                                                { text: t('cancel'), onPress: () => { }, style: 'cancel' },
                                                { text: t('ok'), onPress: () => dispatch(cancelBooking({ booking: curBooking, reason: t('driver_cancelled_booking'), cancelledBy: role })) },
                                            ]
                                        );
                                }
                                }
                                buttonStyle={{ height: '100%', backgroundColor: colors.RED, borderRadius: 10, width: curBooking && role == 'customer' ? '100%' : '95%', alignSelf: curBooking && role == 'customer' ? 'center' : isRTL ? 'flex-end' : 'flex-start', }}
                                containerStyle={{ height: '100%' }}
                            />
                        </View>
                        : null}
                    {appConsts.captureBookingImage && settings && settings.AllowDeliveryPickupImageCapture && role == 'driver' && !curBooking.pickup_image && (curBooking.status == 'ACCEPTED' || curBooking.status == 'ARRIVED') ?
                        <View style={{ flex: 1 }}>
                            <Button
                                title={t('take_pickup_image')}
                                loading={loading}
                                titleStyle={{ color: colors.WHITE, fontFamily: fonts.Bold, fontSize: 13 }}
                                loadingProps={{ size: "large", color: colors.WHITE }}
                                onPress={() => _pickImage(ImagePicker.launchCameraAsync)}
                                buttonStyle={{ height: '100%', backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, width: '95%', borderRadius: 10, alignSelf: isRTL ? 'flex-start' : 'flex-end' }}
                                containerStyle={{ height: '100%' }}
                            />
                        </View>
                        : null}
                    {role == 'driver' && (!appConsts.captureBookingImage || (curBooking.pickup_image && appConsts.captureBookingImage) || (settings && !settings.AllowDeliveryPickupImageCapture && appConsts.captureBookingImage)) && (curBooking.status == 'ACCEPTED' || curBooking.status == 'ARRIVED') ?
                        <View style={{ flex: 1 }}>
                            <Button
                                title={t('start_trip')}
                                loading={false}
                                loadingProps={{ size: "large", color: colors.WHITE }}
                                titleStyle={{ color: colors.WHITE, fontFamily: fonts.Bold, fontSize: 13 }}
                                onPress={() => {
                                    if (curBooking.otp && appConsts.hasStartOtp) {
                                        setOtpModalVisible(true);
                                    } else {
                                        startBooking();
                                    }
                                }}
                                buttonStyle={{ height: '100%', backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, width: '100%', borderRadius: 10, alignSelf: 'center' }}
                                containerStyle={{ height: '100%' }}
                            />
                        </View>
                        : null}

                    {appConsts.captureBookingImage && settings && settings.AllowFinalDeliveryImageCapture && role == 'driver' && !curBooking.deliver_image && curBooking.status == 'STARTED' ?
                        <View style={{ flex: 1 }}>
                            <Button
                                title={t('take_deliver_image')}
                                loading={loading}
                                loadingProps={{ size: "large", color: colors.WHITE }}
                                titleStyle={{ color: colors.WHITE, fontFamily: fonts.Bold, fontSize: 14 }}
                                onPress={() => _pickImage(ImagePicker.launchCameraAsync)}
                                buttonStyle={{ height: '100%', backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, borderRadius: 10, alignSelf: 'center', width: '100%' }}
                                containerStyle={{ height: '100%' }}
                            />
                        </View>
                        : null}
                    {role == 'driver' && (!appConsts.captureBookingImage || (curBooking.deliver_image && appConsts.captureBookingImage) || (settings && !settings.AllowFinalDeliveryImageCapture && appConsts.captureBookingImage)) && curBooking.status == 'STARTED' ?
                        <View style={{ flex: 1 }}>
                            <Button
                                title={t('complete_ride')}
                                loading={loading}
                                titleStyle={{ color: colors.WHITE, fontFamily: fonts.Bold, fontSize: 16 }}
                                onPress={() => {
                                    if (curBooking.otp && !appConsts.hasStartOtp) {
                                        setOtpModalVisible(true);
                                    } else {
                                        endBooking();
                                    }
                                }}
                                buttonStyle={{ height: '100%', backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, borderRadius: 10 }}
                                containerStyle={{ height: '100%', width: '100%' }}
                            />
                        </View>
                        : null}
                </View>
                : null
        );
    }



    const startBooking = () => {
        setOtpModalVisible(false);
        let booking = { ...curBooking };
        booking.status = 'STARTED';
        dispatch(updateBooking(booking));
    }

    const endBooking = () => {
        setLoading(true);
        let booking = { ...curBooking };
        booking.status = 'REACHED';
        dispatch(updateBooking(booking));
        setOtpModalVisible(false);
    }

    const updateErrand = (errandChanges = {}, bookingChanges = {}) => {
        let booking = { ...curBooking, ...bookingChanges };
        booking.errand = {
            ...errand,
            ...errandChanges,
        };
        dispatch(updateBooking(booking));
    };

    const markErrandArrival = () => {
        updateErrand(
            { phase: errand.requiresSearch ? ERRAND_PHASES.SEARCHING : ERRAND_PHASES.TO_STORE },
            { status: 'ARRIVED' }
        );
    };

    const submitErrandPriceChange = () => {
        if (errand.activePriceChangeRequest) {
            Alert.alert(t('alert'), 'Ya existe una solicitud de cambio pendiente para este mandado.');
            return;
        }
        const proposedAmount = parseFloat(errandPriceValue);
        if (!proposedAmount || proposedAmount <= 0) {
            Alert.alert(t('alert'), 'Ingresa un valor valido para el producto.');
            return;
        }
        const request = {
            proposedAmount,
            note: errandPriceNote,
            alternativeNote: errandAlternativeNote,
            requestedAt: Date.now(),
            requestedBy: role,
            status: 'PENDING'
        };
        updateErrand({
            activePriceChangeRequest: request,
            phase: ERRAND_PHASES.AWAITING_PRICE_APPROVAL,
            priceChangeHistory: appendErrandPriceHistory(errand.priceChangeHistory, request, 'PENDING', role)
        });
        setErrandPriceValue('');
        setErrandPriceNote('');
        setErrandAlternativeNote('');
        setErrandPriceModalVisible(false);
    };

    const acceptErrandPriceChange = () => {
        if (!errand.activePriceChangeRequest) {
            return;
        }
        const proposedAmount = parseFloat(errand.activePriceChangeRequest.proposedAmount || 0);
        const alreadyPaidOnline = parseFloat(errand.itemValuePaidOnline || 0);
        const needsExtraOnlinePayment = curBooking.payment_mode !== 'cash' && proposedAmount > alreadyPaidOnline;
        const refundPending = curBooking.payment_mode !== 'cash' && alreadyPaidOnline > proposedAmount
            ? parseFloat((alreadyPaidOnline - proposedAmount).toFixed(settings?.decimal || 2))
            : 0;

        let booking = { ...curBooking };
        booking.errand = {
            ...errand,
            approvedItemValue: proposedAmount,
            activePriceChangeRequest: null,
            phase: needsExtraOnlinePayment ? ERRAND_PHASES.AWAITING_PRICE_APPROVAL : ERRAND_PHASES.ITEM_CONFIRMED,
            pendingOnlinePayment: needsExtraOnlinePayment
                ? parseFloat((proposedAmount - alreadyPaidOnline).toFixed(settings?.decimal || 2))
                : 0,
            requiresAdditionalPayment: needsExtraOnlinePayment,
            pendingWalletRefund: refundPending,
            priceChangeHistory: appendErrandPriceHistory(errand.priceChangeHistory, errand.activePriceChangeRequest, 'ACCEPTED', role)
        };
        dispatch(updateBooking(booking));
        if (needsExtraOnlinePayment) {
            props.navigation.navigate('PaymentDetails', { booking });
        }
    };

    const rejectErrandPriceChange = () => {
        if (!errand.activePriceChangeRequest) {
            return;
        }
        updateErrand({
            activePriceChangeRequest: null,
            phase: ERRAND_PHASES.SEARCHING,
            priceChangeHistory: appendErrandPriceHistory(errand.priceChangeHistory, errand.activePriceChangeRequest, 'REJECTED', role)
        });
    };

    const confirmErrandItemPurchased = () => {
        updateErrand({
            phase: ERRAND_PHASES.ITEM_CONFIRMED
        });
    };

    const startErrandDelivery = () => {
        let booking = { ...curBooking };
        booking.status = 'STARTED';
        booking.errand = {
            ...errand,
            phase: ERRAND_PHASES.DELIVERING
        };
        dispatch(updateBooking(booking));
    };

    const acceptBid = (item) => {
        let bookingObj = { ...curBooking };
        if ((bookingObj.payment_mode === 'wallet' && parseFloat(auth.profile.walletBalance) >= item.trip_cost) || bookingObj.payment_mode === 'cash' || bookingObj.payment_mode === 'card') {
            bookingObj.selectedBid = item;
            for (let key in bookingObj.driverOffers) {
                if (key !== item.driver) {
                    delete bookingObj.driverOffers[key];
                }
            }
            for (let key in bookingObj.requestedDrivers) {
                if (key !== item.driver) {
                    delete bookingObj.requestedDrivers[key];
                }
            }
            dispatch(updateBooking(bookingObj));
        } else {
            Alert.alert(t('alert'), t('wallet_balance_low'));
        }
    }

    const startNavigation = () => {
        let url = 'https://www.google.com/maps/dir/?api=1&travelmode=driving';
        if (curBooking.status == 'ACCEPTED') {
            url = url + '&destination=' + curBooking.pickup.lat + "," + curBooking.pickup.lng;
            Linking.openURL(url);
        }
        else if (curBooking.status == 'STARTED') {
            if (curBooking.waypoints && curBooking.waypoints.length && curBooking.waypoints.length > 0) {
                let abc = url + '&destination=' + curBooking.drop.lat + "," + curBooking.drop.lng + '&waypoints=';
                if (curBooking.waypoints.length > 1) {
                    for (let i = 0; i < curBooking.waypoints.length; i++) {
                        let obj = curBooking.waypoints[i];
                        if (i < curBooking.waypoints.length - 1) {
                            abc = abc + obj.lat + ',' + obj.lng + '%7C'
                        } else {
                            abc = abc + obj.lat + ',' + obj.lng

                        }
                    }
                    Linking.openURL(abc);
                } else {
                    url = url + '&destination=' + curBooking.drop.lat + "," + curBooking.drop.lng + '&waypoints=' + curBooking.waypoints[0].lat + "," + curBooking.waypoints[0].lng;
                    Linking.openURL(url);
                }
            } else {
                url = url + '&destination=' + curBooking.drop.lat + "," + curBooking.drop.lng;
                Linking.openURL(url);
            }
        } else {
            Alert.alert(t('alert'), t('navigation_available'));
        }
    }

    const alertModal = () => {
        return (
            <Modal
                animationType="none"
                transparent={true}
                visible={alertModalVisible}
                onRequestClose={() => {
                    setAlertModalVisible(false);
                }}>
                <View style={styles.alertModalContainer}>
                    <View style={styles.alertModalInnerContainer}>

                        <View style={styles.alertContainer}>

                            <Text style={styles.rideCancelText}>{t('rider_cancel_text')}</Text>

                            <View style={styles.horizontalLLine} />

                            <View style={styles.msgContainer}>
                                <Text style={styles.cancelMsgText}>{t('cancel_messege1')}  {bookingId} {t('cancel_messege2')} </Text>
                            </View>
                            <View style={styles.okButtonContainer}>
                                <Button
                                    title={t('ok')}
                                    titleStyle={{ fontFamily: fonts.Bold }}
                                    onPress={() => {
                                        setAlertModalVisible(false);
                                        props.navigation.popToTop();
                                    }}
                                    buttonStyle={styles.okButtonStyle}
                                    containerStyle={styles.okButtonContainerStyle}
                                />
                            </View>

                        </View>

                    </View>
                </View>

            </Modal>
        )
    }

    const goBack = () => {
        props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'TabRoot' }] }));
    }

    const [cancellationReasonsObj, setCancellationReasonsObj] = useState(null);

    useEffect(() => {
        if (cancelReasons) {
            let modReasons = cancelReasons.map((reasons) => {
                return { label: t(getLangKey(reasons.label)), value: reasons.value }
            })
            setCancellationReasonsObj(modReasons)
        }
    }, [cancelReasons])

    const renderCancelContent = () => {
        return (
            <View style={styles.cancelContentContainer}>
                <ScrollView style={styles.radioScrollContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.radioContainer}>
                        {cancellationReasonsObj ?
                            <RadioForm
                                radio_props={cancellationReasonsObj}
                                initial={0}
                                animation={false}
                                buttonColor={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                                selectedButtonColor={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                                buttonSize={10}
                                buttonOuterSize={20}
                                style={styles.radioContainerStyle}
                                labelStyle={[styles.radioText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}
                                radioStyle={[styles.radioStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                                onPress={(value) => { setCancelReasonSelected(value) }}
                            />
                            : null}
                    </View>
                </ScrollView>
            </View>
        );
    };

    const handleCancelConfirm = () => {
        if (cancelReasonSelected >= 0) {
            dispatch(cancelBooking({ booking: curBooking, reason: cancelReasons[cancelReasonSelected].label, cancelledBy: role }));
            setModalVisible(false);
            props.navigation.replace('TabRoot', { screen: 'RideList', params: { fromBooking: true } });
        } else {
            Alert.alert(t('alert'), t('select_reason'));
        }
    };

    const confirmModalClose = () => {
        setConfirmModalVisible(false);
        let booking = { ...curBooking };
        booking.confirmModal = true;
        dispatch(updateBooking(booking));
    }

    const confirmModal = () => {
        return (
            <WaygoDialog
                visible={confirmModalVisible}
                onClose={confirmModalClose}
                title={t('booking_requested_success_title')}
                icon="checkmark-circle"
                iconColor={colors.GREEN}
                type="info"
                showButtons={false}
                customContent={(
                    <View>
                        <Text style={{ fontSize: 14, fontFamily: fonts.Regular, color: mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)', textAlign: 'center', marginTop: 6 }}>
                            {t('booking_requested_success_body')}
                        </Text>
                        <View style={{ marginTop: 18 }}>
                            <Button
                                title={t('done')}
                                titleStyle={{ fontFamily: fonts.Bold }}
                                onPress={confirmModalClose}
                                buttonStyle={{ height: 44, borderRadius: 10, backgroundColor: colors.GREEN }}
                            />
                        </View>
                    </View>
                )}
            />
        )
    }

    const searchModal = () => {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={searchModalVisible}
                onRequestClose={() => {
                    setSearchModalVisible(false)
                }}
            >
                <View style={{ flex: 1, backgroundColor: colors.BACKGROUND, justifyContent: 'center', alignItems: 'center' }}>
                    {settings && curBooking && curBooking.driverOffers && !curBooking.selectedBid ?
                        <View style={{ width: width - 40, backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE, borderRadius: 10, flex: 1, maxHeight: height - 200, marginTop: 15 }}>
                            <View style={{ color: colors.BLACK, position: 'absolute', top: 20, alignSelf: 'center' }}>
                                <Text style={{ color: mode === 'dark' ? colors.WHITE : colors.BLACK, fontSize: 20, fontFamily: fonts.Regular }}>{t('drivers')}</Text>
                            </View>
                            <View style={{ marginTop: 60, width: width - 60, height: height - 340, marginRight: 10, marginLeft: 10, alignSelf: 'center', maxWidth: 350, }}>
                                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                                    {Object.keys(curBooking.driverOffers).map(key => {
                                        const driver = curBooking.driverOffers[key];
                                        const rating = driver.driverRating ? Math.round(parseFloat(driver.driverRating) * 2) / 2 : 0;
                                        return (
                                            <View key={key} style={[styles.vew, mode === 'dark' ? styles.shadowBackDark : styles.shadowBack]}>
                                                <View style={{ height: '70%', width: '100%', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                                    <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center' }}>
                                                        <Image source={curBooking && curBooking.driverOffers[key].driver_image ? { uri: curBooking.driverOffers[key].driver_image } : require('../../assets/images/profilePic.png')} style={{ borderRadius: 33, width: 65, height: 65 }} />
                                                    </View>
                                                    <View style={{ width: '75%', alignItems: 'center' }}>
                                                        <Text style={{ color: mode === 'dark' ? colors.WHITE : colors.BLACK, fontSize: 16, fontFamily: fonts.Regular, marginTop: 4, textAlign: 'center', }}>{curBooking.driverOffers[key].driver_name}</Text>
                                                        <StarRating
                                                            maxStars={5}
                                                            starSize={20}
                                                            enableHalfStar={true}
                                                            color={colors.STAR}
                                                            emptyColor={colors.STAR}
                                                            rating={rating}
                                                            onChange={() => {

                                                            }}
                                                            style={[isRTL ? { transform: [{ scaleX: -1 }] } : null]}
                                                        />
                                                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 4 }}>
                                                            {settings.swipe_symbol === false ?
                                                                <Text style={{ color: mode === 'dark' ? colors.WHITE : colors.BLACK, fontSize: 22, fontFamily: fonts.Bold }}>{settings.symbol} {formatAmount(curBooking.driverOffers[key].trip_cost, settings.decimal, settings.country)}</Text>
                                                                :
                                                                <Text style={{ color: mode === 'dark' ? colors.WHITE : colors.BLACK, fontSize: 22, fontFamily: fonts.Bold }}>{formatAmount(curBooking.driverOffers[key].trip_cost, settings.decimal, settings.country)} {settings.symbol}</Text>
                                                            }
                                                            <Button
                                                                title={t('accept')}
                                                                titleStyle={[styles.buttonTitleText, { fontFamily: fonts.Bold }]}
                                                                onPress={() => acceptBid(curBooking.driverOffers[key])}
                                                                buttonStyle={styles.accpt}
                                                            />
                                                        </View>
                                                        <Text style={{ color: mode === 'dark' ? colors.WHITE : colors.BLACK, fontSize: 16, fontFamily: fonts.Bold, alignSelf: 'center' }}>{moment(curBooking.driverOffers[key].deliveryDate).format('lll')}</Text>
                                                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignSelf: 'center' }}>
                                                            <Text style={{ color: mode === 'dark' ? colors.WHITE : colors.BLACK, fontSize: 12, marginTop: 3, fontFamily: fonts.Regular }}>{t('driver_distance')} - </Text>
                                                            <Text style={{ color: mode === 'dark' ? colors.WHITE : colors.BLACK, fontSize: 16, fontFamily: fonts.Bold, }}>{curBooking && curBooking.driverEstimates && curBooking.driverEstimates[key].timein_text ? curBooking.driverEstimates[key].timein_text : t('within_min')}</Text>
                                                        </View>
                                                    </View>

                                                </View>

                                            </View>
                                        )
                                    }
                                    )}
                                </ScrollView>
                            </View>
                            <View style={{ position: 'absolute', bottom: 20, alignSelf: 'center' }}>
                                <Button
                                    title={t('close')}
                                    loading={false}
                                    loadingProps={{ size: "large", }}
                                    titleStyle={{ fontFamily: fonts.Bold }}
                                    onPress={() => { setSearchModalVisible(false); setConfirmModalVisible(false); }}
                                    buttonStyle={{ width: 120, borderRadius: 10, backgroundColor: colors.RED }}
                                    containerStyle={{ marginTop: 20 }}
                                />
                            </View>
                        </View>
                        :
                        <View style={{ width: width - 70, borderRadius: 10, flex: 1, maxHeight: 310, marginTop: 15, backgroundColor: mode === 'dark' ? colors.BLACK : colors.WHITE }}>
                            <Image source={require('../../assets/images/g4.gif')} resizeMode={'contain'} style={{ width: '100%', height: 220, alignSelf: 'center' }} />
                            <View style={{ color: colors.BLACK, alignSelf: 'center' }}>
                                <Text style={{ color: mode === 'dark' ? colors.WHITE : colors.BLACK, fontSize: 16, fontFamily: fonts.Regular }}>{t('driver_assign_messege')}</Text>
                            </View>
                            <View style={{ position: 'absolute', bottom: 10, alignSelf: 'center' }}>
                                <Button
                                    title={t('close')}
                                    loading={false}
                                    loadingProps={{ size: "large", }}
                                    titleStyle={{ fontFamily: fonts.Bold }}
                                    onPress={() => { setSearchModalVisible(false) }}
                                    buttonStyle={{ width: 120, backgroundColor: colors.RED }}
                                    containerStyle={{ marginTop: 20, }}
                                />
                            </View>
                        </View>
                    }
                </View>
            </Modal>
        );
    }

    const chat = () => {
        props.navigation.navigate("onlineChat", { bookingId: bookingId, status: curBooking.status })
    }
    const openWhatsApp = () => {
        const message = 'Hi';
        if (role === 'customer') {
            const whatsappLink = `whatsapp://send?phone=${curBooking.driver_contact}&text=${encodeURIComponent(message)}`;
            Linking.openURL(whatsappLink)
        } else if (role === 'driver') {
            const whatsappLink = `whatsapp://send?phone=${curBooking.customer_contact}&text=${encodeURIComponent(message)}`;
            Linking.openURL(whatsappLink)
        }
    };


    const onPressCall = (phoneNumber) => {
        let call_link = Platform.OS == 'android' ? 'tel:' + phoneNumber : 'telprompt:' + phoneNumber;
        Linking.openURL(call_link);
    }

    const _pickImage = async (res) => {
        var pickFrom = res;

        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status == 'granted') {
            let result = await pickFrom({
                allowsEditing: true,
                aspect: [3, 3]
            });

            if (!result.canceled) {
                const blob = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        resolve(xhr.response);
                    };
                    xhr.onerror = function () {
                        Alert.alert(t('alert'), t('image_upload_error'));
                        setLoader(false);
                    };
                    xhr.responseType = 'blob';
                    xhr.open('GET', result.assets[0].uri, true);
                    xhr.send(null);
                });
                if (blob) {
                    setLoading(true);
                    dispatch(updateBookingImage(curBooking,
                        curBooking.status == 'ACCEPTED' || curBooking.status == 'ARRIVED' ? 'pickup_image' : 'deliver_image',
                        blob));
                }
            }
        }
    };

    const PurchaseInfoModal = () => {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={purchaseInfoModalStatus}
                onRequestClose={() => {
                    setPurchaseInfoModalStatus(false);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={[styles.modalView, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}>
                        <View style={{ width: '100%' }}>
                            {(isErrand || curBooking?.parcelTypeSelected?.description || curBooking?.optionSelected?.description || curBooking?.otherPerson || curBooking?.otherPersonPhone || curBooking?.pickUpInstructions || curBooking?.deliveryInstructions) ? <>
                                {isErrand ? (
                                    <>
                                        <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                            <Text style={[styles.textHeading, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>Servicio</Text>
                                            <Text style={[styles.textContent, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>Mandado</Text>
                                        </View>
                                        <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                            <Text style={[styles.textHeading, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>Pedido</Text>
                                            <Text style={[styles.textContent, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{errand.requestText}</Text>
                                        </View>
                                        <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                            <Text style={[styles.textHeading, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>Fase</Text>
                                            <Text style={[styles.textContent, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{errand.phase}</Text>
                                        </View>
                                        {!errand.itemAlreadyPaid ? (
                                            <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                                <Text style={[styles.textHeading, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>Valor del producto</Text>
                                                <Text style={[styles.textContent, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                                    {settings.swipe_symbol === false ? `${settings.symbol} ${formatAmount(errand.approvedItemValue ?? errand.declaredItemValue, settings.decimal, settings.country)}` : `${formatAmount(errand.approvedItemValue ?? errand.declaredItemValue, settings.decimal, settings.country)} ${settings.symbol}`}
                                                </Text>
                                            </View>
                                        ) : null}
                                        {errand.searchCostApplied ? (
                                            <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                                <Text style={[styles.textHeading, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>Costo por busqueda</Text>
                                                <Text style={[styles.textContent, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                                    {settings.swipe_symbol === false ? `${settings.symbol} ${formatAmount(errand.searchCostAmount, settings.decimal, settings.country)}` : `${formatAmount(errand.searchCostAmount, settings.decimal, settings.country)} ${settings.symbol}`}
                                                </Text>
                                            </View>
                                        ) : null}
                                    </>
                                ) : null}
                                {curBooking?.parcelTypeSelected?.description ?
                                    <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                        <Text style={[styles.textHeading, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t('parcel_type')}</Text>
                                        <Text style={[styles.textContent, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                            {curBooking && curBooking.parcelTypeSelected ? t(getLangKey(curBooking.parcelTypeSelected.description)) : ''}
                                        </Text>
                                    </View> : null}
                                {curBooking?.optionSelected?.description ?
                                    <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                        <Text style={[styles.textHeading, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t('options')}</Text>
                                        <Text style={[styles.textContent, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                            {curBooking && curBooking.optionSelected ? t(getLangKey(curBooking.optionSelected.description)) : ''}
                                        </Text>
                                    </View> : null}
                                {curBooking && curBooking.otherPerson ?
                                    <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                        <Text style={[styles.textHeading, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t('otherPerson')}</Text>
                                        <Text style={[styles.textContent, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                            {curBooking ? curBooking.otherPerson : ''}
                                        </Text>
                                    </View>
                                    : null}
                                {curBooking && curBooking.otherPersonPhone ?
                                    <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                        <Text style={[styles.textHeading, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t('otherPersonPhone')}</Text>
                                        <Text style={[styles.textContent, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                            {curBooking ? curBooking.otherPersonPhone : ''}
                                        </Text>
                                    </View>
                                    : null}
                                {curBooking && curBooking.pickUpInstructions ?
                                    <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                        <Text style={[styles.textHeading, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t('pickUpInstructions')}</Text>
                                        <Text style={[styles.textContent, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                            {curBooking ? curBooking.pickUpInstructions : ''}
                                        </Text>
                                    </View>
                                    : null}
                                {curBooking && curBooking.deliveryInstructions ?
                                    <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                        <Text style={[styles.textHeading, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t('deliveryInstructions')}</Text>
                                        <Text style={[styles.textContent, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                            {curBooking ? curBooking.deliveryInstructions : ''}
                                        </Text>
                                    </View>
                                    : null}
                            </> : <Text style={[styles.textHeading, { textAlign: "center", marginVertical: 10, color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t('no_info_found')}</Text>}
                        </View>
                        <View style={{ flexDirection: 'row', alignSelf: 'center', height: 40 }}>
                            <OldTouch
                                loading={false}
                                onPress={() => setPurchaseInfoModalStatus(false)}
                                style={[styles.modalButtonStyle, { backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}
                            >
                                <Text style={styles.modalButtonTextStyle}>{t('ok')}</Text>
                            </OldTouch>
                        </View>
                    </View>
                </View>
            </Modal>

        )
    }

    const onShare = async (curBooking) => {
        try {
            const result = await Share.share({
                message: curBooking.otp + t('otp_sms')
            });
        } catch (error) {
            alert(error.message);
        }
    };

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            pageActive.current = true;
        });
        return unsubscribe;
    }, [props.navigation, pageActive.current]);

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('blur', () => {
            pageActive.current = false;
            if (role == 'customer') {
                dispatch(stopLocationFetch(bookingId));
            }
        });
        return unsubscribe;
    }, [props.navigation, pageActive.current]);

    useEffect(() => {
        pageActive.current = true;
        return () => {
            pageActive.current = false;
        };
    }, []);

    const submitComplain = (curBooking) => {
        Alert.alert(
            t('panic_text'),
            t('panic_question'),
            [
                {
                    text: t('cancel'),
                    onPress: () => { },
                    style: 'cancel'
                },
                {
                    text: t('ok'), onPress: async () => {
                        let call_link = Platform.OS == 'android' ? 'tel:' + settings.panic : 'telprompt:' + settings.panic;
                        Linking.openURL(call_link);

                        let obj = {};
                        obj.bookingId = curBooking.id,
                            obj.complainDate = new Date().getTime();

                        if (auth.profile && auth.profile && auth.profile.usertype && auth.profile.usertype == 'driver') {
                            obj.user_name = curBooking.driver_name;
                            obj.contact = curBooking.driver_contact;
                        }
                        if (auth.profile && auth.profile && auth.profile.usertype && auth.profile.usertype == 'customer') {
                            obj.user_name = curBooking.customer_name;
                            obj.contact = curBooking.customer_contact;
                        }
                        obj.user_type = auth.profile && auth.profile && auth.profile.usertype ? auth.profile.usertype : null;
                        dispatch(editSos(obj, "Add"));
                    }
                }
            ],
            { cancelable: false }
        )
    }

    const AcceptedBookingView = () => {
        return (
            <View style={[styles.mainContainer, { flexDirection: 'column', backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}>

                <View style={{
                    backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND,
                    paddingTop: Platform.OS === 'ios' ? 45 : 25,
                    paddingHorizontal: 20,
                    paddingBottom: 8,
                    elevation: 0,
                    shadowOpacity: 0,
                }}>
                    <TouchableOpacity
                        onPress={() => { goBack() }}
                        style={{
                            width: 40,
                            height: 40,
                            justifyContent: 'center',
                            alignItems: isRTL ? 'flex-end' : 'flex-start'
                        }}
                    >
                        <Icon
                            name={isRTL ? 'arrow-right' : 'arrow-back'}
                            type='ionicon'
                            color={mode === 'dark' ? colors.WHITE : colors.BLACK}
                            size={24}
                        />
                    </TouchableOpacity>
                </View>


                <View style={[styles.acceptedStatusContainer, { marginBottom: 15 }]}>
                    <Text style={[styles.acceptedStatusText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK, fontSize: 16 }]}>
                        {t('booking_status')}: <Text style={[styles.cabBoldText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK, fontSize: 16 }]}>{t('ACCEPTED')}</Text>
                    </Text>
                </View>


                <View style={[styles.acceptedMapContainer, { marginHorizontal: 15, flex: 1, marginBottom: 15, backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}>
                    {curBooking ?
                        <MapView
                            ref={mapRef}
                            style={styles.acceptedMap}
                            provider={PROVIDER_GOOGLE}
                            initialRegion={{
                                latitude: curBooking.pickup.lat,
                                longitude: curBooking.pickup.lng,
                                latitudeDelta: latitudeDelta,
                                longitudeDelta: longitudeDelta
                            }}
                            minZoomLevel={3}
                            customMapStyle={mode === 'dark' ? customMapStyle : []}
                        >
                            {lastLocation ?
                                <Marker.Animated
                                    coordinate={new AnimatedRegion({
                                        latitude: lastLocation.lat,
                                        longitude: lastLocation.lng,
                                        latitudeDelta: latitudeDelta,
                                        longitudeDelta: longitudeDelta
                                    })}
                                >
                                    <Image
                                        source={role === 'driver' ? carImageIcon : (curBooking && curBooking.carImage ? { uri: curBooking.carImage } : require('../../assets/images/microBlackCar.png'))}
                                        style={{ width: 40, height: 40, alignSelf: 'center', resizeMode: 'contain', transform: [isRTL ? { scaleX: -1 } : { scaleX: 1 }] }}
                                    />
                                </Marker.Animated>
                                : null}

                            <Marker
                                coordinate={{ latitude: (curBooking.pickup.lat), longitude: (curBooking.pickup.lng) }}
                                title={curBooking.pickup.add}>
                                <Image source={require("../../assets/images/green_pin.png")} style={{ height: 35, width: 35 }} />
                            </Marker>

                            {curBooking != null && curBooking.waypoints && curBooking.waypoints.length > 0 ? curBooking.waypoints.map((point, index) => {
                                return (
                                    <Marker
                                        coordinate={{ latitude: point.lat, longitude: point.lng }}
                                        pinColor={colors.GREEN}
                                        title={point.add}
                                        key={point.add}
                                    >
                                        <Image source={require("../../assets/images/rsz_2red_pin.png")} style={{ height: 35, width: 35 }} />
                                    </Marker>
                                )
                            }) : null}

                            <Marker
                                coordinate={{ latitude: (curBooking.drop.lat), longitude: (curBooking.drop.lng) }}
                                title={curBooking.drop.add}>
                                <Image source={require("../../assets/images/rsz_2red_pin.png")} style={{ height: 35, width: 35 }} />
                            </Marker>

                            {liveRouteCoords ?
                                <Polyline
                                    coordinates={liveRouteCoords}
                                    strokeWidth={5}
                                    strokeColor={colors.BLUE}
                                />
                                : null}
                        </MapView>
                        : null}
                </View>


                <View style={{ padding: 20, marginTop: 'auto' }}>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 15,
                    }}>
                        <Image
                            source={curBooking.driver_image ? { uri: curBooking.driver_image } : require('../../assets/images/profilePic.png')}
                            style={{
                                width: 60,
                                height: 60,
                                borderRadius: 30,
                                marginRight: 15,
                            }}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: 18,
                                fontWeight: '600',
                                marginBottom: 4,
                                color: mode === 'dark' ? colors.WHITE : colors.BLACK
                            }}>
                                {curBooking.driver_name}
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                color: mode === 'dark' ? colors.WHITE : colors.BLACK + '80'
                            }}>
                                {t('assigned_driver')}
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
                                {curBooking.reference ? (
                                    <Text style={{ fontSize: 12, color: mode === 'dark' ? colors.WHITE : colors.BLACK + '99', marginRight: 12, marginBottom: 2 }}>
                                        {t('booking_ref')}: <Text style={{ fontFamily: fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>{curBooking.reference}</Text>
                                    </Text>
                                ) : null}
                                {curBooking.vehicleMake ? (
                                    <Text style={{ fontSize: 12, color: mode === 'dark' ? colors.WHITE : colors.BLACK + '99', marginRight: 12, marginBottom: 2 }}>
                                        {t('vehicle_make')}: <Text style={{ fontFamily: fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>{curBooking.vehicleMake}</Text>
                                    </Text>
                                ) : null}
                                {(curBooking.vehicleColor || curBooking.car_color) ? (
                                    <Text style={{ fontSize: 12, color: mode === 'dark' ? colors.WHITE : colors.BLACK + '99', marginRight: 12, marginBottom: 2 }}>
                                        {t('color')}: <Text style={{ fontFamily: fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>
                                            {(() => {
                                                const colorKey = curBooking.vehicleColor || curBooking.car_color;
                                                const colorObj = colorKey ? getVehicleColorByKey(colorKey) : null;
                                                return colorObj ? t(colorObj.labelKey) : colorKey;
                                            })()}
                                        </Text>
                                    </Text>
                                ) : null}
                                {curBooking.vehicle_number ? (
                                    <Text style={{ fontSize: 12, color: mode === 'dark' ? colors.WHITE : colors.BLACK + '99', marginRight: 12, marginBottom: 2 }}>
                                        {t('plate')}: <Text style={{ fontFamily: fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>{curBooking.vehicle_number}</Text>
                                    </Text>
                                ) : null}
                            </View>
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <StarRating
                                maxStars={1}
                                starSize={20}
                                enableHalfStar={true}
                                color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                                emptyColor={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                                rating={Math.round(parseFloat(curBooking.driverRating) * 2) / 2}
                                style={[styles.ratingContainerStyle, isRTL ? { marginRight: 0, transform: [{ scaleX: -1 }] } : { scaleX: 1 }]}
                                onChange={() => { }}
                            />
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '600',
                                marginLeft: 8,
                                color: mode === 'dark' ? colors.WHITE : colors.BLACK
                            }}>
                                {curBooking.driverRating}
                            </Text>
                        </View>
                    </View>


                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 15,
                    }}>
                        <View style={{
                            alignItems: 'center',
                            flex: 1,
                        }}>
                            <Text style={{
                                fontSize: 14,
                                marginBottom: 4,
                                color: mode === 'dark' ? colors.WHITE : colors.BLACK + '80'
                            }}>
                                {t('distance')}
                            </Text>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: mode === 'dark' ? colors.WHITE : colors.BLACK
                            }}>
                                {parseFloat(curBooking.estimateDistance).toFixed(settings.decimal)} {settings.convert_to_mile ? t('mile') : t('km')}
                            </Text>
                        </View>
                        <View style={{
                            alignItems: 'center',
                            flex: 1,
                        }}>
                            <Text style={{
                                fontSize: 14,
                                marginBottom: 4,
                                color: mode === 'dark' ? colors.WHITE : colors.BLACK + '80'
                            }}>
                                {t('time')}
                            </Text>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: mode === 'dark' ? colors.WHITE : colors.BLACK
                            }}>
                                {arrivalTime} {t('mins')}
                            </Text>
                        </View>
                        <View style={{
                            alignItems: 'center',
                            flex: 1,
                        }}>
                            <Text style={{
                                fontSize: 14,
                                marginBottom: 4,
                                color: mode === 'dark' ? colors.WHITE : colors.BLACK + '80'
                            }}>
                                {t('cost')}
                            </Text>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: mode === 'dark' ? colors.WHITE : colors.BLACK
                            }}>
                                {settings && settings.swipe_symbol === false ?
                                    `${settings.symbol} ${curBooking && curBooking.trip_cost > 0 ? formatAmount(curBooking.trip_cost, settings.decimal, settings.country) : curBooking && curBooking.estimate ? formatAmount(curBooking.trip_cost, settings.decimal, settings.country) : 0}` :
                                    `${curBooking && curBooking.trip_cost > 0 ? formatAmount(curBooking.trip_cost, settings.decimal, settings.country) : curBooking && curBooking.estimate ? formatAmount(curBooking.trip_cost, settings.decimal, settings.country) : 0} ${settings.symbol}`
                                }
                            </Text>
                        </View>
                    </View>


                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 10,
                        marginTop: 10,
                    }}>
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                marginRight: 10,
                                height: 50,
                                borderRadius: 12,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: mode === 'dark' ? '#3A3A3A' : '#F5F5F5',
                                borderWidth: 1,
                                borderColor: mode === 'dark' ? '#2C2C2E' : '#E2E9EC',
                            }}
                            onPress={() => {
                                props.navigation.navigate("onlineChat", { bookingId: bookingId, status: curBooking.status });
                            }}
                        >
                            <Text style={{
                                fontSize: 14,
                                fontWeight: '500',
                                color: mode === 'dark' ? colors.WHITE : colors.BLACK
                            }}>
                                {t('contact_form_message_placeholder')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                {
                                    width: 50,
                                    height: 50,
                                    borderRadius: 12,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: colors.BLUE,
                                    shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 2,
                                    },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 3,
                                    elevation: 3,
                                    marginRight: 10,
                                }
                            ]}
                            onPress={() => {
                                role == 'customer' ?
                                    onPressCall(curBooking.driver_contact) :
                                    (curBooking.otherPersonPhone && curBooking.otherPersonPhone.length > 0 ?
                                        onPressCall(curBooking.otherPersonPhone) :
                                        onPressCall(curBooking.customer_contact)
                                    );
                            }}
                        >
                            <Icon
                                name="call"
                                type="ionicon"
                                size={24}
                                color={colors.WHITE}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: 10,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: colors.RED,
                                shadowColor: "#000",
                                shadowOffset: {
                                    width: 0,
                                    height: 2,
                                },
                                shadowOpacity: 0.1,
                                shadowRadius: 3,
                                elevation: 3,
                            }}
                            onPress={() => {
                                setCancelDialogVisible(true);
                            }}
                        >
                            <Icon
                                name="close"
                                type="ionicon"
                                size={24}
                                color={colors.WHITE}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.mainContainer}>

            {curBooking && curBooking.status === 'ACCEPTED' && role === 'customer' ? (
                <AcceptedBookingView />
            ) : (
                <>
                    <View style={styles.mapcontainer}>
                        {curBooking ?
                            <MapView
                                ref={mapRef}
                                style={styles.map}
                                provider={PROVIDER_GOOGLE}
                                initialRegion={{
                                    latitude: curBooking.pickup.lat,
                                    longitude: curBooking.pickup.lng,
                                    latitudeDelta: latitudeDelta,
                                    longitudeDelta: longitudeDelta
                                }}
                                minZoomLevel={3}
                                customMapStyle={mode === 'dark' ? customMapStyle : []}
                            >

                                {(curBooking.status == 'ACCEPTED' || curBooking.status == 'ARRIVED' || curBooking.status == 'STARTED') && lastLocation ?
                                    <Marker.Animated
                                        coordinate={new AnimatedRegion({
                                            latitude: lastLocation.lat,
                                            longitude: lastLocation.lng,
                                            latitudeDelta: latitudeDelta,
                                            longitudeDelta: longitudeDelta
                                        })}
                                    >
                                        <Image
                                            source={role === 'driver' ? carImageIcon : (curBooking && curBooking.carImage ? { uri: curBooking.carImage } : require('../../assets/images/microBlackCar.png'))}
                                            style={{ width: 40, height: 40, alignSelf: 'center', resizeMode: 'contain', transform: [isRTL ? { scaleX: -1 } : { scaleX: 1 }] }}
                                        />
                                    </Marker.Animated>
                                    : null}

                                <Marker
                                    coordinate={{ latitude: (curBooking.pickup.lat), longitude: (curBooking.pickup.lng) }}
                                    title={curBooking.pickup.add}>
                                    <Image source={require("../../assets/images/green_pin.png")} style={{ height: 35, width: 35 }} />
                                </Marker>
                                {curBooking != null && curBooking.waypoints && curBooking.waypoints.length > 0 ? curBooking.waypoints.map((point, index) => {
                                    return (
                                        <Marker
                                            coordinate={{ latitude: point.lat, longitude: point.lng }}
                                            pinColor={colors.GREEN}
                                            title={point.add}
                                            key={point.add}
                                        >
                                            <Image source={require("../../assets/images/rsz_2red_pin.png")} style={{ height: 35, width: 35 }} />
                                        </Marker>
                                    )
                                })
                                    : null}
                                <Marker
                                    coordinate={{ latitude: (curBooking.drop.lat), longitude: (curBooking.drop.lng) }}
                                    title={curBooking.drop.add}>
                                    <Image source={require("../../assets/images/rsz_2red_pin.png")} style={{ height: 35, width: 35 }} />
                                </Marker>

                                {liveRouteCoords && (curBooking.status == 'ACCEPTED' || curBooking.status == 'STARTED') ?
                                    <Polyline
                                        coordinates={liveRouteCoords}
                                        strokeWidth={5}
                                        strokeColor={colors.BLUE}
                                    />
                                    : null}

                                {(curBooking.status == 'NEW' || curBooking.status == 'ARRIVED' || curBooking.status == 'REACHED') && curBooking.coords ?
                                    <Polyline
                                        coordinates={curBooking.coords}
                                        strokeWidth={4}
                                        strokeColor={colors.BLUE}
                                    />
                                    : null}
                            </MapView>
                            : null}
                        <View style={[styles.menuIcon, { backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 }, isRTL ? { right: 15 } : { left: 15 }]}>
                            <TouchableOpacity onPress={() => { goBack() }} style={styles.menuIconButton} >
                                <Icon
                                    name={isRTL ? 'arrow-right' : 'arrow-back'}
                                    type='ionicon'
                                    color={mode === 'dark' ? colors.WHITE : colors.BLACK}
                                    size={24}
                                />
                            </TouchableOpacity>
                        </View>




                    </View>
                </>
            )}

            {!(curBooking && curBooking.status === 'ACCEPTED' && role === 'customer') && (
                <View
                    style={[styles.unifiedModal, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}
                    onTouchStart={e => setTouchY(e.nativeEvent.pageY)}
                    onTouchEnd={e => {
                        if ((touchY - e.nativeEvent.pageY > 50) && !showBottomExpanded) setShowBottomExpanded(true);
                        if ((e.nativeEvent.pageY - touchY > 50) && showBottomExpanded) setShowBottomExpanded(false);
                    }}
                >
                    <View style={[styles.bar, { backgroundColor: '#E2E6EA', marginVertical: 8, alignSelf: 'center' }]} />
                    <View style={{ paddingBottom: 15 }}>

                        <View style={{ alignItems: 'flex-start', marginTop: 2, marginBottom: 8 }}>
                            <Text style={{ fontSize: 16, fontFamily: fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>
                                {curBooking && curBooking.status ? (t(curBooking.status).charAt(0).toUpperCase() + t(curBooking.status).slice(1).toLowerCase()) : ''}
                            </Text>
                        </View>
                        {curBooking && curBooking.status != "NEW" ?
                            <View style={{ minHeight: (role == 'customer' && ((curBooking && curBooking.status == 'ARRIVED') || curBooking.status == 'PAID' || curBooking.status == 'REACHED' || (curBooking && curBooking.status == 'STARTED'))) ? '10%' : '8%', justifyContent: 'center' }}>
                                {role == 'customer' ?
                                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', padding: 3, alignSelf: 'flex-start', width: '100%', borderTopRightRadius: 10, borderTopLeftRadius: 10 }}>
                                        <Image source={curBooking.driver_image ? { uri: curBooking.driver_image } : require('../../assets/images/profilePic.png')} style={{ height: 46, width: 46, borderRadius: 23, marginLeft: isRTL ? 0 : 1 }} />
                                        <View style={{ width: '85%', flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between' }}>
                                            <View style={{ width: '60%', justifyContent: 'center' }}>
                                                <Text style={[styles.driverNameText, { fontSize: 14, textAlign: isRTL ? 'right' : 'left', color: mode === 'dark' ? colors.WHITE : colors.BLACK }]} numberOfLines={1}>{curBooking.driver_name}</Text>
                                                <Text style={{ fontSize: 12, fontFamily: fonts.Regular, color: colors.SHADOW, textAlign: isRTL ? 'right' : 'left', marginTop: 2, marginLeft: isRTL ? 0 : 4, marginRight: isRTL ? 4 : 0 }} numberOfLines={1}>
                                                    {t('assigned_driver')}
                                                </Text>

                                            </View>
                                            <View style={{ marginTop: 2, alignItems: 'center', marginLeft: isRTL ? 10 : 0, marginRight: isRTL ? 0 : 10, width: '40%' }}>
                                                <View style={{ alignSelf: 'flex-end' }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: mode === 'dark' ? '#2C2C2E' : '#F1F5F9', borderRadius: 12, paddingHorizontal: 8, height: 24 }}>
                                                        <Icon name="star" type="ionicon" size={14} color={colors.STAR} />
                                                        <Text style={{ marginLeft: 4, fontSize: 12, fontFamily: fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>
                                                            {curBooking.driverRating}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Text style={{ marginTop: 6, alignSelf: 'flex-end', fontSize: 12, fontFamily: fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK }} numberOfLines={1}>
                                                    {curBooking.vehicle_number}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    :
                                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', padding: 3, alignSelf: 'flex-start', width: '100%', borderTopRightRadius: 10, borderTopLeftRadius: 10 }}>
                                        <Image source={curBooking.customer_image ? { uri: curBooking.customer_image } : require('../../assets/images/profilePic.png')} style={{ height: 46, width: 46, borderRadius: 23, marginLeft: isRTL ? 0 : 5 }} />
                                        <View style={{ flex: 1, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between' }}>
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <Text style={[styles.driverNameText, { fontSize: 14, textAlign: isRTL ? 'right' : 'left', color: mode === 'dark' ? colors.WHITE : colors.BLACK }]} >{curBooking.customer_name}</Text>
                                            </View>
                                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginLeft: isRTL ? 5 : 0, marginRight: isRTL ? 0 : 5 }}>

                                                {role == 'driver' && appConsts.showBookingOptions ?
                                                    <TouchableOpacity
                                                        style={[styles.floatButton1, { borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, marginHorizontal: 3 }]}
                                                        onPress={() => setPurchaseInfoModalStatus(true)}
                                                    >
                                                        <Icon
                                                            name="cube"
                                                            type="ionicon"
                                                            size={30}
                                                            color={colors.WHITE}
                                                        />
                                                    </TouchableOpacity>
                                                    : null}
                                                {role == 'driver' ?
                                                    <TouchableOpacity
                                                        style={[styles.floatButton1, { borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}
                                                        onPress={() =>
                                                            startNavigation()
                                                        }
                                                    >
                                                        <Icon
                                                            name="google-maps"
                                                            type="material-community"
                                                            size={28}
                                                            color={colors.WHITE}
                                                        />
                                                    </TouchableOpacity>
                                                    : null}
                                            </View>
                                        </View>

                                    </View>
                                }
                            </View>
                            : null}

                        {showBottomExpanded ? (
                            <View style={[styles.addressRow, { flexDirection: isRTL ? 'row-reverse' : 'row', marginBottom: 15, marginTop: 10 }]}>
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
                                    <View style={styles.addressField}>
                                        <Text numberOfLines={1} style={[styles.addressText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                            {curBooking ? curBooking.pickup.add : ''}
                                        </Text>
                                    </View>
                                    <View style={[styles.separator, { backgroundColor: mode === 'dark' ? colors.WHITE + '20' : colors.SHADOW + '20' }]} />
                                    <View style={styles.addressField}>
                                        <Text numberOfLines={1} style={[styles.addressText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                            {curBooking ? curBooking.drop.add : ''}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ) : null}
                        {(curBooking && curBooking.status == 'ARRIVED' || curBooking && curBooking.status == 'ACCEPTED' || curBooking && curBooking.status == 'REACHED' || curBooking && curBooking.status == 'PAID' || curBooking && curBooking.status == 'STARTED') ?
                            <View style={{ justifyContent: 'space-around', alignItems: 'center', flexDirection: isRTL ? 'row-reverse' : 'row', height: 55 }}>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ fontFamily: fonts.Regular, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>{t('distance')}</Text>
                                    <Text style={{ fontFamily: fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>{curBooking ? parseFloat(curBooking.estimateDistance).toFixed(settings.decimal) : 0} {settings.convert_to_mile ? t('mile') : t('km')}</Text>
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ fontFamily: fonts.Regular, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>{t('time')}</Text>
                                    <Text style={{ fontFamily: fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>{curBooking.estimateTime ? parseFloat(curBooking.estimateTime / 60).toFixed(0) : 0} {t('mins')}</Text>
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ fontFamily: fonts.Regular, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>{t('cost')}</Text>

                                    {settings && settings.swipe_symbol === false ?
                                        <Text style={{ fontFamily: fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>{settings.symbol} {curBooking && curBooking.trip_cost > 0 ? formatAmount(curBooking.trip_cost, settings.decimal, settings.country) : curBooking && curBooking.estimate ? formatAmount(curBooking.trip_cost, settings.decimal, settings.country) : 0}</Text>
                                        :
                                        <Text style={{ fontFamily: fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>{curBooking && curBooking.trip_cost > 0 ? formatAmount(curBooking.trip_cost, settings.decimal, settings.country) : curBooking && curBooking.estimate ? formatAmount(curBooking.trip_cost, settings.decimal, settings.country) : 0} {settings.symbol}</Text>
                                    }
                                </View>
                            </View>
                            : null}
                        {curBooking && curBooking.status == "NEW" && (curBooking.bookLater == false || (curBooking.bookLater && (((new Date(curBooking.tripdate)) - (new Date())) / (1000 * 60)) <= 15)) ?
                            <View style={{ width: width, height: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <Image style={{ width: 40, height: 40, color: mode === 'dark' ? colors.WHITE : colors.BLACK }} source={require('../../assets/images/loader.gif')} />
                                <TouchableOpacity onPress={() => { setSearchModalVisible(!searchModalVisible) }}>
                                    <Text style={{ fontSize: 22, fontFamily: fonts.Regular, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>{curBooking.driverOffers ? t('selectBid') : t('searching')}</Text>
                                </TouchableOpacity>
                            </View>
                            : null}
                        {curBooking && curBooking.status == "NEW" && curBooking.bookLater && (((new Date(curBooking.tripdate)) - (new Date())) / (1000 * 60)) > 15 ?
                            <View style={{ flex: 1, width: width, height: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 16, fontFamily: fonts.Regular, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>{t('trip_start_time') + ":  "}</Text>
                                <Text style={{ fontFamily: fonts.Bold, fontSize: 16, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>{moment(curBooking.tripdate).format('lll')}</Text>
                            </View>
                            : null}

                        {curBooking && !(curBooking.status == 'NEW') ? (
                            <View style={[styles.acceptedActionButtons, { marginTop: 10, marginBottom: 10 }]}>
                                {(curBooking && curBooking.status && auth.profile && auth.profile.uid && ((['ACCEPTED', 'ARRIVED', 'STARTED', 'REACHED'].indexOf(curBooking.status) != -1))) && (settings && settings.panic && settings.panic.length > 0) && (role === 'driver' || appConsts.canCall) ? (
                                    <TouchableOpacity
                                        style={[styles.acceptedActionButton, { backgroundColor: colors.RED }]}
                                        onPress={() => submitComplain(curBooking)}
                                    >
                                        <Icon name="alarm-light" type="material-community" size={24} color={colors.WHITE} />
                                    </TouchableOpacity>
                                ) : null}

                                <TouchableOpacity
                                    style={[styles.acceptedActionButton, { backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}
                                    onPress={settings && settings.chatViaWhatsApp === true ? () => openWhatsApp() : () => chat()}
                                >
                                    <Icon name="chatbubbles" type="ionicon" size={26} color={colors.WHITE} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.acceptedActionButton, { backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}
                                    onPress={() => role == 'customer' ? onPressCall(curBooking.driver_contact) : (curBooking.otherPersonPhone && curBooking.otherPersonPhone.length > 0 ? onPressCall(curBooking.otherPersonPhone) : onPressCall(curBooking.customer_contact))}
                                >
                                    <Icon name="call" type="ionicon" size={26} color={colors.WHITE} />
                                </TouchableOpacity>
                            </View>
                        ) : null}
                        {
                            renderButtons()
                        }
                    </View>
                </View>
            )}
            {
                PurchaseInfoModal()
            }
            <WaygoDialog
                visible={errandPriceModalVisible}
                onClose={() => setErrandPriceModalVisible(false)}
                title={'Solicitud de cambio de precio'}
                showButtons={false}
                showIcon={false}
                customContent={(
                    <View>
                        <Text style={{ fontFamily: fonts.Regular, color: mode === 'dark' ? colors.WHITE : colors.BLACK, marginBottom: 10 }}>
                            Usa esta opcion cuando el producto cueste distinto a lo declarado o cuando encuentres una alternativa.
                        </Text>
                        <TextInput
                            value={errandPriceValue}
                            onChangeText={setErrandPriceValue}
                            placeholder="Nuevo valor del producto"
                            keyboardType="numeric"
                            placeholderTextColor={colors.SHADOW}
                            style={{
                                height: 44,
                                borderWidth: 1,
                                borderColor: colors.SHADOW,
                                borderRadius: 10,
                                paddingHorizontal: 12,
                                color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                marginBottom: 10
                            }}
                        />
                        <TextInput
                            value={errandPriceNote}
                            onChangeText={setErrandPriceNote}
                            placeholder="Nota para el cliente"
                            placeholderTextColor={colors.SHADOW}
                            style={{
                                height: 44,
                                borderWidth: 1,
                                borderColor: colors.SHADOW,
                                borderRadius: 10,
                                paddingHorizontal: 12,
                                color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                marginBottom: 10
                            }}
                        />
                        <TextInput
                            value={errandAlternativeNote}
                            onChangeText={setErrandAlternativeNote}
                            placeholder="Alternativa sugerida"
                            placeholderTextColor={colors.SHADOW}
                            style={{
                                height: 44,
                                borderWidth: 1,
                                borderColor: colors.SHADOW,
                                borderRadius: 10,
                                paddingHorizontal: 12,
                                color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                marginBottom: 12
                            }}
                        />
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 10 }}>
                            <View style={{ flex: 1 }}>
                                <Button
                                    title={t('cancel')}
                                    titleStyle={{ fontFamily: fonts.Bold }}
                                    onPress={() => setErrandPriceModalVisible(false)}
                                    buttonStyle={{ height: 44, borderRadius: 10, backgroundColor: colors.RED }}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Button
                                    title={'Enviar'}
                                    titleStyle={{ fontFamily: fonts.Bold }}
                                    onPress={submitErrandPriceChange}
                                    buttonStyle={{ height: 44, borderRadius: 10, backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }}
                                />
                            </View>
                        </View>
                    </View>
                )}
            />
            <WaygoDialog
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={t('cancel_reason_modal_title')}
                type="warning"
                showButtons={true}
                onConfirm={handleCancelConfirm}
                confirmText={t('ok')}
                cancelText={t('close')}
                customContent={renderCancelContent()}
                showIcon={false}
            />
            {
                alertModal()
            }
            {
                searchModal()
            }
            {
                confirmModal()
            }

            <WaygoDialog
                visible={ratingVisible}
                onClose={() => setRatingVisible(false)}
                title={''}
                type="confirm"
                showButtons={false}
                showIcon={false}
                customContent={(
                    <View>
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 }}>
                            <View style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, backgroundColor: colors.PAGEBACK, alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={curBooking?.driver_image ? { uri: curBooking.driver_image } : require('../../assets/images/profilePic.png')} style={{ width: 58, height: 58, borderRadius: 29 }} />
                            </View>
                            <View style={{ marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }}>
                                <Text style={{ fontSize: 18, fontFamily: fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK }} numberOfLines={1}>
                                    {curBooking ? curBooking.driver_name : ''}
                                </Text>
                                <Text style={{ fontSize: 14, fontFamily: fonts.Medium, color: colors.SHADOW }} numberOfLines={1}>
                                    {t('assigned_driver')}
                                </Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'center', marginBottom: 10 }}>
                            <Text style={{ fontSize: 18, fontFamily: fonts.Bold, textAlign: 'center', color: mode === 'dark' ? colors.WHITE : colors.BLACK, marginBottom: 4 }}>{t('how_your_trip')}</Text>
                            <Text style={{ fontSize: 13, fontFamily: fonts.Regular, textAlign: 'center', color: colors.SHADOW, marginBottom: 10 }}>{t('your_feedback_test')}</Text>
                            <StarRating
                                maxStars={5}
                                starSize={32}
                                enableHalfStar={true}
                                color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                                emptyColor={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                                rating={driverRatingValue}
                                onChange={(rating) => setDriverRatingValue(rating)}
                                style={[isRTL ? { transform: [{ scaleX: -1 }] } : null]}
                            />
                        </View>
                        <View style={{ borderColor: '#DEE5EA', borderWidth: 2, borderRadius: 16, backgroundColor: mode === 'dark' ? '#1E1E1E' : colors.WHITE, padding: 8, marginBottom: 14 }}>
                            <TextInput
                                multiline={true}
                                style={{ minHeight: 110, padding: 8, fontFamily: fonts.Regular, color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? 'right' : 'left' }}
                                placeholder={t('your_feedback') + '...'}
                                placeholderTextColor={'#9AA3AB'}
                                onChangeText={(text) => setDriverFeedback(text)}
                                value={driverFeedback}
                                numberOfLines={6}
                                returnKeyType="done"
                                blurOnSubmit={true}
                                onSubmitEditing={() => {
                                    Keyboard.dismiss();
                                }}
                            />
                        </View>
                        <Text style={{ fontSize: 18, fontFamily: fonts.Bold, textAlign: 'center', color: mode === 'dark' ? colors.WHITE : colors.BLACK, marginBottom: 8 }}>{t('addtip')}</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            {tipOptions.map((percent, idx) => {
                                const fare = curBooking?.trip_cost ? parseFloat(curBooking.trip_cost) : 0;
                                const tipAmount = parseFloat((fare * (percent / 100)).toFixed(settings?.decimal || 2));
                                const isSelected = selectedTipPercent === percent;
                                return (
                                    <TouchableOpacity key={idx} onPress={() => setSelectedTipPercent(percent)} style={{ width: '48%', height: 42, borderRadius: 10, borderWidth: 1, borderColor: isSelected ? 'transparent' : '#CBD5DC', backgroundColor: isSelected ? '#F3BE12' : colors.WHITE, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                        <Text style={{ fontFamily: fonts.Bold, fontSize: 14, color: colors.BLACK }}>
                                            {`${percent}% `}
                                            {settings?.swipe_symbol === false
                                                ? `(${settings?.symbol}${formatAmount(tipAmount, settings?.decimal, settings?.country)})`
                                                : `(${formatAmount(tipAmount, settings?.decimal, settings?.country)} ${settings?.symbol})`}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                        <View style={{ marginTop: 12 }}>
                            <Button
                                title={t('submit_rating')}
                                titleStyle={{ fontFamily: fonts.Bold }}
                                onPress={() => {
                                    if (curBooking) {
                                        let updated = { ...curBooking };
                                        updated.rating = driverRatingValue;
                                        updated.feedback = driverFeedback;
                                        if (selectedTipPercent !== null && selectedTipPercent !== undefined) {
                                            const fare = updated?.trip_cost ? parseFloat(updated.trip_cost) : 0;
                                            updated.tipamount = parseFloat((fare * (selectedTipPercent / 100)).toFixed(settings?.decimal || 2));
                                        }
                                        updated.status = 'COMPLETE';
                                        dispatch(updateBooking(updated));
                                        setRatingVisible(false);
                                        props.navigation.navigate('TabRoot', { name: 'RideList', params: { fromBooking: true } });
                                    } else {
                                        setRatingVisible(false);
                                    }
                                }}
                                buttonStyle={{ height: 50, borderRadius: 12, backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }}
                            />
                        </View>
                    </View>
                )}
            />
            <OtpModal
                modalvisable={otpModalVisible}
                requestmodalclose={() => { setOtpModalVisible(false) }}
                otp={curBooking ? curBooking.otp : ''}
                onMatch={(value) => value ? appConsts.hasStartOtp ? startBooking() : endBooking() : null}
                mode={mode}
            />
            <WaygoDialog
                visible={cancelDialogVisible}
                onClose={() => setCancelDialogVisible(false)}
                title="Cancelar viaje"
                message="¿Estás seguro de que deseas cancelar este viaje?"
                type="warning"
                showButtons={true}
                onConfirm={() => {
                    setCancelDialogVisible(false);
                    setModalVisible(true);
                }}
                confirmText="Sí, cancelar"
                cancelText="No, mantener"
            />
        </View>
    );

}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: colors.WHITE },
    headerStyle: {
        backgroundColor: colors.HEADER,
        borderBottomWidth: 0,
    },
    headerInnerStyle: {
        marginLeft: 10,
        marginRight: 10
    },
    accpt: {
        width: 90,
        backgroundColor: colors.GREEN,
        height: 40,
        borderRadius: 10,
        marginLeft: 10
    },
    vew1: {
        width: '96%',
        marginTop: -8,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: Platform.OS == 'ios' ? 0.1 : 0.8,
        shadowRadius: 3,
        elevation: Platform.OS == 'ios' ? 2 : 9,
        position: 'absolute',
        bottom: 25,
        alignSelf: 'center',
        borderRadius: 10
    },
    vew: {
        height: 150,
        marginBottom: 20,
        borderColor: 'black',
        borderRadius: 10,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.SHADOW
    },
    shadowBack: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.WHITE,
    },
    shadowBackDark: {
        shadowColor: colors.SHADOW,
        backgroundColor: colors.PAGEBACK,
    },
    headerTitleStyle: {
        color: colors.WHITE,
        fontFamily: fonts.Bold,
        fontSize: 20
    },
    topContainer: { flex: 1.5, borderTopWidth: 0, alignItems: 'center', backgroundColor: colors.HEADER, paddingEnd: 20 },
    topLeftContainer: {
        flex: 1.5,
        alignItems: 'center'
    },
    topRightContainer: {
        flex: 9.5,
        justifyContent: 'space-between',
    },
    whereButton: { flex: 1, justifyContent: 'center', borderBottomColor: colors.WHITE, borderBottomWidth: 1 },
    whereContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', },
    whereText: { flex: 9, fontFamily: fonts.Regular, fontSize: 14, fontWeight: '400', color: colors.WHITE },
    iconContainer: { flex: 1, },
    dropButton: { flex: 1, justifyContent: 'center' },
    mapcontainer: {
        flex: 7,
        width: width,
    },
    bottomContainer: { alignItems: 'center' },
    map: {
        flex: 1,
        minHeight: 400,
        ...StyleSheet.absoluteFillObject,
    },
    locationStyle: {
        height: 35,
        width: 35,
        justifyContent: 'center',
        borderRadius: 25,
        alignItems: 'center',
        marginHorizontal: 5
    },
    otpContainer: { flex: 0.8, backgroundColor: colors.YELLOW, width: width, flexDirection: 'row', justifyContent: 'space-between' },
    cabText: { paddingLeft: 10, alignSelf: 'center', color: colors.BLACK, fontFamily: fonts.Regular },
    cabBoldText: { fontFamily: fonts.Bold },
    otpText: { color: colors.BLACK, fontFamily: fonts.Bold, },
    cabDetailsContainer: { flex: 2.5, backgroundColor: colors.WHITE, flexDirection: 'row', position: 'relative', zIndex: 1 },
    cabDetails: { flex: 19 },
    cabName: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    cabNameText: { color: colors.BLACK, fontFamily: fonts.Bold, fontSize: 14 },
    cabPhoto: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    cabImage: { width: 100, height: height / 20, marginBottom: 5, marginTop: 5 },
    cabNumber: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    verticalDesign: { flex: 2, height: 50, width: 1, alignItems: 'center' },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: colors.TRANSPARENT,
        borderStyle: 'solid',
        borderLeftWidth: 9,
        borderRightWidth: 9,
        borderBottomWidth: 10,
        borderLeftColor: colors.TRANSPARENT,
        borderRightColor: colors.TRANSPARENT,
        borderBottomColor: colors.YELLOW,
        transform: [
            { rotate: '180deg' }
        ],

        marginTop: -1,
        overflow: 'visible'
    },
    verticalLine: { height: height / 18, width: 0.5, backgroundColor: colors.PAGEBACK, alignItems: 'center', marginTop: 10 },
    driverDetails: { flex: 19, alignItems: 'center', justifyContent: 'center', },
    driverPhotoContainer: { alignItems: 'center', marginTop: 10 },
    driverPhoto: { borderRadius: height / 20 / 2, width: height / 20, height: height / 20, },
    driverNameContainer: { flex: 2.2, alignItems: 'center', justifyContent: 'center' },
    driverNameText: { color: colors.BLACK, fontFamily: fonts.Bold, fontSize: 16, marginHorizontal: 5 },
    ratingContainer: { flex: 2.4, alignItems: 'center', justifyContent: 'center' },
    alertModalContainer: { flex: 1, justifyContent: 'center', backgroundColor: colors.BACKGROUND },
    alertModalInnerContainer: { height: 200, width: (width * 0.85), backgroundColor: colors.WHITE, alignItems: 'center', alignSelf: 'center', borderRadius: 7 },
    alertContainer: { flex: 2, justifyContent: 'space-between', width: (width - 100) },
    rideCancelText: { flex: 1, top: 15, color: colors.BLACK, fontFamily: fonts.Bold, fontSize: 20, alignSelf: 'center' },
    horizontalLLine: { width: (width - 110), height: 0.5, backgroundColor: colors.PAGEBACK, alignSelf: 'center', },
    msgContainer: { flex: 2.5, alignItems: 'center', justifyContent: 'center' },
    cancelMsgText: { color: colors.BLACK, fontFamily: fonts.Regular, fontSize: 15, alignSelf: 'center', textAlign: 'center' },
    okButtonContainer: { flex: 1, width: (width * 0.85), flexDirection: 'row', backgroundColor: colors.SHADOW, alignSelf: 'center' },
    okButtonStyle: { flexDirection: 'row', backgroundColor: colors.SHADOW, alignItems: 'center', justifyContent: 'center' },
    okButtonContainerStyle: { flex: 1, width: (width * 0.85), backgroundColor: colors.SHADOW, },

    cancelContentContainer: {
        width: '100%',
        maxHeight: 300,
        paddingVertical: 10,
    },
    radioScrollContainer: {
        maxHeight: 250,
        paddingHorizontal: 10,
    },
    radioContainer: { flex: 8, alignItems: 'center' },
    radioText: { fontSize: 16, fontFamily: fonts.Medium },
    radioContainerStyle: { paddingTop: 30, marginHorizontal: 10 },
    radioStyle: { paddingBottom: 25 },
    textStyle: {
        fontFamily: fonts.Regular,
        fontSize: 16
    },
    floatButton: {
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        width: 50,
        position: "absolute",
        right: 10,
        height: 50,
        borderRadius: 30
    },
    floatButton1: {
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        width: 50,
        height: 50,
        borderRadius: 12
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: colors.BACKGROUND
    },
    modalView: {
        margin: 20,
        borderRadius: 20,
        padding: 35,
        alignItems: "flex-start",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    textContainerStyle: {
        flexDirection: 'column',
        marginBottom: 12,
    },
    textHeading: {
        fontSize: 12,
        fontFamily: fonts.Bold
    },
    textHeading1: {
        fontSize: 20,
        color: colors.BLACK,
        fontFamily: fonts.Regular
    },
    textContent: {
        fontSize: 14,
        margin: 4,
        fontFamily: fonts.Regular
    },
    textContent1: {
        fontSize: 20,
        color: colors.BLUE,
        padding: 5,
        fontFamily: fonts.Regular
    },
    modalButtonStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: 40,
        elevation: 0,
        borderRadius: 10
    },
    modalButtonTextStyle: {
        color: colors.WHITE,
        fontFamily: fonts.Bold,
        fontSize: 18
    },
    topTitle: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 3,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        justifyContent: 'center',
        position: 'absolute',
        right: 0,
        top: hasNotch ? 45 : 55,
    },
    topTitle1: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 3,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        justifyContent: 'center',
        position: 'absolute',
        left: 0,
        top: hasNotch ? 45 : 55
    },
    topContainer: {
        flex: 1.5,
        borderTopWidth: 0,
        alignItems: 'center',
        backgroundColor: colors.HEADER,
        paddingEnd: 20
    },
    addressBar: {
        borderBottomWidth: 0.7,
        bottom: 0,
        width: '100%',
        flexDirection: 'row',
        backgroundColor: colors.WHITE,
        paddingLeft: 8,
        paddingRight: 8,
        shadowColor: colors.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 3,
    },
    addressBarMul: {
        borderBottomWidth: 0.7,
        bottom: 0,
        width: '100%',
        flexDirection: 'row',
        backgroundColor: colors.WHITE,
        shadowColor: colors.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 3,
    },
    ballandsquare: {
        width: 12,
        alignItems: 'center',
        justifyContent: 'center',
        left: 5
    },
    hbox1: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: colors.GREEN
    },
    hbox3: {
        height: 12,
        width: 12,
        backgroundColor: colors.RED
    },
    contentStyle: {
        justifyContent: 'center',
        width: '95%',
        height: 90,
        left: 7
    },
    contentStyleMul: {
        width: '100%',
        marginHorizontal: 5
    },
    addressStyle1: {
        borderBottomWidth: 1,
        height: 45,
        justifyContent: 'center',
        paddingTop: 2
    },
    addressStyle2: {
        height: 45,
        justifyContent: 'center',
    },
    menuIcon: {
        height: 40,
        width: 40,
        borderRadius: 25,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 3,
        alignItems: 'center',
        position: 'absolute',
        top: hasNotch ? 40 : 55,
    },
    menuIconButton: {
        flex: 1,
        height: 50,
        width: 50,
        justifyContent: 'center',
    },
    radioScrollContainer: {
        maxHeight: 380,
        width: '100%',
        marginVertical: 5,
    },
    acceptedStatusContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 100 : 80,
        left: 20,
        right: 20,
        zIndex: 1000,
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        backgroundColor: '#1369B466',
    },
    acceptedStatusText: {
        fontSize: 16,
        fontWeight: '600',
    },
    acceptedMapContainer: {
        height: 600,
        width: '90%',
        marginTop: 60,
        marginBottom: 20,
        marginHorizontal: 20,
        borderRadius: 20,
        overflow: 'hidden',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    acceptedMap: {
        flex: 1,
    },
    acceptedBottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    acceptedDriverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    acceptedDriverImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    acceptedDriverDetails: {
        flex: 1,
    },
    acceptedDriverName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    acceptedDriverSubtitle: {
        fontSize: 14,
    },
    acceptedRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    acceptedRatingText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    acceptedTripInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    acceptedTripInfoItem: {
        alignItems: 'center',
        flex: 1,
    },
    acceptedTripInfoLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    acceptedTripInfoValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    acceptedActionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 40,
    },
    acceptedActionButton: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    unifiedModal: {
        width: '96%',
        justifyContent: 'flex-start',
        position: 'absolute',
        bottom: 25,
        alignSelf: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        paddingHorizontal: 15,
        paddingTop: 0,
    },
    bar: {
        width: 100,
        height: 6,
        borderRadius: 3,
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
        height: 25,
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
    separator: {
        height: 1,
        marginVertical: 5,
    },
});
