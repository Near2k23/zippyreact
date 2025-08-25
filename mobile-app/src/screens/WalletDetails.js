import React, { useEffect, useState } from 'react';
import { WTransactionHistory, WaygoDialog } from '../components';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform,
  ScrollView,
  TextInput
} from 'react-native';

const AutoResizeText = ({ children, style, maxFontSize = 24, minFontSize = 16, ...props }) => {
  const [fontSize, setFontSize] = useState(maxFontSize);
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const onTextLayout = (event) => {
    const { width } = event.nativeEvent.lines[0];
    setTextWidth(width);
  };

  const onContainerLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  useEffect(() => {
    if (textWidth > 0 && containerWidth > 0 && textWidth > containerWidth) {
      const ratio = containerWidth / textWidth;
      const newFontSize = Math.max(fontSize * ratio * 0.9, minFontSize);
      if (newFontSize < fontSize) {
        setFontSize(newFontSize);
      }
    }
  }, [textWidth, containerWidth, fontSize, minFontSize]);

  return (
    <View onLayout={onContainerLayout} style={{ flex: 1 }}>
      <Text
        {...props}
        style={[style, { fontSize }]}
        onTextLayout={onTextLayout}
        numberOfLines={1}
        adjustsFontSizeToFit={true}
        minimumFontScale={minFontSize / maxFontSize}
      >
        {children}
      </Text>
    </View>
  );
};
import { colors } from '../common/theme';
var { height } = Dimensions.get('window');
import i18n from 'i18n-js';
import { useSelector, useDispatch } from 'react-redux';
import { CommonActions } from '@react-navigation/native';
import { api } from 'common';
import { MAIN_COLOR,MAIN_COLOR_DARK } from '../common/sharedFunctions';
import { fonts } from '../common/font';
import { useColorScheme } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Icon } from 'react-native-elements';

export default function WalletDetails(props) {

  const { withdrawBalance } = api;
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const walletHistory = useSelector(state => state.auth.walletHistory);
  const settings = useSelector(state => state.settingsdata.settings);
  const providers = useSelector(state => state.paymentmethods.providers);
  const [profile, setProfile] = useState();
  const { t } = i18n;
  const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
  var { height, width } = Dimensions.get('window');
  let colorScheme = useColorScheme();
  const [mode, setMode] = useState();
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);

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

  useEffect(() => {
    if (auth.profile && auth.profile.uid) {
      setProfile(auth.profile);
    } else {
      setProfile(null);
    }
  }, [auth.profile]);

  const doReacharge = () => {
    if (!(profile.mobile && profile.mobile.length > 6 && profile.email && profile.firstName)) {
      Alert.alert(t('alert'), t('profile_incomplete'));
      props.navigation.dispatch(CommonActions.reset({ index: 0, routes:[{ name: 'Profile', params: { fromPage: 'Wallet'}}]}));
    } else {
      if (providers) {
        setRechargeModalVisible(true);
      } else {
        Alert.alert(t('alert'), t('provider_not_found'))
      }
    }
  }

  const rechargeAmounts = [10000, 25000, 50000, 100000];

  const handleRechargeConfirm = () => {
    if (!selectedAmount) {
      Alert.alert(t('alert'), t('select_amount'));
      return;
    }
    setRechargeModalVisible(false);
    
    const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const reference = [...Array(4)].map(_ => c[~~(Math.random() * c.length)]).join('');
    var d = new Date();
    var time = d.getTime();
    
    let payData = {
      email: profile.email,
      amount: selectedAmount,
      order_id: "wallet-" + profile.uid + "-" + reference,
      name: t('add_money') || 'Add Money',
      description: t('wallet_ballance') || 'Wallet Balance',
      currency: settings.code,
      quantity: 1,
      paymentType: 'walletCredit'
    };
    
    props.navigation.navigate("paymentMethod", {
      payData: payData,
      userdata: profile,
      settings: settings,
      providers: providers
    });
    
    setSelectedAmount(null);
  };

  const renderRechargeContent = () => (
    <View style={styles.rechargeContent}>
      <Text style={[styles.amountSelectionTitle, { 
        color: mode === 'dark' ? colors.WHITE : colors.BLACK 
      }]}>
        {t('select_recharge_amount')}
      </Text>
      <View style={styles.amountGrid}>
        {rechargeAmounts.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={[
              styles.amountButton,
              selectedAmount === amount && styles.selectedAmountButton,
              { 
                backgroundColor: selectedAmount === amount 
                  ? (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR)
                  : (mode === 'dark' ? '#3A3A3A' : '#F5F5F5'),
                borderColor: selectedAmount === amount 
                  ? (mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR)
                  : 'transparent'
              }
            ]}
            onPress={() => setSelectedAmount(amount)}
          >
            <Text style={[
              styles.amountText,
              { 
                color: selectedAmount === amount 
                  ? colors.WHITE 
                  : (mode === 'dark' ? colors.WHITE : colors.BLACK)
              }
            ]}>
              {settings?.symbol || '$'}{formatAmount(amount, settings?.decimal || 2, settings?.country)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(null);
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successDialogVisible, setSuccessDialogVisible] = useState(false);

  const doWithdraw = () => {
    if (!(profile.mobile && profile.mobile.length > 6) && profile.email && profile.firstName) {
      Alert.alert(t('alert'), t('profile_incomplete'));
      props.navigation.dispatch(CommonActions.reset({ index: 0, routes:[{ name: 'Profile', params: { fromPage: 'Wallet'}}]}));
    } else {
      if (parseFloat(profile.walletBalance) > 0) {
        setWithdrawModalVisible(true);
      } else {
        Alert.alert(t('alert'), t('wallet_bal_low'))
      }
    }
  }

  const handleWithdrawConfirm = () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      setErrorMessage(t('enter_valid_amount'));
      setErrorDialogVisible(true);
      return;
    }
    if (parseFloat(withdrawAmount) > parseFloat(profile.walletBalance)) {
      setErrorMessage(t('wallet_bal_low'));
      setErrorDialogVisible(true);
      return;
    }
    
    setWithdrawModalVisible(false);
    
    setTimeout(() => {
      setWithdrawAmount(null);
      dispatch(withdrawBalance(profile, withdrawAmount));
      
      setTimeout(() => {
        setSuccessDialogVisible(true);
      }, 100);
    }, 300);
  };

  const [withdrawAmountFocus, setWithdrawAmountFocus] = useState(false);

  const renderWithdrawContent = () => (
    <View style={styles.withdrawContent}>
      <Text style={[styles.withdrawInputLabel, { 
        color: mode === 'dark' ? colors.WHITE : colors.BLACK 
      }]}>
        {t('withdraw_amount')}
      </Text>
      <TextInput
        placeholder={`${settings?.symbol || '$'}0.00`}
        onFocus={() => setWithdrawAmountFocus(true)}
        onBlur={() => setWithdrawAmountFocus(false)}
        value={withdrawAmount ? withdrawAmount.toString() : ''}
        placeholderTextColor={colors.SHADOW}
        style={[
          styles.withdrawTextInput,
          { 
            color: mode === 'dark' ? colors.WHITE : colors.BLACK,
            backgroundColor: mode === 'dark' ? '#3A3A3A' : '#F5F5F5'
          },
          (withdrawAmountFocus || (withdrawAmount && withdrawAmount.toString().length > 0)) ? [
            styles.withdrawInputFocused, 
            { borderColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }
          ] : null
        ]}
        onChangeText={(text) => {
          const numericValue = text.replace(/[^0-9.]/g, '');
          if (numericValue === '' || /^\d*\.?\d*$/.test(numericValue)) {
            setWithdrawAmount(numericValue === '' ? null : parseFloat(numericValue) || null);
          }
        }}
        keyboardType="numeric"
        maxLength={10}
      />
    </View>
  );

  const getCreditedTransactions = () => {
    if (!walletHistory) return [];
    return walletHistory.filter(transaction => 
      transaction.type === 'Credit' || 
      transaction.type === 'Deposit' ||
      parseFloat(transaction.amount) > 0
    );
  };

  const getDebitedTransactions = () => {
    if (!walletHistory) return [];
    return walletHistory.filter(transaction => 
      transaction.type === 'Debit' ||
      parseFloat(transaction.amount) < 0
    );
  };

  const getWithdrawnTransactions = () => {
    if (!walletHistory) return [];
    return walletHistory.filter(transaction => 
      transaction.type === 'Withdraw'
    );
  };

  const showCreditedTransactions = () => {
    props.navigation.navigate('TransactionHistory', {
      transactions: getCreditedTransactions(),
      title: t('credited') || 'Acreditado',
      type: 'credited'
    });
  };

  const showDebitedTransactions = () => {
    props.navigation.navigate('TransactionHistory', {
      transactions: getDebitedTransactions(),
      title: t('debited') || 'Debitado',
      type: 'debited'
    });
  };

  const showWithdrawnTransactions = () => {
    props.navigation.navigate('TransactionHistory', {
      transactions: getWithdrawnTransactions(),
      title: t('withdrawn') || 'Retirado',
      type: 'withdrawn'
    });
  };

  return (
    <View style={[styles.mainView, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND }]}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCardContainer}>
          <View style={[styles.balanceCard, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}>
            <View style={styles.balanceCardHeader}>
              <View style={styles.balanceInfo}>
                <View style={styles.titleRow}>
                  <View style={[styles.walletIconContainer, { backgroundColor: mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR }]}>
                    <MaterialIcons name="account-balance-wallet" size={24} color={colors.WHITE} />
                  </View>
                  <Text style={[styles.balanceTitle, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                    {t('wallet_balance')}
                  </Text>
                </View>
                <View style={styles.balanceBottomSection}>
                  <View style={styles.balanceLeftColumn}>
                    <Text style={[styles.balanceSubtitle, { 
                      color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                      marginTop: 10 
                    }]}>
                      {t('balance')}
                    </Text>
                    <AutoResizeText 
                      style={[styles.balanceAmount, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}
                      maxFontSize={24}
                      minFontSize={14}
                    >
                      {settings.swipe_symbol === false ?
                        isRTL ?
                          `${profile && profile.hasOwnProperty('walletBalance') ? formatAmount(profile.walletBalance, settings.decimal, settings.country) : ''}${settings.symbol}`
                          :
                          `${settings.symbol}${profile && profile.hasOwnProperty('walletBalance') ? formatAmount(profile.walletBalance, settings.decimal, settings.country) : ''}`
                        :
                        isRTL ?
                          `${profile && profile.hasOwnProperty('walletBalance') ? formatAmount(profile.walletBalance, settings.decimal, settings.country) : ''}${settings.symbol}`
                          :   
                          `${settings.symbol} ${profile && profile.hasOwnProperty('walletBalance') ? formatAmount(profile.walletBalance, settings.decimal, settings.country) : ''}`
                      }
                    </AutoResizeText>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity 
                      onPress={doReacharge}
                      style={[styles.rechargeButton, { backgroundColor: colors.GREEN, width: 70, marginRight: 2 }]}
                    >
                      <Text style={styles.rechargeButtonText}>{t('Recharge')}</Text>
                    </TouchableOpacity>
                    {(profile?.usertype === 'driver' || (profile?.usertype === 'customer' && settings?.RiderWithDraw)) && (
                      <TouchableOpacity 
                        onPress={doWithdraw}
                        style={[styles.rechargeButton, { backgroundColor: colors.RED, width: 70 }]}
                      >
                        <Text style={styles.rechargeButtonText}>{t('withdraw')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}
            onPress={showCreditedTransactions}
          >
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                {t('credited') || 'Acreditado'}
              </Text>
              <MaterialIcons 
                name={isRTL ? "keyboard-arrow-left" : "keyboard-arrow-right"} 
                size={24} 
                color={mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'} 
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}
            onPress={showDebitedTransactions}
          >
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                {t('debited') || 'Debitado'}
              </Text>
              <MaterialIcons 
                name={isRTL ? "keyboard-arrow-left" : "keyboard-arrow-right"} 
                size={24} 
                color={mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'} 
              />
            </View>
          </TouchableOpacity>

          {settings && settings.RiderWithDraw && (
            <TouchableOpacity 
              style={[styles.menuItem, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE }]}
              onPress={showWithdrawnTransactions}
            >
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemText, { color: mode === 'dark' ? colors.WHITE : colors.BLACK }]}>
                  {t('withdrawn') || 'Retirado'}
                </Text>
                <MaterialIcons 
                  name={isRTL ? "keyboard-arrow-left" : "keyboard-arrow-right"} 
                  size={24} 
                  color={mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'} 
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <WaygoDialog
        visible={rechargeModalVisible}
        onClose={() => {
          setRechargeModalVisible(false);
          setSelectedAmount(null);
        }}
        title={t('recharge_wallet')}
        icon="wallet-plus-outline"
        iconColor={mode === 'dark' ? MAIN_COLOR_DARK : MAIN_COLOR}
        type="confirm"
        showButtons={true}
        confirmText={t('Recharge')}
        cancelText={t('cancel')}
        onConfirm={handleRechargeConfirm}
        customContent={renderRechargeContent()}
      />

      <WaygoDialog
        visible={withdrawModalVisible}
        onClose={() => {
          setWithdrawModalVisible(false);
          setWithdrawAmount(null);
        }}
        title={t('withdraw_money')}
        icon="wallet-outline"
        iconColor={colors.RED}
        type="confirm"
        showButtons={true}
        confirmText={t('withdraw')}
        cancelText={t('cancel')}
        onConfirm={handleWithdrawConfirm}
        customContent={renderWithdrawContent()}
      />

      <WaygoDialog
        visible={errorDialogVisible}
        onClose={() => setErrorDialogVisible(false)}
        title={t('alert')}
        icon="alert-circle-outline"
        iconColor={colors.RED}
        type="alert"
        showButtons={true}
        confirmText={t('ok')}
        onConfirm={() => setErrorDialogVisible(false)}
        message={errorMessage}
      />

      <WaygoDialog
        visible={successDialogVisible}
        onClose={() => setSuccessDialogVisible(false)}
        title={t('success')}
        icon="check-circle"
        iconColor={colors.GREEN}
        type="alert"
        showButtons={true}
        confirmText={t('ok')}
        onConfirm={() => setSuccessDialogVisible(false)}
        message={t('withdraw_request_submitted')}
      />
    </View>
  );

}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  balanceCardContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  balanceTitle: {
    fontSize: 16,
    fontFamily: fonts.Bold,
    marginLeft: 12,
  },
  balanceBottomSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 0,
  },
  balanceLeftColumn: {
    flex: 1,
  },
  balanceSubtitle: {
    fontSize: 12,
    fontFamily: fonts.Regular,
    marginBottom: 0,
    marginTop: 10,
  },
  balanceAmount: {
    fontFamily: fonts.Bold,
    flexShrink: 1,
  },
  rechargeButton: {
    width: 80,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    marginTop: 10,
  },
  rechargeButtonText: {
    color: colors.WHITE,
    fontSize: 12,
    fontFamily: fonts.Bold,
  },
  rechargeContent: {
    paddingVertical: 10,
  },
  amountSelectionTitle: {
    fontSize: 14,
    fontFamily: fonts.Regular,
    marginBottom: 16,
    textAlign: 'center',
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  amountButton: {
    width: '48%',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 8,
  },
  selectedAmountButton: {
    borderWidth: 2,
  },
  amountText: {
    fontSize: 14,
    fontFamily: fonts.Medium,
  },
  withdrawContent: {
    paddingVertical: 10,
  },
  withdrawInputLabel: {
    fontSize: 14,
    fontFamily: fonts.Medium,
    marginBottom: 8,
    marginLeft: 4,
  },
  withdrawTextInput: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: fonts.Regular,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  withdrawInputFocused: {
    borderWidth: 2,
  },
  menuContainer: {
    gap: 12,
  },
  menuItem: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: fonts.Medium,
  },
});