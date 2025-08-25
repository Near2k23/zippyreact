import React, { useState, useEffect } from 'react';
import { Icon } from 'react-native-elements';
import { colors } from '../common/theme';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Keyboard,
  Image,
  Modal,
  ScrollView,
  Platform
} from 'react-native';
import i18n from 'i18n-js';
import { api } from 'common';
import { useSelector, useDispatch } from 'react-redux';
import { checkSearchPhrase, appConsts } from '../common/sharedFunctions';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
var { width,height } = Dimensions.get('window');
import {  StackActions } from '@react-navigation/native';
import { Entypo, MaterialIcons, AntDesign, FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Button } from 'react-native-elements';
import uuid from 'react-native-uuid';
import { fonts } from '../common/font';
import { useColorScheme } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import WaygoDialog from '../components/WaygoDialog';

const hasNotch = DeviceInfo.hasNotch();

export default function SearchScreen(props) {
  const { t } = i18n;
  const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
  const {
    fetchCoordsfromPlace,
    fetchPlacesAutocomplete,
    updateTripPickup,
    updateTripDrop,
    editAddress
  } = api;
  const dispatch = useDispatch();
  const [searchResults, setSearchResults] = useState([]);
  const [isShowingResults, setIsShowingResults] = useState(false);
  const tripdata = useSelector(state => state.tripdata);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const { locationType, addParam } = props.route.params;
  const [loading, setLoading] = useState();
  const settingsdata = useSelector(state => state.settingsdata.settings);
  const [settings, setSettings] = useState({});
  const [selLocations, setSelLocations] = useState([]);
  const auth = useSelector(state => state.auth);
  const [profile, setProfile] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [isShowingResults2, setIsShowingResults2] = useState(false);
  const [searchResults2, setSearchResults2] = useState([]);
  const [searchKeyword2, setSearchKeyword2] = useState('');
  const [addressName,setAddressName] = useState('');
  const [address,setAddress] = useState('');
  const addressdata = useSelector(state => state.addressdata);
  const [saveNameValue, setSaveNameValue] = useState('');
  let colorScheme = useColorScheme();
  const [mode, setMode] = useState();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogData, setDialogData] = useState({});

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
  const saveName = [
    {value: t('home'), lable: t('home'), icon: 'home-outline', type: 'material-community'},
    {value: t('work'), lable: t('work'), icon: 'domain', type: 'materialIcons'},
    {value: t('other'), lable: t('other'), icon: 'location-outline', type: 'ionicon'}
  ];

  const [UUID, setUUID] = useState();

  useEffect(()=>{
    const uuidv4 = uuid.v4()
    setUUID(uuidv4);
    return () => {
      setUUID(null);
    };
  },[]);

  useEffect(() => {
    if (addressdata.addresses) {
        setSavedAddresses(addressdata.addresses);
    } else {
      setSavedAddresses([]);
    }    
  },[addressdata, addressdata.addresses]);

  useEffect(() => {
    if (settingsdata) {
      setSettings(settingsdata);
    }
  }, [settingsdata]);

  useEffect(() => {
    if (auth.profile && auth.profile.uid) {
        setProfile(auth.profile);
    } else {
        setProfile(null);
    }
  }, [auth && auth.profile]);

  useEffect(() => {
    if (settingsdata) {
      setSettings(settingsdata);
    }
  }, [settingsdata]);

  const setAddressOnMap = (item)=>{
    props.navigation.dispatch(StackActions.pop(1));
    if(locationType == 'pickup'){
      dispatch(updateTripPickup({...tripdata.pickup, source:"mapSelect"}));
    }else{
      dispatch(updateTripDrop({...tripdata.drop, source:"mapSelect"}));
    }
  }

  useEffect(() => {
    if (tripdata.drop && locationType == 'drop') {
      let arr = []
      if (tripdata.drop && tripdata.drop.waypoints) {
        const waypoints = tripdata.drop.waypoints;
        for (let i = 0; i < waypoints.length; i++) {
          arr.push(waypoints[i]);
        }
      }
      if (tripdata.drop.add) {
        arr.push({
          lat: tripdata.drop.lat,
          lng: tripdata.drop.lng,
          add: tripdata.drop.add,
          source: tripdata.drop.source
        });
      }
      setSelLocations(arr);
    }
  }, [locationType, tripdata.drop]);

  const searchLocation = async (text) => {
    setSearchKeyword(text);
    if (text.length > (settings.AllowCriticalEditsAdmin ? 3 : 5)) {
      const res = await fetchPlacesAutocomplete(text, UUID);
      if (res) {
        setSearchResults(res);
        setIsShowingResults(true);
      }
    }
  };

  const updateLocation = (data) => {
    setModalVisible(false);
    setLoading(true);
    setSearchKeyword(checkSearchPhrase(data.description));
    setIsShowingResults(false);
    if (data.place_id) {
      fetchCoordsfromPlace(data.place_id).then((res) => {
        if (res && res.lat) {
          if (locationType == 'pickup') {
            dispatch(updateTripPickup({
              lat: res.lat,
              lng: res.lng,
              add: data.description,
              source: 'search'
            }));
            if (appConsts.hasMultiDrop) {
              props.navigation.dispatch(StackActions.pop(1));
            }
          } else {
            if (appConsts.hasMultiDrop) {
              let arr = selLocations;
              arr.push({
                lat: res.lat,
                lng: res.lng,
                add: data.description,
                source: 'search'
              });
              Keyboard.dismiss();
              setSelLocations(arr);
            } else {
              dispatch(updateTripDrop({
                lat: res.lat,
                lng: res.lng,
                add: data.description,
                source: 'search'
              }));
            }
          }
          setLoading(false);
          if (!appConsts.hasMultiDrop) {
            props.navigation.dispatch(StackActions.pop(1));
          }
        } else {
          setDialogData({
            title: t('alert'),
            message: t('place_to_coords_error'),
            type: 'warning'
          });
          setDialogVisible(true);
        }
      });
    } else {
      if (data.description) {
        if (locationType == 'pickup') {
          dispatch(updateTripPickup({
            lat: data.lat,
            lng: data.lng,
            add: data.description,
            source: 'search'
          }));
          if (appConsts.hasMultiDrop) {
            props.navigation.dispatch(StackActions.pop(1));
          }
        } else {
          if (appConsts.hasMultiDrop) {
            let arr = [...selLocations];
            let notFound = true;
            for (let i = 0; i < arr.length; i++) {
              if (arr[i].add == data.description) {
                notFound = false;
                break;
              }
            }
            if (notFound) {
              let entry = {
                lat: data.lat,
                lng: data.lng,
                add: data.description,
                source: 'search'
              };
              arr.push(entry);
            }
            Keyboard.dismiss();
            setSelLocations(arr);
          } else {
            dispatch(updateTripDrop({
              lat: data.lat,
              lng: data.lng,
              add: data.description,
              source: 'search'
            }));
          }

        }
        setLoading(false);
        if (!appConsts.hasMultiDrop) {
          props.navigation.dispatch(StackActions.pop(1));
        }
      }
    }
  }

  const searchSaveLocation = async (text) => {
    setSearchKeyword2(text);
    if (text.length > (settings.AllowCriticalEditsAdmin ? 3 : 5)) {
      const res = await fetchPlacesAutocomplete(text, UUID);
      if (res) {
        setSearchResults2(res);
        setIsShowingResults2(true);
      }
    }
  };

  useEffect(() => {
    if (tripdata.drop && locationType == 'drop') {
      let arr = []
      if (tripdata.drop && tripdata.drop.waypoints) {
        const waypoints = tripdata.drop.waypoints;
        for (let i = 0; i < waypoints.length; i++) {
          arr.push(waypoints[i]);
        }
      }
      if (tripdata.drop.add) {
        arr.push({
          lat: tripdata.drop.lat,
          lng: tripdata.drop.lng,
          add: tripdata.drop.add,
          source: tripdata.drop.source
        });
      }
      setSelLocations(arr);
    }
  }, [locationType, tripdata.drop]);

  const okClicked = () => {
    let waypoints = [...selLocations];
    waypoints.splice(selLocations.length - 1, 1);
    let dropObj = {
      ...selLocations[selLocations.length - 1],
      waypoints: waypoints
    }
    dispatch(updateTripDrop(dropObj));
    props.navigation.dispatch(StackActions.pop(1));
  }

  const saveLocation = (item)=>{
    if(item && saveNameValue && ((saveNameValue== t('other') && addressName) || saveNameValue!= t('other'))){
      let name = saveNameValue== t('other') ? addressName : saveNameValueßß
      if (saveNameValue === t('home') || saveNameValue === t('work')) {
        const existingAddress = savedAddresses.find(addr => addr.name === saveNameValue.toLowerCase());
        if (existingAddress) {
          setDialogData({
            title: t('alert'),
            message: t('address_already_exists_error'),
            type: 'warning',
            onConfirm: () => {
              setDialogVisible(false);
            }
          });
          setDialogVisible(true);
          return;
        }
      }
      
      setLoading(true);
      fetchCoordsfromPlace(item.place_id).then((res) => {
        if (res && res.lat) {
          let dropObj = {
            lat: res.lat,
            lng: res.lng,
            description: item.description,
            name: name.toLowerCase()
          }
         dispatch(editAddress(profile.uid, dropObj, 'Add'));
        }
      })
      setTimeout(()=>{
        setAddress('')
        setAddressName('')
        setLoading(false)
        setSearchKeyword2('')
        setSaveNameValue('')
      },3000)
    }else{
      setDialogData({
        title: t('alert'),
        message: t('no_details_error'),
        type: 'warning',
        onConfirm: () => {
          setLoading(false);
          setDialogVisible(false);
        }
      });
      setDialogVisible(true);
    }
  }

  const removeItem = (index) => {
    let arr = [...selLocations];
    arr.splice(index, 1);
    setSelLocations(arr);
  }

  const onPressDelete = (item) =>{
    setDialogData({
      title: t('confirm'),
      message: t('confirm_delete_saved_address'),
      type: 'warning',
      icon: 'alert-octagon-outline',
      iconColor: colors.RED,
      onConfirm: () => {
        dispatch(editAddress(profile.uid, item, 'Delete'));
        setDialogVisible(false);
      }
    });
    setDialogVisible(true);
  }

  const closeModel = () => {
    setSearchKeyword2('')
    setAddressName('')
    setAddress('')
    setModalVisible(!modalVisible)
    setSaveNameValue('')
  }



  return (
    <View style={{flex:1, backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}}>
      <View style={{flex: 1,backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE, height:'100%', width: '100%', alignContent: 'center', alignItems:'center' }}>

      <View style={[mode === 'dark' ? styles.addressBarDark : styles.addressBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[styles.contentStyle]}>
          {locationType == 'drop' ?
            <View style={[styles.addressBox, {flexDirection:isRTL? 'row-reverse':'row', gap: 5}]}>
              <View style={{height: 16, width: 16, borderRadius: 8, borderColor: colors.GREEN, borderWidth: 1, justifyContent: 'center', alignItems: 'center'}}>
                <View style={{height: 10, width: 10, borderRadius: 5, backgroundColor: colors.GREEN }}></View>
              </View>
              <View style={[styles.addressStyle1, {flexDirection:isRTL? 'row-reverse':'row', borderBottomColor: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>
                <Text numberOfLines={1} style={[mode === 'dark' ? styles.textStyleDark : styles.textStyle, { textAlign: isRTL ? "right" : "left", fontSize: 14 }]}>{tripdata.pickup && tripdata.pickup.add ? tripdata.pickup.add : t('map_screen_where_input_text')}</Text>
              </View>
            </View>
          : null }

          {appConsts.hasMultiDrop && selLocations.length > 0 ?
            <FlatList
              data={selLocations}
              renderItem={({ item, index }) => {
                return (
                <View key={"key" + index} style={[styles.addressBox, {flexDirection:isRTL? 'row-reverse':'row', marginBottom: 1, width: width-12, gap: 5}]}>
                  <View style={[styles.multiAddressChar,{borderColor: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>
                    <Text style={{fontFamily:fonts.Bold, fontSize: 14, color: mode === 'dark' ? colors.WHITE : colors.BLACK }}>{String.fromCharCode(65+index)}</Text> 
                  </View>
                  <View style={[styles.multiAddressStyle, {flexDirection:isRTL? 'row-reverse':'row', borderBottomColor: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>
                    <Text numberOfLines={1} style={[mode === 'dark' ? styles.textStyleDark : styles.textStyle, {textAlign: isRTL ? "right" : "left", width: width-80 }]}>{item.add}</Text>
                  </View>
                  <TouchableOpacity style={[styles.dropremove,{ borderBottomColor: mode === 'dark' ? colors.WHITE : colors.BLACK}]} onPress={() => removeItem(index)}>
                    <Entypo name="cross" size={24} color= {mode === 'dark' ? colors.WHITE : colors.SECONDARY} style={{borderLeftWidth: 1, borderLeftColor: mode === 'dark' ? colors.WHITE : colors.SECONDARY}}/>
                  </TouchableOpacity>
                </View>
                );
              }}
              keyExtractor={(item) => item.add}
              style={styles.multiLocation}
            />
          : null}
    
          <View style={styles.addressStyle2}>
            <View style={[styles.autocompleteMain, { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 5}]}>
              {locationType == 'pickup' ?
                <View style={{height: 16, width: 16, borderRadius: 8, borderColor: colors.GREEN, borderWidth: 1, justifyContent: 'center', alignItems: 'center'}}>
                  <View style={{height: 10, width: 10, borderRadius: 5, backgroundColor: colors.GREEN }}></View>
                </View>
              :
              <View style={{height: 16, width: 16, borderRadius: 8, borderColor: colors.RED, borderWidth: 1, justifyContent: 'center', alignItems: 'center'}}>
                <View style={{height: 10, width: 10, borderRadius: 5, backgroundColor: colors.RED }}></View>
              </View>
              }
              <TextInput
                placeholder={t('search_for_an_address')}
                returnKeyType="search"
                style={[mode === 'dark' ? styles.searchBoxDark : styles.searchBox, isRTL ? { textAlign: 'right' } : { textAlign: 'left' }]}
                placeholderTextColor= {mode === 'dark' ? colors.WHITE : colors.BLACK}
                onChangeText={(text) => searchLocation(text)}
                value={searchKeyword}
              />
            </View>
          </View>
        </View>
      </View>

      {!searchKeyword ?
       <TouchableOpacity onPress={() => setAddressOnMap()} style={[mode === 'dark' ? styles.optionCardDark : styles.optionCard,{flexDirection:isRTL? 'row-reverse':'row', marginTop: 5}]}>        
        <View style={[styles.optionLeftIcon]}>          
          <Ionicons name={locationType == 'pickup' ? 'navigate-outline' : 'location-outline'} size={22} color={mode === 'dark' ? colors.WHITE : colors.BLACK} />        
        </View>
        <View style={{flex:1, justifyContent: 'center' }}>
          <Text style={{ textAlign: isRTL ? 'right' : 'left', fontSize: 16, fontFamily:fonts.Bold, color: mode === 'dark' ? colors.WHITE : colors.BLACK}}>{ locationType == 'pickup' ? t('pickup_address_from_map') : t('drop_address_from_map')}</Text>
        </View>
        <MaterialIcons name={isRTL ? 'keyboard-arrow-left' : 'keyboard-arrow-right'} size={28} color={mode === 'dark' ? colors.WHITE : colors.SHADOW} />
      </TouchableOpacity>
      :null }

     {!searchKeyword ?
     <TouchableOpacity onPress={() => setModalVisible(true)} style={[mode === 'dark' ? styles.optionCardDark : styles.optionCard,{flexDirection:isRTL? 'row-reverse':'row', marginTop: 10}]}>        
        <View style={styles.optionLeftIcon}>          
          <MaterialCommunityIcons name="bookmark-outline" size={22} color={mode === 'dark' ? colors.WHITE : colors.BLACK} />        
        </View>
        <View style={{flex:1, justifyContent: 'center' }}>
          <Text style={{ textAlign: isRTL ? 'right' : 'left', fontFamily:fonts.Bold,fontSize: 16, color: mode === 'dark' ? colors.WHITE : colors.BLACK}}>{t('saved_address')}</Text>
        </View>
        <MaterialIcons name={isRTL ? 'keyboard-arrow-left' : 'keyboard-arrow-right'} size={28} color={mode === 'dark' ? colors.WHITE : colors.SHADOW} />
      </TouchableOpacity>
      :null }

      {searchKeyword && isShowingResults ?
        <FlatList
          keyboardShouldPersistTaps='always'
          data={searchResults}
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity
                key={item.description}
                style={styles.resultItem}
                onPress={() => updateLocation(item)}>
                <Text numberOfLines={1} style={{fontSize: 16,fontFamily:fonts.Regular, textAlign: isRTL ? "right" : "left", width: width-20, color: mode === 'dark' ? colors.WHITE : colors.BLACK}}>{item.description}</Text>
              </TouchableOpacity>
            );
          }}
          style={styles.searchResultsContainer}
        />
        : null}

        {loading ?
          <View style={styles.loading}>
            <ActivityIndicator color={colors.BLACK} size='large' />
          </View>
        : null}
        {selLocations.length > 0 && locationType == 'drop' ?
          <View style={styles.okButtonContainer}>
            <TouchableOpacity onPress={okClicked} style={[styles.okButton, {
              backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR
            }]}>
              <Text style={styles.okButtonText}>{t('ok')}</Text>
            </TouchableOpacity>
          </View>
        : null}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={[mode === 'dark' ? styles.centeredViewDark : styles.centeredView]}>
          <View style={[styles.modalHeader, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND }]}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => closeModel()}
            >
              <MaterialIcons 
                name={isRTL ? "arrow-right" : "arrow-back"} 
                size={24} 
                color={mode === 'dark' ? colors.WHITE : colors.BLACK} 
              />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>{t('saved_address')}</Text>
          </View>

          <ScrollView 
            style={[styles.modalContent, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
          >
            <View style={styles.imageContainer}>
              <Image 
                source={require('../../assets/images/address.png')} 
                style={styles.addressImage}
                resizeMode="contain"
              />
            </View>

            {address && saveNameValue === t('other') && (
              <View style={styles.nameInputContainer}>
                <Text style={[styles.inputLabel, { color: mode === 'dark' ? colors.WHITE : '#A7A9AC' }]}>
                  {t('name')}
                </Text>
                <TextInput
                  style={[styles.nameInput, {
                    color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                    borderColor: '#E2E9EC',
                    backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE
                  }]}
                  placeholder={''}
                  placeholderTextColor={colors.SECONDARY}
                  value={addressName}
                  onChangeText={setAddressName}
                  autoCapitalize='none'
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
            )}

            <View style={{width: "100%", marginBottom: 10}}>
              <Text style={[styles.inputLabel, { color: mode === 'dark' ? colors.WHITE : '#A7A9AC' }]}>{t('search_for_an_address')}</Text>
              <View style={[styles.searchContainer, {
                borderColor: '#E2E9EC',
                backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE
              }]}>
                <Ionicons name="location-outline" size={20} color={colors.SECONDARY} style={{ marginRight: 10 }} />
                <TextInput
                  placeholder={''}
                  returnKeyType="search"
                  style={[styles.searchInput, {
                    color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                    textAlign: isRTL ? 'right' : 'left',
                    flex: 1,
                    fontFamily: fonts.Regular
                  }]}
                  placeholderTextColor={colors.SECONDARY}
                  onChangeText={(text) => searchSaveLocation(text)}
                  value={address ? address.description : searchKeyword2}
                />
                {address && (
                  <TouchableOpacity onPress={() => setAddress('')} style={{ marginLeft: 10 }}>
                    <Entypo name="cross" size={20} color={colors.SECONDARY} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {searchKeyword2 && isShowingResults2 && !address && (
              <View style={styles.searchResultsWrapper}>
                <FlatList
                  keyboardShouldPersistTaps='always'
                  data={searchResults2}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.searchResultItem, {
                        borderBottomColor: mode === 'dark' ? colors.WHITE : '#E0E0E0'
                      }]}
                      onPress={() => setAddress(item)}
                    >
                      <Ionicons name="location-outline" size={20} color={colors.SECONDARY} />
                      <Text numberOfLines={2} style={[styles.searchResultText, {
                        color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                        textAlign: isRTL ? "right" : "left"
                      }]}>
                        {item.description}
                      </Text>
                    </TouchableOpacity>
                  )}
                  style={styles.searchResults}
                  nestedScrollEnabled={true}
                />
              </View>
            )}

            <View style={styles.categoryContainer}>
              <View style={[styles.categoryGrid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {saveName.map((item, index) => (
                                      <TouchableOpacity
                      key={index}
                      style={[styles.categoryCard, {
                        backgroundColor: item.value === saveNameValue 
                          ? (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR)
                          : 'transparent'
                      }]}
                      onPress={() => setSaveNameValue(item.value)}
                    >
                    <Icon
                      name={item.icon}
                      type={item.type}
                      color={item.value === saveNameValue ? colors.WHITE : (mode === 'dark' ? colors.WHITE : colors.BLACK)}
                      size={24}
                    />
                    <Text style={[styles.categoryText, {
                      color: item.value === saveNameValue ? colors.WHITE : (mode === 'dark' ? colors.WHITE : colors.BLACK)
                    }]}>
                      {item.lable}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {address && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.saveButton, { 
                    backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR,
                    opacity: loading ? 0.7 : 1
                  }]}
                  onPress={() => saveLocation(address)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.WHITE} size="small" />
                  ) : (
                    <Text style={styles.buttonText}>{t('save')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {!searchKeyword2 && !address && (
              <View style={styles.savedAddressList}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                  {savedAddresses && savedAddresses.length > 0 ? (
                    savedAddresses.map((savedAddress, index) => {
                      const normalizedName = (savedAddress?.name || '').toLowerCase();
                      const isHome = normalizedName === 'home' || normalizedName === t('home').toLowerCase();
                      const isWork = normalizedName === 'work' || normalizedName === t('work').toLowerCase();
                      const iconColor = mode === 'dark' ? colors.WHITE : colors.BLACK;
                      return (
                        <View
                          key={index}
                          style={[styles.savedAddressCard, {
                            backgroundColor: mode === 'dark' ? '#2A2A2A' : colors.WHITE,
                            borderColor: mode === 'dark' ? colors.WHITE : '#E2E9EC'
                          }]}
                        >
                          <TouchableOpacity
                            style={[styles.savedAddressContent, { flexDirection: 'row' }]}
                            onPress={() => updateLocation(savedAddress)}
                          >
                            <View style={[
                              styles.addressIcon,
                              {
                                marginRight: isRTL ? 0 : 12,
                                marginLeft: isRTL ? 12 : 0
                              }
                            ]}>
                              {isHome ? (
                                <MaterialCommunityIcons name="home-outline" size={18} color={iconColor} />
                              ) : isWork ? (
                                <MaterialIcons name="domain" size={18} color={iconColor} />
                              ) : (
                                <Ionicons name="location-outline" size={18} color={iconColor} />
                              )}
                            </View>
                            <View style={styles.addressInfo}>
                              <Text style={[styles.addressName, {
                                color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                                textAlign: isRTL ? "right" : "left"
                              }]}>
                                {(savedAddress.name || '').charAt(0).toUpperCase() + (savedAddress.name || '').slice(1)}
                              </Text>
                              <Text style={[styles.addressDescription, {
                                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                                textAlign: isRTL ? "right" : "left"
                              }]}>
                                {savedAddress.description}
                              </Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => onPressDelete(savedAddress)}
                          >
                            <MaterialCommunityIcons 
                              name="delete-outline" 
                              size={20} 
                              color={colors.RED} 
                            />
                          </TouchableOpacity>
                        </View>
                      );
                    })
                  ) : (
                    <View style={styles.noAddressContainer}>
                      <Text style={[styles.noAddressText, {
                        color: mode === 'dark' ? colors.WHITE : colors.BLACK
                      }]}>
                        {t('no_saved_address')}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      <WaygoDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        title={dialogData.title}
        message={dialogData.message}
        type={dialogData.type}
        showButtons={!!dialogData.onConfirm}
        onConfirm={dialogData.onConfirm}
        confirmText={t('ok')}
        cancelText={t('cancel')}
      />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  floting:{
    minWidth: 150,
    height:50,
    position:'absolute',
    bottom:40,
    justifyContent:'center',
    alignItems:'center',
    alignSelf:'center',
    borderRadius:10,
    backgroundColor:colors.GREEN,
    shadowColor: colors.BLACK,
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  okButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    gap: 10,
  },
  okButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okButtonText: {
    fontSize: 14,
    fontFamily: fonts.Medium,
    lineHeight: 18,
    color: colors.WHITE,
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40
  },
  autocompleteMain: {
    alignItems: 'center'
  },
  searchBox: {
    width: width-45,
    height: 40,
    fontSize: 14,
    borderColor: colors.WHITE,
    color:  colors.BLACK,
    borderRadius: 10,
    fontFamily:fonts.Regular
  },
  searchBoxDark: {
    width: width-45,
    height: 40,
    fontSize: 14,
    borderColor: colors.BLACK,
    color: colors.WHITE,
    borderRadius: 10,
    fontFamily:fonts.Regular
  },
  description: {
    color: colors.BLACK,
    textAlign: 'left',
    fontSize: 14
  },
  resultItem: {
    width: '100%',
    justifyContent: 'center',
    borderBottomWidth: 1,
    backgroundColor: colors.TRANSPARENT,
    alignItems: 'flex-start',
    height: 40,
    justifyContent:'center',
    borderBottomWidth: .5,
    paddingHorizontal: 5
  },
  searchResultsContainer: {
    width: width,
    paddingHorizontal: 5
  },
  headerTitleStyle: {
    color: colors.WHITE,
    fontFamily: fonts.Bold,
    fontSize: 20
  },
  multiLocation: {
    width: width-10
  },
  addressBar: {
    marginVertical: 5,
    width: width - 10,
    flexDirection: 'row',
    backgroundColor: colors.WHITE,
    shadowColor: colors.BLACK,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    borderRadius: 8,
    elevation: 3
  },
  addressBarDark: {
    marginVertical: 5,
    width: width - 10,
    flexDirection: 'row',
    backgroundColor: colors.PAGEBACK,
    shadowColor: colors.SHADOW,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    borderRadius: 8,
    elevation: 3
  },
  contentStyle: {
    justifyContent: 'center',
    width: width,
    alignItems: 'center'
  },
  addressBox: {
    height: 48,
    width: width - 20,
    alignItems:'center',
    paddingTop: 2
  },
  addressStyle1: {
    borderBottomWidth: 1,
    height: 48,
    width: width - 50,
    alignItems:'center'
  },
  addressStyle2: {
    height: 45,
    width: width - 15,
    justifyContent: 'center',
    marginTop: 2
  },
  hbox1: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: colors.GREEN,
    marginHorizontal: 3
  },
  hbox3: {
    height: 12,
    width: 12,
    backgroundColor: colors.RED,
    marginHorizontal: 5
  },
  textStyle: {
    fontFamily: fonts.Regular,
    fontSize: 14,
    color: colors.BLACK,
    width: width - 36
  },
  textStyleDark: {
    fontFamily: fonts.Regular,
    fontSize: 14,
    color: colors.WHITE,
    width: width - 36
  },
  saveBox:{
    height: 50,
    width: width-10,
    justifyContent:'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: colors.WHITE,
    shadowColor: colors.BLACK,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    borderRadius: 10,
    elevation: 3
  },
  saveBoxDark:{
    height: 50,
    width: width-10,
    justifyContent:'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: colors.PAGEBACK,
    shadowColor: colors.SHADOW,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    borderRadius: 10,
    elevation: 3
  },
  centeredView: {
    flex: 1,
    backgroundColor: colors.WHITE
  },
  centeredViewDark: {
    flex: 1,
    backgroundColor: colors.PAGEBACK
  },
  modalHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 15,
    elevation: 0,
    shadowOpacity: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  headerTitle: {
    fontFamily: fonts.Bold,
    fontSize: 20,
    marginTop: 8,
    marginLeft: 0,
    textAlign: 'left',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10
  },
  addressImage: {
    width: width * 0.8,
    height: height * 0.25,
    maxHeight: 200
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 10,
    height: 50
  },
  searchInput: {
    fontSize: 14,
    fontFamily: fonts.Regular
  },
  inputLabel: {
    width: '100%',
    fontSize: 13,
    color: '#A7A9AC',
    marginBottom: 6,
    fontFamily: fonts.Bold
  },
  categoryContainer: {
    marginBottom: 20
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: fonts.Medium,
    marginBottom: 12
  },
  categoryGrid: {
    justifyContent: 'space-between'
  },
  categoryCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 4,
    minHeight: 80
  },
  categoryText: {
    fontSize: 12,
    fontFamily: fonts.Medium,
    marginTop: 8,
    textAlign: 'center'
  },
  nameInputContainer: {
    marginBottom: 20,
    width: "100%"
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 15,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 14,
    fontFamily: fonts.Regular
  },
  buttonContainer: {
    marginBottom: 20
  },
  saveButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.Medium,
    color: colors.WHITE
  },
  searchResultsWrapper: {
    marginBottom: 20,
    maxHeight: 200,
    backgroundColor: 'transparent'
  },
  searchResults: {
    maxHeight: 200
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1
  },
  searchResultText: {
    fontSize: 14,
    fontFamily: fonts.Regular,
    marginLeft: 12,
    flex: 1
  },
  savedAddressList: {
    flex: 1
  },
  savedAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    shadowColor: colors.BLACK,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  savedAddressContent: {
    flex: 1,
    alignItems: 'center'
  },
  addressIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addressInfo: {
    flex: 1
  },
  addressName: {
    fontSize: 16,
    fontFamily: fonts.Bold,
    marginBottom: 4
  },
  addressDescription: {
    fontSize: 13,
    fontFamily: fonts.Regular,
    lineHeight: 18
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8
  },
  noAddressContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60
  },
  noAddressText: {
    fontSize: 16,
    fontFamily: fonts.Medium,
    textAlign: 'center'
  },

  dropremove:{
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    height: 48
  },
  multiAddressStyle: {
    borderBottomWidth: 1,
    height: 48,
    width: width - 55,
    alignItems:'center',
    width: width-80
  },
  multiAddressChar:{
    height: 20,
    width: 20,
    marginHorizontal: 3,
    borderWidth: 1,
    backgroundColor: colors.SECONDARY,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  optionLeftIcon:{
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems:'center',
    justifyContent:'center',
    marginRight: 10
  },
  optionCard:{
    height: 56,
    width: width-10,
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E9EC',
    shadowColor: colors.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1
  },
  optionCardDark:{
    height: 56,
    width: width-10,
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: colors.PAGEBACK,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.WHITE,
    shadowColor: colors.SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1
  }
})