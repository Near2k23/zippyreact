import { useState, useEffect, useRef } from 'react';
import { api, store } from 'common';
import { useSelector } from 'react-redux';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';
import i18n from 'i18n-js';
import moment from 'moment/min/moment-with-locales';
import { colors } from './src/common/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { AppCommonLoadingScreen, useAppCommonShared } from './AppCommon.shared';
import WaygoDialog from './src/components/WaygoDialog';

const LOCATION_TASK_NAME = 'background-location-task';

if (!TaskManager.isTaskDefined || !TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
  TaskManager.defineTask(LOCATION_TASK_NAME, ({ data: { locations }, error }) => {
    if (error) {
      console.log(error);
      return;
    }
    if (locations && locations.length > 0) {
      const location = locations[locations.length - 1];
      if (location?.coords) {
        try {
          store.dispatch({
            type: 'UPDATE_GPS_LOCATION',
            payload: {
              lat: location.coords.latitude,
              lng: location.coords.longitude
            }
          });
        } catch (taskError) {
          console.log('Error dispatching location update:', taskError);
        }
      }
    }
  });
}

const audioSource = require('./assets/sounds/horn.wav');
const audioSourceRepeat = require('./assets/sounds/repeat.wav');

export default function AppCommonDriver({ children }) {
  const { t } = i18n;
  const activeBooking = useSelector(state => state.bookinglistdata.tracked);
  const lastLocation = useSelector(state => state.locationdata.coords);
  const tasks = useSelector(state => state.taskdata.tasks);
  const watcher = useRef();
  const locationOn = useRef(false);
  const [playedSounds, setPlayedSounds] = useState([]);
  const [deviceId, setDeviceId] = useState();
  const [hornPlayerPlaying, setHornPlayerPlaying] = useState(false);
  const [repeatPlayerPlaying, setRepeatPlayerPlaying] = useState(false);
  const player = useAudioPlayer(audioSource);
  const playerRepeat = useAudioPlayer(audioSourceRepeat);
  const {
    auth,
    authState,
    authStillNotResponded,
    bounceAnim,
    dispatch,
    fetchingToken,
    gps,
    initialFunctionsNotCalled,
    languagedata,
    locationLoading,
    saveToken,
    setAuthState,
    setAuthStillNotResponded,
    settings,
    validateUserType,
    wrongAppDialogVisible,
    setWrongAppDialogVisible
  } = useAppCommonShared();

  useEffect(() => {
    AsyncStorage.getItem('deviceId', (err, result) => {
      if (result) {
        setDeviceId(result);
      } else {
        const nextDeviceId = 'id' + new Date().getTime();
        AsyncStorage.setItem('deviceId', nextDeviceId);
        setDeviceId(nextDeviceId);
      }
    });
  }, []);

  useEffect(() => {
    const hornStatusListener = status => {
      setHornPlayerPlaying(status.playing);
      if (status.duration > 0 && ((!status.playing && status.currentTime >= status.duration) || (status.playbackRate === 0 && status.currentTime >= status.duration) || (status.playing && status.currentTime >= status.duration && Math.abs(status.currentTime - status.duration) < 0.1))) {
        setHornPlayerPlaying(false);
        setTimeout(() => {
          try {
            player.pause();
            player.replace(audioSource);
          } catch (error) {
            console.log('Error resetting horn player:', error);
          }
        }, 50);
      }
    };

    const repeatStatusListener = status => {
      setRepeatPlayerPlaying(status.playing);
      if (status.duration > 0 && ((!status.playing && status.currentTime >= status.duration) || (status.playbackRate === 0 && status.currentTime >= status.duration) || (status.playing && status.currentTime >= status.duration && Math.abs(status.currentTime - status.duration) < 0.1))) {
        setRepeatPlayerPlaying(false);
        setTimeout(() => {
          try {
            playerRepeat.pause();
            playerRepeat.replace(audioSourceRepeat);
          } catch (error) {
            console.log('Error resetting repeat player:', error);
          }
        }, 50);
      }
    };

    player.addListener('playbackStatusUpdate', hornStatusListener);
    playerRepeat.addListener('playbackStatusUpdate', repeatStatusListener);

    return () => {
      player.removeListener('playbackStatusUpdate', hornStatusListener);
      playerRepeat.removeListener('playbackStatusUpdate', repeatStatusListener);
    };
  }, [player, playerRepeat]);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      for (let index = 0; index < tasks.length; index += 1) {
        if (!playedSounds.includes(tasks[index].id)) {
          const nextPlayedSounds = [...playedSounds, tasks[index].id];
          if (settings?.CarHornRepeat) {
            if (repeatPlayerPlaying) {
              playerRepeat.pause();
              setRepeatPlayerPlaying(false);
              playerRepeat.replace(audioSourceRepeat);
              setTimeout(() => {
                playerRepeat.play();
              }, 200);
            } else {
              playerRepeat.play();
            }
          } else if (hornPlayerPlaying) {
            player.pause();
            setHornPlayerPlaying(false);
            player.replace(audioSource);
            setTimeout(() => {
              player.play();
            }, 200);
          } else {
            player.play();
          }
          setPlayedSounds(nextPlayedSounds);
        }
      }
    }
  }, [hornPlayerPlaying, playedSounds, player, playerRepeat, repeatPlayerPlaying, settings, tasks]);

  useEffect(() => {
    if (gps.location?.lat && gps.location?.lng) {
      locationLoading.current = false;
      api.saveUserLocation({
        lat: gps.location.lat,
        lng: gps.location.lng
      });

      if (activeBooking) {
        if (lastLocation && (activeBooking.status === 'ACCEPTED' || activeBooking.status === 'STARTED')) {
          const diff = api.GetDistance(lastLocation.lat, lastLocation.lng, gps.location.lat, gps.location.lng);
          if (diff > 0.01 && activeBooking.driverDeviceId === deviceId) {
            api.saveTracking(activeBooking.id, {
              at: new Date().getTime(),
              status: activeBooking.status,
              lat: gps.location.lat,
              lng: gps.location.lng
            });
          }
        }

        if (!lastLocation && activeBooking.status === 'ACCEPTED') {
          api.saveTracking(activeBooking.id, {
            at: new Date().getTime(),
            status: activeBooking.status,
            lat: gps.location.lat,
            lng: gps.location.lng
          });
        }

        if (activeBooking.status === 'ACCEPTED') {
          const diff = api.GetDistance(activeBooking.pickup.lat, activeBooking.pickup.lng, gps.location.lat, gps.location.lng);
          if (diff < 0.02) {
            const bookingData = { ...activeBooking, status: 'ARRIVED' };
            store.dispatch(api.updateBooking(bookingData));
            api.saveTracking(activeBooking.id, {
              at: new Date().getTime(),
              status: 'ARRIVED',
              lat: gps.location.lat,
              lng: gps.location.lng
            });
          }
        }
      }
    }
  }, [activeBooking, deviceId, gps.location, lastLocation, locationLoading]);

  useEffect(() => {
    if (auth.profile?.driverActiveStatus) {
      if (!locationOn.current) {
        locationOn.current = true;
        if (Platform.OS === 'android') {
          AsyncStorage.getItem('firstRun', (err, result) => {
            if (result) {
              StartBackgroundLocation();
            } else {
              Alert.alert(t('disclaimer'), t('disclaimer_text'), [
                {
                  text: t('cancel'),
                  onPress: () => {
                    locationOn.current = false;
                  },
                  style: 'cancel'
                },
                {
                  text: t('ok'),
                  onPress: () => {
                    AsyncStorage.setItem('firstRun', 'OK');
                    StartBackgroundLocation();
                  }
                }
              ], { cancelable: false });
            }
          });
        } else {
          StartBackgroundLocation();
        }
      }
    } else if (auth.profile && locationOn.current) {
      locationOn.current = false;
      StopBackgroundLocation();
    } else if (auth.profile) {
      store.dispatch({
        type: 'UPDATE_GPS_LOCATION',
        payload: {
          error: true
        }
      });
      locationLoading.current = false;
    }
  }, [auth.profile]);

  const StartBackgroundLocation = async () => {
    if (watcher.current) {
      watcher.current.remove();
      watcher.current = null;
    }

    const permResp = await Location.requestForegroundPermissionsAsync();
    if (permResp.status === 'granted') {
      try {
        const { status } = await Location.requestBackgroundPermissionsAsync();
        if (status === 'granted') {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000,
            distanceInterval: 5,
            showsBackgroundLocationIndicator: true,
            activityType: Location.ActivityType.AutomotiveNavigation,
            foregroundService: {
              notificationTitle: t('locationServiveTitle'),
              notificationBody: t('locationServiveBody'),
              notificationColor: colors.SKY
            }
          });
        } else if (__DEV__) {
          StartForegroundGeolocation();
        } else {
          store.dispatch({
            type: 'UPDATE_GPS_LOCATION',
            payload: {
              error: true
            }
          });
          locationLoading.current = false;
        }
      } catch (error) {
        if (__DEV__) {
          StartForegroundGeolocation();
        } else {
          store.dispatch({
            type: 'UPDATE_GPS_LOCATION',
            payload: {
              error: true
            }
          });
          locationLoading.current = false;
        }
      }
    } else {
      store.dispatch({
        type: 'UPDATE_GPS_LOCATION',
        payload: {
          error: true
        }
      });
      locationLoading.current = false;
    }
  };

  const StartForegroundGeolocation = async () => {
    watcher.current = await Location.watchPositionAsync({
      accuracy: Location.Accuracy.High,
      activityType: Location.ActivityType.AutomotiveNavigation
    }, location => {
      store.dispatch({
        type: 'UPDATE_GPS_LOCATION',
        payload: {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        }
      });
    });
  };

  const StopBackgroundLocation = async () => {
    locationOn.current = false;
    try {
      TaskManager.getRegisteredTasksAsync().then(res => {
        if (res.length > 0) {
          for (let index = 0; index < res.length; index += 1) {
            if (res[index].taskName === LOCATION_TASK_NAME) {
              Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
              break;
            }
          }
        } else if (watcher.current) {
          watcher.current.remove();
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (auth.profile && languagedata.langlist && settings && initialFunctionsNotCalled.current) {
      setAuthStillNotResponded(false);
      if (!validateUserType('driver')) {
        return;
      }

      setAuthState('driver');
      if (auth.profile.lang) {
        i18n.locale = auth.profile.lang.langLocale;
        moment.locale(auth.profile.lang.dateLocale);
      }

      saveToken();
      fetchingToken.current = false;
      dispatch(api.fetchBookings());
      dispatch(api.fetchPaymentMethods());
      dispatch(api.fetchTasks());
      dispatch(api.fetchUserNotifications());
      dispatch(api.fetchCars());
      dispatch(api.fetchWalletHistory());
      dispatch(api.fetchPromos());
      dispatch(api.fetchCancelReasons());
      dispatch(api.fetchComplain());
      initialFunctionsNotCalled.current = false;
    }
  }, [auth.profile, dispatch, fetchingToken, initialFunctionsNotCalled, languagedata.langlist, saveToken, settings, setAuthState, setAuthStillNotResponded, validateUserType]);

  useEffect(() => {
    (async () => {
      try {
        await setAudioModeAsync({
          staysActiveInBackground: true,
          playsInSilentMode: true,
          interruptionModeIOS: 2,
          interruptionModeAndroid: 2,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false
        });
      } catch (error) {
        console.log('Error setting audio mode:', error);
      }
    })();
  }, []);

  if (authStillNotResponded || !languagedata.langlist || !settings || authState === 'loading') {
    return <AppCommonLoadingScreen bounceAnim={bounceAnim} />;
  }

  return (
    <>
      {children}
      <WaygoDialog
        visible={wrongAppDialogVisible}
        onClose={() => setWrongAppDialogVisible(false)}
        title="App incorrecta"
        message="Tu cuenta es de otra aplicación. Descarga la app correcta para continuar."
        type="warning"
        showButtons={true}
        singleButton={true}
        confirmText="OK"
        onConfirm={() => {
          Linking.openURL('https://waygodriver.com');
          setWrongAppDialogVisible(false);
        }}
      />
    </>
  );
}
