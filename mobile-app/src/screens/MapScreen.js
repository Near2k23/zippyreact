import React, { useEffect, useState, useRef, useContext, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Dimensions,
    Text,
    Platform,
    Alert,
    ScrollView,
    StatusBar,
    Animated,
    ImageBackground,
    Linking,
    ActivityIndicator,
    useColorScheme,
    TouchableOpacity,
    Modal,
    BackHandler,
    TextInput,
    Switch
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import { colors } from '../common/theme';
import * as Location from 'expo-location';
var { height, width } = Dimensions.get('window');
import i18n from 'i18n-js';
import DatePicker from 'react-native-date-picker';
import { useSelector, useDispatch } from 'react-redux';
import { api, FirebaseContext } from 'common';
import * as DecodePolyLine from '@mapbox/polyline';
import { OptionModal } from '../components/OptionModal';
import BookingModal, { appConsts, prepareEstimateObject } from '../common/sharedFunctions';
import { getCarTypeWithZonePrices, getFilteredCarTypesWithZonePrices as getFilteredCarTypesWithZonePricesHelper } from 'common/src/other/ZonePriceHelper';
import WaygoDialog from '../components/WaygoDialog';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { CommonActions } from '@react-navigation/native';
import { MAIN_COLOR, MAIN_COLOR_DARK, CarHorizontal, CarVertical, validateBookingObj, SECONDORY_COLOR } from '../common/sharedFunctions';
import {
    ERRAND_SERVICE_TYPE,
    RIDE_SERVICE_TYPE,
    canAcceptCashForErrand,
    getErrandItemValue,
    normalizeErrandData,
    shouldForceErrandOnlinePayment,
} from 'common/src/other/ErrandUtils';
import { startActivityAsync, ActivityAction } from 'expo-intent-launcher';
import Button from '../components/Button';
import { fonts } from "../common/font";
import DeviceInfo from 'react-native-device-info';
import customMapStyle from "../common/mapTheme.json";
import AppBannerCarousel from '../components/AppBannerCarousel';

const hasNotch = DeviceInfo.hasNotch();
const BANNER_APP_RIDER = 'RIDER';
const isBannerEnabled = (item) => item?.active === true || item?.active === 'true' || item?.active === 1;
const matchesBannerApp = (item, appName) => String(item?.app || '').trim().toUpperCase() === appName;

export default function MapScreen(props) {
    const {
        fetchAddressfromCoords,
        fetchDrivers,
        updateTripPickup,
        updateTripDrop,
        updatSelPointType,
        getDistanceMatrix,
        getDirectionsApi,
        updateTripCar,
        getEstimate,
        clearEstimate,
        addBooking,
        clearBooking,
        clearTripPoints,
        GetDistance,
        updateProfile,
        updateProfileWithEmail,
        checkUserExists,
        storeAddresses,
        detectZoneByLocation,
        fetchZones,
        setCurrentZone,
        isPointInZone
    } = api;
    const dispatch = useDispatch();
    const { config } = useContext(FirebaseContext);
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

    const auth = useSelector(state => state.auth);
    const settings = useSelector(state => state.settingsdata.settings);
    const banners = useSelector(state => state.bannerdata.banners);
    const cars = useSelector(state => state.cartypes.cars);
    const tripdata = useSelector(state => state.tripdata);
    const usersdata = useSelector(state => state.usersdata);
    const estimatedata = useSelector(state => state.estimatedata);
    const providers = useSelector(state => state.paymentmethods.providers);
    const gps = useSelector(state => state.gpsdata);
    const zonesdata = useSelector(state => state.zonesdata);
    const currentZoneFromStore = zonesdata?.currentZone;
    const activeBookings = useSelector(state => state.bookinglistdata.active);
    const bookings = useSelector(state => state.bookinglistdata.bookings);
    const addressdata = useSelector(state => state.addressdata);
    const [datePickerOpen, setDatePickerOpen] = useState(false)
    const latitudeDelta = 0.12;
    const longitudeDelta = latitudeDelta * (width / height);

    const [allCarTypes, setAllCarTypes] = useState([]);
    const [freeCars, setFreeCars] = useState([]);
    const [selectFromMap, setSelectFromMap] = useState(false);
    const [mapSelectionType, setMapSelectionType] = useState(null);
    const [isResolvingTapAddress, setIsResolvingTapAddress] = useState(false);
    const mapSelectRequestId = useRef(0);

    useEffect(() => {
        if (props.route.params?.selectFromMap && props.route.params?.locationType) {
            setSelectFromMap(true);
            setMapSelectionType(props.route.params.locationType);
            setShowInitialScreen(false);
            dispatch(updatSelPointType(props.route.params.locationType));
        }
    }, [props.route.params]);

    useEffect(() => {
        dispatch(fetchZones());
    }, [dispatch, fetchZones]);
    const [pickerConfig, setPickerConfig] = useState({
        selectedDateTime: new Date(),
        dateModalOpen: false,
        dateMode: 'date'
    });
    const [region, setRegion] = useState(null);
    const [optionModalStatus, setOptionModalStatus] = useState(false);
    const [bookingDate, setBookingDate] = useState(null);
    const [bookingModalStatus, setBookingModalStatus] = useState(false);
    const [bookLoading, setBookLoading] = useState(false);
    const [bookLaterLoading, setBookLaterLoading] = useState(false);
    const [shouldOpenBookingModal, setShouldOpenBookingModal] = useState(false);
    const [allCarTypeEstimates, setAllCarTypeEstimates] = useState({});
    const [initDate, setInitDate] = useState(new Date());

    const instructionInitData = {
        otherPerson: "",
        otherPersonPhone: "",
        pickUpInstructions: "",
        deliveryInstructions: "",
        parcelTypeIndex: 0,
        optionIndex: 0,
        parcelTypeSelected: null,
        optionSelected: null
    };
    const errandInitData = {
        requestText: '',
        illegalGoodsAccepted: false,
        itemAlreadyPaid: true,
        declaredItemValue: 0,
        approvedItemValue: null,
        requiresSearch: false,
        searchArea: null,
        searchCostApplied: false,
        searchCostAmount: 0,
        phase: 'TO_STORE',
        activePriceChangeRequest: null,
        priceChangeHistory: [],
    };
    const [instructionData, setInstructionData] = useState(instructionInitData);
    const [serviceType, setServiceType] = useState(RIDE_SERVICE_TYPE);
    const [errandData, setErrandData] = useState(errandInitData);
    const bookingdata = useSelector(state => state.bookingdata);
    const [locationRejected, setLocationRejected] = useState(false);
    const mapRef = useRef();
    const [dragging, setDragging] = useState(0);

    const animation = useRef(new Animated.Value(4)).current;
    const [isEditing, setIsEditing] = useState(false);
    const [touchY, setTouchY] = useState();

    const [bookingType, setBookingType] = useState(false);
    const intVal = useRef();

    const [profile, setProfile] = useState();
    const [checkType, setCheckType] = useState(false);
    const pageActive = useRef();
    const [drivers, setDrivers] = useState();
    const [roundTrip, setRoundTrip] = useState(false);
    const [tripInstructions, setTripInstructions] = useState('');
    const [payment_mode, setPaymentMode] = useState(0);
    const [radioProps, setRadioProps] = useState([]);
    const [checkTerm, setCheckTerm] = useState(false);
    const [bookModelLoading, setBookModelLoading] = useState(false);
    const [term, setTerm] = useState(false);
    const [deliveryWithBid, setDeliveryWithBid] = useState(false);
    const [otherPerson, setOtherPerson] = useState(false)
    const [offerFare, setOfferFare] = useState(0);
    const [minimumPrice, setMinimumPrice] = useState(0);
    let colorScheme = useColorScheme();
    const [mode, setMode] = useState();

    const [showInitialScreen, setShowInitialScreen] = useState(true);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [showCarTypes, setShowCarTypes] = useState(false);
    const [showCarTypesExpanded, setShowCarTypesExpanded] = useState(true);
    const [routeCoords, setRouteCoords] = useState([]);
    const [hasAutoFitted, setHasAutoFitted] = useState(false);
    const [shouldRequestEstimate, setShouldRequestEstimate] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [showRecentTripsModal, setShowRecentTripsModal] = useState(false);
    const [recentTrips, setRecentTrips] = useState([]);
    const [isInZone, setIsInZone] = useState(true);
    const [outOfZoneDialog, setOutOfZoneDialog] = useState(false);
    const [currentZone, setCurrentZoneState] = useState(null);
    const [zoneDetectionMessage, setZoneDetectionMessage] = useState('');
    const [showTermsDialog, setShowTermsDialog] = useState(false);
    const [showLocationPermissionDialog, setShowLocationPermissionDialog] = useState(false);
    const [noServiceInZoneDialogDismissed, setNoServiceInZoneDialogDismissed] = useState(false);
    const insets = useSafeAreaInsets();
    const normalizedErrand = normalizeErrandData(errandData, settings || {});
    const riderBanners = useMemo(() => {
        return (banners || []).filter((item) => matchesBannerApp(item, BANNER_APP_RIDER) && isBannerEnabled(item));
    }, [banners]);
    const compactLocationLabel = useMemo(() => {
        if (currentZone?.name) {
            return String(currentZone.name).trim();
        }
        if (currentLocation) {
            return String(currentLocation).split(',')[0].trim();
        }
        return 'Tu ubicación';
    }, [currentLocation, currentZone?.name]);
    const displayLocationLabel = useMemo(() => {
        if (currentLocation) {
            return String(currentLocation).split(',')[0].trim();
        }
        if (currentZone?.name) {
            return String(currentZone.name).trim();
        }
        return 'Tu ubicacion';
    }, [currentLocation, currentZone?.name]);

    const handleTermsCancel = () => {
        BackHandler.exitApp();
    };

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

    const fitMapToRoute = async (pickup, drop, forceAutoFit = false) => {
        if (pickup && drop && mapRef.current) {
            try {
                const pickupLat = parseFloat(pickup.lat);
                const pickupLng = parseFloat(pickup.lng);
                const dropLat = parseFloat(drop.lat);
                const dropLng = parseFloat(drop.lng);

                if (!isNaN(pickupLat) && !isNaN(pickupLng) && !isNaN(dropLat) && !isNaN(dropLng)) {
                    const deltaLat = Math.abs(pickupLat - dropLat);
                    const deltaLng = Math.abs(pickupLng - dropLng);
                    if (deltaLat < 0.0005 && deltaLng < 0.0005) {
                        mapRef.current.animateToRegion({
                            latitude: pickupLat,
                            longitude: pickupLng,
                            latitudeDelta: latitudeDelta,
                            longitudeDelta: longitudeDelta
                        });
                        return;
                    }
                }
                if (settings && settings.showLiveRoute) {
                    const startLoc = pickup.lat + ',' + pickup.lng;
                    const destLoc = drop.lat + ',' + drop.lng;
                    let waypoints = '';
                    if (drop && drop.waypoints && drop.waypoints.length > 0) {
                        const arr = drop.waypoints;
                        for (let i = 0; i < arr.length; i++) {
                            waypoints = waypoints + arr[i].lat + ',' + arr[i].lng;
                            if (i < arr.length - 1) {
                                waypoints = waypoints + '|';
                            }
                        }
                    }

                    const response = await getDirectionsApi(startLoc, destLoc, waypoints);
                    if (response && response.polylinePoints) {
                        const coords = DecodePolyLine.decode(response.polylinePoints);
                        const routeCoordinates = coords.map(coord => ({
                            latitude: coord[0],
                            longitude: coord[1]
                        }));
                        setRouteCoords(routeCoordinates);

                        if (!hasAutoFitted || forceAutoFit) {
                            mapRef.current.fitToCoordinates(routeCoordinates, {
                                edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
                                animated: true
                            });
                            setHasAutoFitted(true);
                        }
                    }
                } else {
                    const coordinates = [
                        { latitude: pickup.lat, longitude: pickup.lng },
                        { latitude: drop.lat, longitude: drop.lng }
                    ];
                    if (!hasAutoFitted || forceAutoFit) {
                        mapRef.current.fitToCoordinates(coordinates, {
                            edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
                            animated: true
                        });
                        setHasAutoFitted(true);
                    }
                }
            } catch (error) {
                console.log('Error fitting map to route:', error);
            }
        }
    }

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
        if (settings && settings.bookingFlow) {
            setDeliveryWithBid(settings.bookingFlow == "2" ? true : false)
        }
    }, [settings])

    useEffect(() => {
        if (gps.location && zonesdata.zones && zonesdata.zones.length > 0) {
            const detectedZone = detectZoneByLocation(gps.location.lat, gps.location.lng, zonesdata.zones);

            const hasGeometryMatch = !!(detectedZone && detectedZone.geometry);

            if (hasGeometryMatch) {
                setCurrentZoneState(detectedZone);
                setIsInZone(true);
                setZoneDetectionMessage('');
                dispatch(setCurrentZone(detectedZone));
            } else {
                setIsInZone(false);
                setZoneDetectionMessage(t('out_of_zone_message'));
                setCurrentZoneState(null);
            }
        }
    }, [gps.location, zonesdata.zones, dispatch, setCurrentZone]);

    useEffect(() => {
        if (currentZone && cars) {
            resetCars();

            const filteredCars = getFilteredCarTypesWithZonePrices();

            if (filteredCars.length > 0) {
                const pricesInfo = filteredCars.map(car => ({
                    name: car.name,
                    base_fare: car.base_fare,
                    rate_per_unit_distance: car.rate_per_unit_distance,
                    rate_per_hour: car.rate_per_hour,
                    min_fare: car.min_fare,
                    convenience_fees: car.convenience_fees,
                    convenience_fee_type: car.convenience_fee_type,
                    fleet_admin_fee: car.fleet_admin_fee,
                }));
            }
        }
    }, [currentZone, cars]);

    const profileInitData = {
        firstName: auth && auth.profile && auth.profile.firstName ? auth.profile.firstName : "",
        lastName: auth && auth.profile && auth.profile.lastName ? auth.profile.lastName : "",
        email: auth && auth.profile && auth.profile.email ? auth.profile.email : "",
    };
    const [profileData, setProfileData] = useState(profileInitData);
    const [bookingOnWait, setBookingOnWait] = useState();

    const addresses = useSelector(state => state.locationdata.addresses);

    useEffect(() => {
        if (auth.profile) {
            setTimeout(() => {
                setTerm(true);
            }, 2000);
            const accepted = auth.profile.term ? true : false;
            setCheckTerm(accepted);
            if (settings && settings.term_required) {
                if (!accepted) {
                    setShowTermsDialog(true);
                } else {
                    setShowTermsDialog(false);
                }
            }
            if (bookingOnWait) {
                finaliseBooking(bookingOnWait);
                setBookingOnWait(null);
                setBookModelLoading(false);
            }
        }
    }, [auth.profile, settings, bookingOnWait])

    useEffect(() => {
        if (settings) {
            let arr = [{ label: t('wallet'), value: 0, cat: 'wallet' }];
            let val = 0;
            if (!settings.disable_online && providers && providers.length > 0) {
                val++;
                arr.push({ label: t('card'), value: val, cat: 'card' });
            }
            const allowCash = serviceType !== ERRAND_SERVICE_TYPE || canAcceptCashForErrand(normalizedErrand, settings);
            if (!settings.disable_cash && allowCash) {
                val++;
                arr.push({ label: t('cash'), value: val, cat: 'cash' });
            }
            setRadioProps(arr);
            if (payment_mode >= arr.length) {
                setPaymentMode(0);
            }
        }
    }, [settings, providers, serviceType, errandData.itemAlreadyPaid, errandData.declaredItemValue, errandData.approvedItemValue, payment_mode]);

    useEffect(() => {
        if (usersdata.drivers) {
            const freeDrivers = usersdata.drivers.filter(d => !d.queue)
            let arr = [];
            for (let i = 0; i < freeDrivers.length; i++) {
                let driver = freeDrivers[i];
                if (!driver.carType) {
                    let carTypes = allCarTypes;
                    for (let i = 0; i < carTypes.length; i++) {
                        let temp = { ...driver, carType: carTypes[i].name };
                        arr.push(temp);
                    }
                } else {
                    arr.push(driver);
                }
            }
            setDrivers(arr);
        }
    }, [usersdata.drivers]);

    useEffect(() => {
        if (addressdata.addresses) {
            setSavedAddresses(addressdata.addresses);
        } else {
            setSavedAddresses([]);
        }
    }, [addressdata]);

    useEffect(() => {
        const initializeLocation = async () => {
            setLoadingLocation(true);
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                        timeout: 15000,
                        maximumAge: 10000
                    });

                    if (location && location.coords) {
                        dispatch({
                            type: 'UPDATE_GPS_LOCATION',
                            payload: {
                                lat: location.coords.latitude,
                                lng: location.coords.longitude
                            }
                        });
                    }
                } else {
                    setLoadingLocation(false);
                    setCurrentLocation(t('location_permission_error'));
                    setLocationRejected(true);
                    setShowLocationPermissionDialog(true);
                }
            } catch (error) {
                console.warn('Error initializing location:', error);
                setLoadingLocation(false);
                setCurrentLocation(t('location_permission_error'));
                setLocationRejected(true);
                setShowLocationPermissionDialog(true);
            }
        };

        initializeLocation();
    }, []);

    useEffect(() => {
        if (gps && gps.location &&
            typeof gps.location.lat === 'number' &&
            typeof gps.location.lng === 'number' &&
            !currentLocation) {
            updateCurrentLocation({
                latitude: gps.location.lat,
                longitude: gps.location.lng
            });
        }
    }, [gps.location]);

    useEffect(() => {
        if (bookings && bookings.length > 0) {
            const completedTrips = bookings
                .filter(trip => trip.status === 'COMPLETE' && trip.pickup && trip.drop)
                .sort((a, b) => new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp))
                .slice(0, 5);
            setRecentTrips(completedTrips);
        }
    }, [bookings]);

    useEffect(() => {
        if (auth.profile && auth.profile.uid) {
            setProfile(auth.profile);
        } else {
            setProfile(null);
        }
    }, [auth.profile]);

    useEffect(() => {
        if (tripdata.drop && tripdata.drop.add) {
            setIsEditing(true);
        }
    }, [tripdata]);

    useEffect(() => {
        if (tripdata.pickup && tripdata.pickup.add && tripdata.drop && tripdata.drop.add && showInitialScreen) {
            setShowInitialScreen(false);
        }
    }, [tripdata.pickup, tripdata.drop, showInitialScreen]);

    useEffect(() => easing => {
        Animated.timing(animation, {
            toValue: !isEditing ? 4 : 0,
            duration: 300,
            useNativeDriver: false,
            easing
        }).start();
    }, [isEditing]);

    useEffect(() => {
        if (cars && currentZone) {
            resetCars();
        } else if (cars && !currentZone) {
            setAllCarTypes([]);
        }
    }, [cars, currentZone]);

    useEffect(() => {
        if (tripdata.pickup && drivers) {
            getDrivers();
        }
        if (tripdata.pickup && !drivers) {
            resetCars();
            setFreeCars([]);
        }
    }, [drivers, tripdata.pickup]);

    useEffect(() => {
        if (estimatedata.estimate) {
            setBookLoading(false);
            setBookLaterLoading(false);
            if (shouldOpenBookingModal) {
                setBookingModalStatus(true);
                setShouldOpenBookingModal(false);
            }
        }
        if (estimatedata.estimate && settings && !settings.coustomerBidPrice) {
            let price = estimatedata.estimate.estimateFare;
            let ammount = settings.coustomerBidPriceType === 'flat' ? parseFloat(price - settings.bidprice).toFixed(settings.decimal) : parseFloat(price - parseFloat(price * (settings.bidprice / 100))).toFixed(settings.decimal);
            if (ammount && ammount > 0) { setMinimumPrice(ammount) }
        }
        if (estimatedata.error && estimatedata.error.flag) {
            setBookLoading(false);
            setBookLaterLoading(false);
            setShouldOpenBookingModal(false);
            Alert.alert(estimatedata.error.msg);
            dispatch(clearEstimate());
        }
    }, [estimatedata.estimate, estimatedata.error, estimatedata.error.flag, shouldOpenBookingModal]);

    useEffect(() => {
        if (tripdata.selected && tripdata.selected == 'pickup' && tripdata.pickup && tripdata.pickup.source == 'search' && mapRef.current) {
            if (!locationRejected) {
                setTimeout(() => {
                    if (mapRef.current) {
                        mapRef.current.animateToRegion({
                            latitude: tripdata.pickup.lat,
                            longitude: tripdata.pickup.lng,
                            latitudeDelta: latitudeDelta,
                            longitudeDelta: longitudeDelta
                        });
                    }
                }, 1000);
            } else {
                setRegion({
                    latitude: tripdata.pickup.lat,
                    longitude: tripdata.pickup.lng,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta
                });
            }
        }
        if (tripdata.selected && tripdata.selected == 'drop' && tripdata.drop && tripdata.drop.source == 'search' && mapRef.current) {
            if (!locationRejected) {
                setTimeout(() => {
                    if (mapRef.current) {
                        mapRef.current.animateToRegion({
                            latitude: tripdata.drop.lat,
                            longitude: tripdata.drop.lng,
                            latitudeDelta: latitudeDelta,
                            longitudeDelta: longitudeDelta
                        });
                    }
                }, 1000)
            } else {
                setRegion({
                    latitude: tripdata.drop.lat,
                    longitude: tripdata.drop.lng,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta
                });
            }
        }

        if (tripdata.pickup && tripdata.drop && !showInitialScreen && !selectFromMap) {
            const requestEstimate = async () => {
                if (tripdata.carType && drivers && drivers.length > 0) {
                    let tripdataWithZonePrices = { ...tripdata, currentZoneId: currentZone?.id || null };
                    if (currentZone && currentZone.id && tripdata.carType) {
                        tripdataWithZonePrices.carType = getCarTypeWithZonePrices(tripdata.carType, currentZone.id);
                    }
                    let result = await prepareEstimateObject(tripdataWithZonePrices, instructionData, serviceType, normalizedErrand, radioProps[payment_mode]?.cat || 'cash');
                    if (!result.error) {
                        dispatch(getEstimate(result.estimateObject));
                    }
                }
            };

            setTimeout(() => {
                requestEstimate();
                calculateAllCarTypeEstimates();
                fitMapToRoute(tripdata.pickup, tripdata.drop);
            }, 500);
        }
    }, [tripdata.selected, tripdata.pickup, tripdata.drop, mapRef.current, showInitialScreen, tripdata.carType, drivers, instructionData, selectFromMap]);

    useEffect(() => {
        if (bookingdata.booking) {
            const bookingStatus = bookingdata.booking.mainData.status;
            if (bookingStatus == 'PAYMENT_PENDING') {
                setTimeout(() => {
                    props.navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [
                                {
                                    name: 'PaymentDetails',
                                    params: { booking: bookingdata.booking.mainData },
                                },
                            ],
                        })
                    );
                    dispatch(clearEstimate());
                    dispatch(clearBooking());
                    dispatch(clearTripPoints());
                }, 1000);
            } else {
                setTimeout(() => {
                    props.navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [
                                {
                                    name: 'BookedCab',
                                    params: { bookingId: bookingdata.booking.booking_id },
                                },
                            ],
                        })
                    );
                    dispatch(clearEstimate());
                    dispatch(clearBooking());
                    dispatch(clearTripPoints());
                }, 1000);
            }
        }
        if (bookingdata.error && bookingdata.error.flag) {
            Alert.alert(bookingdata.error.msg);
            dispatch(clearBooking());
        }
        if (bookingdata.loading) {
            setBookLoading(true);
            setBookLaterLoading(true);
        } else {
            setBookLoading(false);
            setBookLaterLoading(false);
        }
    }, [bookingdata.booking, bookingdata.loading, bookingdata.error, bookingdata.error.flag]);

    useEffect(() => {
        if (gps.location) {
            if (gps.location.lat && gps.location.lng) {
                setDragging(0);
                if (region && mapRef.current) {
                    mapRef.current.animateToRegion({
                        latitude: gps.location.lat,
                        longitude: gps.location.lng,
                        latitudeDelta: latitudeDelta,
                        longitudeDelta: longitudeDelta
                    });
                }
                else {
                    setRegion({
                        latitude: gps.location.lat,
                        longitude: gps.location.lng,
                        latitudeDelta: latitudeDelta,
                        longitudeDelta: longitudeDelta
                    });
                }
                updateAddresses({
                    latitude: gps.location.lat,
                    longitude: gps.location.lng
                }, region ? 'gps' : 'init');
            } else {
                setLocationRejected(true);
            }
        }
    }, [gps.location]);


    useEffect(() => {
        if (region && mapRef.current) {
            if (Platform.OS == 'ios') {
                mapRef.current.animateToRegion({
                    latitude: region.latitude,
                    longitude: region.longitude,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta
                });
            }
        }
    }, [region, mapRef.current]);

    const getFilteredCarTypesWithZonePrices = () => {
        const filteredCars = getFilteredCarTypesWithZonePricesHelper(cars, currentZone?.id);
        if (serviceType === ERRAND_SERVICE_TYPE) {
            return filteredCars.filter((car) => car.acceptErrands);
        }
        return filteredCars;
    };

    const getCarTypesForServiceType = (nextType) => {
        const filteredCars = getFilteredCarTypesWithZonePricesHelper(cars, currentZone?.id);
        if (nextType === ERRAND_SERVICE_TYPE) {
            return filteredCars.filter((car) => car.acceptErrands);
        }
        return filteredCars;
    };

    const handleServiceTypeChange = (nextType) => {
        setServiceType(nextType);
        if (nextType === RIDE_SERVICE_TYPE) {
            setErrandData(errandInitData);
        }
        dispatch(updateTripCar(null));
    };

    const handlePrimaryServiceStart = (nextType) => {
        if (!isInZone) {
            setOutOfZoneDialog(true);
            return;
        }
        if (nextType === ERRAND_SERVICE_TYPE && settings && settings.enableErrands === false) {
            Alert.alert(t('alert'), 'Los mandados estan deshabilitados por el administrador.');
            return;
        }

        const availableCars = getCarTypesForServiceType(nextType);
        if (!availableCars.length) {
            Alert.alert(
                t('alert'),
                nextType === ERRAND_SERVICE_TYPE
                    ? 'No hay vehiculos disponibles para mandados en tu zona.'
                    : 'No hay vehiculos disponibles para viajes en tu zona.'
            );
            return;
        }

        handleServiceTypeChange(nextType);
        handleNewTrip();
    };

    const validateErrandForm = () => {
        if (serviceType !== ERRAND_SERVICE_TYPE) {
            return true;
        }
        if (settings && settings.enableErrands === false) {
            Alert.alert(t('alert'), 'Los mandados estan deshabilitados por el administrador.');
            return false;
        }
        if (!normalizedErrand.requestText || !String(normalizedErrand.requestText).trim()) {
            Alert.alert(t('alert'), 'Describe el mandado antes de continuar.');
            return false;
        }
        if (!normalizedErrand.illegalGoodsAccepted) {
            Alert.alert(t('alert'), 'Debes confirmar que el mandado es legal.');
            return false;
        }
        if (!normalizedErrand.itemAlreadyPaid && getErrandItemValue(normalizedErrand) <= 0) {
            Alert.alert(t('alert'), 'Debes indicar el valor del pedido.');
            return false;
        }
        if (tripdata.carType && !tripdata.carType.acceptErrands) {
            Alert.alert(t('alert'), 'Selecciona un vehiculo que acepte mandados.');
            return false;
        }
        return true;
    };

    useEffect(() => {
        if (serviceType === ERRAND_SERVICE_TYPE && settings && settings.enableErrands === false) {
            Alert.alert(t('alert'), 'Los mandados estan deshabilitados por el administrador.');
            setServiceType(RIDE_SERVICE_TYPE);
            return;
        }
        if (serviceType === ERRAND_SERVICE_TYPE && tripdata.carType && !tripdata.carType.acceptErrands) {
            dispatch(updateTripCar(null));
        }
        resetCars();
    }, [serviceType, settings?.enableErrands]);


    const resetCars = () => {
        const filteredCarsWithPrices = getFilteredCarTypesWithZonePrices();

        if (filteredCarsWithPrices.length > 0) {
            let carWiseArr = [];
            for (let i = 0; i < filteredCarsWithPrices.length; i++) {
                let temp = { ...filteredCarsWithPrices[i], minTime: '', available: false, active: i === 0 };
                carWiseArr.push(temp);
            }
            setAllCarTypes(carWiseArr);
            if (!tripdata.carType) {
                dispatch(updateTripCar(filteredCarsWithPrices[0]));
            }
        } else {
            setAllCarTypes([]);
        }
    }

    const resetActiveCar = () => {
        let carWiseArr = [];
        const sorted = allCarTypes.sort((a, b) => a.pos - b.pos);
        for (let i = 0; i < sorted.length; i++) {
            let temp = { ...sorted[i], active: false };
            carWiseArr.push(temp);
        }
        setAllCarTypes(carWiseArr);
    }



    const setAddresses = async (pos, res, source) => {
        if (res) {
            if (selectFromMap && mapSelectionType) {
                if (mapSelectionType === "pickup") {
                    dispatch(
                        updateTripPickup({
                            lat: pos.latitude,
                            lng: pos.longitude,
                            add: res,
                            source: "mapSelect",
                        })
                    );
                } else if (mapSelectionType === "drop") {
                    dispatch(
                        updateTripDrop({
                            lat: pos.latitude,
                            lng: pos.longitude,
                            add: res,
                            source: "mapSelect",
                        })
                    );
                }
            } else if (tripdata.selected == "pickup") {
                dispatch(
                    updateTripPickup({
                        lat: pos.latitude,
                        lng: pos.longitude,
                        add: res,
                        source: source,
                    })
                );
                if (source == "init") {
                    dispatch(
                        updateTripDrop({
                            lat: pos.latitude,
                            lng: pos.longitude,
                            add: null,
                            source: source,
                        })
                    );
                }
            } else {
                dispatch(
                    updateTripDrop({
                        lat: pos.latitude,
                        lng: pos.longitude,
                        add: res,
                        source: source,
                    })
                );
            }
        }
    };

    const updateAddresses = async (pos, source) => {
        let latlng = pos.latitude + "," + pos.longitude;
        if (!pos.latitude) return;
        let res = '';
        let found = false;
        let savedAddresses = [];

        try {
            const value = addresses;
            if (value !== null) {
                savedAddresses = JSON.parse(value);
                for (let i = 0; i < savedAddresses.length; i++) {
                    let distance = GetDistance(pos.latitude, pos.longitude, savedAddresses[i].lat, savedAddresses[i].lng);
                    if (distance < 0.25) {
                        res = savedAddresses[i].description;
                        found = true;
                        break;
                    }
                }
            }
        } catch (error) {
            found = false;
        }

        if (found) {
            setAddresses(pos, res, source);
        } else {
            fetchAddressfromCoords(latlng).then((add) => {
                if (add) {
                    savedAddresses.push({
                        lat: pos.latitude,
                        lng: pos.longitude,
                        description: add
                    });
                    storeAddresses(savedAddresses);
                    setAddresses(pos, add, source);
                }
            });
        }
    };

    const handleMapPress = (e) => {
        if (!selectFromMap || !mapSelectionType) return;
        const coordinate = e?.nativeEvent?.coordinate;
        if (!coordinate || typeof coordinate.latitude !== 'number' || typeof coordinate.longitude !== 'number') return;

        mapSelectRequestId.current += 1;
        const reqId = mapSelectRequestId.current;
        setIsResolvingTapAddress(true);

        const pos = { latitude: coordinate.latitude, longitude: coordinate.longitude };

        if (mapSelectionType === 'pickup') {
            dispatch(updateTripPickup({ lat: pos.latitude, lng: pos.longitude, add: null, source: 'mapSelect' }));
        } else if (mapSelectionType === 'drop') {
            dispatch(updateTripDrop({ lat: pos.latitude, lng: pos.longitude, add: null, source: 'mapSelect' }));
        }

        let res = '';
        let found = false;
        let savedAddresses = [];

        try {
            const value = addresses;
            if (value !== null) {
                savedAddresses = JSON.parse(value);
                for (let i = 0; i < savedAddresses.length; i++) {
                    let distance = GetDistance(pos.latitude, pos.longitude, savedAddresses[i].lat, savedAddresses[i].lng);
                    if (distance < 0.25) {
                        res = savedAddresses[i].description;
                        found = true;
                        break;
                    }
                }
            }
        } catch (error) {
            found = false;
        }

        if (reqId !== mapSelectRequestId.current) return;

        if (found) {
            setAddresses(pos, res, 'mapSelect');
            if (reqId === mapSelectRequestId.current) setIsResolvingTapAddress(false);
            return;
        }

        const latlng = pos.latitude + "," + pos.longitude;
        fetchAddressfromCoords(latlng).then((add) => {
            if (reqId !== mapSelectRequestId.current) return;
            if (add) {
                try {
                    savedAddresses.push({ lat: pos.latitude, lng: pos.longitude, description: add });
                    storeAddresses(savedAddresses);
                } catch (error) { }
                setAddresses(pos, add, 'mapSelect');
            }
            if (reqId === mapSelectRequestId.current) setIsResolvingTapAddress(false);
        }).catch(() => {
            if (reqId === mapSelectRequestId.current) setIsResolvingTapAddress(false);
        });
    };

    const onRegionChangeComplete = (newregion, gesture) => {
        if (selectFromMap && mapSelectionType) {
            return;
        }
        if ((tripdata.pickup && tripdata.pickup.source == 'mapSelect') || (tripdata.drop && tripdata.drop.source == 'mapSelect')) {
            if (gesture && gesture.isGesture) {
                updateAddresses({
                    latitude: newregion.latitude,
                    longitude: newregion.longitude
                }, 'mapSelect');
            }
        }
    }

    const calculateAllCarTypeEstimates = async () => {
        if (tripdata.pickup && tripdata.drop && allCarTypes && allCarTypes.length > 0) {
            const estimates = {};

            for (const carType of allCarTypes) {
                try {
                    const tempTripData = {
                        ...tripdata,
                        carType: carType,
                        currentZoneId: currentZone?.id || null
                    };

                    const result = await prepareEstimateObject(tempTripData, instructionData, serviceType, normalizedErrand, radioProps[payment_mode]?.cat || 'cash');
                    if (!result.error && result.estimateObject) {
                        const estimateResult = await new Promise((resolve) => {
                            const tempDispatch = (action) => {
                                if (action.type === 'FETCH_ESTIMATE_SUCCESS') {
                                    resolve(action.payload);
                                } else if (action.type === 'FETCH_ESTIMATE_FAILED') {
                                    resolve(null);
                                }
                            };

                            getEstimate(result.estimateObject)(tempDispatch);
                        });

                        if (estimateResult) {
                            estimates[carType.name] = {
                                estimate: estimateResult
                            };
                        }
                    }
                } catch (error) {
                    console.log(`Error calculating estimate for ${carType.name}:`, error);
                }
            }

            setAllCarTypeEstimates(estimates);
        }
    };

    const selectCarType = (value, key) => {
        if (!isInZone) {
            try { setOutOfZoneDialog(true); } catch (e) { }
            return;
        }
        let carTypes = allCarTypes;
        for (let i = 0; i < carTypes.length; i++) {
            carTypes[i].active = false;
            if (carTypes[i].name == value.name) {
                carTypes[i].active = true;
                let instObj = { ...instructionData };
                if (Array.isArray(carTypes[i].parcelTypes)) {
                    instObj.parcelTypeSelected = carTypes[i].parcelTypes[0];
                    instObj.parcelTypeIndex = 0;
                }
                if (Array.isArray(carTypes[i].options)) {
                    instObj.optionSelected = carTypes[i].options[0];
                    instObj.optionIndex = 0;
                }
                setInstructionData(instObj);
            } else {
                carTypes[i].active = false;
            }
        }

        let carTypeWithZonePrices = value;
        if (currentZone && currentZone.id) {
            carTypeWithZonePrices = getCarTypeWithZonePrices(value, currentZone.id);
        }

        dispatch(updateTripCar(carTypeWithZonePrices));

        setTimeout(() => {
            calculateAllCarTypeEstimates();
        }, 100);
    }

    const getDrivers = async () => {
        if (tripdata.pickup) {
            let availableDrivers = [];
            let arr = {};
            let startLoc = tripdata.pickup.lat + ',' + tripdata.pickup.lng;

            let distArr = [];
            let allDrivers = [];
            for (let i = 0; i < drivers.length; i++) {
                let driver = { ...drivers[i] };
                let distance = GetDistance(tripdata.pickup.lat, tripdata.pickup.lng, driver.location.lat, driver.location.lng);
                if (settings.convert_to_mile) {
                    distance = distance / 1.609344;
                }
                if (distance < ((settings && settings.driverRadius) ? settings.driverRadius : 10)) {
                    driver["distance"] = distance;
                    allDrivers.push(driver);
                }
            }

            const sortedDrivers = settings.useDistanceMatrix ? allDrivers.slice(0, 25) : allDrivers;

            if (sortedDrivers.length > 0) {
                let driverDest = "";
                for (let i = 0; i < sortedDrivers.length; i++) {
                    let driver = { ...sortedDrivers[i] };
                    driverDest = driverDest + driver.location.lat + "," + driver.location.lng
                    if (i < (sortedDrivers.length - 1)) {
                        driverDest = driverDest + '|';
                    }
                }

                if (settings.useDistanceMatrix) {
                    distArr = await getDistanceMatrix(startLoc, driverDest);
                } else {
                    for (let i = 0; i < sortedDrivers.length; i++) {
                        distArr.push({ timein_text: ((sortedDrivers[i].distance * 2) + 1).toFixed(0) + ' min', found: true })
                    }
                }


                for (let i = 0; i < sortedDrivers.length; i++) {
                    let driver = { ...sortedDrivers[i] };
                    if (distArr[i].found && cars) {
                        driver.arriveTime = distArr[i];
                        const filteredCars = getFilteredCarTypesWithZonePrices();
                        for (let j = 0; j < filteredCars.length; j++) {
                            if (filteredCars[j].name == driver.carType) {
                                driver.carImage = filteredCars[j].image;
                                break;
                            }
                        }
                        let carType = driver.carType;
                        if (carType && carType.length > 0) {
                            if (arr[carType] && arr[carType].sortedDrivers) {
                                arr[carType].sortedDrivers.push(driver);
                                if (arr[carType].minDistance > driver.distance) {
                                    arr[carType].minDistance = driver.distance;
                                    arr[carType].minTime = driver.arriveTime.timein_text;
                                }
                            } else {
                                arr[carType] = {};
                                arr[carType].sortedDrivers = [];
                                arr[carType].sortedDrivers.push(driver);
                                arr[carType].minDistance = driver.distance;
                                arr[carType].minTime = driver.arriveTime.timein_text;
                            }
                        } else {
                            let carTypes = allCarTypes;
                            for (let i = 0; i < carTypes.length; i++) {
                                let carType = carTypes[i];
                                if (arr[carType]) {
                                    arr[carType].sortedDrivers.push(driver);
                                    if (arr[carType].minDistance > driver.distance) {
                                        arr[carType].minDistance = driver.distance;
                                        arr[carType].minTime = driver.arriveTime.timein_text;
                                    }
                                } else {
                                    arr[carType] = {};
                                    arr[carType].sortedDrivers = [];
                                    arr[carType].sortedDrivers.push(driver);
                                    arr[carType].minDistance = driver.distance;
                                    arr[carType].minTime = driver.arriveTime.timein_text;
                                }
                            }
                        }
                        availableDrivers.push(driver);
                    }
                }
            }

            const filteredCarsWithPrices = getFilteredCarTypesWithZonePrices();
            let carWiseArr = [];
            if (filteredCarsWithPrices && filteredCarsWithPrices.length > 0) {
                for (let i = 0; i < filteredCarsWithPrices.length; i++) {
                    let temp = { ...filteredCarsWithPrices[i] };
                    if (arr[filteredCarsWithPrices[i].name]) {
                        temp['nearbyData'] = arr[filteredCarsWithPrices[i].name].drivers;
                        temp['minTime'] = arr[filteredCarsWithPrices[i].name].minTime;
                        temp['available'] = true;
                    } else {
                        temp['minTime'] = '';
                        temp['available'] = false;
                    }
                    temp['active'] = (tripdata.carType && (tripdata.carType.name == filteredCarsWithPrices[i].name)) ? true : false;
                    carWiseArr.push(temp);
                }
            }

            setFreeCars(availableDrivers);
            setAllCarTypes(carWiseArr);
        }
    }

    const tapAddress = (selection) => {
        if (selection === 'drop' && tripdata.drop && tripdata.drop.add === null) props.navigation.navigate('Search', { locationType: "drop" })
        if (selection === tripdata.selected) {
            let savedAddresses = [];
            let allAddresses = profile.savedAddresses;
            for (let key in allAddresses) {
                savedAddresses.push(allAddresses[key]);
            }
            if (selection == 'drop') {
                props.navigation.navigate('Search', { locationType: "drop", addParam: savedAddresses });
            } else {
                props.navigation.navigate('Search', { locationType: "pickup", addParam: savedAddresses });
            }
        } else {
            setDragging(0)
            if (selection == 'drop' && tripdata.selected && tripdata.selected == 'pickup' && mapRef.current && tripdata.drop && tripdata.drop.lat && tripdata.drop.lng) {
                mapRef.current.animateToRegion({
                    latitude: tripdata.drop.lat,
                    longitude: tripdata.drop.lng,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta
                });
            }
            if (selection == 'pickup' && tripdata.selected && tripdata.selected == 'drop' && mapRef.current && tripdata.pickup && tripdata.pickup.lat && tripdata.pickup.lng) {
                mapRef.current.animateToRegion({
                    latitude: tripdata.pickup.lat,
                    longitude: tripdata.pickup.lng,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta
                });
            }
            dispatch(updatSelPointType(selection));
        }

    };

    const handleNewTrip = () => {
        const hasResolvedPickup = tripdata.pickup && tripdata.pickup.add;
        const canUseCurrentLocation = gps && gps.location && gps.location.lat && gps.location.lng && currentLocation;

        if (!hasResolvedPickup && canUseCurrentLocation) {
            dispatch(updateTripPickup({
                lat: gps.location.lat,
                lng: gps.location.lng,
                add: currentLocation,
                source: 'gps'
            }));
        }

        if (hasResolvedPickup || canUseCurrentLocation) {
            dispatch(updatSelPointType('drop'));
            props.navigation.navigate('Search', {
                locationType: "drop",
                isSearchDrop: true
            });
        } else {
            dispatch(updatSelPointType('pickup'));
            props.navigation.navigate('Search', {
                locationType: "pickup",
                isSearchDrop: false
            });
        }
    };

    const handleRecentTrips = () => {
        setShowRecentTripsModal(true);
    };

    const handleSelectRecentTrip = (trip) => {
        dispatch(clearTripPoints());

        if (trip.pickup && trip.pickup.lat && trip.pickup.lng) {
            dispatch(updateTripPickup({
                lat: trip.pickup.lat,
                lng: trip.pickup.lng,
                add: trip.pickup.add || 'Pickup Location',
                source: 'recent_trip'
            }));
        }

        if (trip.drop && trip.drop.lat && trip.drop.lng) {
            dispatch(updateTripDrop({
                lat: trip.drop.lat,
                lng: trip.drop.lng,
                add: trip.drop.add || 'Drop Location',
                source: 'recent_trip'
            }));
        }

        setShowRecentTripsModal(false);
        setShowInitialScreen(false);
    };

    const renderRecentTripItem = (trip, index) => {
        return (
            <TouchableOpacity
                key={index}
                style={[styles.recentTripCard, {
                    backgroundColor: mode === 'dark' ? '#1C1C1E' : colors.WHITE,
                    borderLeftColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR
                }]}
                onPress={() => handleSelectRecentTrip(trip)}
                activeOpacity={0.7}
            >
                <View style={styles.tripRouteContainer}>
                    <View style={styles.routePointContainer}>
                        <View style={[styles.routeIconContainer, { backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}>
                            <Icon name="location-on" type="material" size={10} color={colors.WHITE} />
                        </View>
                        <Text style={[styles.routeAddress, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]} numberOfLines={1}>
                            {trip.pickup?.add || 'Pickup Location'}
                        </Text>
                    </View>

                    <View style={[styles.routeConnector, { backgroundColor: mode === 'dark' ? colors.WHITE + '30' : colors.SHADOW + '30' }]} />

                    <View style={styles.routePointContainer}>
                        <View style={[styles.routeIconContainer, { backgroundColor: colors.RED }]}>
                            <Icon name="location-on" type="material" size={10} color={colors.WHITE} />
                        </View>
                        <Text style={[styles.routeAddress, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]} numberOfLines={1}>
                            {trip.drop?.add || 'Drop Location'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderRecentTripsContent = () => (
        <ScrollView
            style={styles.recentTripsScrollView}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
        >
            <View style={styles.recentTripsContent}>
                {recentTrips.length > 0 ? (
                    recentTrips.map((trip, index) => renderRecentTripItem(trip, index))
                ) : (
                    <View style={styles.emptyTripsContainer}>
                        <Text style={[styles.emptyTripsText, { color: colors.SHADOW }]}>
                            {t('no_recent_trips_available')}
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );

    const handleWallet = () => {
        props.navigation.navigate('WalletDetails');
    };

    const handleRechargeWallet = () => {
        props.navigation.navigate('addMoney', {
            userdata: auth?.profile,
            providers: providers
        });
    };

    const handleWhatsAppSupport = () => {
        Linking.openURL('https://wa.me/573165627092');
    };

    const handleQuickBooking = (carTypeName) => {
        if (!isInZone) {
            try { setOutOfZoneDialog(true); } catch (e) { }
            return;
        }
        dispatch(clearTripPoints());

        const filteredCars = getFilteredCarTypesWithZonePrices();
        if (filteredCars.length > 0) {
            const selectedCar = filteredCars.find(car => car.name === carTypeName) || filteredCars[0];
            dispatch(updateTripCar(selectedCar));
        }

        if (gps && gps.location && gps.location.lat && gps.location.lng) {
            dispatch(updateTripPickup({
                lat: gps.location.lat,
                lng: gps.location.lng,
                add: currentLocation || 'Current Location',
                source: 'gps'
            }));
        }

        dispatch(updatSelPointType('drop'));
        setShowInitialScreen(false);
    };

    const handleAddressSelect = (address) => {
        if (!address || !address.lat || !address.lng) {
            console.warn('Address missing coordinates:', address);
            return;
        }

        if (zonesdata.zones && zonesdata.zones.length > 0) {
            const addressZone = detectZoneByLocation(address.lat, address.lng, zonesdata.zones);

            if (!addressZone) {
                Alert.alert(
                    t('out_of_zone_title') || 'Fuera de Zona de Servicio',
                    t('out_of_zone_message') || 'Esta dirección está fuera de nuestra zona de servicio.',
                    [{ text: t('ok') || 'OK' }]
                );
                return;
            }

            const hasValidGeometry = addressZone.geometry &&
                ((addressZone.geometry.type === 'polygon' && addressZone.geometry.coordinates && addressZone.geometry.coordinates.length > 0) ||
                    (addressZone.geometry.type === 'circle' && addressZone.geometry.center && addressZone.geometry.radius));

            if (!hasValidGeometry && !addressZone.isDefault) {
                Alert.alert(
                    t('out_of_zone_title') || 'Fuera de Zona de Servicio',
                    t('out_of_zone_message') || 'Esta dirección está fuera de nuestra zona de servicio.',
                    [{ text: t('ok') || 'OK' }]
                );
                return;
            }
        }

        dispatch(clearTripPoints());

        if (gps && gps.location && gps.location.lat && gps.location.lng) {
            dispatch(updateTripPickup({
                lat: gps.location.lat,
                lng: gps.location.lng,
                add: currentLocation || 'Current Location',
                source: 'gps'
            }));
        }

        dispatch(updateTripDrop({
            lat: address.lat,
            lng: address.lng,
            add: address.description || address.name,
            source: 'predefined'
        }));

        dispatch(updatSelPointType('drop'));
        setShowInitialScreen(false);
    };

    const updateCurrentLocation = async (pos) => {
        if (!pos || !pos.latitude || !pos.longitude) {
            console.warn('Invalid position data:', pos);
            setLoadingLocation(false);
            return;
        }

        setLoadingLocation(true);

        let latlng = pos.latitude + "," + pos.longitude;
        let res = '';
        let found = false;
        let storedAddresses = [];

        try {
            const value = addresses;
            if (value !== null) {
                storedAddresses = Array.isArray(value) ? value : JSON.parse(value);
                for (let i = 0; i < storedAddresses.length; i++) {
                    if (storedAddresses[i] && storedAddresses[i].lat && storedAddresses[i].lng) {
                        let distance = GetDistance(pos.latitude, pos.longitude, storedAddresses[i].lat, storedAddresses[i].lng);
                        if (distance < 0.08) {
                            res = storedAddresses[i].description;
                            found = true;
                            break;
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('Error parsing addresses:', error);
            found = false;
        }

        if (found) {
            setCurrentLocation(res);
            if (!tripdata.pickup?.add || tripdata.pickup?.source === 'gps') {
                dispatch(updateTripPickup({
                    lat: pos.latitude,
                    lng: pos.longitude,
                    add: res,
                    source: 'gps'
                }));
            }
            setLoadingLocation(false);
        } else {
            fetchAddressfromCoords(latlng).then((add) => {
                if (add) {
                    storedAddresses.push({
                        lat: pos.latitude,
                        lng: pos.longitude,
                        description: add
                    });
                    storeAddresses(storedAddresses);
                    setCurrentLocation(add);
                    if (!tripdata.pickup?.add || tripdata.pickup?.source === 'gps') {
                        dispatch(updateTripPickup({
                            lat: pos.latitude,
                            lng: pos.longitude,
                            add: add,
                            source: 'gps'
                        }));
                    }
                }
                setLoadingLocation(false);
            }).catch((error) => {
                console.warn('Error fetching address:', error);
                setLoadingLocation(false);
            });
        }
    };

    const locationWatcherRef = useRef(null);

    const locateUser = async () => {
        setLoadingLocation(true);
        try {
            const permission = await Location.getForegroundPermissionsAsync();
            let status = permission.status;

            if (status !== 'granted') {
                const requestResult = await Location.requestForegroundPermissionsAsync();
                status = requestResult.status;
            }

            if (status !== 'granted') {
                setLoadingLocation(false);
                setShowLocationPermissionDialog(true);
                return;
            }

            let location = null;
            try {
                location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Highest
                });
            } catch (highAccuracyError) {
                console.warn('High accuracy location failed:', highAccuracyError);
                location = await Location.getLastKnownPositionAsync();
            }

            if (location?.coords?.latitude && location?.coords?.longitude) {
                dispatch({
                    type: 'UPDATE_GPS_LOCATION',
                    payload: {
                        lat: location.coords.latitude,
                        lng: location.coords.longitude
                    }
                });
                updateCurrentLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
            } else {
                setLoadingLocation(false);
            }
        } catch (error) {
            console.warn('Error getting location:', error);
            setLoadingLocation(false);
        }
    };

    useEffect(() => {
        return () => {
            if (locationWatcherRef.current) {
                locationWatcherRef.current.remove();
                locationWatcherRef.current = null;
            }
        };
    }, []);

    const handleHomeTrip = () => {
        const homeAddress = savedAddresses.find(addr => addr.name?.toLowerCase() === t('home').toLowerCase());
        if (homeAddress) {
            setShowInitialScreen(false);
            dispatch(updateTripDrop({
                lat: homeAddress.lat,
                lng: homeAddress.lng,
                add: homeAddress.description,
                source: 'predefined'
            }));
            dispatch(updatSelPointType('pickup'));
        }
    };

    const handleWorkTrip = () => {
        const workAddress = savedAddresses.find(addr => addr.name?.toLowerCase() === t('work').toLowerCase());
        if (workAddress) {
            setShowInitialScreen(false);
            dispatch(updateTripDrop({
                lat: workAddress.lat,
                lng: workAddress.lng,
                add: workAddress.description,
                source: 'predefined'
            }));
            dispatch(updatSelPointType('pickup'));
        }
    };

    const handleAddAddress = () => {
        props.navigation.navigate('Search', { locationType: "drop" });
    };

    const hasHomeAddress = savedAddresses.some(addr => addr.name?.toLowerCase() === t('home').toLowerCase());
    const hasWorkAddress = savedAddresses.some(addr => addr.name?.toLowerCase() === t('work').toLowerCase());

    const onPressBook = async () => {
        if (!validateErrandForm()) {
            return;
        }
        if (parseFloat(profile.walletBalance) >= 0) {
            setCheckType(true);
            setBookLoading(true);
            if (!(profile.mobile && profile.mobile.length > 6)) {
                Alert.alert(t('alert'), t('mobile_need_update'));
                props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Profile', params: { fromPage: 'Map' } }] }));
                setBookLoading(false);
            } else {
                if ((settings && settings.imageIdApproval && auth.profile.verifyId && auth.profile.verifyIdImage) || (settings && !settings.imageIdApproval)) {
                    if (auth.profile.approved) {
                        if (tripdata.pickup && tripdata.drop && tripdata.drop.add) {
                            if (!tripdata.carType) {
                                setBookLoading(false);
                                setShowCarTypesExpanded(true);
                            } else {
                                let driver_available = false;
                                for (let i = 0; i < allCarTypes.length; i++) {
                                    let car = allCarTypes[i];
                                    if (car.name == tripdata.carType.name && car.minTime) {
                                        driver_available = true;
                                        break;
                                    }
                                }
                                if (driver_available) {
                                    setBookingDate(null);
                                    setBookingType(false);
                                    setShouldRequestEstimate(true);
                                    if (serviceType !== ERRAND_SERVICE_TYPE && appConsts.hasOptions &&
                                        (tripdata?.carType?.options?.length > 0 || tripdata?.carType?.parcelTypes?.length > 0)) {
                                        setOptionModalStatus(true);
                                        setBookLaterLoading(false);
                                    } else {
                                        let tripdataWithZonePrices = { ...tripdata, currentZoneId: currentZone?.id || null };
                                        if (currentZone && currentZone.id && tripdata.carType) {
                                            tripdataWithZonePrices.carType = getCarTypeWithZonePrices(tripdata.carType, currentZone.id);
                                        }
                                        let result = await prepareEstimateObject(tripdataWithZonePrices, instructionData, serviceType, normalizedErrand, radioProps[payment_mode]?.cat || 'cash');
                                        if (result.error) {
                                            setBookLoading(false);
                                            Alert.alert(t('alert'), result.msg);
                                        } else {
                                            setShouldOpenBookingModal(true);
                                            dispatch(getEstimate((await result).estimateObject));
                                        }
                                    }
                                } else {
                                    Alert.alert(t('alert'), t('no_driver_found_alert_messege'));
                                    setBookLoading(false);
                                }
                            }
                        } else {
                            Alert.alert(t('alert'), t('drop_location_blank_error'));
                            setBookLoading(false);
                        }
                    } else {
                        Alert.alert(t('alert'), t('admin_contact'));
                        setBookLoading(false);
                    }
                } else {
                    Alert.alert(
                        t('alert'),
                        t('verifyid_error'),
                        [
                            { text: t('cancel'), onPress: () => { setBookLoading(true) }, style: 'cancel' },
                            {
                                text: t('ok'), onPress: () =>
                                    props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'editUser', params: { fromPage: 'Map' } }] }))
                            }
                        ],
                        { cancelable: false }
                    );
                }
            }
        } else {
            Alert.alert(
                t('alert'),
                t('wallet_balance_low')
            );
        }
    }


    const onPressBookLater = () => {
        if (!validateErrandForm()) {
            return;
        }
        setCheckType(false);
        if (parseFloat(profile.walletBalance) >= 0) {
            if (!(profile.mobile && profile.mobile.length > 6)) {
                Alert.alert(t('alert'), t('mobile_need_update'));
                props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Profile', params: { fromPage: 'Map' } }] }));
            } else {
                if ((settings && settings.imageIdApproval && auth.profile.verifyId && auth.profile.verifyIdImage) || (settings && !settings.imageIdApproval)) {
                    if (auth.profile.approved) {
                        if (tripdata.pickup && tripdata.drop && tripdata.drop.add) {
                            if (tripdata.carType) {
                                setInitDate(new Date());
                                setDatePickerOpen(true);
                            } else {
                                setShowCarTypesExpanded(true);
                            }
                        } else {
                            Alert.alert(t('alert'), t('drop_location_blank_error'))
                        }
                    } else {
                        Alert.alert(t('alert'), t('admin_contact'))
                    }
                } else {
                    Alert.alert(
                        t('alert'),
                        t('verifyid_error'),
                        [
                            { text: t('cancel'), onPress: () => { }, style: 'cancel' },
                            {
                                text: t('ok'), onPress: () =>
                                    props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'editUser', params: { fromPage: 'Map' } }] }))
                            }
                        ],
                        { cancelable: false }
                    );
                }
            }
        } else {
            Alert.alert(
                t('alert'),
                t('wallet_balance_low')
            );
        }
    }

    const hideDatePicker = () => {
        setDatePickerOpen(false);
    };

    const handleDateConfirm = (date) => {
        setInitDate(date);
        setDatePickerOpen(false);
        setBookLaterLoading(true);
        setTimeout(async () => {
            let date1;
            try {
                let res = await fetch(`https://${config.projectId}.web.app/getservertime`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
                const json = await res.json();
                if (json.time) {
                    date1 = json.time;
                } else {
                    date1 = new Date().getTime();
                }
            } catch (err) {
                date1 = new Date().getTime();
            }

            const date2 = new Date(date);
            const diffTime = date2 - date1;
            const diffMins = diffTime / (1000 * 60);

            if (diffMins < 15) {
                setBookLaterLoading(false);
                Alert.alert(
                    t('alert'),
                    t('past_booking_error'),
                    [
                        { text: t('ok'), onPress: () => { } }
                    ],
                    { cancelable: true }
                );
            } else {
                setBookingDate(date);
                setBookingType(true);
                setShouldRequestEstimate(true);
                if (serviceType !== ERRAND_SERVICE_TYPE && appConsts.hasOptions) {
                    setOptionModalStatus(true);
                    setBookLaterLoading(false);
                } else {
                    let tripdataWithZonePrices = { ...tripdata, currentZoneId: currentZone?.id || null };
                    if (currentZone && currentZone.id && tripdata.carType) {
                        tripdataWithZonePrices.carType = getCarTypeWithZonePrices(tripdata.carType, currentZone.id);
                    }
                    let result = await prepareEstimateObject(tripdataWithZonePrices, instructionData, serviceType, normalizedErrand, radioProps[payment_mode]?.cat || 'cash');
                    if (result.error) {
                        setBookLoading(false);
                        Alert.alert(t('alert'), result.msg);
                    } else {
                        setShouldOpenBookingModal(true);
                        dispatch(getEstimate((await result).estimateObject));
                    }
                }
            }
        }, 1000);

    };


    const handleGetEstimate = async () => {
        if (!validateErrandForm()) {
            setBookLoading(false);
            setBookLaterLoading(false);
            return;
        }
        if (checkType) {
            setBookLoading(true);
        } else {
            setBookLaterLoading(true);
        }
        setOptionModalStatus(false);
        setShouldRequestEstimate(true);
        let tripdataWithZonePrices = { ...tripdata, currentZoneId: currentZone?.id || null };
        if (currentZone && currentZone.id && tripdata.carType) {
            tripdataWithZonePrices.carType = getCarTypeWithZonePrices(tripdata.carType, currentZone.id);
        }
        let result = await prepareEstimateObject(tripdataWithZonePrices, instructionData, serviceType, normalizedErrand, radioProps[payment_mode]?.cat || 'cash');
        if (result.error) {
            setBookLoading(false);
            Alert.alert(t('alert'), result.msg);
        } else {
            setShouldOpenBookingModal(true);
            dispatch(getEstimate(result.estimateObject));
        }
    }

    const handleParcelTypeSelection = (value) => {
        setInstructionData({
            ...instructionData,
            parcelTypeIndex: value,
            parcelTypeSelected: tripdata.carType.parcelTypes[value]
        });
    }

    const handleOptionSelection = (value) => {
        setInstructionData({
            ...instructionData,
            optionIndex: value,
            optionSelected: tripdata.carType.options[value]
        });
    }

    const onModalCancel = () => {
        setInstructionData(instructionInitData);
        setErrandData(errandInitData);
        setServiceType(RIDE_SERVICE_TYPE);
        setTripInstructions("");
        setOfferFare(0)
        setRoundTrip(false);
        dispatch(updateTripCar(null));
        setBookingModalStatus(false);
        setOptionModalStatus(false);
        resetActiveCar();
        setBookLoading(false);
        setBookLaterLoading(false);
        dispatch(clearEstimate());
        setBookModelLoading(false);
    }

    const finaliseBooking = (bookingData) => {
        dispatch(addBooking(bookingData));
        setInstructionData(instructionInitData);
        setErrandData(errandInitData);
        setServiceType(RIDE_SERVICE_TYPE);
        setBookingModalStatus(false);
        setOptionModalStatus(false);
        resetCars();
        setTripInstructions("");
        setOfferFare(0)
        setRoundTrip(false);
        resetCars();
    }

    const bookNow = async () => {
        setBookModelLoading(true);
        let wallet_balance = profile.walletBalance;
        const selectedPaymentCategory = radioProps[payment_mode]?.cat || 'cash';
        const bookingChargeAmount = serviceType === ERRAND_SERVICE_TYPE
            ? (estimatedata?.estimate?.upfrontOnlineAmount || estimatedata?.estimate?.customerTotal || estimatedata?.estimate?.estimateFare || 0)
            : (estimatedata?.estimate?.estimateFare || 0);
        let notfound = true;
        if (activeBookings) {
            for (let i = 0; i < activeBookings.length; i++) {
                if (activeBookings[i].payment_mode === 'wallet' && activeBookings[i].status !== 'PAID') {
                    notfound = false;
                    break;
                }
            }
        }
        const regx1 = /([0-9\s-]{7,})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/;
        if ((otherPerson && /\S/.test(instructionData.otherPerson) && regx1.test(instructionData.otherPersonPhone) && instructionData.otherPersonPhone && instructionData.otherPersonPhone.length > 6) || !otherPerson) {
            if ((offerFare > 0 && offerFare >= parseFloat(minimumPrice)) || offerFare == 0) {
                if ((selectedPaymentCategory === 'wallet' && notfound) || selectedPaymentCategory !== 'wallet') {
                    if ((selectedPaymentCategory === 'wallet' && (parseFloat(wallet_balance) >= parseFloat(bookingChargeAmount)) && appConsts.checkWallet) || selectedPaymentCategory !== 'wallet' || (selectedPaymentCategory === 'wallet' && !appConsts.checkWallet)) {
                        const addBookingObj = {
                            pickup: estimatedata.estimate.pickup,
                            drop: estimatedata.estimate.drop,
                            carDetails: estimatedata.estimate.carDetails,
                            userDetails: auth.profile,
                            estimate: estimatedata.estimate,
                            tripdate: bookingType ? new Date(bookingDate).getTime() : new Date().getTime(),
                            bookLater: bookingType,
                            settings: settings,
                            booking_type_admin: false,
                            booking_type_fleetadmin: false,
                            deliveryWithBid: serviceType === ERRAND_SERVICE_TYPE ? false : (deliveryWithBid ? deliveryWithBid : false),
                            payment_mode: selectedPaymentCategory,
                            customer_offer: serviceType === ERRAND_SERVICE_TYPE ? 0 : offerFare,
                            serviceType: serviceType,
                            errand: serviceType === ERRAND_SERVICE_TYPE ? {
                                ...normalizedErrand,
                                searchArea: normalizedErrand.requiresSearch && estimatedata.estimate.pickup ? {
                                    lat: estimatedata.estimate.pickup.coords ? estimatedata.estimate.pickup.coords.lat : estimatedata.estimate.pickup.lat,
                                    lng: estimatedata.estimate.pickup.coords ? estimatedata.estimate.pickup.coords.lng : estimatedata.estimate.pickup.lng,
                                    add: estimatedata.estimate.pickup.description || estimatedata.estimate.pickup.add
                                } : null
                            } : null
                        };
                        if (auth && auth.profile && auth.profile.firstName && auth.profile.firstName.length > 0 && auth.profile.lastName && auth.profile.lastName.length > 0 && auth.profile.email && auth.profile.email.length > 0) {
                            const result = await validateBookingObj(t, addBookingObj, instructionData, settings, bookingType, roundTrip, tripInstructions, tripdata, drivers, otherPerson, offerFare, serviceType, normalizedErrand);
                            if (result.error) {
                                Alert.alert(
                                    t('alert'),
                                    result.msg,
                                    [
                                        { text: t('ok'), onPress: () => { setBookModelLoading(false) } }
                                    ],
                                    { cancelable: true }
                                );
                            } else {
                                finaliseBooking(result.addBookingObj);
                            }
                        } else {
                            setBookModelLoading(true);
                            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                            if (/\S/.test(profileData.firstName) && /\S/.test(profileData.lastName) && auth) {
                                const userData = {
                                    firstName: profileData.firstName,
                                    lastName: profileData.lastName
                                }
                                if (auth.profile.email) {
                                    const result = await validateBookingObj(t, addBookingObj, instructionData, settings, bookingType, roundTrip, tripInstructions, tripdata, drivers, otherPerson, offerFare, serviceType, normalizedErrand);
                                    let bookingData = result.addBookingObj;
                                    bookingData.userDetails.firstName = profileData.firstName;
                                    bookingData.userDetails.lastName = profileData.lastName;
                                    setBookingOnWait(bookingData);
                                    setTimeout(() => {
                                        dispatch(updateProfile(userData));
                                    }, 200)
                                } else {
                                    if (re.test(profileData.email)) {
                                        checkUserExists({ email: profileData.email }).then(async (res) => {
                                            if (res.users && res.users.length > 0) {
                                                Alert.alert(t('alert'), t('user_exists'));
                                                setBookModelLoading(false);
                                            } else if (res.error) {
                                                Alert.alert(t('alert'), t('email_or_mobile_issue'));
                                                setBookModelLoading(false);
                                            } else {
                                                const result = await validateBookingObj(t, addBookingObj, instructionData, settings, bookingType, roundTrip, tripInstructions, tripdata, drivers, otherPerson, offerFare, serviceType, normalizedErrand);
                                                if (result.error) {
                                                    Alert.alert(
                                                        t('alert'),
                                                        result.msg,
                                                        [
                                                            { text: t('ok'), onPress: () => { setBookModelLoading(false) } }
                                                        ],
                                                        { cancelable: true }
                                                    );
                                                } else {
                                                    profileData['uid'] = auth.profile.uid;
                                                    let bookingData = result.addBookingObj;
                                                    bookingData.userDetails.firstName = profileData.firstName;
                                                    bookingData.userDetails.lastName = profileData.lastName;
                                                    bookingData.userDetails.email = profileData.email;
                                                    setBookingOnWait(bookingData);
                                                    setTimeout(() => {
                                                        dispatch(updateProfileWithEmail(profileData));
                                                    }, 200)
                                                }
                                            }
                                        });
                                    } else {
                                        Alert.alert(t('alert'), t('proper_email'));
                                        setBookModelLoading(false);
                                    }
                                }
                            } else {
                                Alert.alert(t('alert'), t('proper_input_name'));
                                setBookModelLoading(false);
                            }
                        }
                    } else {
                        Alert.alert(
                            t('alert'),
                            t('wallet_balance_low')
                        );
                        setBookModelLoading(false);
                    }
                } else {
                    Alert.alert(
                        t('alert'),
                        t('wallet_booking_alert')
                    );
                    setBookModelLoading(false);
                }
            } else {
                Alert.alert(
                    t('alert'),
                    t('offer_price_greter_minimum_price')
                );
                setBookModelLoading(false);
            }
        } else {
            Alert.alert(t('alert'), t('otherPersonDetailMissing'));
            setBookModelLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            pageActive.current = true;
            dispatch(fetchDrivers('app'));
            if (intVal.current == 0) {
                intVal.current = setInterval(() => {
                    dispatch(fetchDrivers('app'));
                }, 30000);
            }
        });
        return unsubscribe;
    }, [props.navigation, intVal.current]);

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('blur', () => {
            pageActive.current = false;
            intVal.current ? clearInterval(intVal.current) : null;
            intVal.current = 0;
        });
        return unsubscribe;
    }, [props.navigation, intVal.current]);

    useEffect(() => {
        pageActive.current = true;
        const interval = setInterval(() => {
            dispatch(fetchDrivers('app'));
        }, 30000);
        intVal.current = interval;
        return () => {
            clearInterval(interval);
            intVal.current = 0;
        };
    }, []);

    const changePermission = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status != 'granted') {
            if (Platform.OS == 'ios') {
                Linking.openSettings()
            } else {
                startActivityAsync(ActivityAction.LOCATION_SOURCE_SETTINGS);
            }
        }
    }
    const onTermAccept = () => {
        if (checkTerm == false) {
            dispatch(updateProfile({ term: true }));
            setCheckTerm(true);
            setShowTermsDialog(false);
        }
    }
    const onTermLink = async () => {
        Linking.openURL(settings.CompanyTermCondition).catch(err => console.error("Couldn't load page", err));
    }

    const onSocialSecurityNavigate = () => {
        props.navigation.navigate('Profile');
    }

    const needsSocialSecurity = () => {
        if (!settings || !settings.socialSecurityRequired) return false;
        const hasSocialSecurity = auth.profile.socialSecurity && auth.profile.socialSecurity.trim() !== '';
        const shouldShowForDriver = auth.profile.usertype === 'driver' && settings.showSocialSecurityDrivers;
        const shouldShowForRider = auth.profile.usertype === 'customer' && settings.showSocialSecurityRiders;
        return (shouldShowForDriver || shouldShowForRider) && !hasSocialSecurity;
    }

    const exitMapSelection = () => {
        setSelectFromMap(false);
        setMapSelectionType(null);
        setIsResolvingTapAddress(false);
        props.navigation.navigate('TabRoot', { screen: 'Home' });
    }

    const onMapSelectComplete = () => {
        if ((tripdata.pickup && tripdata.pickup.source == 'mapSelect') || (tripdata.drop && tripdata.drop.source == 'mapSelect')) {
            if (tripdata.selected === 'pickup') {
                dispatch(updateTripPickup({ ...tripdata.pickup, source: "region-change" }))
            } else {
                dispatch(updateTripDrop({ ...tripdata.drop, source: "region-change" }))
            }
        }
        if (selectFromMap && mapSelectionType) {
            if (mapSelectionType === 'pickup') {
                dispatch(updateTripPickup({ ...tripdata.pickup, source: "region-change" }))
            } else if (mapSelectionType === 'drop') {
                dispatch(updateTripDrop({ ...tripdata.drop, source: "region-change" }))
            }
            exitMapSelection();
        }
    }

    const noServiceInZone = showInitialScreen && currentZone && (cars != null) && (cars.length === 0 || getFilteredCarTypesWithZonePrices().length === 0);

    useEffect(() => {
        if (!noServiceInZone) {
            setNoServiceInZoneDialogDismissed(false);
        }
    }, [noServiceInZone]);

    return (
        <View style={styles.container}>
            <WaygoDialog
                visible={noServiceInZone && !noServiceInZoneDialogDismissed}
                onClose={() => setNoServiceInZoneDialogDismissed(true)}
                title={t('no_service_in_zone_title') || 'Sin servicio'}
                message={t('no_service_in_zone') || 'No hay servicio en tu zona'}
                type="info"
            />
            {!showInitialScreen ? (
                <View style={styles.mapcontainer}>
                    {region && region.latitude && pageActive.current ?
                        <MapView
                            ref={mapRef}
                            provider={PROVIDER_GOOGLE}
                            showsUserLocation={true}
                            loadingEnabled
                            showsMyLocationButton={false}
                            style={styles.mapViewStyle}
                            initialRegion={region}
                            onRegionChangeComplete={onRegionChangeComplete}
                            onPress={selectFromMap && mapSelectionType ? handleMapPress : undefined}
                            onPanDrag={() => setDragging(30)}
                            minZoomLevel={11}
                            maxZoomLevel={20}
                            zoomEnabled={true}
                            scrollEnabled={true}
                            pitchEnabled={true}
                            rotateEnabled={true}
                            customMapStyle={mode === 'dark' ? customMapStyle : []}
                        >
                            {freeCars ? freeCars.map((item, index) => {
                                return (
                                    <Marker.Animated
                                        coordinate={{ latitude: item.location ? item.location.lat : 0.00, longitude: item.location ? item.location.lng : 0.00 }}
                                        key={index}
                                    >
                                        <Image
                                            key={index}
                                            source={settings && settings.carType_required && item.carImage ? { uri: item.carImage } : require('../../assets/images/microBlackCar.png')}
                                            style={{ height: 35, width: 35, resizeMode: 'contain' }}
                                        />
                                    </Marker.Animated>

                                )
                            })
                                : null}
                            {routeCoords && routeCoords.length > 0 && (
                                <Polyline
                                    coordinates={routeCoords}
                                    strokeWidth={5}
                                    strokeColor={colors.BLUE}
                                />
                            )}
                            {tripdata.pickup && tripdata.pickup.lat && routeCoords && routeCoords.length > 0 && (
                                <Marker
                                    coordinate={{ latitude: tripdata.pickup.lat, longitude: tripdata.pickup.lng }}
                                    title={tripdata.pickup.add}
                                >
                                    <Image source={require('../../assets/images/green_pin.png')} style={{ height: 35, width: 35 }} />
                                </Marker>
                            )}
                            {tripdata.drop && tripdata.drop.lat && routeCoords && routeCoords.length > 0 && (
                                <Marker
                                    coordinate={{ latitude: tripdata.drop.lat, longitude: tripdata.drop.lng }}
                                    title={tripdata.drop.add}
                                >
                                    <Image source={require('../../assets/images/rsz_2red_pin.png')} style={{ height: 35, width: 35 }} />
                                </Marker>
                            )}
                            {selectFromMap && mapSelectionType === 'pickup' && tripdata.pickup && tripdata.pickup.lat && (
                                <Marker
                                    coordinate={{ latitude: tripdata.pickup.lat, longitude: tripdata.pickup.lng }}
                                    title={tripdata.pickup.add}
                                >
                                    <Image source={require('../../assets/images/green_pin.png')} style={{ height: 35, width: 35 }} />
                                </Marker>
                            )}
                            {selectFromMap && mapSelectionType === 'drop' && tripdata.drop && tripdata.drop.lat && (
                                <Marker
                                    coordinate={{ latitude: tripdata.drop.lat, longitude: tripdata.drop.lng }}
                                    title={tripdata.drop.add}
                                >
                                    <Image source={require('../../assets/images/rsz_2red_pin.png')} style={{ height: 35, width: 35 }} />
                                </Marker>
                            )}
                        </MapView>
                        : null}
                    {region && !selectFromMap && (!routeCoords || routeCoords.length === 0) ?
                        tripdata.selected == 'pickup' ?
                            <View pointerEvents="none" style={styles.mapFloatingPinView}>
                                <Image pointerEvents="none" style={[styles.mapFloatingPin, { marginBottom: Platform.OS == 'ios' ? (hasNotch ? (-10 + dragging) : 33) : 40 }]} resizeMode="contain" source={require('../../assets/images/green_pin.png')} />
                            </View>
                            :
                            <View pointerEvents="none" style={styles.mapFloatingPinView}>
                                <Image pointerEvents="none" style={[styles.mapFloatingPin, { marginBottom: Platform.OS == 'ios' ? (hasNotch ? (-10 + dragging) : 33) : 40 }]} resizeMode="contain" source={require('../../assets/images/rsz_2red_pin.png')} />
                            </View>
                        : null}
                    {!showInitialScreen && selectFromMap && isResolvingTapAddress ? (
                        <View style={styles.mapResolvingAddress}>
                            <ActivityIndicator color={colors.WHITE} size="small" />
                            <Text style={styles.mapResolvingAddressText}>{t('loading')}</Text>
                        </View>
                    ) : null}
                    {(!(tripdata.pickup && tripdata.pickup.source == 'mapSelect')) ? tripdata.selected == 'pickup' ?
                        <View style={[styles.locationButtonView, {
                            bottom: settings && settings.horizontal_view ? 180 : isEditing ?
                                allCarTypes && allCarTypes.length > 0 ?
                                    allCarTypes.length == 1 ?
                                        110
                                        :
                                        allCarTypes.length == 2 ?
                                            185
                                            :
                                            260
                                    :
                                    95
                                : 40
                        }]}>
                            <TouchableOpacity onPress={locateUser} style={[styles.locateButtonStyle, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND }]}>
                                <Icon
                                    name='gps-fixed'
                                    color={colors.SHADOW}
                                    size={26}
                                />
                            </TouchableOpacity>
                        </View>
                        : null : null}
                    {locationRejected ?
                        <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontFamily: fonts.Regular }} >{t('location_permission_error')}</Text>
                        </View>
                        : null}
                </View>
            ) : null}


            <View style={styles.menuIcon}>
                <ImageBackground source={mode === 'dark' ? require('../../assets/images/black-grad6.png') : require('../../assets/images/white-grad6.png')} style={{ height: '100%', width: '100%' }}>
                    <View style={[styles.backHeaderContainer, { marginTop: Platform.OS == 'android' ? (__DEV__ ? 20 : 40) : (hasNotch ? 48 : 20) }]}>
                        <View style={[styles.headerTop, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            {!showInitialScreen ? (
                                <TouchableOpacity onPress={() => {
                                    if (selectFromMap && mapSelectionType) {
                                        exitMapSelection();
                                    } else {
                                        setShowInitialScreen(true);
                                        setRouteCoords([]);
                                        setHasAutoFitted(false);
                                        dispatch(clearTripPoints());
                                        dispatch(clearEstimate());
                                    }
                                }} style={styles.backButton}>
                                    <Icon
                                        name="arrow-back"
                                        type="ionicon"
                                        size={24}
                                        color={mode === 'dark' ? colors.WHITE : colors.BLACK}
                                    />
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.backButton} />
                            )}
                        </View>
                    </View>
                </ImageBackground>
            </View>

            {!showInitialScreen && (gps.error || (!checkTerm && settings.term_required) || (!auth.profile.approved) || needsSocialSecurity()) ?
                <View style={{
                    position: 'absolute',
                    width: width - 20,
                    margin: 10,
                    borderRadius: 8,
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.75,
                    shadowRadius: 4,
                    elevation: 5,
                    justifyContent: 'space-evenly',
                    top: Platform.OS == 'android' ? (__DEV__ ? 65 : 65) : (hasNotch ? 85 : 80),
                    height: 10 +
                        (gps.error ? 70 : 0) +
                        (!checkTerm && settings.term_required ? 70 : 0) +
                        (!auth.profile.approved ? 70 : 0) +
                        (needsSocialSecurity() ? 70 : 0)
                }}>
                    {gps.error ?
                        <View style={[styles.alrt, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <View style={[styles.alrt1, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                <Icon name="alert-circle" type="ionicon" color={colors.RED} size={18} />
                                <Text style={{ fontSize: 14, fontFamily: fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK, marginLeft: 3 }}>{t('allow_only')}</Text>
                            </View>
                            <Button
                                btnClick={changePermission}
                                title={t('fix')}
                                loading={false}
                                loadingColor={{ color: colors.WHITE }}
                                buttonStyle={styles.checkButtonTitle}
                                style={styles.checkButtonStyle}
                            />
                        </View>
                        : null}
                    {!checkTerm && settings.term_required && term ?
                        <View style={[styles.alrt, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <TouchableOpacity onPress={onTermLink} style={[styles.alrt1, { flexDirection: isRTL ? 'row-reverse' : 'row', width: width - 180, height: 50 }]}>
                                <Icon name="document-text" type="ionicon" color={colors.RED} size={18} />
                                <Text style={{ fontSize: 14, fontFamily: fonts.Bold, color: colors.BLUE, marginLeft: 3, textDecorationLine: 'underline' }}>{t('term_condition')}</Text>
                            </TouchableOpacity>
                            <Button
                                btnClick={onTermAccept}
                                loading={false}
                                loadingColor={{ color: colors.WHITE }}
                                title={t('accept')}
                                style={styles.checkButtonStyle}
                                buttonStyle={styles.checkButtonTitle}
                            />
                        </View>
                        : null}
                    {needsSocialSecurity() ?
                        <View style={[styles.alrt, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <TouchableOpacity onPress={onSocialSecurityNavigate} style={[styles.alrt1, { flexDirection: isRTL ? 'row-reverse' : 'row', width: width - 180, height: 50 }]}>
                                <Icon name="card" type="ionicon" color={colors.RED} size={18} />
                                <Text style={{ fontSize: 14, fontFamily: fonts.Bold, color: colors.BLUE, marginLeft: 3, textDecorationLine: 'underline' }}>{t('social_security')}</Text>
                            </TouchableOpacity>
                            <Button
                                btnClick={onSocialSecurityNavigate}
                                loading={false}
                                loadingColor={{ color: colors.WHITE }}
                                title={t('complete') || 'Completar'}
                                style={styles.checkButtonStyle}
                                buttonStyle={styles.checkButtonTitle}
                            />
                        </View>
                        : null}
                    {!auth.profile.approved ?
                        <View style={[styles.alrt, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <View style={[styles.alrt1, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                <Icon name="alert-circle" type="ionicon" color={colors.RED} size={18} />
                                <Text style={{ fontSize: 14, fontFamily: fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK, marginLeft: 3 }}>{t('admin_contact')}</Text>
                            </View>
                        </View>
                        : null}
                </View>
                : null}

            {showInitialScreen ? (
                <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND }]}>
                    <StatusBar
                        translucent
                        backgroundColor="transparent"
                        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
                    />
                    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top - (Platform.OS === 'ios' ? 6 : 0), Platform.OS === 'ios' ? 10 : 16) }]}>
                        <View style={[styles.header]}>
                            <View style={[styles.homeTopRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                <View style={styles.homeLocationBlock}>
                                    <Text style={[styles.homeLocationCaption, { color: mode === 'dark' ? '#B5BCC8' : '#60646C' }]}>
                                        Ubicacion actual
                                    </Text>
                                    <TouchableOpacity
                                        onPress={locateUser}
                                        style={[
                                            styles.homeLocationPill,
                                            { flexDirection: isRTL ? 'row-reverse' : 'row' }
                                        ]}
                                    >
                                        <Text style={[styles.homeLocationValue, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]} numberOfLines={1}>
                                            {displayLocationLabel}
                                        </Text>
                                            {loadingLocation ? (
                                                <ActivityIndicator size="small" color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} />
                                            ) : (
                                                <Icon name="chevron-down" type="ionicon" size={16} color={mode === 'dark' ? '#F27830' : colors.BLACK} />
                                            )}
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity
                                    onPress={() => props.navigation.navigate('Notifications')}
                                    style={[styles.homeIconButton, { backgroundColor: mode === 'dark' ? '#23262B' : colors.WHITE, borderWidth: mode === 'dark' ? 1 : 0, borderColor: mode === 'dark' ? '#2E3238' : 'transparent' }]}
                                >
                                    <Icon
                                        name="notifications-outline"
                                        type="ionicon"
                                        size={20}
                                        color={mode === 'dark' ? '#F27830' : colors.BLACK}
                                    />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                onPress={isInZone ? handleNewTrip : () => setOutOfZoneDialog(true)}
                                style={[styles.homeSearchBar, {
                                    backgroundColor: mode === 'dark' ? '#23262B' : colors.WHITE,
                                    borderWidth: mode === 'dark' ? 1 : 0,
                                    borderColor: mode === 'dark' ? '#2E3238' : 'transparent',
                                    opacity: isInZone ? 1 : 0.5
                                }]}
                            >
                                <Icon
                                    name="search-outline"
                                    type="ionicon"
                                    size={20}
                                    color={mode === 'dark' ? '#F27830' : colors.BLACK}
                                />
                                <Text style={[styles.homeSearchText, { color: mode === 'dark' ? '#E7EAF0' : '#4B5563' }]}>
                                    Que quieres hoy?
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView
                        style={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 110, 132) }]}
                    >
                        {(() => {
                            const filteredCars = getFilteredCarTypesWithZonePrices();

                            if (locationRejected && !currentZone) {
                                return (
                                    <View style={styles.serviceTypesContainer}>
                                        <View style={[styles.serviceTypes, { justifyContent: 'center', alignItems: 'center', minHeight: 150 }]}>
                                            <Icon name="location-off" type="material" size={40} color={colors.SHADOW} />
                                            <Text style={{ fontFamily: fonts.Regular, color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: 'center', marginTop: 10, paddingHorizontal: 20 }}>
                                                {t('location_permission_error')}
                                            </Text>
                                            <TouchableOpacity onPress={() => setShowLocationPermissionDialog(true)} style={{ marginTop: 12 }}>
                                                <Text style={{ fontFamily: fonts.Bold, color: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }}>
                                                    {t('fix') || 'Habilitar'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            }

                            const isLoading = !currentZone || cars == null;
                            const noServiceInZone = !isLoading && (cars.length === 0 || filteredCars.length === 0);
                            const rideCars = getCarTypesForServiceType(RIDE_SERVICE_TYPE);
                            const errandCars = getCarTypesForServiceType(ERRAND_SERVICE_TYPE);
                            const errandsDisabled = settings && settings.enableErrands === false;

                            if (isLoading) {
                                return (
                                    <View style={styles.serviceTypesContainer}>
                                        <View style={[styles.serviceTypes, { justifyContent: 'center', alignItems: 'center', minHeight: 150 }]}>
                                            <ActivityIndicator size="large" color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} />
                                        </View>
                                    </View>
                                );
                            }
                            if (noServiceInZone) {
                                return null;
                            }

                            return (
                                <View style={styles.homeServicesContainer}>
                                    <View style={[styles.serviceShortcutRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <TouchableOpacity
                                            activeOpacity={0.92}
                                            onPress={() => handlePrimaryServiceStart(RIDE_SERVICE_TYPE)}
                                            style={[
                                                styles.serviceShortcutCard,
                                                {
                                                    backgroundColor: mode === 'dark' ? '#23262B' : 'transparent',
                                                    borderWidth: mode === 'dark' ? 1 : 0,
                                                    borderColor: mode === 'dark' ? '#2E3238' : 'transparent'
                                                }
                                            ]}
                                        >
                                            <View style={[styles.serviceShortcutIconWrap, { backgroundColor: mode === 'dark' ? '#33261E' : '#F6C7A5' }]}>
                                                <Image source={require('../../assets/images/taxi.png')} resizeMode="contain" style={styles.serviceShortcutImageRide} />
                                            </View>
                                            <Text style={[styles.serviceShortcutTitle, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>Viajes</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            activeOpacity={0.92}
                                            onPress={() => handlePrimaryServiceStart(ERRAND_SERVICE_TYPE)}
                                            style={[
                                                styles.serviceShortcutCard,
                                                {
                                                    backgroundColor: mode === 'dark' ? '#23262B' : 'transparent',
                                                    borderWidth: mode === 'dark' ? 1 : 0,
                                                    borderColor: mode === 'dark' ? '#2E3238' : 'transparent'
                                                }
                                            ]}
                                        >
                                            <View style={[styles.serviceShortcutIconWrap, { backgroundColor: mode === 'dark' ? '#381D26' : '#F4B8C3' }]}>
                                                <Image source={require('../../assets/images/mandado.png')} resizeMode="contain" style={styles.serviceShortcutImageErrand} />
                                            </View>
                                            <Text style={[styles.serviceShortcutTitle, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>Mandado</Text>
                                            {errandsDisabled ? (
                                                <View style={styles.homeServiceBadge}>
                                                    <Text style={styles.homeServiceBadgeText}>Deshabilitado</Text>
                                                </View>
                                            ) : null}
                                        </TouchableOpacity>
                                    </View>

                                    <View style={[styles.quickActionsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        {[
                                            {
                                                key: 'addresses',
                                                label: 'Direcciones',
                                                icon: 'location-outline',
                                                onPress: handleAddAddress,
                                                backgroundColor: '#D7E8FA',
                                                darkBackgroundColor: '#33261E',
                                                iconColor: '#2F80ED'
                                            },
                                            {
                                                key: 'whatsapp',
                                                label: 'WhatsApp',
                                                icon: 'logo-whatsapp',
                                                onPress: handleWhatsAppSupport,
                                                backgroundColor: '#D8F3E3',
                                                darkBackgroundColor: '#153225',
                                                iconColor: '#25D366'
                                            },
                                            {
                                                key: 'recent',
                                                label: 'Recientes',
                                                icon: 'time-outline',
                                                onPress: handleRecentTrips,
                                                backgroundColor: '#F7E3B8',
                                                darkBackgroundColor: '#362C17',
                                                iconColor: '#F2A93B'
                                            },
                                            {
                                                key: 'wallet',
                                                label: 'Billetera',
                                                icon: 'wallet-outline',
                                                onPress: handleWallet,
                                                backgroundColor: '#F6CDB8',
                                                darkBackgroundColor: '#2D2020',
                                                iconColor: '#F27830'
                                            }
                                        ].map((item) => (
                                            <TouchableOpacity
                                                key={item.key}
                                                style={[
                                                    styles.quickActionCard,
                                                    {
                                                        backgroundColor: mode === 'dark' ? '#23262B' : 'transparent',
                                                        borderWidth: mode === 'dark' ? 1 : 0,
                                                        borderColor: mode === 'dark' ? '#2E3238' : 'transparent'
                                                    }
                                                ]}
                                                onPress={item.onPress}
                                                activeOpacity={0.9}
                                            >
                                                <View style={[styles.quickActionIconWrap, { backgroundColor: mode === 'dark' ? item.darkBackgroundColor : item.backgroundColor }]}>
                                                    <Icon name={item.icon} type="ionicon" size={28} color={mode === 'dark' ? item.iconColor : '#20242B'} />
                                                </View>
                                                <Text style={[styles.quickActionText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]} numberOfLines={1}>
                                                    {item.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <TouchableOpacity
                                        style={[
                                            styles.walletBalanceCard,
                                            {
                                                backgroundColor: mode === 'dark' ? '#23262B' : '#111111',
                                                borderWidth: mode === 'dark' ? 1 : 0,
                                                borderColor: mode === 'dark' ? '#2E3238' : 'transparent',
                                                flexDirection: isRTL ? 'row-reverse' : 'row'
                                            }
                                        ]}
                                        onPress={handleWallet}
                                        activeOpacity={0.92}
                                    >
                                        <View style={styles.walletBalanceLeft}>
                                            <View style={[styles.walletBalanceIcon, { backgroundColor: mode === 'dark' ? '#381D26' : '#F27830' }]}>
                                                <Icon name="wallet-outline" type="ionicon" size={22} color={colors.WHITE} />
                                            </View>
                                            <View style={styles.walletBalanceTextBlock}>
                                                <Text style={[styles.walletBalanceLabel, { color: mode === 'dark' ? '#B5BCC8' : '#F5F7FB' }]}>
                                                    Saldo disponible
                                                </Text>
                                                <Text style={[styles.walletBalanceAmount, { color: colors.WHITE }]}>
                                                    {settings?.swipe_symbol === false
                                                        ? `${settings?.symbol || '$'} ${formatAmount(auth?.profile?.walletBalance || 0, settings?.decimal || 2, settings?.country)}`
                                                        : `${formatAmount(auth?.profile?.walletBalance || 0, settings?.decimal || 2, settings?.country)} ${settings?.symbol || '$'}`}
                                                </Text>
                                            </View>
                                        </View>

                                        <TouchableOpacity
                                            style={[styles.walletRechargeButton, { backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : '#FFFFFF' }]}
                                            onPress={handleRechargeWallet}
                                            activeOpacity={0.9}
                                        >
                                            <Text style={[styles.walletRechargeText, { color: mode === 'dark' ? colors.WHITE : '#111111' }]}>
                                                Recargar
                                            </Text>
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                </View>
                            );
                        })()}

                        {(gps.error || (!checkTerm && settings.term_required) || (!auth.profile.approved) || needsSocialSecurity()) && (
                            <View style={{ width: '100%', marginTop: 16, marginBottom: 8 }}>
                                {gps.error ?
                                    <View style={[styles.alrt, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <View style={[styles.alrt1, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                            <Icon name="alert-circle" type="ionicon" color={colors.RED} size={18} />
                                            <Text style={{ fontSize: 14, fontFamily: fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK, marginLeft: 3 }}>{t('allow_only')}</Text>
                                        </View>
                                        <Button
                                            btnClick={changePermission}
                                            title={t('fix')}
                                            loading={false}
                                            loadingColor={{ color: colors.WHITE }}
                                            buttonStyle={styles.checkButtonTitle}
                                            style={styles.checkButtonStyle}
                                        />
                                    </View>
                                    : null}

                                {!checkTerm && settings.term_required && term ?
                                    <View style={[styles.alrt, { flexDirection: isRTL ? 'row-reverse' : 'row', marginTop: gps.error ? 10 : 0 }]}>
                                        <TouchableOpacity onPress={onTermLink} style={[styles.alrt1, { flexDirection: isRTL ? 'row-reverse' : 'row', width: width - 180, height: 50 }]}>
                                            <Icon name="document-text" type="ionicon" color={colors.RED} size={18} />
                                            <Text style={{ fontSize: 14, fontFamily: fonts.Bold, color: colors.BLUE, marginLeft: 3, textDecorationLine: 'underline' }}>{t('term_condition')}</Text>
                                        </TouchableOpacity>
                                        <Button
                                            btnClick={onTermAccept}
                                            loading={false}
                                            loadingColor={{ color: colors.WHITE }}
                                            title={t('accept')}
                                            style={styles.checkButtonStyle}
                                            buttonStyle={styles.checkButtonTitle}
                                        />
                                    </View>
                                    : null}

                                {needsSocialSecurity() ?
                                    <View style={[styles.alrt, { flexDirection: isRTL ? 'row-reverse' : 'row', marginTop: (!checkTerm && settings.term_required && term) || gps.error ? 10 : 0 }]}>
                                        <TouchableOpacity onPress={onSocialSecurityNavigate} style={[styles.alrt1, { flexDirection: isRTL ? 'row-reverse' : 'row', width: width - 180, height: 50 }]}>
                                            <Icon name="card" type="ionicon" color={colors.RED} size={18} />
                                            <Text style={{ fontSize: 14, fontFamily: fonts.Bold, color: colors.BLUE, marginLeft: 3, textDecorationLine: 'underline' }}>{t('social_security')}</Text>
                                        </TouchableOpacity>
                                        <Button
                                            btnClick={onSocialSecurityNavigate}
                                            loading={false}
                                            loadingColor={{ color: colors.WHITE }}
                                            title={t('complete') || 'Completar'}
                                            style={styles.checkButtonStyle}
                                            buttonStyle={styles.checkButtonTitle}
                                        />
                                    </View>
                                    : null}

                                {!auth.profile.approved ?
                                    <View style={[styles.alrt, { flexDirection: isRTL ? 'row-reverse' : 'row', marginTop: (needsSocialSecurity() || (!checkTerm && settings.term_required && term) || gps.error) ? 10 : 0 }]}>
                                        <View style={[styles.alrt1, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                            <Icon name="alert-circle" type="ionicon" color={colors.RED} size={18} />
                                            <Text style={{ fontSize: 14, fontFamily: fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK, marginLeft: 3 }}>{t('admin_contact')}</Text>
                                        </View>
                                    </View>
                                    : null}
                            </View>
                        )}

                        {riderBanners.length > 0 ? (
                            <View style={{ width: '100%', marginTop: 18 }}>
                                <AppBannerCarousel banners={riderBanners} />
                            </View>
                        ) : null}

                        {!isInZone && zoneDetectionMessage ? (
                            <View style={[styles.zoneWarningBanner, {
                                backgroundColor: '#FF6B6B',
                                width: '100%',
                                alignSelf: 'stretch',
                                marginHorizontal: 0,
                                marginTop: 10,
                                marginBottom: 20,
                                padding: 15,
                                borderRadius: 10,
                                flexDirection: isRTL ? 'row-reverse' : 'row',
                                alignItems: 'center'
                            }]}>
                                <Icon
                                    name="warning"
                                    type="ionicon"
                                    size={20}
                                    color={colors.WHITE}
                                    style={{ marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0 }}
                                />
                                <Text style={[styles.zoneWarningText, {
                                    color: colors.WHITE,
                                    flex: 1,
                                    fontSize: 14,
                                    fontFamily: fonts.Bold,
                                    textAlign: isRTL ? 'right' : 'left'
                                }]}>
                                    {zoneDetectionMessage}
                                </Text>
                            </View>
                        ) : null}
                    </ScrollView>
                </SafeAreaView>
            ) : null
            }

            {showInitialScreen ? null : (tripdata.pickup && tripdata.pickup.source == 'mapSelect') || (tripdata.drop && tripdata.drop.source == 'mapSelect') ?
                <View style={[styles.unifiedModal, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND, height: 120 }]}>
                    <View style={[styles.bar, { backgroundColor: '#E2E6EA', marginVertical: 8, alignSelf: 'center' }]} ></View>
                    <View style={{ backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND, paddingHorizontal: 15, flex: 1, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 16, fontFamily: fonts.Bold, textAlign: 'center', marginBottom: 20, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>
                            {tripdata.selected === 'pickup' ? t('confirm_pickup_location') : t('confirm_drop_location')}
                        </Text>
                        <View style={[styles.buttonBar, { flexDirection: isRTL ? 'row-reverse' : 'row', paddingTop: 0, paddingBottom: 10 }]}>
                            <View style={{ width: '49.5%', borderRadius: 12, height: 45 }}>
                                <Button
                                    title={t('cancel')}
                                    buttonStyle={[styles.buttonTitleStyle, { color: colors.BLACK }]}
                                    btnClick={onMapSelectComplete}
                                    style={{ backgroundColor: '#E6E7E8', height: '100%', width: '100%' }}
                                />
                            </View>
                            <View style={{ width: '49.5%', borderRadius: 12, height: 45 }}>
                                <Button
                                    title={t('ok')}
                                    buttonStyle={[styles.buttonTitleStyle, { color: colors.WHITE }]}
                                    btnClick={onMapSelectComplete}
                                    style={{ backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, height: '100%', width: '100%' }}
                                />
                            </View>
                        </View>
                    </View>
                </View>
                :
                <>
                    {settings && settings.horizontal_view ?
                        <View style={styles.fullCarView}>
                            <ScrollView horizontal={true} style={styles.fullCarScroller} showsHorizontalScrollIndicator={false}>
                                {(() => {
                                    const isLoading = !currentZone || !cars || cars.length === 0;
                                    const filteredCars = getFilteredCarTypesWithZonePrices();

                                    if (isLoading) {
                                        return (
                                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 150, paddingHorizontal: 20 }}>
                                                <ActivityIndicator size="large" color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} />
                                            </View>
                                        );
                                    }

                                    return filteredCars.map((prop, key) => {
                                        const activeProp = allCarTypes.find(ct => ct.name === prop.name) || prop;
                                        return (
                                            <View key={key} style={[styles.cabDivStyle, { shadowColor: mode === 'dark' ? colors.WHITE : colors.BLACK, borderWidth: 2, borderColor: activeProp.active == true ? mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR : colors.SHADOW, backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND }]}>
                                                <CarHorizontal
                                                    onPress={() => { selectCarType({ ...prop, active: activeProp.active }, key) }}
                                                    carData={{ ...prop, active: activeProp.active }}
                                                    settings={settings}
                                                    styles={styles}
                                                    mode={mode}
                                                    formatAmount={formatAmount}
                                                />
                                            </View>
                                        );
                                    });
                                })()}
                            </ScrollView>
                        </View>
                        :
                        <>
                            <View style={[styles.unifiedModal, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND }]}
                                onTouchStart={e => setTouchY(e.nativeEvent.pageY)}
                                onTouchEnd={e => {
                                    if ((touchY - e.nativeEvent.pageY > 50) && !showCarTypesExpanded)
                                        setShowCarTypesExpanded(true);
                                    if ((e.nativeEvent.pageY - touchY > 50) && showCarTypesExpanded)
                                        setShowCarTypesExpanded(false);
                                }}
                            >
                                <View style={[styles.bar, { backgroundColor: '#E2E6EA', marginVertical: 8, alignSelf: 'center' }]} ></View>
                                <View style={{ backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND, paddingHorizontal: 15 }}>
                                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 10, marginBottom: 15 }}>
                                        <TouchableOpacity
                                            onPress={() => handleServiceTypeChange(RIDE_SERVICE_TYPE)}
                                            style={{
                                                flex: 1,
                                                height: 42,
                                                borderRadius: 12,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: serviceType === RIDE_SERVICE_TYPE ? (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR) : (mode === 'dark' ? colors.BLACK : colors.WHITE),
                                                borderWidth: 1,
                                                borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR
                                            }}
                                        >
                                            <Text style={{ color: serviceType === RIDE_SERVICE_TYPE ? colors.WHITE : (mode === 'dark' ? colors.WHITE : colors.BLACK), fontFamily: fonts.Bold }}>
                                                Viaje
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleServiceTypeChange(ERRAND_SERVICE_TYPE)}
                                            style={{
                                                flex: 1,
                                                height: 42,
                                                borderRadius: 12,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: serviceType === ERRAND_SERVICE_TYPE ? (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR) : (mode === 'dark' ? colors.BLACK : colors.WHITE),
                                                borderWidth: 1,
                                                borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR
                                            }}
                                        >
                                            <Text style={{ color: serviceType === ERRAND_SERVICE_TYPE ? colors.WHITE : (mode === 'dark' ? colors.WHITE : colors.BLACK), fontFamily: fonts.Bold }}>
                                                Mandado
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={[styles.addressRow, { flexDirection: isRTL ? 'row-reverse' : 'row', marginBottom: 15 }]}>
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
                                            <TouchableOpacity onPress={() => tapAddress('pickup')} style={styles.addressField}>
                                                <Text numberOfLines={1} style={[styles.addressText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                                    {tripdata.pickup && tripdata.pickup.add ? tripdata.pickup.add : t('map_screen_where_input_text')}
                                                </Text>
                                            </TouchableOpacity>
                                            <View style={[styles.separator, { backgroundColor: mode === 'dark' ? colors.WHITE + '20' : colors.SHADOW + '20' }]} />
                                            <TouchableOpacity onPress={() => tapAddress('drop')} style={styles.addressField}>
                                                <Text numberOfLines={1} style={[styles.addressText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                                    {tripdata.drop && tripdata.drop.add ? tripdata.drop.add : t('map_screen_drop_input_text')}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {serviceType === ERRAND_SERVICE_TYPE ? (
                                        <View style={{ marginBottom: 15, padding: 12, borderRadius: 14, backgroundColor: mode === 'dark' ? colors.BLACK : colors.WHITE, borderWidth: 1, borderColor: mode === 'dark' ? colors.WHITE + '20' : colors.SHADOW + '40' }}>
                                            <Text style={{ fontFamily: fonts.Bold, fontSize: 15, color: mode === 'dark' ? colors.WHITE : colors.BLACK, marginBottom: 6 }}>
                                                Mandado
                                            </Text>
                                            <TextInput
                                                value={normalizedErrand.requestText}
                                                onChangeText={(text) => setErrandData({ ...errandData, requestText: text })}
                                                placeholder="Que debemos comprar o recoger"
                                                placeholderTextColor={colors.SHADOW}
                                                multiline
                                                style={{
                                                    minHeight: 74,
                                                    borderWidth: 1,
                                                    borderColor: colors.SHADOW + '60',
                                                    borderRadius: 12,
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 10,
                                                    color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                                    fontFamily: fonts.Regular,
                                                    marginBottom: 10
                                                }}
                                            />
                                            <TouchableOpacity
                                                onPress={() => setErrandData({ ...errandData, illegalGoodsAccepted: !normalizedErrand.illegalGoodsAccepted })}
                                                style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 10 }}
                                            >
                                                <Icon
                                                    name={normalizedErrand.illegalGoodsAccepted ? 'checkbox' : 'square-outline'}
                                                    type="ionicon"
                                                    size={20}
                                                    color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
                                                />
                                                <Text style={{ marginHorizontal: 8, fontFamily: fonts.Regular, color: mode === 'dark' ? colors.WHITE : colors.BLACK, flex: 1 }}>
                                                    No se aceptan drogas, armas ni articulos ilegales.
                                                </Text>
                                            </TouchableOpacity>
                                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                                <Text style={{ fontFamily: fonts.Regular, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>
                                                    El producto ya esta pago
                                                </Text>
                                                <Switch
                                                    value={normalizedErrand.itemAlreadyPaid}
                                                    onValueChange={(value) => setErrandData({ ...errandData, itemAlreadyPaid: value, declaredItemValue: value ? 0 : errandData.declaredItemValue })}
                                                    trackColor={{ false: colors.SHADOW, true: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }}
                                                    thumbColor={colors.WHITE}
                                                />
                                            </View>
                                            {!normalizedErrand.itemAlreadyPaid ? (
                                                <TextInput
                                                    value={String(normalizedErrand.declaredItemValue || '')}
                                                    onChangeText={(text) => setErrandData({ ...errandData, declaredItemValue: text.replace(/[^0-9.]/g, '') })}
                                                    placeholder="Valor estimado del pedido"
                                                    placeholderTextColor={colors.SHADOW}
                                                    keyboardType="numeric"
                                                    style={{
                                                        height: 46,
                                                        borderWidth: 1,
                                                        borderColor: colors.SHADOW + '60',
                                                        borderRadius: 12,
                                                        paddingHorizontal: 12,
                                                        color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                                        fontFamily: fonts.Regular,
                                                        marginBottom: 10
                                                    }}
                                                />
                                            ) : null}
                                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text style={{ fontFamily: fonts.Regular, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>
                                                    Aplicar costo por busqueda
                                                </Text>
                                                <Switch
                                                    value={normalizedErrand.requiresSearch}
                                                    onValueChange={(value) => setErrandData({ ...errandData, requiresSearch: value, searchCostApplied: value, searchCostAmount: value ? parseFloat(settings?.errandSearchCost || 0) : 0 })}
                                                    trackColor={{ false: colors.SHADOW, true: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }}
                                                    thumbColor={colors.WHITE}
                                                />
                                            </View>
                                            {!normalizedErrand.itemAlreadyPaid ? (
                                                <Text style={{ marginTop: 10, color: shouldForceErrandOnlinePayment(normalizedErrand, settings) ? colors.RED : (mode === 'dark' ? colors.WHITE : colors.BLACK), fontFamily: fonts.Regular, fontSize: 12 }}>
                                                    {shouldForceErrandOnlinePayment(normalizedErrand, settings)
                                                        ? 'Este mandado solo permite wallet o tarjeta por el valor del pedido.'
                                                        : 'Puedes cobrar el producto en efectivo o en linea.'}
                                                </Text>
                                            ) : null}
                                        </View>
                                    ) : null}

                                    {showCarTypesExpanded && (
                                        <View style={{ paddingBottom: 24 }}>
                                            {(() => {
                                                const isLoading = !currentZone || !cars || cars.length === 0;
                                                const filteredCars = getFilteredCarTypesWithZonePrices();

                                                if (isLoading) {
                                                    return (
                                                        <View style={{ paddingVertical: 30, alignItems: 'center', justifyContent: 'center' }}>
                                                            <ActivityIndicator size="large" color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} />
                                                        </View>
                                                    );
                                                }

                                                return filteredCars && filteredCars.length > 0 ? (
                                                    <ScrollView
                                                        horizontal={true}
                                                        showsHorizontalScrollIndicator={false}
                                                        style={styles.carTypesExpandedScroll}
                                                        contentContainerStyle={styles.carTypesExpandedContent}
                                                    >
                                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                                            {filteredCars.map((prop, index) => {
                                                                const activeProp = allCarTypes.find(ct => ct.name === prop.name) || prop;
                                                                return (
                                                                    <TouchableOpacity
                                                                        key={index}
                                                                        onPress={() => { selectCarType({ ...prop, active: activeProp.active }, index) }}
                                                                        style={[styles.carTypeCard, {
                                                                            borderColor: activeProp.active ? (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR) : colors.SHADOW,
                                                                            backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND
                                                                        }]}
                                                                    >
                                                                        <Image
                                                                            source={prop.image ? { uri: prop.image } : require('../../assets/images/microBlackCar.png')}
                                                                            style={styles.carTypeImage}
                                                                            resizeMode="contain"
                                                                        />
                                                                        <Text style={[styles.carTypeName, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                                                            {prop.name}
                                                                        </Text>
                                                                        <Text style={[styles.carTypePrice, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                                                            {allCarTypeEstimates[prop.name] && allCarTypeEstimates[prop.name].estimate ? (
                                                                                settings?.swipe_symbol === true ?
                                                                                    `${formatAmount(allCarTypeEstimates[prop.name].estimate.estimateFare, settings?.decimal)} ${settings?.symbol}` :
                                                                                    `${settings?.symbol} ${formatAmount(allCarTypeEstimates[prop.name].estimate.estimateFare, settings?.decimal)}`
                                                                            ) : (
                                                                                '...'
                                                                            )}
                                                                        </Text>
                                                                        {activeProp.minTime && (
                                                                            <Text style={[styles.carTypeTime, { color: colors.SHADOW }]}>
                                                                                {activeProp.minTime}
                                                                            </Text>
                                                                        )}
                                                                    </TouchableOpacity>
                                                                );
                                                            })}
                                                        </View>
                                                    </ScrollView>
                                                ) : (
                                                    <Text style={{ color: colors.HEADER, fontFamily: fonts.Bold, fontSize: 20, textAlign: 'center' }}>{t("service_start_soon")}</Text>
                                                );
                                            })()}
                                        </View>
                                    )}
                                    <View style={[styles.buttonBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        {bookLoading || bookLaterLoading ?
                                            <View style={{ flex: 1, borderRadius: 10, height: 55, margin: 3, justifyContent: 'center', borderWidth: 1, borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }}>
                                                <ActivityIndicator color={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR} size='large' />
                                            </View>
                                            :
                                            <>
                                                <View style={{ width: '49.5%', borderRadius: 12, height: 45 }}>
                                                    <Button
                                                        title={((tripdata.pickup && tripdata.pickup.source == 'mapSelect') || (tripdata.drop && tripdata.drop.source == 'mapSelect')) ? t('cancel') : t('book_later_button')}
                                                        loading={bookLaterLoading}
                                                        loadingColor={{ color: colors.BLACK }}
                                                        buttonStyle={[styles.buttonTitleStyle, { color: colors.BLACK }]}
                                                        btnClick={((tripdata.pickup && tripdata.pickup.source == 'mapSelect') || (tripdata.drop && tripdata.drop.source == 'mapSelect')) ? onMapSelectComplete : onPressBookLater}
                                                        style={{ backgroundColor: '#E6E7E8', height: '100%', width: '100%' }}
                                                    />
                                                </View>

                                                <View style={{ width: '49.5%', borderRadius: 12, height: 45 }}>
                                                    <Button
                                                        title={((tripdata.pickup && tripdata.pickup.source == 'mapSelect') || (tripdata.drop && tripdata.drop.source == 'mapSelect')) ? t('ok') : t('book_now_button')}
                                                        loading={bookLoading}
                                                        loadingColor={{ color: colors.WHITE }}
                                                        buttonStyle={[styles.buttonTitleStyle, { color: colors.WHITE }]}
                                                        btnClick={((tripdata.pickup && tripdata.pickup.source == 'mapSelect') || (tripdata.drop && tripdata.drop.source == 'mapSelect')) ? onMapSelectComplete : onPressBook}
                                                        style={{ backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR, height: '100%', width: '100%' }}
                                                    />
                                                </View>
                                            </>
                                        }
                                    </View>
                                </View>
                            </View>
                        </>
                    }
                </>
            }

            <OptionModal
                settings={settings}
                tripdata={tripdata}
                instructionData={instructionData}
                optionModalStatus={optionModalStatus}
                onPressCancel={onModalCancel}
                handleGetEstimate={handleGetEstimate}
                handleParcelTypeSelection={handleParcelTypeSelection}
                handleOptionSelection={handleOptionSelection}
                mode={mode}
                formatAmount={formatAmount}
            />
            <BookingModal
                settings={settings}
                tripdata={tripdata}
                estimate={estimatedata.estimate}
                serviceType={serviceType}
                errandData={normalizedErrand}
                setErrandData={setErrandData}
                instructionData={instructionData}
                setInstructionData={setInstructionData}
                tripInstructions={tripInstructions}
                setTripInstructions={setTripInstructions}
                minimumPrice={minimumPrice}
                offerFare={offerFare}
                setOfferFare={setOfferFare}
                roundTrip={roundTrip}
                setRoundTrip={setRoundTrip}
                bookingModalStatus={bookingModalStatus}
                bookNow={bookNow}
                onPressCancel={onModalCancel}
                payment_mode={payment_mode}
                setPaymentMode={setPaymentMode}
                radioProps={radioProps}
                profileData={profileData}
                setProfileData={setProfileData}
                auth={auth}
                bookModelLoading={bookModelLoading}
                deliveryWithBid={deliveryWithBid}
                setDeliveryWithBid={setDeliveryWithBid}
                otherPerson={otherPerson}
                setOtherPerson={setOtherPerson}
                mode={mode}
                formatAmount={formatAmount}
            />
            <DatePicker
                modal
                title={t("select_date")}
                confirmText={t('confirm')}
                cancelText={t('cancel')}
                open={datePickerOpen}
                date={initDate}
                onConfirm={handleDateConfirm}
                onCancel={hideDatePicker}
                hideText={true}
                minimumDate={new Date()}
                theme='light'
            />

            <WaygoDialog
                visible={showRecentTripsModal}
                onClose={() => setShowRecentTripsModal(false)}
                title={t('recent_trips')}
                showButtons={false}
                showIcon={false}
                customContent={renderRecentTripsContent()}
            />

            <WaygoDialog
                visible={outOfZoneDialog}
                onClose={() => setOutOfZoneDialog(false)}
                title={t('out_of_zone_title') || 'Fuera de Zona de Servicio'}
                message={zoneDetectionMessage}
                showButtons={true}
                showIcon={true}
                type="warning"
                confirmText={t('ok')}
                cancelText={t('cancel')}
                onConfirm={() => setOutOfZoneDialog(false)}
            />
            <WaygoDialog
                visible={showLocationPermissionDialog}
                onClose={() => setShowLocationPermissionDialog(false)}
                title={t('location_permission_title') || 'Acceso a Ubicación'}
                message={t('location_permission_message') || 'Waygo necesita acceso a tu ubicación para mostrarte los servicios disponibles en tu zona. Por favor, habilita los permisos de ubicación en la configuración.'}
                showButtons={true}
                showIcon={true}
                type="warning"
                confirmText={t('open_settings') || 'Abrir Ajustes'}
                cancelText={t('cancel')}
                onConfirm={() => {
                    setShowLocationPermissionDialog(false);
                    changePermission();
                }}
            />
            <Modal
                animationType="fade"
                transparent={true}
                visible={!checkTerm && settings && settings.term_required && term && showTermsDialog}
                onRequestClose={handleTermsCancel}
            >
                <View style={styles.termsModalOverlay}>
                    <View style={[styles.termsModalContent, { backgroundColor: mode === 'dark' ? '#272A2C' : colors.WHITE }]}>
                        <View style={styles.termsModalHeader}>
                            <View style={styles.termsIconContainer}>
                                <Icon name="document-text" type="ionicon" color={colors.RED} size={24} />
                            </View>
                            <Text style={[styles.termsModalTitle, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                {t('term_condition')}
                            </Text>
                        </View>

                        <View style={styles.termsModalBody}>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={[styles.termsModalText, { color: mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)' }]}>
                                    {t('continue_accept_terms')}
                                </Text>
                                <TouchableOpacity onPress={onTermLink}>
                                    <Text style={[styles.termsModalLink, { color: colors.BLUE }]}>
                                        {t('term_condition')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={[styles.termsButtonContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <TouchableOpacity
                                style={[styles.termsButton, styles.termsRejectButton, {
                                    backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#E2E9EC',
                                    marginRight: isRTL ? 0 : 10,
                                    marginLeft: isRTL ? 10 : 0,
                                }]}
                                onPress={handleTermsCancel}
                            >
                                <Text style={[styles.termsButtonText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                                    {t('no_accept')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.termsButton, styles.termsAcceptButton, {
                                    backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR,
                                    marginLeft: isRTL ? 0 : 10,
                                    marginRight: isRTL ? 10 : 0,
                                }]}
                                onPress={onTermAccept}
                            >
                                <Text style={[styles.termsButtonText, { color: colors.WHITE }]}>
                                    {t('accept')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.SCREEN_BACKGROUND,
    },
    menuIcon: {
        height: 100,
        width: '100%',
        position: 'absolute',
        top: 0,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationButton: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    menuIconButton: {
        flex: 1,
        height: 50,
        width: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center'
    },
    topTitle: {
        height: 50,
        width: 165,
        backgroundColor: colors.WHITE,
        shadowColor: colors.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 2,
        borderTopRightRadius: 25,
        borderBottomRightRadius: 25,
        justifyContent: 'center',
        position: 'absolute',
        left: 0,
        bottom: 180
    },
    topTitle1: {
        height: 50,
        width: 165,
        backgroundColor: colors.WHITE,
        shadowColor: colors.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 2,
        borderTopLeftRadius: 25,
        borderBottomLeftRadius: 25,
        justifyContent: 'center',
        position: 'absolute',
        right: 0,
        bottom: 180
    },
    mapcontainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapViewStyle: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
    },
    mapFloatingPinView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
    },
    mapFloatingPin: {
        height: 40
    },
    mapResolvingAddress: {
        position: 'absolute',
        top: Platform.OS == 'android' ? 90 : (hasNotch ? 110 : 95),
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.35)'
    },
    mapResolvingAddressText: {
        marginLeft: 8,
        fontFamily: fonts.Bold,
        fontSize: 14,
        color: colors.WHITE
    },
    buttonBar: {
        height: 65,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 20,
    },
    buttonContainer: {
        height: 50,
        borderRadius: 10
    },
    buttonStyle: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonTitleStyle: {
        fontFamily: fonts.Bold,
        fontSize: 14,
    },
    locationButtonView: {
        position: 'absolute',
        height: Platform.OS == 'ios' ? 55 : 42,
        width: Platform.OS == 'ios' ? 55 : 42,
        bottom: 180,
        right: 10,
        borderRadius: Platform.OS == 'ios' ? 30 : 30,
    },
    locateButtonStyle: {
        height: Platform.OS == 'ios' ? 55 : 42,
        width: Platform.OS == 'ios' ? 55 : 42,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Platform.OS == 'ios' ? 27 : 21,
        elevation: 2,
        shadowOpacity: 0.3,
        shadowRadius: 3,
        shadowOffset: {
            height: 0,
            width: 0
        },
    },
    addressBar: {
        position: 'absolute',
        marginHorizontal: 20,
        top: Platform.OS == 'android' ? (__DEV__ ? 65 : 70) : (hasNotch ? 85 : 80),
        width: width - 40,
        flexDirection: 'row',
        paddingLeft: 10,
        paddingRight: 10,
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        borderRadius: 8,
        elevation: 3
    },
    ballandsquare: {
        width: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    hbox1: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: colors.GREEN
    },
    hbox2: {
        height: 36,
        width: 1,
        backgroundColor: colors.SHADOW
    },
    hbox3: {
        height: 12,
        width: 12,
        backgroundColor: colors.RED
    },
    contentStyle: {
        justifyContent: 'center',
        width: width - 74
    },
    addressStyle1: {
        borderBottomWidth: 1,
        height: 48,
        width: width - 84,
        justifyContent: 'center',
        paddingTop: 2
    },
    addressStyle2: {
        height: 48,
        width: width - 84,
        justifyContent: 'center',
    },
    textStyle: {
        fontFamily: fonts.Regular,
        fontSize: 14
    },
    fullCarView: {
        position: 'absolute',
        bottom: 60,
        width: width - 10,
        height: 170,
        marginLeft: 5,
        marginRight: 5,
        alignItems: 'center',
        marginBottom: 10
    },
    fullCarScroller: {
        width: width - 10,
        height: 160,
        flexDirection: 'row'
    },
    cabDivStyle: {
        width: (width - 40) / 3,
        height: '95%',
        alignItems: 'center',
        marginHorizontal: 5,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        borderRadius: 8,
        elevation: 3
    },
    imageStyle: {
        height: 50,
        width: '100%',
        marginVertical: 15,
        padding: 5,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 5
    },
    imageStyle1: {
        height: 40,
        width: 50 * 1.8
    },
    textViewStyle: {
        height: 50,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    text1: {
        fontFamily: fonts.Bold,
        fontSize: 14,
        color: colors.BLACK
    },
    text2: {
        fontFamily: fonts.Bold,
        fontSize: 11,
        color: colors.SHADOW
    },
    carShow: {
        width: '100%',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 65,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        alignItems: 'center'
    },
    bar: {
        width: 100,
        height: 6
    },
    carContainer: {
        justifyContent: "space-between",
        width: width - 30,
        minHeight: 70,
        marginBottom: 5,
        marginLeft: 15,
        marginRight: 15,
        borderRadius: 6,
        borderWidth: 1,
        alignItems: 'center',
    },
    bodyContent: {
        flex: 1
    },
    titleStyles: {
        fontSize: 14,
        color: colors.HEADER,
        paddingBottom: 2,
        fontFamily: fonts.Bold
    },
    subtitleStyle: {
        fontSize: 12,
        color: colors.BALANCE_ADD,
        lineHeight: 16,
        paddingBottom: 2
    },
    priceStyle: {
        color: colors.BALANCE_ADD,
        fontFamily: fonts.Bold,
        fontSize: 12,
        lineHeight: 14,
    },
    cardItemImagePlace: {
        width: 70,
        height: 45,
        margin: 5,
        resizeMode: 'contain'
    },
    cardItemImageBox: {
        width: 80,
        height: 50,
        margin: 10,
        resizeMode: 'center'
    },
    alrt1: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: "70%",
    },
    alrt: {
        width: width - 40,
        height: 60,
        padding: 10,
        borderWidth: 1,
        borderColor: colors.SHADOW,
        borderRadius: 5,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    checkButtonStyle: {
        backgroundColor: colors.GREEN,
        width: 85,
        height: 40,
        borderColor: colors.TRANSPARENT,
        borderWidth: 0,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    checkButtonTitle: {
        fontSize: 12,
        fontFamily: fonts.Medium,
        color: colors.WHITE
    },
    initialHomeContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    homeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    homeHeaderText: {
        fontSize: 20,
        fontFamily: fonts.Bold,
    },
    addButton: {
        padding: 10,
    },
    addButtonText: {
        fontSize: 16,
        fontFamily: fonts.Medium,
    },
    destinationOptions: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: 10,
        gap: 15,
    },
    optionContainer: {
        alignItems: 'center',
        gap: 8,
        flex: 1,
        maxWidth: 90,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionText: {
        fontSize: 14,
        fontFamily: fonts.Medium,
        textAlign: 'center',
    },
    addressContainer: {
        paddingHorizontal: 15,
        paddingTop: 20,
        paddingBottom: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
    addressLabel: {
        fontSize: 12,
        fontFamily: fonts.Medium,
        marginBottom: 4,
        opacity: 0.7,
    },
    addressText: {
        fontSize: 16,
        fontFamily: fonts.Regular,
    },
    separator: {
        height: 1,
        marginVertical: 5,
    },
    unifiedModal: {
        width: '100%',
        justifyContent: 'flex-start',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    carTypeCard: {
        width: 100,
        height: 120,
        borderRadius: 12,
        borderWidth: 2,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    carTypesExpandedScroll: {
        marginHorizontal: -5,
        paddingHorizontal: 5,
        paddingVertical: 4,
    },
    carTypesExpandedContent: {
        paddingBottom: 14,
    },
    carTypeImage: {
        width: 40,
        height: 25,
        marginBottom: 6,
    },
    carTypeName: {
        fontSize: 12,
        fontFamily: fonts.Bold,
        textAlign: 'center',
        marginBottom: 1,
    },
    carTypePrice: {
        fontSize: 11,
        fontFamily: fonts.Medium,
        textAlign: 'center',
        marginBottom: 1,
    },
    carTypeTime: {
        fontSize: 10,
        fontFamily: fonts.Regular,
        textAlign: 'center',
    },
    headerContainer: {
        overflow: 'visible',
        paddingTop: Platform.OS === 'ios' ? (hasNotch ? 8 : 4) : 50,
        backgroundColor: 'transparent',
        zIndex: 1,
    },
    headerBackgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height,
        zIndex: 0,
    },
    backHeaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
        paddingTop: Platform.OS === 'ios' ? (hasNotch ? 20 : 10) : 10,
        height: Platform.OS === 'ios' ? (hasNotch ? 100 : 80) : 80,
        backgroundColor: 'transparent',
        zIndex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 8,
        backgroundColor: 'transparent',
        position: 'relative',
        zIndex: 2,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    chipWrapper: {
        marginTop: 10,
        marginBottom: 20,
        marginHorizontal: -20,
    },
    homeTopRow: {
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    homeLocationBlock: {
        flex: 1,
        marginRight: 12,
    },
    homeLocationCaption: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        marginBottom: 2,
    },
    homeLocationPill: {
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 8,
        borderRadius: 16,
        paddingVertical: 2,
        paddingHorizontal: 0,
    },
    homeLocationValue: {
        fontSize: 19,
        lineHeight: 24,
        fontFamily: fonts.Bold,
        maxWidth: width * 0.62,
    },
    homeIconButton: {
        width: 46,
        height: 46,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
    },
    homeSearchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderRadius: 28,
        height: 58,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 5,
    },
    homeSearchText: {
        marginLeft: 10,
        fontSize: 17,
        fontFamily: fonts.Regular,
        flex: 1,
    },
    chipScrollContainer: {
    },
    chipContainer: {
        flexDirection: 'row',
        paddingLeft: 20,
        paddingRight: 0,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        minWidth: 80,
        maxWidth: 150,
        alignItems: 'center',
    },
    chipText: {
        color: colors.WHITE,
        fontSize: 12,
        fontFamily: fonts.Medium,
    },
    profileSection: {
        flex: 1,
        alignItems: 'center',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: colors.SHADOW + '20',
        borderWidth: 2,
        borderColor: colors.WHITE,
    },
    locationSection: {
        flex: 1,
        justifyContent: 'center',
        height: 50,
    },
    greetingText: {
        fontSize: 18,
        fontFamily: fonts.Bold,
        marginBottom: 2,
        lineHeight: 20,
    },
    currentLocationContainer: {
        alignItems: 'center',
        marginTop: 2,
    },
    currentLocationText: {
        fontSize: 12,
        fontFamily: fonts.Regular,
        marginLeft: 5,
        flex: 1,
        maxWidth: width * 0.5,
        lineHeight: 16,
    },
    notificationButton: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.WHITE,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 6,
        paddingBottom: 26,
    },
    searchInput: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginHorizontal: 0,
        marginTop: 15,
        height: 50,
    },
    searchTitle: {
        fontSize: 24,
        fontFamily: fonts.Bold,
        marginTop: 15,
        marginBottom: 10,
    },
    searchPlaceholder: {
        marginLeft: 10,
        fontSize: 16,
        fontFamily: fonts.Regular,
        flex: 1,
    },
    mapIcon: {
        width: 72,
        height: 72,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: fonts.Bold,
        marginBottom: 15,
        marginTop: Platform.OS === 'ios' ? 0 : 30,
    },
    serviceTypesContainer: {
        marginBottom: 20
    },
    serviceTypesScrollView: {
        marginHorizontal: -20,
    },
    serviceTypesContent: {
        paddingHorizontal: 20,
        paddingBottom: 5,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    serviceTypes: {
        flexDirection: 'row',
    },
    serviceTypeCard: {
        width: 120,
        borderRadius: 12,
        padding: 20,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.WHITE,
        elevation: 2,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        minHeight: 160,
    },
    serviceTypeIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        alignSelf: 'center',
    },
    serviceTypeImage: {
        width: 40,
        height: 40,
    },
    serviceTypeName: {
        fontSize: 16,
        fontFamily: fonts.Bold,
        marginBottom: 5,
        textAlign: 'center',
    },
    serviceTypePrice: {
        fontSize: 12,
        fontFamily: fonts.Regular,
        textAlign: 'center',
    },
    homeServicesContainer: {
        marginBottom: 22,
    },
    serviceShortcutRow: {
        gap: 12,
        alignItems: 'stretch',
    },
    serviceShortcutCard: {
        flex: 1,
        minHeight: 246,
        borderRadius: 34,
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    homeServiceCardDisabled: {
        opacity: 0.55,
    },
    serviceShortcutIconWrap: {
        width: '100%',
        flex: 1,
        minHeight: 174,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    serviceShortcutImageRide: {
        width: 156,
        height: 116,
    },
    serviceShortcutImageErrand: {
        width: 164,
        height: 164,
    },
    serviceShortcutTitle: {
        fontSize: 24,
        fontFamily: fonts.Medium,
        color: '#111111',
        textAlign: 'center',
    },
    quickActionsRow: {
        marginTop: 14,
        justifyContent: 'center',
        gap: 2,
    },
    quickActionCard: {
        flex: 1,
        minHeight: 88,
        borderRadius: 20,
        paddingHorizontal: 2,
        paddingVertical: 2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'transparent',
    },
    quickActionIconWrap: {
        width: 58,
        height: 58,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: 12,
        lineHeight: 15,
        fontFamily: fonts.Regular,
        textAlign: 'center',
    },
    walletBalanceCard: {
        marginTop: 18,
        borderRadius: 28,
        minHeight: 104,
        paddingHorizontal: 18,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 6,
        marginBottom: 16,
    },
    walletBalanceLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 0,
    },
    walletBalanceIcon: {
        width: 48,
        height: 48,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    walletBalanceTextBlock: {
        flex: 1,
        minWidth: 0,
    },
    walletBalanceLabel: {
        fontSize: 12,
        fontFamily: fonts.Regular,
        marginBottom: 4,
    },
    walletBalanceAmount: {
        fontSize: 23,
        lineHeight: 28,
        fontFamily: fonts.Bold,
    },
    walletRechargeButton: {
        minWidth: 104,
        height: 44,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        marginLeft: 12,
    },
    walletRechargeText: {
        fontSize: 14,
        fontFamily: fonts.Bold,
    },
    homeInfoStrip: {
        marginTop: 16,
        borderRadius: 20,
        minHeight: 74,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 14,
        elevation: 2,
    },
    homeInfoStripItem: {
        flex: 1,
        alignItems: 'center',
    },
    homeInfoStripIcon: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    homeInfoStripTextBlock: {
        flex: 1,
    },
    homeInfoStripTitle: {
        fontSize: 15,
        fontFamily: fonts.Bold,
        marginBottom: 2,
    },
    homeInfoStripSubtitle: {
        fontSize: 12,
        fontFamily: fonts.Regular,
    },
    homeInfoStripDivider: {
        width: 1,
        alignSelf: 'stretch',
        marginHorizontal: 12,
        borderRadius: 999,
    },
    homeServiceBadge: {
        alignSelf: 'flex-start',
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: '#111111',
    },
    homeServiceBadgeText: {
        color: colors.WHITE,
        fontFamily: fonts.Bold,
        fontSize: 12,
    },
    actionButtonsContainer: {
        gap: 15,
    },
    primaryButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: colors.WHITE,
        fontSize: 16,
        fontFamily: fonts.Bold,
    },
    secondaryButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontFamily: fonts.Bold,
    },
    recentTripsScrollView: {
        maxHeight: 400,
    },
    recentTripsContent: {
        paddingHorizontal: 4,
        paddingBottom: 20,
    },
    recentTripCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: colors.BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    tripRouteContainer: {
        gap: 4,
    },
    routePointContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    routeIconContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    routeAddress: {
        flex: 1,
        fontSize: 14,
        fontFamily: fonts.Medium,
    },
    termsModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    termsModalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        shadowColor: colors.BLACK,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 16,
        paddingBottom: 20,
        overflow: 'hidden',
        maxHeight: '90%',
    },
    termsModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 20,
    },
    termsIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(128, 128, 128, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    termsModalTitle: {
        fontSize: 18,
        fontFamily: fonts.Bold,
        lineHeight: 22,
        flex: 1,
    },
    termsModalBody: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        minHeight: 80,
    },
    termsModalText: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        lineHeight: 20,
        textAlign: 'center',
    },
    termsModalLink: {
        fontSize: 14,
        fontFamily: fonts.Bold,
        textDecorationLine: 'underline',
    },
    termsButtonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    termsButton: {
        flex: 1,
        height: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    termsRejectButton: {
    },
    termsAcceptButton: {
    },
    termsButtonText: {
        fontSize: 14,
        fontFamily: fonts.Medium,
        lineHeight: 18,
    },
    routeConnector: {
        width: 2,
        height: 12,
        marginLeft: 9,
        marginVertical: 2,
        borderRadius: 1,
    },
    emptyTripsContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyTripsText: {
        fontSize: 14,
        fontFamily: fonts.Regular,
        textAlign: 'center',
        color: colors.SHADOW,
    },
    zoneWarningBanner: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    zoneWarningText: {
        lineHeight: 20,
    },
    bannerImage: {
        width: '100%',
        height: 120,
        marginTop: 15,
        marginBottom: 10,
        borderRadius: 12,
    }
});
