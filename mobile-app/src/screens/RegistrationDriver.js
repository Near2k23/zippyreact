import React, { useState, useEffect } from 'react';
import { RegistrationDriver } from '../components';
import { StyleSheet, View, Alert } from 'react-native';
import { useSelector,useDispatch } from 'react-redux';
import i18n from 'i18n-js';
import { api } from 'common';

export default function RegistrationDriverPage(props) {
  const {
    mainSignUp, 
    validateReferer,
    checkUserExists,
    editreferral
  } = api;
  const [loading, setLoading] = useState(false);
  const useduserReferral = useSelector(state => state.usedreferralid.usedreferral);
  const { t } = i18n;

    const dispatch = useDispatch()
    
    const uploadImagesAndUpdateProfile = async (uid, regData) => {
        try {
            const { firebase } = require('common/src/config/configureFirebase');
            const { uploadBytesResumable, getDownloadURL } = require('firebase/storage');
            const { singleUserRef, verifyIdImageRef, profileImageRef } = firebase;
            const { update } = require('firebase/database');
            
            const updateData = {};
            
            if (regData.verifyIdImage) {
                await uploadBytesResumable(verifyIdImageRef(uid), regData.verifyIdImage);
                const verifyIdImageUrl = await getDownloadURL(verifyIdImageRef(uid));
                updateData.verifyIdImage = verifyIdImageUrl;
            }
            
            if (regData.profileImage) {
                await uploadBytesResumable(profileImageRef(uid), regData.profileImage);
                const profileImageUrl = await getDownloadURL(profileImageRef(uid));
                updateData.profile_image = profileImageUrl;
            }
            
            if (regData.term !== undefined) {
                updateData.term = regData.term;
            }
            
            if (regData.biometricEnabled !== undefined) {
                updateData.biometricEnabled = regData.biometricEnabled;
            }
            
            if (Object.keys(updateData).length > 0) {
                await update(singleUserRef(uid), updateData);
            }
        } catch (error) {
            console.error('Error uploading images:', error);
        }
    };
    
    const clickRegister = async (regData) => {
    setLoading(true);
    checkUserExists(regData).then((res)=>{
      if(res.users && res.users.length>0){
        setLoading(false);
        Alert.alert(t('alert'),t('user_exists'));
      }
      else if(res.error){
        setLoading(false);
        Alert.alert(t('alert'),t('email_or_mobile_issue'));
      }
      else{
        if (regData.referralId && regData.referralId.length > 0) {
          
          validateReferer(regData.referralId).then((referralInfo)=>{
            const referrals = useduserReferral ?? [];
            for (let i = 0; i < referrals.length; i++) {
                if(referrals[i].email===regData.email){
                    Alert.alert(t("referral_email_used"))
                    setLoading(false)
                    return
                }else if(referrals[i].phone===regData.mobile){
                    Alert.alert(t("referral_number_used"))
                    setLoading(false)
                    return
                }
               
               
            }
            if (referralInfo.uid) {
                            mainSignUp({...regData, signupViaReferral: referralInfo.uid}).then(async (res)=>{
                             
                            dispatch(editreferral({email:regData.email,phone:regData.mobile},"Add"))
                setLoading(false);
                if(res.uid){
                  await uploadImagesAndUpdateProfile(res.uid, regData);
                  Alert.alert(
                    t('alert'),
                    t('account_create_successfully'),
                    [
                        {
                            text: t('ok'), 
                            onPress: () => {
                             props. navigation.goBack();
                            }
                        },
                    ],
                    { cancelable: false },
                  );
                }else{
                  let errorMessage = t('reg_error') || 'Error al crear la cuenta.';
                  if (res.error) {
                    const errorStr = res.error.toString();
                    if (errorStr.includes('Phone number is too short') || errorStr.includes('TOO_SHORT')) {
                      errorMessage = t('phone_number_too_short') || 'El número de teléfono es demasiado corto. Por favor ingrese un número válido con código de país.';
                    } else if (errorStr.includes('Email already exists') || errorStr.includes('email-already-in-use')) {
                      errorMessage = t('email_already_exists') || 'Este correo electrónico ya está registrado.';
                    } else if (errorStr.includes('Phone number already exists') || errorStr.includes('phone-number-already-exists')) {
                      errorMessage = t('phone_already_exists') || 'Este número de teléfono ya está registrado.';
                    } else if (errorStr.includes('Invalid email format') || errorStr.includes('invalid-email')) {
                      errorMessage = t('invalid_email_format') || 'Formato de correo electrónico inválido.';
                    } else if (errorStr.includes('Invalid phone number format') || errorStr.includes('invalid-phone-number')) {
                      errorMessage = t('invalid_phone_format') || 'Formato de número de teléfono inválido.';
                    } else if (errorStr.includes('Password is too weak') || errorStr.includes('weak-password')) {
                      errorMessage = t('weak_password') || 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
                    } else if (errorStr.includes('User Not Created')) {
                      errorMessage = t('user_creation_failed') || 'No se pudo crear el usuario. Por favor intenta nuevamente.';
                    } else if (errorStr.includes('network') || errorStr.includes('Network')) {
                      errorMessage = t('auth_network_error') || 'Error de conexión. Verifica tu conexión a internet.';
                    } else if (errorStr.includes('quota') || errorStr.includes('Quota')) {
                      errorMessage = t('auth_quota_exceeded') || 'Se ha excedido la cuota. Por favor intenta más tarde.';
                    } else {
                      const cleanError = errorStr.replace(/Firebase: Error \(auth\/[^)]+\)\.?/g, '').trim();
                      errorMessage = cleanError || t('reg_error') || 'Error al crear la cuenta. Por favor intenta nuevamente.';
                    }
                  }
                  Alert.alert(t('alert'), errorMessage);
                  console.log('🔐 AUTH DEBUG - Error en mainSignUp:', res.error);
                }
              })
            }else{
              setLoading(false);
              Alert.alert(t('alert'),t('referer_not_found'))
            }
          }).catch((error)=>{
            setLoading(false);
            Alert.alert(t('alert'),t('referer_not_found'))
          });
        } else {
          mainSignUp(regData).then(async (res)=>{
                        setLoading(false);
            if(res.uid){
                            await uploadImagesAndUpdateProfile(res.uid, regData);
                            Alert.alert(
                  t('alert'),
                  t('account_create_successfully'),
                  [
                      {
                          text: t('ok'), 
                          onPress: () => {
                            props.navigation.goBack();
                          }
                      },
                  ],
                  { cancelable: false },
              );
            }else{
              let errorMessage = t('reg_error') || 'Error al crear la cuenta.';
              if (res.error) {
                const errorStr = res.error.toString();
                if (errorStr.includes('Phone number is too short') || errorStr.includes('TOO_SHORT')) {
                  errorMessage = t('phone_number_too_short') || 'El número de teléfono es demasiado corto. Por favor ingrese un número válido con código de país.';
                } else if (errorStr.includes('Email already exists') || errorStr.includes('email-already-in-use')) {
                  errorMessage = t('email_already_exists') || 'Este correo electrónico ya está registrado.';
                } else if (errorStr.includes('Phone number already exists') || errorStr.includes('phone-number-already-exists')) {
                  errorMessage = t('phone_already_exists') || 'Este número de teléfono ya está registrado.';
                } else if (errorStr.includes('Invalid email format') || errorStr.includes('invalid-email')) {
                  errorMessage = t('invalid_email_format') || 'Formato de correo electrónico inválido.';
                } else if (errorStr.includes('Invalid phone number format') || errorStr.includes('invalid-phone-number')) {
                  errorMessage = t('invalid_phone_format') || 'Formato de número de teléfono inválido.';
                } else if (errorStr.includes('Password is too weak') || errorStr.includes('weak-password')) {
                  errorMessage = t('weak_password') || 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
                } else if (errorStr.includes('User Not Created')) {
                  errorMessage = t('user_creation_failed') || 'No se pudo crear el usuario. Por favor intenta nuevamente.';
                } else if (errorStr.includes('network') || errorStr.includes('Network')) {
                  errorMessage = t('auth_network_error') || 'Error de conexión. Verifica tu conexión a internet.';
                } else if (errorStr.includes('quota') || errorStr.includes('Quota')) {
                  errorMessage = t('auth_quota_exceeded') || 'Se ha excedido la cuota. Por favor intenta más tarde.';
                } else {
                  const cleanError = errorStr.replace(/Firebase: Error \(auth\/[^)]+\)\.?/g, '').trim();
                  errorMessage = cleanError || t('reg_error') || 'Error al crear la cuenta. Por favor intenta nuevamente.';
                }
              }
              Alert.alert(t('alert'), errorMessage);
              console.log('🔐 AUTH DEBUG - Error en mainSignUp:', res.error);
            }
          })
        }
      }
    });
  }

  return (
    <View style={styles.containerView}>
      <RegistrationDriver
        onPressRegister={(regData) => clickRegister(regData)}
        onPressBack={() => { props.navigation.goBack() }}
        loading={loading}
        >
      </RegistrationDriver>
    </View>
  );
}
const styles = StyleSheet.create({
  containerView: { flex: 1 },
  textContainer: { textAlign: "center" },
});
