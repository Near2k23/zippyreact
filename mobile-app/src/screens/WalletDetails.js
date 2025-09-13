import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform,
  ScrollView,
  TextInput,
  Alert,
  Animated
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { CommonActions } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Icon } from 'react-native-elements';
import i18n from 'i18n-js';

// Local imports
import { WTransactionHistory, WaygoDialog } from '../components';
import { colors } from '../common/theme';
import { fonts } from '../common/font';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import { api } from 'common';

// Constants
const { height, width } = Dimensions.get('window');
const RECHARGE_AMOUNTS = [10000, 25000, 50000, 100000];

// AutoResizeText Component
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

export default function WalletDetails(props) {
  // Redux hooks
  const { withdrawBalance } = api;
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const walletHistory = useSelector(state => state.auth.walletHistory);
  const settings = useSelector(state => state.settingsdata.settings);
  const providers = useSelector(state => state.paymentmethods.providers);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // State management
  const [profile, setProfile] = useState();
  const [mode, setMode] = useState();
  
  // Recharge states
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  
  // Withdraw states
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(null);
  const [withdrawAmountFocus, setWithdrawAmountFocus] = useState(false);
  
  // Dialog states
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successDialogVisible, setSuccessDialogVisible] = useState(false);

  // Localization and theme
  const { t } = i18n;
  const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
  const colorScheme = useColorScheme();

  // Utility functions
  const formatAmount = (value, decimal, country) => {
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
  };

  // Effects
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
    if (auth.profile && auth.profile.uid) {
      setProfile(auth.profile);
    } else {
      setProfile(null);
    }
  }, [auth.profile]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);



  const getCreditedTransactions = () => {
    if (!walletHistory) return [];
    return walletHistory.filter((transaction) => {
      return transaction.type === 'Credit' || transaction.type === 'Deposit';
    });
  };

  const getDebitedTransactions = () => {
    if (!walletHistory) return [];
    return walletHistory.filter((transaction) => {
      return transaction.type === 'Debit';
    });
  };

  const getWithdrawnTransactions = () => {
    if (!walletHistory) return [];
    return walletHistory.filter((transaction) => {
      return transaction.type === 'Withdraw';
    });
  };

  const showCreditedTransactions = () => {
    const creditedTransactions = getCreditedTransactions();
    props.navigation.navigate('TransactionHistory', {
      transactions: creditedTransactions,
      title: t('credited') || 'Acreditado',
      type: 'credited'
    });
  };

  const showDebitedTransactions = () => {
    const debitedTransactions = getDebitedTransactions();
    props.navigation.navigate('TransactionHistory', {
      transactions: debitedTransactions,
      title: t('debited') || 'Debitado',
      type: 'debited'
    });
  };

  const showWithdrawnTransactions = () => {
    const withdrawnTransactions = getWithdrawnTransactions();
    if (withdrawnTransactions.length > 0) {
      props.navigation.navigate('TransactionHistory', {
        transactions: withdrawnTransactions,
        title: t('withdrawn') || 'Retirado',
        type: 'withdrawn'
      });
    } else {
      Alert.alert(t('alert'), t('no_withdrawn_transactions') || 'No hay transacciones retiradas');
    }
  };

  // Recharge functions
  const doRecharge = () => {
    if (!(profile.mobile && profile.mobile.length > 6 && profile.email && profile.firstName)) {
      Alert.alert(t('alert'), t('profile_incomplete'));
      props.navigation.dispatch(CommonActions.reset({ 
        index: 0, 
        routes: [{ name: 'Profile', params: { fromPage: 'Wallet' } }] 
      }));
    } else {
      if (providers) {
        setRechargeModalVisible(true);
      } else {
        Alert.alert(t('alert'), t('provider_not_found'));
      }
    }
  };

  const handleRechargeConfirm = () => {
    if (!selectedAmount) {
      Alert.alert(t('alert'), t('select_amount'));
      return;
    }
    setRechargeModalVisible(false);
    
    const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const reference = [...Array(4)].map(_ => c[~~(Math.random() * c.length)]).join('');
    const d = new Date();
    const time = d.getTime();
    
    const payData = {
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

  // Withdraw functions
  const doWithdraw = () => {
    if (!(profile.mobile && profile.mobile.length > 6) && profile.email && profile.firstName) {
      Alert.alert(t('alert'), t('profile_incomplete'));
      props.navigation.dispatch(CommonActions.reset({ 
        index: 0, 
        routes: [{ name: 'Profile', params: { fromPage: 'Wallet' } }] 
      }));
    } else {
      if (parseFloat(profile.walletBalance) > 0) {
        setWithdrawModalVisible(true);
      } else {
        Alert.alert(t('alert'), t('wallet_bal_low'));
      }
    }
  };

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

  // Render functions
  const renderRechargeContent = () => (
    <View style={styles.rechargeContent}>
      <Text style={[styles.amountSelectionTitle, { 
        color: mode === 'dark' ? colors.WHITE : colors.BLACK 
      }]}>
        {t('select_recharge_amount')}
      </Text>
      <View style={styles.amountGrid}>
        {RECHARGE_AMOUNTS.map((amount) => (
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

  const renderBalanceCard = () => (
    <Animated.View 
      style={[
        styles.balanceCardContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <View style={[styles.balanceCard, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE, borderColor: mode === 'dark' ? '#2C2C2E' : '#E2E9EC' }]}>
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
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity 
                  onPress={doRecharge}
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
    </Animated.View>
  );

  const renderMenuOptions = () => (
    <View style={styles.menuContainer}>
      <TouchableOpacity 
        style={[styles.menuItem, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE, borderColor: mode === 'dark' ? '#2C2C2E' : '#E2E9EC' }]}
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
        style={[styles.menuItem, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE, borderColor: mode === 'dark' ? '#2C2C2E' : '#E2E9EC' }]}
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

      {getWithdrawnTransactions().length > 0 && (
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.WHITE, borderColor: mode === 'dark' ? '#2C2C2E' : '#E2E9EC' }]}
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
  );

  const renderDialogs = () => (
    <>
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
    </>
  );

  // Main render
  return (
    <View style={[styles.mainView, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND }]}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {renderBalanceCard()}
        {renderMenuOptions()}
      </ScrollView>
      {renderDialogs()}
    </View>
  );
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    borderRadius: 24,
    padding: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 0,
  },
  balanceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MAIN_COLOR,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  balanceInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceTitle: {
    fontSize: 18,
    fontFamily: fonts.Bold,
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  balanceBottomSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  balanceLeftColumn: {
    flex: 1,
  },
  balanceSubtitle: {
    fontSize: 13,
    fontFamily: fonts.Medium,
    marginBottom: 4,
    marginTop: 12,
    opacity: 0.7,
    letterSpacing: 0.3,
  },
  balanceAmount: {
    fontFamily: fonts.Bold,
    flexShrink: 1,
    letterSpacing: 0.5,
  },
  rechargeButton: {
    width: 85,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    marginTop: 12,
    backgroundColor: colors.GREEN,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  rechargeButtonText: {
    color: colors.WHITE,
    fontSize: 13,
    fontFamily: fonts.Bold,
    letterSpacing: 0.3,
  },
  rechargeContent: {
    paddingVertical: 16,
  },
  amountSelectionTitle: {
    fontSize: 16,
    fontFamily: fonts.Medium,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  amountButton: {
    width: '48%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedAmountButton: {
    borderWidth: 2,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  amountText: {
    fontSize: 15,
    fontFamily: fonts.Medium,
    letterSpacing: 0.3,
  },
  withdrawContent: {
    paddingVertical: 16,
  },
  withdrawInputLabel: {
    fontSize: 15,
    fontFamily: fonts.Medium,
    marginBottom: 12,
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  withdrawTextInput: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 17,
    fontFamily: fonts.Regular,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  withdrawInputFocused: {
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  menuContainer: {
    gap: 16,
  },
  menuItem: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 0,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemText: {
    fontSize: 17,
    fontFamily: fonts.Medium,
    letterSpacing: 0.3,
  },
});