import { useState, useEffect, useRef } from 'react';
import { api } from 'common';
import { useSelector, useDispatch } from 'react-redux';
import { Alert, View, Animated, Platform } from 'react-native';
import i18n from 'i18n-js';
import { colors } from './src/common/theme';
import GetPushToken from './src/components/GetPushToken';
import SplashGradientBackground from './src/components/SplashGradientBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment/min/moment-with-locales';

export function useAppCommonShared() {
  const dispatch = useDispatch();
  const gps = useSelector(state => state.gpsdata);
  const auth = useSelector(state => state.auth);
  const settings = useSelector(state => state.settingsdata.settings);
  const zonesdata = useSelector(state => state.zonesdata);
  const languagedata = useSelector(state => state.languagedata);
  const [bounceAnim] = useState(new Animated.Value(1));
  const initialFunctionsNotCalled = useRef(true);
  const fetchingToken = useRef(true);
  const langCalled = useRef(false);
  const [authStillNotResponded, setAuthStillNotResponded] = useState(true);
  const [authState, setAuthState] = useState('loading');
  const [wrongAppDialogVisible, setWrongAppDialogVisible] = useState(false);
  const locationLoading = useRef(true);
  const mismatchHandled = useRef(false);

  useEffect(() => {
    const startBounceAnimation = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ]).start(() => {
        startBounceAnimation();
      });
    };

    startBounceAnimation();
  }, [bounceAnim]);

  useEffect(() => {
    if (api) {
      dispatch(api.fetchSettings());
      dispatch(api.fetchLanguages());
      dispatch(api.fetchCarTypes());
      dispatch(api.fetchBanners());
      dispatch(api.fetchZones());
      langCalled.current = true;
    }
  }, [dispatch]);

  useEffect(() => {
    if (languagedata.langlist && langCalled.current) {
      const translations = {};
      let defaultLanguage = {};

      for (const value of Object.values(languagedata.langlist)) {
        translations[value.langLocale] = value.keyValuePairs;
        if (value.default) {
          defaultLanguage = value;
        }
      }

      i18n.translations = translations;
      i18n.fallbacks = true;
      AsyncStorage.getItem('lang', (err, result) => {
        if (result) {
          const language = JSON.parse(result);
          i18n.locale = language.langLocale;
          moment.locale(language.dateLocale);
        } else {
          i18n.locale = defaultLanguage.langLocale;
          moment.locale(defaultLanguage.dateLocale);
        }
      });
      dispatch(api.fetchUser());
    }
  }, [dispatch, languagedata.langlist]);

  useEffect(() => {
    if (gps.location && gps.location.lat && gps.location.lng && zonesdata.zones && zonesdata.zones.length > 0) {
      const detectedZone = api.detectZoneByLocation(gps.location.lat, gps.location.lng, zonesdata.zones);
      if (detectedZone) {
        dispatch(api.setCurrentZone(detectedZone));
        AsyncStorage.setItem('currentZone', JSON.stringify(detectedZone));
      } else {
        dispatch(api.setCurrentZone(null));
        AsyncStorage.removeItem('currentZone');
      }
    }
  }, [dispatch, gps.location, zonesdata.zones]);

  useEffect(() => {
    if (api && languagedata.langlist && auth.error && auth.error.msg && !auth.profile && settings) {
      locationLoading.current = false;
      setAuthState('failed');
      setAuthStillNotResponded(false);
      initialFunctionsNotCalled.current = true;
      fetchingToken.current = false;
      mismatchHandled.current = false;
      dispatch(api.clearLoginError());
    }
    dispatch(api.fetchusedreferral());
  }, [auth.error, auth.profile, dispatch, languagedata.langlist, settings]);

  useEffect(() => {
    if (!auth.profile?.uid) {
      mismatchHandled.current = false;
    }
  }, [auth.profile?.uid]);

  const saveToken = async () => {
    const token = await GetPushToken();
    if ((auth.profile && auth.profile.pushToken && auth.profile.pushToken !== token) || !(auth.profile && auth.profile.pushToken)) {
      api.updatePushToken(token ? token : 'token_error', Platform.OS === 'ios' ? 'IOS' : 'ANDROID');
    }
  };

  const validateUserType = expectedUserType => {
    if (!auth.profile?.usertype) {
      Alert.alert(i18n.t('alert'), i18n.t('user_issue_contact_admin'));
      dispatch(api.signOff());
      return false;
    }

    if (auth.profile.usertype !== expectedUserType) {
      if (!mismatchHandled.current) {
        mismatchHandled.current = true;
        setWrongAppDialogVisible(true);
        setAuthStillNotResponded(false);
        setAuthState('failed');
        try { dispatch(api.signOutImmediate()); } catch (_) { /* evitar crash JS */ }
      }
      return false;
    }

    return true;
  };

  return {
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
    setWrongAppDialogVisible,
    zonesdata
  };
}

export function AppCommonLoadingScreen({ bounceAnim }) {
  return (
    <SplashGradientBackground>
      <Animated.Image
        source={require('./assets/images/logo_splash.png')}
        style={{
          width: 200,
          height: 200,
          resizeMode: 'contain',
          transform: [{ scale: bounceAnim }]
        }}
      />
    </SplashGradientBackground>
  );
}
