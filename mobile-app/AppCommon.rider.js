import { useEffect, useRef } from 'react';
import { api, store } from 'common';
import * as Location from 'expo-location';
import { Linking } from 'react-native';
import i18n from 'i18n-js';
import moment from 'moment/min/moment-with-locales';
import { AppCommonLoadingScreen, useAppCommonShared } from './AppCommon.shared';
import WaygoDialog from './src/components/WaygoDialog';

export default function AppCommonRider({ children }) {
  const locationOn = useRef(false);
  const {
    auth,
    authState,
    authStillNotResponded,
    bounceAnim,
    dispatch,
    fetchingToken,
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
    if (auth.profile && !locationOn.current) {
      locationOn.current = true;
      GetOneTimeLocation();
    }
  }, [auth.profile]);

  const GetOneTimeLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      try {
        const tempWatcher = await Location.watchPositionAsync({
          accuracy: Location.Accuracy.Balanced
        }, location => {
          store.dispatch({
            type: 'UPDATE_GPS_LOCATION',
            payload: {
              lat: location.coords.latitude,
              lng: location.coords.longitude
            }
          });
          tempWatcher.remove();
        });
      } catch (error) {
        store.dispatch({
          type: 'UPDATE_GPS_LOCATION',
          payload: {
            error: true
          }
        });
        locationLoading.current = false;
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

  useEffect(() => {
    if (auth.profile && languagedata.langlist && settings && initialFunctionsNotCalled.current) {
      setAuthStillNotResponded(false);
      if (!validateUserType('customer')) {
        return;
      }

      setAuthState('customer');
      if (auth.profile.lang) {
        i18n.locale = auth.profile.lang.langLocale;
        moment.locale(auth.profile.lang.dateLocale);
      }

      saveToken();
      fetchingToken.current = false;
      dispatch(api.fetchDrivers('app'));
      dispatch(api.fetchBookings());
      dispatch(api.fetchCancelReasons());
      dispatch(api.fetchPaymentMethods());
      dispatch(api.fetchPromos());
      dispatch(api.fetchUserNotifications());
      dispatch(api.fetchAddresses());
      dispatch(api.fetchWalletHistory());
      dispatch(api.fetchComplain());
      dispatch(api.fetchTaxes());
      initialFunctionsNotCalled.current = false;
    }
  }, [auth.profile, dispatch, fetchingToken, initialFunctionsNotCalled, languagedata.langlist, saveToken, settings, setAuthState, setAuthStillNotResponded, validateUserType]);

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
