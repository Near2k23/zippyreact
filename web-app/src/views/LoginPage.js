import React, { useState, useEffect, useContext } from 'react';
import { makeStyles } from "@mui/styles";
import Navbar from "components/ui/navbar.jsx";
import Footer from "components/ui/footer.jsx";
import { useSelector, useDispatch } from "react-redux";
import { useToast } from '../components/Toast';
import CountrySelect from '../components/CountrySelect';
import { FirebaseContext, api } from 'common';
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FONT_FAMILY } from "../common/sharedFunctions.js"
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from '@mui/material/TextField';

const inputStyles = makeStyles((theme) => ({
  textField: {
    "& label.Mui-focused": {
      color: "var(--primary-color)",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "var(--primary-color)",
    },
    "& .MuiFilledInput-underline:after": {
      borderBottomColor: "var(--primary-color)",
    },
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": {
        borderColor: "var(--primary-color)",
      },
    },
    "& input": {
      fontFamily: FONT_FAMILY,
    },
  },
  rootRtl_1: {
    "& label": {
      right: 10,
      left: "auto",
      paddingRight: 33,
      fontFamily: FONT_FAMILY,
    },
    "& legend": {
      textAlign: "right",
      marginRight: 25,
      fontFamily: FONT_FAMILY,
    },
    "& label.Mui-focused": {
      color: "var(--primary-color)",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "var(--primary-color)",
    },
    "& .MuiFilledInput-underline:after": {
      borderBottomColor: "var(--primary-color)",
    },
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": {
        borderColor: "var(--primary-color)",
      },
    },
    "& input": {
      fontFamily: FONT_FAMILY,
    },
  },
}));

export default function LoginPage(props) {
  const { authRef, RecaptchaVerifier, signInWithPhoneNumber } = useContext(FirebaseContext);
  const { t, i18n} = useTranslation();
  const {
    googleLogin,
    countries,
    sendResetMail,
    verifyEmailPassword,
    requestMobileOtp,
    mainSignUp,
    checkUserExists,
    validateReferer
  } = api;
  const navigate = useNavigate();
  const auth = useSelector(state => state.auth);
  const settings = useSelector(state => state.settingsdata.settings);
  const dispatch = useDispatch();
  const [capatchaReady, setCapatchaReady] = React.useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verifier, setVerifier] = useState(null);
  const [mobileWithoutCountry, setMobileWithoutCountry] = useState('');
  const[showSignUp, setShowSignUp] = useState(false);
  const isRTL = i18n.dir();

  const [data, setData] = React.useState({
    email: '',
    confirmpassword: "",
    country: "",
    contact: '',
    mobile:"",
    password: '',
    otp: '',
    verificationId: null,
    firstName: '',
    lastName: '',
    selectedcountry:null,
    usertype:'customer',
    referralId:'',
    entryType: null
  });

  const [otpCalled, setOtpCalled] = useState();

  const inputClasses = inputStyles();
  const { showToast, ToastContainer } = useToast();


  useEffect(() => {
    if(settings){
        for (let i = 0; i < countries.length; i++) {
            if(countries[i].label === settings.country){
                setData({
                  country: countries[i].phone,
                  selectedcountry:countries[i],
                });
            }
        }
    }
  }, [settings,countries]);

  useEffect(() => {
    if(!window.recaptchaVerifier){
      setCapatchaReady(true);
    }
    if (auth.profile) {
      if(auth.profile.uid){
        let role = auth.profile.usertype;
        if(role==='admin' || role==='fleetadmin'){
          navigate('/dashboard');
        }
        else if (role==='driver'){
          navigate('/bookings');
        }
        else {
          navigate('/');
        }
      }
    }
    if (auth.error && auth.error.flag && auth.error.msg.message !== t('not_logged_in')) {
      if (auth.error.msg.message === t('require_approval')){
        showToast(t('require_approval'), 'warning', 4000, 'top-right', t('warning') || 'Advertencia');
      } else if(auth.error.msg.message === "Firebase: Error (auth/invalid-verification-code)."){
        showToast(t('login_error'), 'error', 4000, 'top-right', t('error') || 'Error');
        setIsLoading(false);
      } else{
        if(data.contact && (data.contact === '' ||  !(!data.contact))){
          showToast(t('login_error'), 'error', 4000, 'top-right', t('error') || 'Error');
          setIsLoading(false);
        }
      }
    }
    if(auth.verificationId && otpCalled){
      setOtpCalled(false);
      setData({ ...data, verificationId: auth.verificationId });
    }
  }, [auth.profile, auth.error, auth.verificationId, navigate, data, data.email, data.contact, capatchaReady, RecaptchaVerifier, t, setData, otpCalled, setOtpCalled, showToast]);


  const handleGoogleLogin = (credentialResponse) => {
    if(credentialResponse && credentialResponse.credential){
      dispatch(googleLogin(credentialResponse.credential,null))
    } else {
      showToast(t('login_error'), 'error', 4000, 'top-right', t('error') || 'Error');
      setIsLoading(false);
    }
  }

  const onInputChange = (event) => {
    setData({ ...data, [event.target.id]: event.target.value })
  }

  const handleGetOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if(data.country){
      if(data.contact){
        if (isNaN(data.contact)) {
          setData({...data, entryType: 'email'});
          const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          if(re.test(data.contact)){
            await dispatch(verifyEmailPassword(
              data.contact,
              data.otp
            ));
          }else{
              showToast(t('proper_email'), 'error', 4000, 'top-right', t('error') || 'Error');
              setIsLoading(false);
          }
        } else{
          setData({...data, entryType: 'mobile'});
          if(!settings.AllowCriticalEditsAdmin){
            showToast(t('in_demo_mobile_login'), 'warning', 4000, 'top-right', t('warning') || 'Advertencia');
            setIsLoading(false);
            return;
          }
          let formattedNum = data.contact.replace(/ /g, '');
          const phoneNumber = "+" + data.country + formattedNum;
          if (formattedNum.length > 6) {
            if(settings.customMobileOTP){
              dispatch(requestMobileOtp(phoneNumber));
              setData({...data, verificationId: true});
              setIsLoading(false)
            } else {
              try {
                if(!window.recaptchaVerifier || verifier===null){
                  window.recaptchaVerifier = new RecaptchaVerifier(authRef(),'sign-in-button', {
                    'size': 'invisible',
                    'callback': function(response) {
                      setCapatchaReady(true);
                    }
                  });
                }
                const appVerifier = window.recaptchaVerifier;
                setVerifier(appVerifier);
                const result = await signInWithPhoneNumber(authRef(), phoneNumber, appVerifier);
                setData({...data, verificationId: result.verificationId})
                setIsLoading(false)
                if (window.recaptchaVerifier) {
                  window.recaptchaVerifier.clear();
                }
              } catch (error) {
                showToast(error.code + ": " + error.message, 'error', 4000, 'top-right', t('error') || 'Error');
                setIsLoading(false);
                if (window.recaptchaVerifier) {
                  window.recaptchaVerifier.clear();
                }
              }
            }
          } else {
              showToast(t('mobile_no_blank_error'), 'error', 4000, 'top-right', t('error') || 'Error');
              setIsLoading(false);
          }
        }
      }else{
        showToast(t('contact_input_error'), 'error', 4000, 'top-right', t('error') || 'Error');
        setIsLoading(false);
      }
    }else{
      showToast(t('country_blank_error'), 'error', 4000, 'top-right', t('error') || 'Error');
      setIsLoading(false);
    }
  }


  const handleCancel = (e) => {
    setData({
      ...data,
      contact: null,
      verificationId: null
    });
    setIsLoading(false);
  }

  const onCountryChange = (object, value) => {
    if (value && value.phone) {
      setData({ ...data, country: value.phone, selectedcountry:value });
      setMobileWithoutCountry("")
    }
  };

  const forgotPassword = async (e) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if(re.test(data.contact)){
      await dispatch(sendResetMail(data.contact));
      showToast(t('email_send'), 'success', 4000, 'top-right', t('success') || '¡Éxito!');
    }else{
      showToast(t('proper_email'), 'error', 4000, 'top-right', t('error') || 'Error');
    }
  };

  const handleShowSignup = ()=>{
    setData({...data, email:"", firstName:"", lastName:"", password:"", confirmpassword:"",usertype:"customer",referralId:""})
    setMobileWithoutCountry("")
    setIsLoading(false)
    setShowSignUp(!showSignUp)
  }

  const mobileInputChange = (e)=>{
    const val = e.target.value;
    setMobileWithoutCountry(val)
    let formattedNum = val.replace(/ /g, '');
    const phoneNumber = "+" + data.country + formattedNum;
      setData({ ...data, mobile: phoneNumber })
  }

  const handleChangeUser = (event) => {
    setData({ ...data, usertype: event.target.value });
  };
  const checkPasswordValidity = value => {
    if (value !== data.confirmpassword){
        return(t('confirm_password_not_match_err'));
    }
  
    const isNonWhiteSpace = /^\S*$/;
    if (!isNonWhiteSpace.test(value)) {
    return(t('password_must_not_contain_whitespaces'));
    }
  
    const isContainsUppercase = /^(?=.*[A-Z]).*$/;
    if (!isContainsUppercase.test(value)) {
    return(t('password_must_have_at_least_one_uppercase_character'));
    }
  
    const isContainsLowercase = /^(?=.*[a-z]).*$/;
    if (!isContainsLowercase.test(value)) {
    return(t('password_must_have_at_least_one_lowercase_character'));
    }
  
    const isContainsNumber = /^(?=.*[0-9]).*$/;
    if (!isContainsNumber.test(value)) {
    return(t('password_must_contain_at_least_one_digit'));
    }
  
    const isValidLength = /^.{8,16}$/;
    if (!isValidLength.test(value)) {
    return(t('password_must_be_8-16_characters_long'));
    }
  
    return null;
  }

  const validateMobile = () => {
    let mobileValid = true;
    if (mobileWithoutCountry.length < 6) {
        mobileValid = false;
        showToast(t('mobile_no_blank_error'), 'error', 4000, 'top-right', t('error') || 'Error');
    }
    return mobileValid;
}


  const handleSignUp = (e)=>{
    e.preventDefault();
    new Promise((resolve,reject) => {
    setIsLoading(true)
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const validatePassword = checkPasswordValidity(data.password);
    if(re.test(data.email)){
      if (/\S/.test(data.firstName) && data.firstName.length > 0 && /\S/.test(data.lastName) && data.lastName.length > 0){
          if(!validatePassword){
            if (validateMobile()) {
              const userData = { ...data };
              if (userData.usertype === 'customer') delete userData.carType
                delete userData.confirmpassword;
                delete userData.pass;
                checkUserExists(userData).then((res) => {
                  if(res.users && res.users.length > 0){
                    showToast(t('user_exists'), 'error', 4000, 'top-right', t('error') || 'Error');
                    setIsLoading(false);
                  }else{
              if (userData.referralId && userData.referralId.length > 0){
                validateReferer(userData.referralId).then((referralInfo)=>{
                  if (referralInfo.uid) {
                    delete userData.country;
                    mainSignUp({...userData, signupViaReferral: referralInfo.uid}).then((res)=>{
                      if(res.uid){
                        handleSuccessfulRegistration();
                        resolve();
                      }else{
                        showToast(t('reg_error'), 'error', 4000, 'top-right', t('error') || 'Error');
                        setIsLoading(false);
                      }
                    })
                  }else{
                    showToast(t('referer_not_found'), 'error', 4000, 'top-right', t('error') || 'Error');
                    setIsLoading(false);
                  }
                }).catch((error)=>{
                  showToast(t('referer_not_found'), 'error', 4000, 'top-right', t('error') || 'Error');
                  setIsLoading(false);
                });
              }else{
                delete userData.country;
                mainSignUp(userData).then((res)=>{
                  if(res.uid){
                    handleSuccessfulRegistration();
                    resolve();
                  }else{
                    showToast(t('reg_error'), 'error', 4000, 'top-right', t('error') || 'Error');
                    setIsLoading(false);
                  }
                })
              }
            }
          })
            }else{
              showToast(t('mobile_no_blank_error'), 'error', 4000, 'top-right', t('error') || 'Error');
              reject();
            }
          }else{
            showToast(validatePassword, 'error', 4000, 'top-right', t('error') || 'Error');
            reject();
          }
      }else{
        showToast(t('proper_input_name'), 'error', 4000, 'top-right', t('error') || 'Error');
        reject();
      }
    }else{
      showToast(t('proper_email'), 'error', 4000, 'top-right', t('error') || 'Error');
      reject();
    }
  }).catch(()=>{})
  .finally(()=>{setIsLoading(false)})
  }

  const handleSuccessfulRegistration = () => {
    setData({...data, email:"", firstName:"", lastName:"", password:"", confirmpassword:"",usertype:"customer",referralId:""});
    setMobileWithoutCountry("");
    setIsLoading(false);
    
    showToast(
      t("account_create_successfully") || "Cuenta creada exitosamente",
      'success',
      4000,
      'top-right',
      t("success") || "¡Éxito!"
    );
    
    setTimeout(() => {
      setShowSignUp(false);
    }, 1000);
  };

  return (
    <div>
      <Navbar 
        logoSrc={require("../assets/img/logo.png")}
        logoSrcDark={require("../assets/img/logo.png")}
        darkText={true}
      />
      <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 sm:w-60 sm:h-60 bg-blue-100 rounded-full opacity-20"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 sm:w-72 sm:h-72 bg-indigo-100 rounded-full opacity-20"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 sm:w-24 sm:h-24 bg-yellow-100 rounded-full opacity-30"></div>
        </div>
        
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 w-full py-32">
          <div className="w-full max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-[20px] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col lg:flex-row min-h-[600px] border border-white/30">
              <div className="w-full lg:w-1/2 p-8 lg:p-12">
                {showSignUp ? (
                  <div className="h-full flex flex-col">
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                        {t("create_account")}
                      </h1>
                      <p className="text-[var(--text-secondary)]">
                        {t("join_waygo")}
                      </p>
                    </div>
                    
                    <form className="space-y-6 flex-1">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label={t("first_name")}
                            value={data.firstName}
                            onChange={(e) => setData({...data, firstName: e.target.value})}
                            className={isRTL === "rtl" ? inputClasses.rootRtl_1 : inputClasses.textField}
                            style={{direction: isRTL === 'rtl' ? 'rtl' : 'ltr'}}
                            InputLabelProps={{ style: { fontFamily: FONT_FAMILY } }}
                            inputProps={{
                              style: { fontFamily: FONT_FAMILY },
                              autoComplete: 'new-password'
                            }}
                          />
                        </div>
                        <div>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label={t("last_name")}
                            value={data.lastName}
                            onChange={(e) => setData({...data, lastName: e.target.value})}
                            className={isRTL === "rtl" ? inputClasses.rootRtl_1 : inputClasses.textField}
                            style={{direction: isRTL === 'rtl' ? 'rtl' : 'ltr'}}
                            InputLabelProps={{ style: { fontFamily: FONT_FAMILY } }}
                            inputProps={{
                              style: { fontFamily: FONT_FAMILY },
                              autoComplete: 'new-password'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <TextField
                          fullWidth
                          variant="outlined"
                          label={t("email")}
                          type="email"
                          value={data.email}
                          onChange={(e) => setData({...data, email: e.target.value})}
                          className={isRTL === "rtl" ? inputClasses.rootRtl_1 : inputClasses.textField}
                          style={{direction: isRTL === 'rtl' ? 'rtl' : 'ltr'}}
                          InputLabelProps={{ style: { fontFamily: FONT_FAMILY } }}
                          inputProps={{
                            style: { fontFamily: FONT_FAMILY },
                            autoComplete: 'new-password'
                          }}
                        />
                      </div>

                      {countries && countries.length > 0 && (
                        <div className="w-full">
                          <CountrySelect
                            countries={countries}
                            label={t('select_country')}
                            value={data.selectedcountry}
                            onChange={onCountryChange}
                            disabled={data.verificationId ? true : false}
                            readOnly={!settings.AllowCountrySelection}
                            style={{ width: '100%' }}
                          />
                        </div>
                      )}

                      <div>
                        <TextField
                          fullWidth
                          variant="outlined"
                          label={t("phone")}
                          value={mobileWithoutCountry}
                          onChange={mobileInputChange}
                          className={isRTL === "rtl" ? inputClasses.rootRtl_1 : inputClasses.textField}
                          style={{direction: isRTL === 'rtl' ? 'rtl' : 'ltr'}}
                          InputLabelProps={{ style: { fontFamily: FONT_FAMILY } }}
                          inputProps={{
                            style: { fontFamily: FONT_FAMILY },
                            autoComplete: 'new-password'
                          }}
                        />
                      </div>

                      <div>
                        <FormControl variant="outlined" fullWidth>
                          <InputLabel>{t("User_Type")}</InputLabel>
                          <Select
                            value={data.usertype || ""}
                            onChange={handleChangeUser}
                            label={t("User_Type")}
                          >
                            <MenuItem value={"customer"}>
                              {t("customer")}
                            </MenuItem>
                            <MenuItem value={"driver"}>
                              {t("driver")}
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </div>

                      <div>
                        <TextField
                          fullWidth
                          variant="outlined"
                          label={t("password")}
                          type="password"
                          value={data.password}
                          onChange={(e) => setData({...data, password: e.target.value})}
                          className={isRTL === "rtl" ? inputClasses.rootRtl_1 : inputClasses.textField}
                          style={{direction: isRTL === 'rtl' ? 'rtl' : 'ltr'}}
                          InputLabelProps={{ style: { fontFamily: FONT_FAMILY } }}
                          inputProps={{
                            style: { fontFamily: FONT_FAMILY },
                            autoComplete: 'new-password'
                          }}
                        />
                      </div>

                      <div>
                        <TextField
                          fullWidth
                          variant="outlined"
                          label={t("confirm_password")}
                          type="password"
                          value={data.confirmpassword}
                          onChange={(e) => setData({...data, confirmpassword: e.target.value})}
                          className={isRTL === "rtl" ? inputClasses.rootRtl_1 : inputClasses.textField}
                          style={{direction: isRTL === 'rtl' ? 'rtl' : 'ltr'}}
                          InputLabelProps={{ style: { fontFamily: FONT_FAMILY } }}
                          inputProps={{
                            style: { fontFamily: FONT_FAMILY },
                            autoComplete: 'new-password'
                          }}
                        />
                      </div>

                      <div>
                        <TextField
                          fullWidth
                          variant="outlined"
                          label={t("referralId")}
                          value={data.referralId}
                          onChange={(e) => setData({...data, referralId: e.target.value})}
                          className={isRTL === "rtl" ? inputClasses.rootRtl_1 : inputClasses.textField}
                          style={{direction: isRTL === 'rtl' ? 'rtl' : 'ltr'}}
                          InputLabelProps={{ style: { fontFamily: FONT_FAMILY } }}
                          inputProps={{
                            style: { fontFamily: FONT_FAMILY },
                            autoComplete: 'new-password'
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleSignUp}
                        disabled={isLoading}
                        className="w-full bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] py-3 px-4 rounded-lg font-medium hover:bg-[var(--button-primary-hover)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('creating_account')}
                          </div>
                        ) : (
                          t('create_account')
                        )}
                      </button>
                    </form>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[var(--border-light)]"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-[var(--text-muted)]">
                          {t('or_continue_with')}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center space-x-4">
                      <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={handleGoogleLogin}
                      />
                    </div>

                    <div className="text-center mt-6">
                      <p className="text-[var(--text-secondary)]">
                        {t('already_have_account')}{' '}
                        <button
                          onClick={handleShowSignup}
                          className="text-[var(--primary-dark)] hover:text-[var(--primary-color)] font-medium transition-colors duration-200"
                        >
                          {t('sign_in')}
                        </button>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                                      <div className="text-center mb-8">
                    <div className="mb-4">
                      <img 
                        src={require("../assets/img/logo.png")} 
                        alt="Waygo" 
                        className="h-12 sm:h-16 md:h-20 w-auto mx-auto"
                      />
                    </div>
                    <p className="text-[var(--text-secondary)]">
                      {t('welcome_back')}
                    </p>
                  </div>
                    
                    <form className="space-y-6 flex-1">
                      <div id="sign-in-button" />
                      
                      {settings.mobileLogin && countries && countries.length > 0 && (
                        <div className="w-full">
                          <CountrySelect
                            countries={countries}
                            label={t('select_country')}
                            value={data.selectedcountry}
                            onChange={onCountryChange}
                            disabled={data.verificationId ? true : false}
                            readOnly={!settings.AllowCountrySelection}
                            style={{ width: '100%' }}
                          />
                        </div>
                      )}

                      <div>
                        <TextField
                          fullWidth
                          variant="outlined"
                          label={settings.emailLogin && settings.mobileLogin ? t('contact_placeholder') : settings.emailLogin && !settings.mobileLogin ? t('email_id') : t('mobile_number')}
                          value={data.contact || ''}
                          onChange={onInputChange}
                          id="contact"
                          disabled={data.verificationId ? true : false}
                          className={isRTL === "rtl" ? inputClasses.rootRtl_1 : inputClasses.textField}
                          style={{direction: isRTL === 'rtl' ? 'rtl' : 'ltr'}}
                          InputLabelProps={{ style: { fontFamily: FONT_FAMILY } }}
                          inputProps={{
                            style: { fontFamily: FONT_FAMILY },
                            autoComplete: 'new-password'
                          }}
                        />
                      </div>

                      {((data.contact && isNaN(data.contact)) || (settings.emailLogin && !settings.mobileLogin)) ? (
                        <div>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label={((data.contact && isNaN(data.contact)) || (settings.emailLogin && !settings.mobileLogin)) ? t('password') : t('otp_here')}
                            type="password"
                            value={data.otp || ''}
                            onChange={onInputChange}
                            id="otp"
                            disabled={data.verificationId ? true : false}
                            className={isRTL === "rtl" ? inputClasses.rootRtl_1 : inputClasses.textField}
                            style={{direction: isRTL === 'rtl' ? 'rtl' : 'ltr'}}
                            InputLabelProps={{ style: { fontFamily: FONT_FAMILY } }}
                            inputProps={{
                              style: { fontFamily: FONT_FAMILY },
                              autoComplete: 'new-password'
                            }}
                          />
                        </div>
                      ) : null}

                      {data.verificationId ? (
                        <TextField
                          fullWidth
                          variant="outlined"
                          label={t('otp')}
                          type="password"
                          value={data.otp || ''}
                          onChange={onInputChange}
                          id="otp"
                          className={isRTL === "rtl" ? inputClasses.rootRtl_1 : inputClasses.textField}
                          style={{direction: isRTL === 'rtl' ? 'rtl' : 'ltr'}}
                          InputLabelProps={{ style: { fontFamily: FONT_FAMILY } }}
                          inputProps={{
                            style: { fontFamily: FONT_FAMILY },
                            autoComplete: 'new-password'
                          }}
                        />
                      ) : null}

                      {data.contact && isNaN(data.contact) ? (
                        <div className="text-right">
                          <button
                            type="button"
                            onClick={() => forgotPassword()}
                            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
                          >
                            {t('forgot_password')}
                          </button>
                        </div>
                      ) : null}

                       <button
                         type="button"
                         onClick={handleGetOTP}
                         disabled={isLoading}
                         className="w-full bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] py-3 px-4 rounded-lg font-medium hover:bg-[var(--button-primary-hover)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         {isLoading ? (
                           <div className="flex items-center justify-center">
                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                             {t('logging_in') || 'Iniciando sesión...'}
                           </div>
                         ) : (
                           settings.mobileLogin ? data.contact && isNaN(data.contact) ? t('login') : t('login_otp') : t('login')
                         )}
                       </button>

                      {data.verificationId ? (
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="w-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] py-3 px-4 rounded-lg font-medium hover:bg-[var(--border-medium)] transition-all duration-200"
                        >
                          {t('cancel')}
                        </button>
                      ) : null}
                    </form>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[var(--border-light)]"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-[var(--text-muted)]">
                          {t('or_continue_with')}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center space-x-4">
                      <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={handleGoogleLogin}
                      />
                    </div>

                    <div className="text-center mt-6">
                      <p className="text-[var(--text-secondary)]">
                        {t('not_a_member')}{' '}
                        <button
                          onClick={handleShowSignup}
                          className="text-[var(--primary-dark)] hover:text-[var(--primary-color)] font-medium transition-colors duration-200"
                        >
                          {t('register_now')}
                        </button>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0">
                  <img 
                    src={require("../assets/img/background.jpg")} 
                    alt="Ciudad vibrante" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
                </div>
              </div>
            </div>
                 </div>
        </div>

        <div className="relative w-full mt-auto">
          <Footer />
        </div>

        <ToastContainer />
      </div>
    </div>
  );
}