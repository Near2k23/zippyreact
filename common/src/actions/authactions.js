import {
  FETCH_USER,
  FETCH_USER_SUCCESS,
  FETCH_USER_FAILED,
  USER_SIGN_IN,
  USER_SIGN_IN_FAILED,
  USER_SIGN_OUT,
  CLEAR_LOGIN_ERROR,
  REQUEST_OTP,
  REQUEST_OTP_SUCCESS,
  REQUEST_OTP_FAILED,
  UPDATE_USER_WALLET_HISTORY,
  SEND_RESET_EMAIL,
  SEND_RESET_EMAIL_FAILED
} from "../store/types";

import store from '../store/store';
import { firebase } from '../config/configureFirebase';
import { onValue, update, set, off } from "firebase/database";
import { onAuthStateChanged, signInWithCredential, signInWithPopup, signOut, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithCustomToken, sendEmailVerification } from "firebase/auth";
import { uploadBytesResumable, getDownloadURL } from "firebase/storage";
import base64 from 'react-native-base64';
import AccessKey from '../other/AccessKey';

export const fetchUser = () => (dispatch) => {
  const {
    auth,
    config,
    singleUserRef
  } = firebase;

  dispatch({
    type: FETCH_USER,
    payload: null
  });
  onAuthStateChanged(auth, async user => {
    if (user) {
      const settings = store.getState().settingsdata?.settings;
      
      if (settings && settings.emailVerificationRequired === true && user.email && !user.emailVerified) {
        const isSocialLogin = user.providerData && user.providerData.length > 0 && 
          (user.providerData[0].providerId === "google.com" || user.providerData[0].providerId === "apple.com");
        
        if (!isSocialLogin) {
          try {
            await sendEmailVerification(user);
            await signOut(auth);
            dispatch({
              type: FETCH_USER_FAILED,
              payload: { 
                code: store.getState().languagedata?.defaultLanguage?.auth_error || 'auth_error', 
                message: store.getState().languagedata?.defaultLanguage?.email_not_verified || 'Por favor verifica tu email antes de iniciar sesión. Se ha enviado un correo de verificación.'
              }
            });
            return;
          } catch (error) {
            console.error('Error sending email verification:', error);
            await signOut(auth);
            dispatch({
              type: FETCH_USER_FAILED,
              payload: { 
                code: store.getState().languagedata?.defaultLanguage?.auth_error || 'auth_error', 
                message: store.getState().languagedata?.defaultLanguage?.email_not_verified || 'Por favor verifica tu email antes de iniciar sesión.'
              }
            });
            return;
          }
        }
      }
      
      onValue(singleUserRef(user.uid), async snapshot => {
        if (snapshot.val()) {
          let profile = snapshot.val();
          profile.uid = user.uid;
          dispatch({
            type: FETCH_USER_SUCCESS,
            payload: profile
          });
        }else{
          let data = {
            uid : user.uid,
            mobile: '',
            email: '',
            firstName: '',
            lastName: '',
            verifyId: ''
          }

          if(user.providerData.length == 0 && user.email){
            data.email = user.email;
          }
          if(user.providerData.length > 0 && user.phoneNumber){
            data.mobile = user.phoneNumber;
          }
          if (user.providerData.length > 0) {
            const provideData = user.providerData[0];
            if (provideData == 'phone') {
              data.mobile = provideData.phoneNumber;
            }
            if (provideData.providerId == "google.com" || provideData.providerId == 'apple.com') {
              if (provideData.email) {
                data.email = provideData.email;
              }
              if (provideData.phoneNumber) {
                data.mobile = provideData.phoneNumber;
              }
              if (provideData.displayName) {
                if (provideData.displayName.split(" ").length > 0) {
                  data.firstName = provideData.displayName.split(" ")[0];
                  data.lastName = provideData.displayName.split(" ")[1];
                } else {
                  data.firstName = provideData.displayName;
                }
              }
              if (provideData.photoURL) {
                data['profile_image'] = provideData.photoURL;
              }
            }
          }
          if(user.providerData.length > 0 && user.verifyId){
            data.verifyId = user.verifyId;
          }

          const settings = store.getState().settingsdata.settings;
          let host = window && window.location && settings.CompanyWebsite === window.location.origin? window.location.origin : `https://${config.projectId}.web.app`
          let url = `${host}/check_auth_exists`;
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              "Authorization": "Basic " + base64.encode(config.projectId + ":" + AccessKey)
            },
            body: JSON.stringify({data: JSON.stringify(data)})
          })
          const json = await response.json();
          if(json.uid){
            dispatch({
              type: FETCH_USER_SUCCESS,
              payload: json
            });
          } else{
            dispatch({
              type: FETCH_USER_FAILED,
              payload: { code: store.getState().languagedata.defaultLanguage.auth_error, message: json.error }
            });
          }
        }
      });
    } else {
      dispatch({
        type: FETCH_USER_FAILED,
        payload: { code: store.getState().languagedata.defaultLanguage.auth_error, message: store.getState().languagedata.defaultLanguage.not_logged_in }
      });
    }
  });
};

export const validateReferer = async (referralId) => {
  const {
    config
  } = firebase;
  const response = await fetch(`https://${config.projectId}.web.app/validate_referrer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      referralId: referralId
    })
  })
  const json = await response.json();
  return json;
};

export const checkUserExists = async (data) => {
  const {
    config
  } = firebase;

  const settings = store.getState().settingsdata.settings;
  let host = window && window.location && settings.CompanyWebsite === window.location.origin? window.location.origin : `https://${config.projectId}.web.app` || `http://localhost:3000`
  let url = `${host}/check_user_exists`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Authorization": "Basic " + base64.encode(config.projectId + ":" + AccessKey)
    },
    body: JSON.stringify({
      email: data.email,
      mobile: data.mobile
    })
  })
  const json = await response.json();
  return json;
};

export const mainSignUp = async (regData) => {
  const {
    config
  } = firebase;
  let url = `https://${config.projectId}.web.app/user_signup`;
  
  const bodyToSend = JSON.stringify({ regData: regData });
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: bodyToSend
  })
  const res = await response.json();
  return res;
};

export const updateProfileWithEmail = (profileData) => async (dispatch) => {
  const {
    config
  } = firebase;
  try{
    const settings = store.getState().settingsdata.settings;
    let host = window && window.location && settings.CompanyWebsite === window.location.origin? window.location.origin : `https://${config.projectId}.web.app`
    let url = `${host}/update_user_email`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": "Basic " + base64.encode(config.projectId + ":" + AccessKey)
      },
      body: JSON.stringify(profileData)
    })
    const result = await response.json();
    if(result.error){ 
      return {success: false, error: result.error}
    }
  }catch(error){
    return {success: false, error: error}
  }
}


export const requestPhoneOtpDevice = (verificationId) => async (dispatch) => {
    dispatch({
      type: REQUEST_OTP_SUCCESS,
      payload: verificationId
    }); 
}

export const mobileSignIn = (verficationId, code) => async (dispatch) => {
  const {
    auth,
    mobileAuthCredential,
  } = firebase;

  dispatch({
    type: USER_SIGN_IN,
    payload: null
  });
  signInWithCredential(auth, mobileAuthCredential(verficationId, code))
    .then(async (userCredential) => {
      const user = userCredential.user;
      const settings = store.getState().settingsdata?.settings;
      
      if (settings && settings.emailVerificationRequired === true && user.email && !user.emailVerified) {
        try {
          await sendEmailVerification(user);
          await signOut(auth);
          dispatch({
            type: USER_SIGN_IN_FAILED,
            payload: { 
              code: 'auth/email-not-verified', 
              message: store.getState().languagedata?.defaultLanguage?.email_not_verified || 'Por favor verifica tu email antes de iniciar sesión. Se ha enviado un correo de verificación.'
            }
          });
        } catch (error) {
          console.error('Error sending email verification:', error);
          await signOut(auth);
          dispatch({
            type: USER_SIGN_IN_FAILED,
            payload: { 
              code: 'auth/email-not-verified', 
              message: store.getState().languagedata?.defaultLanguage?.email_not_verified || 'Por favor verifica tu email antes de iniciar sesión.'
            }
          });
        }
      } else {
        //OnAuthStateChange takes care of Navigation
      }
    }).catch(error => {
      dispatch({
        type: USER_SIGN_IN_FAILED,
        payload: error
      });
    });
};

export const saveAddresses = async (uid, location, name) => {
  const { singleUserRef } = firebase;
  onValue(child(singleUserRef(uid), "savedAddresses"), (savedAdd) => {
    if (savedAdd.val()) {
      let addresses = savedAdd.val();
      let didNotMatch = true;
      for (let key in addresses) {
        let entry = addresses[key];
        if (entry.name == name ) {
          didNotMatch = false;
          update(child(singleUserRef(uid),"savedAddresses/" + key),{
            description: location.add,
            lat: location.lat,
            lng: location.lng,
            count: 1,
            name: name
          });
          break;
        }
      }
      if (didNotMatch) {
        push(child(singleUserRef(uid),"savedAddresses"),{
          description: location.add,
          lat: location.lat,
          lng: location.lng,
          count: 1,
          name: name
        });
      }
    } else {
      push(child(singleUserRef(uid),"savedAddresses"),{
        description: location.add,
        lat: location.lat,
        lng: location.lng,
        count: 1,
        name: name
      });
    }
  }, {onlyOnce: true});
};

export const googleLogin = (idToken, accessToken) => (dispatch) => {

  const {
    auth,
    googleCredential
  } = firebase;

  dispatch({
    type: USER_SIGN_IN,
    payload: null
  });

  const credential = googleCredential(idToken, accessToken);
  signInWithCredential(auth, credential)
    .then((user) => {
      //OnAuthStateChange takes care of Navigation
    })
    .catch(error => {
      console.log(error);
      dispatch({
        type: USER_SIGN_IN_FAILED,
        payload: error
      });
    });
}

export const appleSignIn = (credentialData) => (dispatch) => {

  const {
    auth,
    appleProvider
  } = firebase;

  dispatch({
    type: USER_SIGN_IN,
    payload: null
  });
  if (credentialData) {
    const credential = appleProvider.credential(credentialData);
    signInWithCredential(auth, credential)
      .then((user) => {
        //OnAuthStateChange takes care of Navigation
      })
      .catch((error) => {
        dispatch({
          type: USER_SIGN_IN_FAILED,
          payload: error
        });
      });
  } else {
    signInWithPopup(auth, appleProvider).then(function (result) {
      signInWithCredential(auth, result.credential)
        .then((user) => {
        //OnAuthStateChange takes care of Navigation
        })
        .catch(error => {
          dispatch({
            type: USER_SIGN_IN_FAILED,
            payload: error
          });
        }
        );
    }).catch(function (error) {
      dispatch({
        type: USER_SIGN_IN_FAILED,
        payload: error
      });
    });
  }
};

export const signOff = () => (dispatch) => {

  const {
    auth,
    singleUserRef,
    walletHistoryRef,
    userNotificationsRef
  } = firebase;

  const uid = auth.currentUser.uid;

  off(singleUserRef(uid));
  off(walletHistoryRef(uid));
  off(userNotificationsRef(uid));

  onValue(singleUserRef(uid), snapshot => {
      if(snapshot.val()){
        const profile = snapshot.val();
        if (profile && profile.usertype === 'driver') {
          update(singleUserRef(uid), {driverActiveStatus:false});
        }
        setTimeout(()=>{
          signOut(auth)
          .then(() => {
            dispatch({
              type: USER_SIGN_OUT,
              payload: null
            });
          })
          .catch(error => {
      
          });
        },2000)
      }
  },{onlyOnce: true});
};

export const updateProfile = (updateData) => async (dispatch) => {

  const {
    auth,
    singleUserRef,
    driverDocsRef,
    driverDocsRefBack,
    verifyIdImageRef,
    vehicleRegistrationCardRef
  } = firebase;

  const uid = auth.currentUser.uid;
  
  if (updateData.licenseImage) {
    await uploadBytesResumable(driverDocsRef(uid), updateData.licenseImage);
    updateData.licenseImage = await getDownloadURL(driverDocsRef(uid));
  }
  if (updateData.licenseImageBack) {
    await uploadBytesResumable(driverDocsRefBack(uid),updateData.licenseImageBack);
    updateData.licenseImageBack = await getDownloadURL(driverDocsRefBack(uid));
  }
  if (updateData.verifyIdImage) {
    await uploadBytesResumable(verifyIdImageRef(uid), updateData.verifyIdImage);
    updateData.verifyIdImage = await getDownloadURL(verifyIdImageRef(uid));
  }
  if (updateData.vehicleRegistrationCard) {
    await uploadBytesResumable(vehicleRegistrationCardRef(uid), updateData.vehicleRegistrationCard);
    updateData.vehicleRegistrationCard = await getDownloadURL(vehicleRegistrationCardRef(uid));
  }

  update(singleUserRef(uid), updateData);
};


export const updateProfileImage = (imageBlob) => {

  const {
    auth,
    singleUserRef,
    profileImageRef,
  } = firebase;

  const uid = auth.currentUser.uid;

  return uploadBytesResumable( profileImageRef(uid), imageBlob).then(() => {
    imageBlob.close()
    return getDownloadURL(profileImageRef(uid))
  }).then((url) => {
    update(singleUserRef(uid), {
      profile_image: url
    });
    return url;
  }).catch((error) => {
    console.error('Error uploading profile image:', error);
    throw error;
  })
};

export const updateWebProfileImage = async (imageBlob) => {

  const {
    auth,
    singleUserRef,
    profileImageRef
  } = firebase;

  const uid = auth.currentUser.uid;

  await uploadBytesResumable(profileImageRef(uid), imageBlob);
  let image = await getDownloadURL(profileImageRef(uid));
  update(singleUserRef(uid), {profile_image: image});

};
export const updateCustomerProfileImage = async (imageBlob, id) => {

  const {
    singleUserRef,
    profileImageRef
  } = firebase;

  const uid = id

  await uploadBytesResumable(profileImageRef(uid), imageBlob);
  let image = await getDownloadURL(profileImageRef(uid));
  update(singleUserRef(uid), {profile_image: image});

};

export const updatePushToken = (token, platform)  => {

  const {
    auth,
    singleUserRef,
  } = firebase;

  const uid = auth.currentUser.uid;

  update(singleUserRef(uid), {
    pushToken: token,
    userPlatform: platform
  });
};

export const clearLoginError = () => (dispatch) => {
  dispatch({
    type: CLEAR_LOGIN_ERROR,
    payload: null
  });
};

export const fetchWalletHistory = () => (dispatch) => {
  const {
    auth,
    walletHistoryRef
  } = firebase;

  const uid = auth.currentUser.uid;

  onValue(walletHistoryRef(uid) , snapshot => {
    const data = snapshot.val(); 
    if(data){
      const arr = Object.keys(data).map(i => {
        data[i].id = i
        return data[i]
      });
      dispatch({
        type: UPDATE_USER_WALLET_HISTORY,
        payload: arr.reverse()
      });
    }
  });
};
export const fetchUserWalletHistory = (userId) => (dispatch) => {
  const {
    auth,
    walletHistoryRef
  } = firebase;

  const uid = userId;

  onValue(walletHistoryRef(uid) , snapshot => {
    const data = snapshot.val(); 
    if(data){
      const arr = Object.keys(data).map(i => {
        data[i].id = i
        return data[i]
      });
      dispatch({
        type: UPDATE_USER_WALLET_HISTORY,
        payload: arr.reverse()
      });
    }else{
      dispatch({
        type: UPDATE_USER_WALLET_HISTORY,
        payload:[]
      });
    }
  });
};

export const sendResetMail = (email) => async (dispatch) => {
  const {
    authRef
  } = firebase;

  dispatch({
    type: SEND_RESET_EMAIL,
    payload: email
  });
  sendPasswordResetEmail(authRef(), email).then(function() {
    console.log('Email send successfuly');
  }).catch(function (error) {
      dispatch({
        type: SEND_RESET_EMAIL_FAILED,
        payload: {code: store.getState().languagedata.defaultLanguage.auth_error, message: store.getState().languagedata.defaultLanguage.not_registred }
      });
  });
};

const getFirebaseErrorMessage = (error, defaultLanguage) => {
  const code = error?.code || '';
  const errorCodeMap = {
    'auth/user-not-found': defaultLanguage?.not_registred || 'Usuario no encontrado. Verifica tu correo electrónico o número de teléfono.',
    'auth/wrong-password': defaultLanguage?.wrong_password || 'Contraseña incorrecta. Por favor intenta nuevamente.',
    'auth/invalid-credential': defaultLanguage?.auth_invalid_credential || 'Credenciales inválidas. Verifica tu correo electrónico y contraseña.',
    'auth/invalid-email': defaultLanguage?.auth_invalid_email || 'Correo electrónico inválido. Por favor verifica el formato.',
    'auth/user-disabled': defaultLanguage?.auth_user_disabled || 'Esta cuenta ha sido deshabilitada. Contacta al soporte.',
    'auth/too-many-requests': defaultLanguage?.auth_too_many_requests || 'Demasiados intentos fallidos. Por favor espera unos minutos e intenta nuevamente.',
    'auth/network-request-failed': defaultLanguage?.auth_network_error || 'Error de conexión. Verifica tu conexión a internet.',
    'auth/email-not-verified': defaultLanguage?.email_not_verified || 'Por favor verifica tu correo electrónico antes de iniciar sesión.',
    'auth/invalid-verification-code': defaultLanguage?.auth_invalid_verification_code || 'Código de verificación inválido. Por favor intenta nuevamente.',
    'auth/code-expired': defaultLanguage?.auth_code_expired || 'El código de verificación ha expirado. Solicita uno nuevo.',
    'auth/session-cookie-expired': defaultLanguage?.auth_session_expired || 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
    'auth/operation-not-allowed': defaultLanguage?.auth_operation_not_allowed || 'Esta operación no está permitida.',
    'auth/weak-password': defaultLanguage?.auth_weak_password || 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.',
    'auth/email-already-in-use': defaultLanguage?.auth_email_already_in_use || 'Este correo electrónico ya está en uso.',
    'auth/phone-number-already-exists': defaultLanguage?.auth_phone_already_exists || 'Este número de teléfono ya está registrado.',
    'auth/invalid-phone-number': defaultLanguage?.auth_invalid_phone_number || 'Número de teléfono inválido. Verifica el formato.',
    'auth/missing-phone-number': defaultLanguage?.auth_missing_phone_number || 'Número de teléfono requerido.',
    'auth/quota-exceeded': defaultLanguage?.auth_quota_exceeded || 'Se ha excedido la cuota. Por favor intenta más tarde.',
    'auth/app-deleted': defaultLanguage?.auth_app_deleted || 'La aplicación ha sido eliminada.',
    'auth/app-not-authorized': defaultLanguage?.auth_app_not_authorized || 'La aplicación no está autorizada.',
    'auth/argument-error': defaultLanguage?.auth_argument_error || 'Error en los argumentos proporcionados.',
    'auth/invalid-api-key': defaultLanguage?.auth_invalid_api_key || 'Error de configuración. Contacta al soporte.',
    'auth/invalid-user-token': defaultLanguage?.auth_invalid_user_token || 'Token de usuario inválido. Por favor inicia sesión nuevamente.',
    'auth/requires-recent-login': defaultLanguage?.auth_requires_recent_login || 'Por seguridad, necesitas iniciar sesión nuevamente.',
  };
  
  if (errorCodeMap[code]) {
    return {
      code: code,
      message: errorCodeMap[code]
    };
  }
  
  const originalMessage = error?.message || '';
  if (originalMessage && !originalMessage.includes('Firebase: Error')) {
    return {
      code: code,
      message: originalMessage
    };
  }
  
  return {
    code: code,
    message: defaultLanguage?.auth_error || 'Ocurrió un error. Por favor intenta nuevamente.'
  };
};

export const verifyEmailPassword = (email, pass) => async (dispatch) => {
  const {
    authRef
  } = firebase;
  const defaultLanguage = store.getState().languagedata?.defaultLanguage || {};

  signInWithEmailAndPassword(authRef(), email, pass)
    .then(async (userCredential) => {
      const user = userCredential.user;
      const settings = store.getState().settingsdata?.settings;
      
      if (settings && settings.emailVerificationRequired === true && user.email && !user.emailVerified) {
        try {
          await sendEmailVerification(user);
          await signOut(authRef());
          dispatch({
            type: USER_SIGN_IN_FAILED,
            payload: { 
              code: 'auth/email-not-verified', 
              message: defaultLanguage.email_not_verified || 'Por favor verifica tu email antes de iniciar sesión. Se ha enviado un correo de verificación.'
            }
          });
        } catch (error) {
          console.error('Error sending email verification:', error);
          await signOut(authRef());
          dispatch({
            type: USER_SIGN_IN_FAILED,
            payload: { 
              code: 'auth/email-not-verified', 
              message: defaultLanguage.email_not_verified || 'Por favor verifica tu email antes de iniciar sesión.'
            }
          });
        }
      } else {
        //OnAuthStateChange takes care of Navigation
      }
    })
    .catch((error) => {
      const friendlyError = getFirebaseErrorMessage(error, defaultLanguage);
      dispatch({
        type: USER_SIGN_IN_FAILED,
        payload: friendlyError
      });
    });
}

export const requestMobileOtp = (mobile) => async (dispatch) => {
  const {
    config
  } = firebase;
  dispatch({
    type: REQUEST_OTP,
    payload: true
  }); 

  const settings = store.getState().settingsdata.settings;
  let host = window && window.location && settings.CompanyWebsite === window.location.origin? window.location.origin : `https://${config.projectId}.web.app`
  let url = `${host}/request_mobile_otp`;
  try{
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobile: mobile })
    });
    const result = await response.json();
    if(result.success){
      dispatch({
        type: REQUEST_OTP_SUCCESS,
        payload: true
      });
    }else{
      dispatch({
        type: REQUEST_OTP_FAILED,
        payload: result.error
      });
    }
  }catch(error){
    console.log(error);
  }
}

export const verifyMobileOtp = (mobile, otp) => async (dispatch) => {
  const {
    auth,
    config
  } = firebase;
  const body = {
    mobile: mobile,
    otp: otp
  };
  try{
    const settings = store.getState().settingsdata.settings;
    let host = window && window.location && settings.CompanyWebsite === window.location.origin? window.location.origin : `https://${config.projectId}.web.app`
    let url = `${host}/verify_mobile_otp`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    const result = await response.json();
    if(result.token){
      signInWithCustomToken(auth,result.token)
        .then(async (userCredential) => {
          const user = userCredential.user;
          
          if (settings && settings.emailVerificationRequired === true && user.email && !user.emailVerified) {
            try {
              await sendEmailVerification(user);
              await signOut(auth);
              dispatch({
                type: USER_SIGN_IN_FAILED,
                payload: { 
                  code: 'auth/email-not-verified', 
                  message: store.getState().languagedata?.defaultLanguage?.email_not_verified || 'Por favor verifica tu email antes de iniciar sesión. Se ha enviado un correo de verificación.'
                }
              });
            } catch (error) {
              console.error('Error sending email verification:', error);
              await signOut(auth);
              dispatch({
                type: USER_SIGN_IN_FAILED,
                payload: { 
                  code: 'auth/email-not-verified', 
                  message: store.getState().languagedata?.defaultLanguage?.email_not_verified || 'Por favor verifica tu email antes de iniciar sesión.'
                }
              });
            }
          } else {
            //OnAuthStateChange takes care of Navigation
          }
        })
        .catch((error) => {
          dispatch({
            type: USER_SIGN_IN_FAILED,
            payload: error
          });
        });
    }else{
      dispatch({
        type: USER_SIGN_IN_FAILED,
        payload: result.error
      });
    }
  }catch(error){
    console.log(error);
    dispatch({
      type: USER_SIGN_IN_FAILED,
      payload: error
    });
  }
}

export const requestEmailOtp = (email) => async (dispatch) => {
  const {
    config
  } = firebase;
  dispatch({
    type: REQUEST_OTP,
    payload: true
  }); 

  const settings = store.getState().settingsdata.settings;
  const isWeb = typeof window !== 'undefined' && window.location;
  let host = isWeb && settings.CompanyWebsite === window.location.origin? window.location.origin : `https://${config.projectId}.web.app`
  let url = `${host}/request_email_otp`;
  try{
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    const result = await response.json();
    if(result.success){
      dispatch({
        type: REQUEST_OTP_SUCCESS,
        payload: true
      });
      return { success: true };
    }else{
      dispatch({
        type: REQUEST_OTP_FAILED,
        payload: result.error
      });
      return { success: false, error: result.error };
    }
  }catch(error){
    console.log('Error in requestEmailOtp:', error);
    dispatch({
      type: REQUEST_OTP_FAILED,
      payload: error.message || 'Network error'
    });
    return { success: false, error: error.message || 'Network error' };
  }
}

export const verifyEmailOtp = (email, otp) => async (dispatch) => {
  const {
    config
  } = firebase;
  const body = {
    email: email,
    otp: otp
  };
  try{
    const settings = store.getState().settingsdata.settings;
    const isWeb = typeof window !== 'undefined' && window.location;
    let host = isWeb && settings.CompanyWebsite === window.location.origin? window.location.origin : `https://${config.projectId}.web.app`
    let url = `${host}/verify_email_otp`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    const result = await response.json();
    if(result.success){
      return { success: true };
    }else{
      return { success: false, error: result.error || 'OTP verification failed' };
    }
  }catch(error){
    console.log('Error in verifyEmailOtp:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}

export const updateAuthMobile = async ( mobile, otp) => {
  const {
    auth,
    config
  } = firebase;

  const uid = auth.currentUser.uid;
  const body = {
    uid: uid,
    mobile: mobile,
    otp: otp
  };

  const settings = store.getState().settingsdata.settings;
  let host = window && window.location && settings.CompanyWebsite === window.location.origin ? window.location.origin : `https://${config.projectId}.web.app`
  let url = `${host}/update_auth_mobile`;
  try{
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    const result = await response.json();
    if(result.success){
      return {success: true}
    }else{
      return {success: false, error: result.error}
    }
  }catch(error){
    return {success: false, error: error}
  }
}

export const resendEmailVerification = () => async (dispatch) => {
  const {
    auth
  } = firebase;

  const user = auth.currentUser;
  
  if (!user) {
    return { success: false, error: 'No user logged in' };
  }

  if (!user.email) {
    return { success: false, error: 'User has no email' };
  }

  try {
    await sendEmailVerification(user);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'Error sending verification email' };
  }
}
