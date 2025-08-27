import React, { useState, useEffect, useCallback, useRef } from "react";
import { Bubble, GiftedChat, Send, InputToolbar, Composer } from 'react-native-gifted-chat';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Linking
} from "react-native";
import { colors } from "../common/theme";
import { fonts } from "../common/font";
import i18n from 'i18n-js';
import { useSelector, useDispatch } from 'react-redux';
import { api } from 'common';
import { Ionicons } from '@expo/vector-icons';
import DeviceInfo from 'react-native-device-info';

const hasNotch = DeviceInfo.hasNotch();

export default function OnlineChat(props) {
  const dispatch = useDispatch();
  const { bookingId, status } = props.route.params;
  const activeBookings = useSelector(state => state.bookinglistdata.active);
  const auth = useSelector(state => state.auth);
  const chats = useSelector(state => state.chatdata.messages);
  
  const [messages, setMessages] = useState([]);
  const deviceColorScheme = useColorScheme();
  const [mode, setMode] = useState(auth?.profile?.mode === 'system' ? deviceColorScheme : auth?.profile?.mode || 'light');
  const messageRef = useRef([]);
  const role = auth?.profile?.usertype;

  const { t } = i18n;

  useEffect(() => {
    if (auth?.profile?.mode) {
      setMode(auth.profile.mode === 'system' ? deviceColorScheme : auth.profile.mode);
    }else {
      setMode('light');
    }
  }, [deviceColorScheme, auth?.profile?.mode]);

  const onPressCall = (phoneNumber) => {
    let call_link = Platform.OS == 'android' ? 'tel:' + phoneNumber : 'telprompt:' + phoneNumber;
    Linking.openURL(call_link);
  }

  useEffect(() => {
    if (chats?.length >= 1 && role) {
      const formattedMessages = chats.map((chat) => ({
        _id: chat.smsId,
        text: chat.message,
        createdAt: chat.createdAt ? new Date(chat.createdAt) : new Date(),
        user: {
          _id: role === "driver" ? 
            (chat.source === "customer" ? 2 : 1) : 
            (chat.source === "customer" ? 1 : 2),
        }
      })).reverse();

      messageRef.current = formattedMessages;
      setMessages(formattedMessages);
    } else {
      messageRef.current = [];
      setMessages([]);
    }
  }, [chats, role]);

  useEffect(() => {
    let isMounted = true;
    
    const unsubscribeFocus = props.navigation.addListener('focus', () => {
      if (isMounted && bookingId) {
        dispatch(api.fetchChatMessages(bookingId));
      }
    });
    
    const unsubscribeBlur = props.navigation.addListener('blur', () => {
      if (isMounted && bookingId) {
        dispatch(api.stopFetchMessages(bookingId));
      }
    });

    // Initial fetch
    if (bookingId) {
      dispatch(api.fetchChatMessages(bookingId));
    }

    return () => {
      isMounted = false;
      unsubscribeFocus();
      unsubscribeBlur();
      if (bookingId) {
        dispatch(api.stopFetchMessages(bookingId));
      }
    };
  }, [bookingId]);

  const onSend = useCallback(async (newMessages = []) => {
    if (!bookingId || !role || !newMessages[0]?.text) return;

    const currentBooking = activeBookings?.find(b => b.id === bookingId);
    if (!currentBooking) return;

    try {
      await dispatch(api.sendMessage({
        booking: currentBooking,
        role: role,
        message: newMessages[0].text
      }));
      dispatch(api.fetchChatMessages(bookingId));
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [bookingId, role, activeBookings]);

  const renderBubble = useCallback((props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: {
          backgroundColor: mode === 'dark' ? '#2C2C2E' : '#E9E9EB',
          marginLeft: -36,
          marginRight: 60,
          marginVertical: 3,
          borderRadius: 20,
          borderBottomLeftRadius: 6,
          maxWidth: '75%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
          elevation: 2,
          alignSelf: 'flex-start',
        },
        right: {
          backgroundColor: mode === 'dark' ? '#0084FF' : '#007AFF',
          marginLeft: 60,
          marginRight: 5,
          marginVertical: 3,
          borderRadius: 20,
          borderBottomRightRadius: 6,
          maxWidth: '75%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 3,
          elevation: 3,
          alignSelf: 'flex-end',
        }
      }}
      textStyle={{
        left: {
          color: mode === 'dark' ? colors.WHITE : colors.BLACK,
          fontSize: 16,
          fontFamily: fonts.Regular,
          lineHeight: 22,
          paddingHorizontal: 4,
          paddingVertical: 2,
        },
        right: {
          color: colors.WHITE,
          fontSize: 16,
          fontFamily: fonts.Regular,
          lineHeight: 22,
          paddingHorizontal: 4,
          paddingVertical: 2,
        }
      }}
      timeTextStyle={{
        left: {
          color: mode === 'dark' ? colors.WHITE + '70' : colors.BLACK + '50',
          fontSize: 11,
          fontFamily: fonts.Regular,
          marginTop: 2,
        },
        right: {
          color: colors.WHITE + '85',
          fontSize: 11,
          fontFamily: fonts.Regular,
          marginTop: 2,
        }
      }}
      containerStyle={{
        left: {
          paddingBottom: 4,
          paddingLeft: 0,
          marginLeft: -12,
        },
        right: {
          paddingBottom: 4,
          paddingRight: 0,
          marginRight: 0,
        }
      }}
    />
  ), [mode]);

  const renderSend = useCallback((props) => (
    <Send
      {...props}
      containerStyle={{
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: mode === 'dark' ? '#0084FF' : '#007AFF',
        borderRadius: 22,
        marginRight: 10,
        marginBottom: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
      }}
      disabled={!props.text?.trim()}
    >
      <Ionicons 
        name="send" 
        size={20} 
        color={colors.WHITE} 
        style={{ marginLeft: 2 }}
      />
    </Send>
  ), [mode]);

  const renderInputToolbar = useCallback((props) => (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: mode === 'dark' ? '#1C1C1E' : colors.WHITE,
        borderTopWidth: 1,
        borderTopColor: mode === 'dark' ? '#2C2C2E' : '#E5E5EA',
        paddingHorizontal: 12,
        paddingVertical: 8,
        paddingBottom: Platform.OS === 'ios' ? 34 : 8,
        minHeight: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 8,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
      primaryStyle={{
        alignItems: 'flex-end',
        justifyContent: 'center',
        flex: 1,
      }}
    />
  ), [mode]);

  const renderComposer = useCallback((props) => (
    <Composer
      {...props}
      textInputStyle={{
        backgroundColor: mode === 'dark' ? '#2C2C2E' : '#F2F2F7',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: mode === 'dark' ? '#3A3A3C' : '#E5E5EA',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginLeft: 8,
        marginRight: 10,
        marginBottom: 4,
        fontSize: 16,
        fontFamily: fonts.Regular,
        color: mode === 'dark' ? colors.WHITE : colors.BLACK,
        maxHeight: 100,
        minHeight: 44,
        lineHeight: 20,
        flex: 1,
      }}
      placeholderTextColor={mode === 'dark' ? colors.WHITE : colors.BLACK + '60'}
      multiline={true}
    />
  ), [mode]);

  const scrollToBottomComponent = useCallback(() => (
    <View style={{
      backgroundColor: mode === 'dark' ? '#0084FF' : '#007AFF',
      borderRadius: 20,
      padding: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    }}>
      <Ionicons name="chevron-down" size={24} color={colors.WHITE} />
    </View>
  ), [mode]);

  const renderCustomHeader = () => {
    const currentBooking = activeBookings?.find(b => b.id === bookingId);
    const otherPersonName = role === 'driver' ? currentBooking?.customer_name : currentBooking?.driver_name;
    const otherPersonImage = role === 'driver' ? currentBooking?.customer_image : currentBooking?.driver_image;
    
    return (
      <View style={{
        backgroundColor: mode === 'dark' ? '#1C1C1E' : colors.WHITE,
        paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: mode === 'dark' ? '#2C2C2E' : '#E5E5EA',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity
              onPress={() => props.navigation.goBack()}
              style={{
                marginRight: 12,
                padding: 4,
              }}
            >
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={mode === 'dark' ? colors.WHITE : colors.BLACK} 
              />
            </TouchableOpacity>
            
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: mode === 'dark' ? '#3A3A3C' : '#E5E5EA',
              marginRight: 12,
              overflow: 'hidden',
            }}>
              {otherPersonImage ? (
                <Image 
                  source={{ uri: otherPersonImage }} 
                  style={{ width: 40, height: 40 }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{
                  width: 40,
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Ionicons 
                    name="person" 
                    size={20} 
                    color={mode === 'dark' ? colors.WHITE + '60' : colors.BLACK + '60'} 
                  />
                </View>
              )}
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 17,
                fontFamily: fonts.Bold,
                color: mode === 'dark' ? colors.WHITE : colors.BLACK,
                marginBottom: 2,
              }}>
                {otherPersonName || (role === 'driver' ? t('customer') : t('driver'))}
              </Text>
              <Text style={{
                fontSize: 13,
                fontFamily: fonts.Regular,
                color: mode === 'dark' ? colors.WHITE : colors.BLACK + '70',
                fontWeight: mode === 'dark' ? '600' : 'normal',
              }}>
                {status === 'COMPLETE' ? t('trip_completed') : t('online')}
              </Text>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={{
                padding: 8,
                marginLeft: 8,
              }}
              onPress={() => {
                const currentBooking = activeBookings?.find(b => b.id === bookingId);
                if (currentBooking) {
                  if (role === 'customer') {
                    onPressCall(currentBooking.driver_contact);
                  } else {
                    if (currentBooking.otherPersonPhone && currentBooking.otherPersonPhone.length > 0) {
                      onPressCall(currentBooking.otherPersonPhone);
                    } else {
                      onPressCall(currentBooking.customer_contact);
                    }
                  }
                }
              }}
            >
              <Ionicons 
                name="call" 
                size={22} 
                color={mode === 'dark' ? colors.WHITE : colors.BLACK} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const chatProps = {
    messages,
    onSend,
    user: { _id: 1 },
    renderBubble,
    renderSend,
    renderInputToolbar,
    renderComposer,
    scrollToBottom: true,
    scrollToBottomComponent,
    placeholder: status === "COMPLETE" ? `${t('booking_is')} ${status}. ${t('not_chat')}` : t('chat_input_title'),
    textInputProps: {
      editable: status !== "COMPLETE"
    },
    renderLoading: () => (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: mode === 'dark' ? '#000000' : '#F2F2F7',
      }}>
        <ActivityIndicator size="large" color={mode === 'dark' ? '#0084FF' : '#007AFF'} />
      </View>
    ),
    listViewProps: {
      style: {
        backgroundColor: mode === 'dark' ? '#000000' : '#F2F2F7',
        padding: 0,
        margin: 0,
      },
    },
    bottomOffset: 0,
    keyboardShouldPersistTaps: 'handled',
    minInputToolbarHeight: 56,
    maxInputLength: 1000,
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: mode === 'dark' ? '#1C1C1E' : colors.WHITE
    }}>
      <StatusBar 
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={mode === 'dark' ? '#1C1C1E' : colors.WHITE}
      />
      
      {renderCustomHeader()}
      
      <View style={{
        flex: 1,
        backgroundColor: mode === 'dark' ? '#000000' : '#F2F2F7'
      }}>
        <GiftedChat 
          {...chatProps} 
          messagesContainerStyle={{
            padding: 5,
            paddingRight: 0,
            marginRight: 0,
            paddingBottom: Platform.OS === 'ios' ? 100 : 80,
          }}
        />
      </View>
    </SafeAreaView>
  );
}
