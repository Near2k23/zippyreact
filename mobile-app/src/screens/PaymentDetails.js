import React, { useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  useColorScheme,
  Platform
} from 'react-native';

import { colors } from '../common/theme';
var { width, height } = Dimensions.get('window');
import { PromoComp } from "../components";
import i18n from 'i18n-js';
import { useSelector,useDispatch } from 'react-redux';
import { api } from 'common';
import { MAIN_COLOR, MAIN_COLOR_DARK, appConsts } from '../common/sharedFunctions';
import { CommonActions } from '@react-navigation/native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { fonts } from '../common/font';
import DeviceInfo from 'react-native-device-info';

const hasNotch = DeviceInfo.hasNotch();

export default function PaymentDetails(props) {
  const {
    updateBooking,
    cancelBooking,
    editPromo,
  } = api;
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const settings = useSelector(state => state.settingsdata?.settings || {});
  const providers = useSelector(state => state.paymentmethods?.providers || []);
  const { booking } = props.route.params;
  const [promodalVisible, setPromodalVisible] = useState(false);
  const { t } = i18n;
  const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

  const [profile,setProfile] = useState();
  const [isLoading,setIsLoading] = useState();

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
    if (auth.profile && auth.profile.uid) {
        setProfile(auth.profile);
    } else {
        setProfile(null);
    }
  }, [auth.profile]);

  let colorScheme = useColorScheme();
  const [mode, setMode] = useState();

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

  const [payDetails, setPayDetails] = useState({
    amount: booking.trip_cost,
    discount: booking.discount? booking.discount:0,
    usedWalletMoney: booking.payment_mode === 'wallet'? booking.trip_cost:0,
    promo_applied: booking.promo_applied?booking.promo_applied:false,
    promo_details: booking.promo_details?booking.promo_details:null,
    payableAmount: booking.payableAmount?booking.payableAmount:booking.trip_cost
  });

  const promoModal = () => {
    return (
      <Modal
        animationType="slide"
        visible={promodalVisible}
        onRequestClose={() => {
          setPromodalVisible(false);
        }}
      >
        <View style={[styles.modalContainer, {backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE}]}>
          <View style={{
            backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND,
            paddingTop: Platform.OS === 'ios' ? 50 : 30,
            paddingHorizontal: 20,
            paddingBottom: 15,
            elevation: 0,
            shadowOpacity: 0,
          }}>
            <TouchableOpacity 
              onPress={() => setPromodalVisible(false)}
              style={{ 
                width: 40, 
                height: 40, 
                justifyContent: 'center', 
                alignItems: isRTL ? 'flex-end' : 'flex-start' 
              }}
            >
              <Ionicons
                name={isRTL ? 'arrow-forward' : 'arrow-back'}
                size={24}
                color={mode === 'dark' ? colors.WHITE : colors.BLACK}
              />
            </TouchableOpacity>
            <Text style={{
              fontFamily: 'Inter-Bold',
              color: mode === 'dark' ? colors.WHITE : colors.BLACK,
              fontSize: 20,
              marginTop: 8,
              marginLeft: isRTL ? 0 : 0,
              textAlign: isRTL ? 'right' : 'left',
            }}>
              {t("your_promo")}
            </Text>
          </View>
          
          <PromoComp
            onPressButton={(item, index) => {
              selectCoupon(item, index);
            }}
          ></PromoComp>
          <TouchableOpacity
            onPress={() => {
              setPromodalVisible(false);
            }}
            style={styles.modalCancelButton}
          >
            <Text style={styles.modalCancelText}>
              {t("cancel")}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  const openPromoModal = () => {
    setPromodalVisible(!promodalVisible);
    let data = { ...payDetails };
    data.payableAmount = data.amount;
    data.discount = 0;
    data.promo_applied = false;
    data.promo_details = null;
    data.usedWalletMoney = 0;
    setPayDetails(data);
  }

  const removePromo = () => {
    let data = { ...payDetails };
    data.promo_details.user_avail = parseInt(data.promo_details.user_avail) - 1;
    delete data.promo_details.usersUsed[auth.profile.uid];
    dispatch(editPromo(data.promo_details));
    data.payableAmount = data.amount;
    data.discount = 0;
    data.promo_applied = false;
    data.promo_details = null;
    data.usedWalletMoney = 0;
    setPayDetails(data);
  }

  const doPayment = (payment_mode) => {

    if (payment_mode == 'cash'){
      let curBooking = { ...booking };
      if(booking.status == "PAYMENT_PENDING"){
        curBooking.status = 'NEW';

      } else if(booking.status == "REACHED"){
        if(booking.prepaid || curBooking.booking_from_web || curBooking.payment_mode == "cash"){
          curBooking.status = 'PAID';
        } else{
          curBooking.status = 'PENDING';
        }
      } else if(booking.status == "PENDING"){
        curBooking.status = 'PAID';
      }else if(booking.status == "NEW"){
        curBooking.status = 'ACCEPTED';
      }
      curBooking.payment_mode = payment_mode;
      curBooking.customer_paid = curBooking.status == 'NEW'? 0: parseFloat((parseFloat(payDetails.amount) - parseFloat(payDetails.discount)).toFixed(settings.decimal));
      curBooking.discount = parseFloat(parseFloat(payDetails.discount).toFixed(settings.decimal));
      curBooking.usedWalletMoney = 0;
      curBooking.cardPaymentAmount = 0;
      curBooking.cashPaymentAmount = curBooking.status == 'NEW'? 0 : parseFloat((payDetails.amount- parseFloat(payDetails.discount)).toFixed(settings.decimal));
      curBooking.payableAmount = parseFloat(parseFloat(payDetails.payableAmount).toFixed(settings.decimal));
      curBooking.promo_applied = payDetails.promo_applied;
      curBooking.promo_details = payDetails.promo_details;

      if(curBooking.status === 'ACCEPTED'){
        curBooking.driver = curBooking.selectedBid.driver;
        curBooking.driver_image =  curBooking.selectedBid.driver_image; 
        curBooking.driver_name = curBooking.selectedBid.driver_name;
        curBooking.driver_contact = curBooking.selectedBid.driver_contact;
        curBooking.driver_token = curBooking.selectedBid.driver_token;
        curBooking.vehicle_number = curBooking.selectedBid.vehicle_number;
        curBooking.driverRating = curBooking.selectedBid.driverRating;
        curBooking.trip_cost =  curBooking.selectedBid.trip_cost;
        curBooking.convenience_fees =  curBooking.selectedBid.convenience_fees;
        curBooking.driver_share =  curBooking.selectedBid.driver_share;
        curBooking.driverOffers = {};
        curBooking.requestedDrivers = {};
        curBooking.driverEstimates = {};
        curBooking.selectedBid = {};
      }
      setIsLoading(true);
      dispatch(updateBooking(curBooking));
      setTimeout(()=>{
        if(profile.usertype == 'customer') {
          if(curBooking.status == 'NEW' || curBooking.status == 'ACCEPTED'){
            props.navigation.navigate('BookedCab',{bookingId:booking.id});
          }else{
            props.navigation.navigate('DriverRating',{bookingId:booking});
          }
        }else{
          props.navigation.dispatch(CommonActions.reset({index: 0,routes: [{ name: 'TabRoot'}]}));
        }
        setIsLoading(false);
      }, 2000);


    } else if(payment_mode == 'wallet') {
      let curBooking = { ...booking };
      if(booking.status == "PAYMENT_PENDING"){
        curBooking.prepaid = true;
        curBooking.status = 'NEW';
      } else if(booking.status == "REACHED"){
        if(booking.prepaid || curBooking.booking_from_web ){
          curBooking.status = 'PAID';
        } else{
          curBooking.status = 'PENDING';
        }
      } else if(booking.status == "PENDING"){
        curBooking.status = 'PAID';
      }else if(booking.status == "NEW"){
        curBooking.prepaid = true;
        curBooking.status = 'ACCEPTED';
      }
      curBooking.payment_mode = payment_mode;
      curBooking.customer_paid = (parseFloat(payDetails.amount) - parseFloat(payDetails.discount)).toFixed(settings.decimal);
      curBooking.discount = parseFloat(payDetails.discount).toFixed(settings.decimal);
      curBooking.usedWalletMoney = (parseFloat(payDetails.amount) - parseFloat(payDetails.discount)).toFixed(settings.decimal);
      curBooking.cardPaymentAmount = 0;
      curBooking.cashPaymentAmount = 0;
      curBooking.payableAmount = parseFloat(payDetails.payableAmount).toFixed(settings.decimal);
      curBooking.promo_applied = payDetails.promo_applied;
      curBooking.promo_details = payDetails.promo_details;

      if(curBooking.status === 'ACCEPTED'){
        curBooking.driver = curBooking.selectedBid.driver;
        curBooking.driver_image =  curBooking.selectedBid.driver_image; 
        curBooking.driver_name = curBooking.selectedBid.driver_name;
        curBooking.driver_contact = curBooking.selectedBid.driver_contact;
        curBooking.driver_token = curBooking.selectedBid.driver_token;
        curBooking.vehicle_number = curBooking.selectedBid.vehicle_number;
        curBooking.driverRating = curBooking.selectedBid.driverRating;
        curBooking.trip_cost =  curBooking.selectedBid.trip_cost;
        curBooking.convenience_fees =  curBooking.selectedBid.convenience_fees;
        curBooking.driver_share =  curBooking.selectedBid.driver_share;
        curBooking.driverOffers = {};
        curBooking.requestedDrivers = {};
        curBooking.driverEstimates = {};
        curBooking.selectedBid = {};
      }
      setIsLoading(true);
      dispatch(updateBooking(curBooking));
      setTimeout(()=>{
        if(profile.usertype == 'customer') {
          if(curBooking.status == 'NEW' || curBooking.status == 'ACCEPTED'){
            props.navigation.navigate('BookedCab',{bookingId:booking.id});
          }else{
            props.navigation.navigate('DriverRating',{bookingId:booking});
          }
        }else{
          props.navigation.dispatch(CommonActions.reset({index: 0,routes: [{ name: 'TabRoot'}]}));
        }
        setIsLoading(false);
      }, 2000);
    }else{
      let curBooking = { ...booking };
      if(profile.usertype == 'customer') {
  
        let payData = {
          first_name: profile.firstName,
          last_name: profile.lastName,
          email: profile.email,
          email: profile.email,
          amount: payDetails.payableAmount,
          order_id: booking.id,
          name: t('bookingPayment'),
          description: t('order_id') + booking.id,
          currency: settings.code,
          quantity: 1
        }

        const paymentPacket = { 
          payment_mode: payment_mode,
          customer_paid: parseFloat((parseFloat(payDetails.amount) - parseFloat(payDetails.discount)).toFixed(settings.decimal)),
          discount: parseFloat(parseFloat(payDetails.discount).toFixed(settings.decimal)),
          usedWalletMoney: parseFloat(parseFloat(payDetails.usedWalletMoney).toFixed(settings.decimal)),
          cardPaymentAmount: parseFloat(parseFloat(payDetails.payableAmount).toFixed(settings.decimal)),
          cashPaymentAmount: 0,
          payableAmount: parseFloat(parseFloat(payDetails.payableAmount).toFixed(settings.decimal)),
          promo_applied: payDetails.promo_applied,
          promo_details: payDetails.promo_details 
        };
        curBooking.paymentPacket = paymentPacket;
        
        setIsLoading(true);
        dispatch(updateBooking(curBooking));
        setTimeout(()=>{
          props.navigation.navigate("paymentMethod", {
            payData: payData,
            profile: profile,
            settings: settings,
            providers: providers,
            booking: curBooking
          });
          setIsLoading(false);
        },3000);
      }else{
       if(booking.status == "REACHED"){
          if((booking.prepaid || curBooking.booking_from_web) && settings.prepaid ){
            curBooking.status = 'PAID';
          } else{
            curBooking.status = 'PENDING';
          }
          dispatch(updateBooking(curBooking));
        } 
        props.navigation.dispatch(CommonActions.reset({index: 0,routes: [{ name: 'TabRoot'}]}));
      }
    
    }
  }

  const selectCoupon = (item, index) => {
    var toDay = new Date().getTime();
    var expDate = item.promo_validity
    item.usersUsed = item.usersUsed? item.usersUsed :{};
    if (payDetails.amount < item.min_order) {
      Alert.alert(t('alert'),t('promo_eligiblity'))
    } else if (item.user_avail && item.user_avail >= item.promo_usage_limit) {
      Alert.alert(t('alert'),t('promo_exp_limit'))
    } else if (item.usersUsed[auth.profile.uid]) {
      Alert.alert(t('alert'),t('promo_used'))
    } else if (toDay > expDate) {
      Alert.alert(t('alert'),t('promo_exp'))
    } else {
      let discounttype = item.promo_discount_type.toUpperCase();
      if (discounttype == 'PERCENTAGE') {
        let discount = parseFloat((payDetails.amount * item.promo_discount_value / 100).toFixed(settings.decimal));
        if (discount > item.max_promo_discount_value) {
          let discount = item.max_promo_discount_value;
          let data = { ...payDetails };
          data.discount = discount
          data.promo_applied = true
          item.user_avail = item.user_avail? parseInt(item.user_avail) + 1 : 1;
          item.usersUsed[auth.profile.uid]=true;
          dispatch(editPromo(item));
          data.promo_details = item
          data.payableAmount = parseFloat((data.payableAmount - discount).toFixed(settings.decimal));
          setPayDetails(data);
          setPromodalVisible(false);
        } else {
          let data = { ...payDetails };
          data.discount = discount
          data.promo_applied = true
          item.user_avail = item.user_avail? parseInt(item.user_avail) + 1 : 1;
          item.usersUsed[auth.profile.uid]=true;
          dispatch(editPromo(item));
          data.promo_details = item,
          data.payableAmount = parseFloat((data.payableAmount - discount).toFixed(settings.decimal));
          setPayDetails(data);
          setPromodalVisible(false);
        }
      } else {
        let discount = item.max_promo_discount_value;
        let data = { ...payDetails };
        data.discount = discount
        data.promo_applied = true
        item.user_avail = item.user_avail? parseInt(item.user_avail) + 1 : 1;
        item.usersUsed[auth.profile.uid]=true;
        dispatch(editPromo(item));
        data.promo_details = item,
        data.payableAmount = parseFloat(data.payableAmount - discount).toFixed(settings.decimal);
        setPayDetails(data);
        setPromodalVisible(false);
      }
    }

  }

  const cancelCurBooking = () => {
    Alert.alert(
      t('alert'),
      t('cancel_confirm'),
      [
          { text: t('cancel'), onPress: () => {}, style: 'cancel' },
          { text: t('ok'), onPress: () => {
              payDetails.promo_applied? removePromo(): null;
              dispatch(
                cancelBooking(
                  { 
                    booking: booking, 
                    reason: t('cancelled_incomplete_booking'),
                    cancelledBy: profile.usertype 
                  }
                )
              );
              props.navigation.navigate('TabRoot', { screen: 'Map' });
            }
          },
      ]
    );
  };

  return (
    <View style={[styles.mainView,{backgroundColor: mode === 'dark' ? colors.PAGEBACK : '#f8f9fa'}]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollStyle}
        contentContainerStyle={styles.scrollContent}
      >


        {/* Trip Details Card for Driver */}
        {profile && profile.usertype == "driver" ? (
          <View style={[styles.tripCard, {
            backgroundColor: mode === 'dark' ? colors.HEADER : colors.WHITE,
            shadowColor: mode === 'dark' ? colors.WHITE : colors.BLACK
          }]}>
            <View style={styles.tripHeader}>
              <FontAwesome5 name="route" size={20} color={mode === 'dark' ? colors.WHITE : MAIN_COLOR} />
              <Text style={[styles.tripTitle, {color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>
                {t("trip_details")}
              </Text>
            </View>
            
            <View style={styles.tripDetailsContainer}>
              <View style={[ styles.location, { flexDirection: isRTL ? "row-reverse" : "row" }]} >
                {booking && booking.trip_start_time ? (
                  <View style={styles.timeContainer}>
                    <Text style={[ styles.timeStyle, { textAlign: isRTL ? "right" : "left", color: mode === 'dark' ? colors.WHITE : colors.BLACK }]} >
                      {booking.trip_start_time}
                    </Text>
                  </View>
                ) : null}
                {booking && booking.pickup ? (
                  <View style={[ styles.address, isRTL ? { flexDirection: "row-reverse", marginRight: 6 } : { flexDirection: "row", marginLeft: 6 }]}>
                    <View style={styles.greenDot} />
                    <Text style={[ styles.adressStyle, {color: mode === 'dark' ? colors.WHITE : colors.BLACK}, isRTL ? { marginRight: 6, textAlign: "right" } : { marginLeft: 6, textAlign: "left" }]}>
                      {booking.pickup.add}
                    </Text>
                  </View>
                ) : null}
              </View>
              
              {booking && booking.waypoints && booking.waypoints.length > 0 ? 
                booking.waypoints.map((point, index) => {
                  return (
                    <View key={"key" + index} style={[styles.location, isRTL?{flexDirection:'row-reverse'}:{flexDirection:'row'}, {justifyContent: 'center', alignItems:'center'}]}>
                        <View style={styles.timeContainer}>
                            <MaterialIcons name="multiple-stop" size={24} color={colors.SHADOW}/> 
                        </View>
                        <View  style={[styles.address, isRTL?{flexDirection:'row-reverse', marginRight:6}:{flexDirection:'row', marginLeft:6}]}>
                            <Text numberOfLines={2} style={[styles.adressStyle,{color: mode === 'dark' ? colors.WHITE : colors.BLACK}, isRTL?{marginRight:6, textAlign:'right'}:{marginLeft:6, textAlign:'left'}]}>{point.add}</Text>
                        </View>
                    </View>
                  ) 
                })
              : null}
              
              <View style={[styles.location, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                {booking && booking.trip_end_time ? (
                  <View style={styles.timeContainer}>
                    <Text style={[styles.timeStyle, { textAlign: isRTL ? "right" : "left", color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                      {booking.trip_end_time}
                    </Text>
                  </View>
                ) : null}
                {booking && booking.drop ? (
                  <View style={[styles.address, isRTL ? { flexDirection: "row-reverse", marginRight: 6 } : { flexDirection: "row", marginLeft: 6 }]}>
                    <View style={styles.redDot} />
                    <Text style={[ styles.adressStyle, {color: mode === 'dark' ? colors.WHITE : colors.BLACK}, isRTL ? { marginRight: 6, textAlign: "right" } : { marginLeft: 6, textAlign: "left" }]}>
                      {booking.drop.add}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
            
            <View style={styles.tripStatsContainer}>
              <View style={[styles.statItem, {flexDirection: isRTL ? "row-reverse" : "row"}]}>
                <Ionicons name="speedometer-outline" size={18} color={mode === 'dark' ? colors.WHITE : MAIN_COLOR} />
                <Text style={[styles.statLabel, {color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? "right" : "left"}]}>
                  {t("distance")}
                </Text>
                <Text style={[styles.statValue, {color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? "right" : "left"}]}>
                  {(booking && booking.distance ? booking.distance : "0") +
                    " " +
                    (settings && settings.convert_to_mile ? t("mile") : t("km"))}
                </Text>
              </View>
              
              <View style={[styles.statItem, {flexDirection: isRTL ? "row-reverse" : "row"}]}>
                <Ionicons name="time-outline" size={18} color={mode === 'dark' ? colors.WHITE : MAIN_COLOR} />
                <Text style={[styles.statLabel, {color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? "right" : "left"}]}>
                  {t("total_time")}
                </Text>
                <Text style={[styles.statValue, {color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? "right" : "left"}]}>
                  {(booking && booking.total_trip_time
                    ? Math.round(booking.total_trip_time / 60 * 10) / 10
                    : "0") +
                    " " +
                    t("mins")}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Payment Summary Card */}
        {profile ? (
          <View style={[styles.paymentCard, {
            backgroundColor: mode === 'dark' ? colors.HEADER : colors.WHITE,
            shadowColor: mode === 'dark' ? colors.WHITE : colors.BLACK
          }]}>
            <View style={styles.paymentHeader}>
              <FontAwesome5 name="money-bill-wave" size={20} color={mode === 'dark' ? colors.WHITE : MAIN_COLOR} />
              <Text style={[styles.paymentTitle, {color: mode === 'dark' ? colors.WHITE : colors.BLACK}]}>
                {t("payment_summary")}
              </Text>
            </View>
            
            <View style={styles.paymentDetailsContainer}>
              <View style={[styles.paymentRow, {flexDirection: isRTL ? "row-reverse" : "row"}]}>
                <Text style={[styles.paymentLabel, {color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? "right" : "left"}]}>
                  {profile.usertype == "customer"
                    ? t("your_fare")
                    : t("total_fare")}
                </Text>
                {settings.swipe_symbol === false ? (
                  <Text style={[styles.paymentValue, {color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? "right" : "left"}]}>
                    {settings.symbol}{" "}
                    {formatAmount(payDetails?.amount, settings.decimal, settings.country)}{" "}
                  </Text>
                ) : (
                  <Text style={[styles.paymentValue, {color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? "right" : "left"}]}>
                     {formatAmount(payDetails?.amount, settings.decimal, settings.country)}{" "}
                    {settings.symbol}
                  </Text>
                )}
              </View>

              <View style={[styles.paymentRow, {flexDirection: isRTL ? "row-reverse" : "row"}]}>
                <Text style={[styles.paymentLabel, {color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? "right" : "left"}]}>
                  {t("promo_discount")}
                </Text>
                {settings.swipe_symbol === false ? (
                  <Text style={[styles.paymentValue, styles.discountText, {textAlign: isRTL ? "right" : "left"}]}>
                    {isRTL ? null : "-"} {settings.symbol}{" "}
                    {payDetails  ? payDetails.discount ? formatAmount(payDetails.discount, settings.decimal, settings.country) : "0.00" : "0.00"}{" "}
                    {isRTL ? "-" : null}
                  </Text>
                ) : (
                  <Text style={[styles.paymentValue, styles.discountText, {textAlign: isRTL ? "right" : "left"}]}>
                    {isRTL ? null : "-"}{" "}
                    {payDetails ? payDetails.discount ? formatAmount(payDetails.discount, settings.decimal, settings.country) : "0.00" : "0.00"}{" "}
                    {settings.symbol} {isRTL ? "-" : null}
                  </Text>
                )}
              </View>

              <View style={styles.divider} />

              <View style={[styles.paymentRow, styles.totalRow, {flexDirection: isRTL ? "row-reverse" : "row"}]}>
                <Text style={[styles.totalLabel, {color: mode === 'dark' ? colors.WHITE : colors.BLACK, textAlign: isRTL ? "right" : "left"}]}>
                  {t("payable_ammount")}
                </Text>
                {settings.swipe_symbol === false ? (
                  <Text style={[styles.totalValue, {color: mode === 'dark' ? colors.WHITE : MAIN_COLOR, textAlign: isRTL ? "right" : "left"}]}>
                    {settings.symbol}{" "}
                    {payDetails.payableAmount ? formatAmount(payDetails.payableAmount, settings.decimal, settings.country) : 0.0}
                  </Text>
                ) : (
                  <Text style={[styles.totalValue, {color: mode === 'dark' ? colors.WHITE : MAIN_COLOR, textAlign: isRTL ? "right" : "left"}]}>
                    {payDetails.payableAmount ? formatAmount(payDetails.payableAmount, settings.decimal, settings.country) : 0.0}{" "}
                    {settings.symbol}
                  </Text>
                )}
              </View>
            </View>
          </View>
        ) : null}

        {/* Promo Section */}
         {profile &&
         profile.usertype == "customer" &&
         (booking.status == "PAYMENT_PENDING" ||
           booking.status == "PENDING" ||
           booking.status == "NEW") ? (
           <View style={styles.promoTextContainer}>
             {payDetails.promo_applied ? (
               <TouchableOpacity onPress={() => {removePromo();}}>
                 <Text style={[styles.promoTextSimple, {color: colors.RED, textAlign: isRTL ? "right" : "left"}]}>
                   {t("remove_promo")}
                 </Text>
               </TouchableOpacity>
             ) : (
               <TouchableOpacity onPress={() => {openPromoModal();}}>
                 <Text style={[styles.promoTextSimple, {color: colors.GREEN, textAlign: isRTL ? "right" : "left"}]}>
                   {t("apply_promo")}
                 </Text>
               </TouchableOpacity>
             )}
           </View>
         ) : null}

         {/* Action Buttons */}
         <View style={styles.actionButtonsContainer}>
           {profile &&
           profile.usertype == "customer" &&
           (booking.status == "PAYMENT_PENDING" || booking.status == "NEW") ? (
             <TouchableOpacity
               onPress={cancelCurBooking}
               style={[styles.actionButton, styles.cancelButton]}
             >
               <Ionicons name="close-circle-outline" size={20} color={colors.WHITE} />
               <Text style={styles.buttonTitle}>{t("cancel")}</Text>
             </TouchableOpacity>
           ) : null}
           
           {booking.payment_mode == "wallet" ? (
             <TouchableOpacity
               style={[styles.actionButton, styles.walletButton]}
               onPress={() => {
                 doPayment("wallet");
               }}
             >
               <View style={styles.buttonContent}>
                 {isLoading ? (
                   <ActivityIndicator size="small" color={colors.WHITE} />
                 ) : (
                   <>
                     <Ionicons name="wallet-outline" size={20} color={colors.WHITE} />
                     <Text style={styles.buttonTitle}>
                       {t("complete_payment")}
                     </Text>
                   </>
                 )}
               </View>
             </TouchableOpacity>
           ) : null}
           
           {booking.payment_mode == "cash" ? (
             <TouchableOpacity
               style={[styles.actionButton, styles.cashButton]}
               onPress={() => {
                 doPayment("cash");
               }}
             >
               <View style={styles.buttonContent}>
                 {isLoading ? (
                   <ActivityIndicator size="small" color={colors.WHITE} />
                 ) : (
                   <>
                     <FontAwesome5 name="money-bill" size={18} color={colors.WHITE} />
                     <Text style={styles.buttonTitle}>
                       {booking.status == "PAYMENT_PENDING"
                         ? t("cash_on_delivery")
                         : booking.payment_mode == "cash"? t("pay_cash") : t("complete_payment")}
                     </Text>
                   </>
                 )}
               </View>
             </TouchableOpacity>
           ) : null}

           {providers &&
           providers.length > 0 &&
           booking.payment_mode == "card" ? (
             <TouchableOpacity
               style={[styles.actionButton, styles.cardButton]}
               onPress={() => {
                 doPayment("card");
               }}
             >
               <View style={styles.buttonContent}>
                 {isLoading ? (
                   <ActivityIndicator size="small" color={colors.WHITE} />
                 ) : (
                   <>
                     <Ionicons name="card" size={20} color={colors.WHITE} />
                     <Text style={styles.buttonTitle}>
                       {profile && profile.usertype == "customer"
                         ? t("payWithCard")
                         : t("complete_payment")}
                     </Text>
                   </>
                 )}
               </View>
             </TouchableOpacity>
           ) : null}
         </View>
       </ScrollView>
       {promoModal()}
     </View>
   );

}

const styles = StyleSheet.create({
  mainView: {
    flex: 1
  },
  scrollStyle: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40
  },
  
  headerCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  billHeader: {
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  billTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  billIcon: {
    marginRight: 12
  },
  billText: {
    fontSize: 24,
    fontFamily: fonts.Bold,
    fontWeight: '700'
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2
  },
  addPromoButton: {
    backgroundColor: colors.GREEN
  },
  removePromoButton: {
    backgroundColor: colors.RED
  },
  promoText: {
    fontSize: 12,
    fontFamily: fonts.Medium,
    marginLeft: 6,
    fontWeight: '600'
  },
  
  tripCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  tripTitle: {
    fontSize: 18,
    fontFamily: fonts.Bold,
    marginLeft: 12,
    fontWeight: '600'
  },
  tripDetailsContainer: {
    marginBottom: 16
  },
  location: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 8,
    paddingHorizontal: 4
  },
  timeContainer: {
    minWidth: 60,
    alignItems: 'center'
  },
  timeStyle: {
    fontFamily: fonts.Regular,
    fontSize: 14,
    color: colors.SHADOW
  },
  greenDot: {
    backgroundColor: colors.GREEN,
    width: 12,
    height: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4
  },
  redDot: {
    backgroundColor: colors.RED,
    width: 12,
    height: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4
  },
  address: {
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: 0,
    marginLeft: 12
  },
  adressStyle: {
    marginLeft: 8,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.Regular,
    flex: 1
  },
  tripStatsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.SHADOW + '30',
    paddingTop: 16
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 12
  },
  statLabel: {
    fontSize: 14,
    fontFamily: fonts.Regular,
    marginLeft: 8,
    flex: 1
  },
  statValue: {
    fontSize: 14,
    fontFamily: fonts.Medium,
    fontWeight: '600'
  },
  
  paymentCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  paymentTitle: {
    fontSize: 18,
    fontFamily: fonts.Bold,
    marginLeft: 12,
    fontWeight: '600'
  },
  paymentDetailsContainer: {
    paddingHorizontal: 4
  },
  paymentRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12
  },
  paymentLabel: {
    fontSize: 16,
    fontFamily: fonts.Regular,
    flex: 1
  },
  paymentValue: {
    fontSize: 16,
    fontFamily: fonts.Medium,
    fontWeight: '600'
  },
  discountText: {
    color: colors.RED
  },
  divider: {
    height: 1,
    backgroundColor: colors.SHADOW + '30',
    marginVertical: 8
  },
  totalRow: {
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: colors.SHADOW + '20'
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: fonts.Bold,
    fontWeight: '700',
    flex: 1
  },
  totalValue: {
    fontSize: 20,
    fontFamily: fonts.Bold,
    fontWeight: '700'
  },
  
  actionButtonsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 20,
      gap: 12,
      justifyContent: 'space-between'
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 12,
      elevation: 3,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6
    },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonTitle: {
    color: colors.WHITE,
    fontSize: 16,
    fontFamily: fonts.Medium,
    marginLeft: 8,
    fontWeight: '600'
  },
  cancelButton: {
    backgroundColor: colors.RED
  },
  walletButton: {
    backgroundColor: MAIN_COLOR
  },
  cashButton: {
    backgroundColor: MAIN_COLOR
  },
  cardButton: {
    backgroundColor: MAIN_COLOR
  },
  
  modalContainer: {
    flex: 1
  },
  customHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  customHeaderBackButton: {
    padding: 8,
    borderRadius: 20,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  customHeaderSpacer: {
    width: 40
  },
  headerStyle: {
    borderBottomWidth: 0,
    elevation: 4
  },
  headerTitleStyle: {
    color: colors.WHITE,
    fontFamily: fonts.Bold,
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center'
  },
  modalCancelButton: {
    backgroundColor: colors.RED,
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2
  },
  modalCancelText: {
     color: colors.WHITE,
     fontSize: 16,
     fontFamily: fonts.Bold,
     fontWeight: '600'
   },
   
   promoTextContainer: {
     paddingHorizontal: 16,
     paddingVertical: 12,
     alignItems: 'center'
   },
   promoTextSimple: {
     fontSize: 16,
     fontFamily: fonts.Medium,
     fontWeight: '600',
     textDecorationLine: 'underline'
   }
 });