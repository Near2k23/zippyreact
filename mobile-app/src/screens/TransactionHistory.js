import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Dimensions, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  useColorScheme, 
  Animated 
} from 'react-native';
import { colors } from '../common/theme';
import i18n from 'i18n-js';
import { useSelector } from 'react-redux';
import { fonts } from '../common/font';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { MAIN_COLOR, MAIN_COLOR_DARK } from '../common/sharedFunctions';
import moment from 'moment/min/moment-with-locales';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function TransactionHistory(props) {
  const { t } = i18n;
  const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
  let colorScheme = useColorScheme();
  const [mode, setMode] = useState();
  const auth = useSelector(state => state.auth);
  const settings = useSelector(state => state.settingsdata.settings);
  const fadeAnim = useRef({}).current;

  // Get parameters from navigation
  const transactions = props.route.params?.transactions || [];
  const title = props.route.params?.title || t('transaction_history_title');
  const type = props.route.params?.type || 'all';

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
    if (transactions) {
      // Initialize animation values for each transaction
      transactions.forEach((_, index) => {
        fadeAnim[index] = new Animated.Value(0);
      });
      
      // Stagger animations
      const animations = transactions.map((_, index) => {
        return Animated.timing(fadeAnim[index], {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        });
      });
      
      Animated.stagger(100, animations).start();
    }
  }, [transactions]);

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

  const getTransactionIcon = (transaction) => {
    const amount = parseFloat(transaction.amount || 0);
    if (amount > 0 || transaction.type === 'Credit' || transaction.type === 'Deposit') {
      return 'plus-circle-outline';
    } else {
      return 'minus-circle-outline';
    }
  };

  const getTransactionColor = (transaction) => {
    const amount = parseFloat(transaction.amount || 0);
    if (amount > 0 || transaction.type === 'Credit' || transaction.type === 'Deposit') {
      return colors.GREEN;
    } else {
      return colors.RED;
    }
  };

  const getTransactionTitle = (transaction) => {
    switch (transaction.type) {
      case 'Credit':
      case 'Deposit':
        return t('credited') || 'Acreditado';
      case 'Debit':
        return t('debited') || 'Debitado';
      case 'Withdraw':
        return t('withdrawn') || 'Retirado';
      default:
        return transaction.type || 'Transacción';
    }
  };

  const renderTransaction = ({ item, index }) => {
    const amount = parseFloat(item.amount || 0);
    const isPositive = amount > 0 || item.type === 'Credit' || item.type === 'Deposit';
    
    return (
      <Animated.View 
        style={[
          styles.transactionCard,
          { 
            backgroundColor: mode === 'dark' ? '#272A2C' : colors.WHITE,
            opacity: fadeAnim[index] || 1,
            transform: [{
              translateY: fadeAnim[index] ? 
                fadeAnim[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                }) : 0
            }]
          }
        ]}
      >
        <View style={styles.transactionContent}>
          <View style={styles.transactionLeft}>
            <View style={[styles.iconContainer, { backgroundColor: getTransactionColor(item) + '20' }]}>
              <MaterialCommunityIcons
                name={getTransactionIcon(item)}
                size={24}
                color={getTransactionColor(item)}
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text 
                numberOfLines={1} 
                style={[styles.transactionTitle, { 
                  color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                  textAlign: isRTL ? 'right' : 'left' 
                }]}
              >
                {getTransactionTitle(item)}
              </Text>
              <Text 
                numberOfLines={1} 
                style={[styles.transactionSubtitle, { 
                  color: mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                  textAlign: isRTL ? 'right' : 'left' 
                }]}
              >
                {item.description || item.remarks || 'Transacción de billetera'}
              </Text>
            </View>
          </View>
          
          <View style={styles.transactionRight}>
            <Text 
              style={[styles.transactionAmount, { 
                color: getTransactionColor(item),
                textAlign: isRTL ? 'left' : 'right' 
              }]}
            >
              {isPositive ? '+' : ''}
              {settings?.swipe_symbol === false ?
                isRTL ?
                  `${formatAmount(Math.abs(amount), settings?.decimal || 2, settings?.country)}${settings?.symbol || '$'}`
                  :
                  `${settings?.symbol || '$'}${formatAmount(Math.abs(amount), settings?.decimal || 2, settings?.country)}`
                :
                isRTL ?
                  `${formatAmount(Math.abs(amount), settings?.decimal || 2, settings?.country)}${settings?.symbol || '$'}`
                  :   
                  `${settings?.symbol || '$'} ${formatAmount(Math.abs(amount), settings?.decimal || 2, settings?.country)}`
              }
            </Text>
            <Text 
              style={[styles.transactionDate, { 
                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                textAlign: isRTL ? 'left' : 'right' 
              }]}
            >
              {moment(item.dated || item.date).format('DD MMM')}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: mode === 'dark' ? colors.PAGEBACK : colors.SCREEN_BACKGROUND }]}>
      <AnimatedFlatList
        data={transactions}
        keyExtractor={(item, index) => `${item.id || index}`}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="wallet-outline"
              size={64}
              color={mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
            />
            <Text style={[styles.emptyText, { 
              color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' 
            }]}>
              {t('no_transactions') || 'No hay transacciones'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  transactionCard: {
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontFamily: fonts.Bold,
    marginBottom: 4,
  },
  transactionSubtitle: {
    fontSize: 14,
    fontFamily: fonts.Regular,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: fonts.Bold,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: fonts.Regular,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.Regular,
    marginTop: 16,
    textAlign: 'center',
  },
});
