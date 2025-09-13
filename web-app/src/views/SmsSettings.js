import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { makeStyles } from '@mui/styles';
import { useSelector, useDispatch } from "react-redux";
import Grid from '@mui/material/Grid';
import { api } from 'common';
import { useTranslation } from "react-i18next";
import {colors} from '../components/Theme/WebTheme';
import Button from "components/CustomButtons/Button.js";
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import {MAIN_COLOR, SECONDORY_COLOR, FONT_FAMILY } from "../common/sharedFunctions"

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
      fontFamily: FONT_FAMILY,
    },
  },
  typography: {
    fontFamily: FONT_FAMILY,
  },
  container: {
    zIndex: "12",
    color:colors.WHITE,
    alignContent: 'center',
    width:'70%'
  },
  container1: {
    backgroundColor: colors.WHITE,
    borderTopLeftRadius: "0px",
    borderTopRightRadius: "0px",
    borderBottomLeftRadius: "8px",
    borderBottomRightRadius: "8px",
    padding: '30px',
    width: '100%',
    top: "19px",
    boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`,
  },
  gridcontainer: {
    alignContent: 'center'
  },
  items: {
    margin: 0,
    width: '100%'
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
    width: 192,
    height: 192
  },
  form: {
    width: '50%',
    marginTop: theme.spacing(1),
    backgroundColor: MAIN_COLOR,
    alignContent: 'center',
    borderRadius: "8px",
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  rootRtl: {
    "& label": {
      right: 10,
      left: "auto",
      paddingRight: 20,
      fontFamily: FONT_FAMILY,
    },
    "& legend": {
      textAlign: "right",
      marginRight: 20,
      fontFamily: FONT_FAMILY,
    },
    "& label.Mui-focused": {
      color: MAIN_COLOR,
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: MAIN_COLOR,
    },
    "& .MuiFilledInput-underline:after": {
      borderBottomColor: MAIN_COLOR,
    },
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": {
        borderColor: MAIN_COLOR,
      },
    },
    "& input": {
      fontFamily: FONT_FAMILY,
    },
  },
  rootRtl_1: {
    "& label": {
      right: 15,
      left: "auto",
      paddingRight: 25,
      fontFamily: FONT_FAMILY,
    },
    "& legend": {
      textAlign: "right",
      marginRight: 25,
      fontFamily: FONT_FAMILY,
    },
    "& label.Mui-focused": {
      color: MAIN_COLOR,
      fontFamily: FONT_FAMILY,
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: MAIN_COLOR,
    },
    "& .MuiFilledInput-underline:after": {
      borderBottomColor: MAIN_COLOR,
    },
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": {
        borderColor: MAIN_COLOR,
      },
    },
  },
  rootRtl_2: {
    "& label": {
      right: 10,
      left: "auto",
      paddingRight: 12,
      fontFamily: FONT_FAMILY,
    },
    "& legend": {
      textAlign: "right",
      marginRight: 25,
      fontFamily: FONT_FAMILY,
    },
    "& label.Mui-focused": {
      color: MAIN_COLOR,
      fontFamily: FONT_FAMILY
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: MAIN_COLOR,
    },
    "& .MuiFilledInput-underline:after": {
      borderBottomColor: MAIN_COLOR,
    },
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": {
        borderColor: MAIN_COLOR,
      },
    },
  },
  right: {
    "& legend": {
      marginRight: 30
    },
  },
  rightStorelink: {
    "& legend": {
      marginRight: 25
    },
  },
  title: {
    color: colors.WHITE,
    marginBottom: '15px',
    paddingTop: '15px',
    paddingLeft: '15px',
    fontSize: '20px',
    fontFamily: FONT_FAMILY,
  },
  buttonStyle: {
    margin: 0,
    width: '100%',
    height: 40,
    borderRadius: "30px",
    backgroundColor: MAIN_COLOR,
    color:colors.WHITE,
    fontFamily: FONT_FAMILY,
    padding: '12px 24px',
    minWidth: '150px',
  },
  textField: {
    "& label.Mui-focused": {
      color: MAIN_COLOR,
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: MAIN_COLOR,
    },
    "& .MuiFilledInput-underline:after": {
      borderBottomColor: MAIN_COLOR,
    },
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": {
        borderColor: MAIN_COLOR,
      },
    },
    "& input": {
      fontFamily: FONT_FAMILY,
    },
  },
  selectField: {
    color: "black",
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: MAIN_COLOR,
    },
  },
}));

const SmsSettings = (props) => {
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();
  const {
    editSmsConfig,
    editSettings
  } = api;
  const settings = useSelector(state => state.settingsdata.settings);
  const smsDetails = useSelector(state => state.smsconfigdata.smsDetails)
  const classes = useStyles();
  const [data, setData] = useState();
  const [customMobileOTP, setCustomMobileOTP] = useState(false);
  const [twilioEnabled, setTwilioEnabled] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (smsDetails) {
        setData(smsDetails);
        setTwilioEnabled(smsDetails.enabled || false);
    } else {
        setData({
          accountSid: "",
          authToken: "",
          fromNumber: "",
          enabled: false
        })
        setTwilioEnabled(false);
    }                                                                             
  }, [smsDetails]);

  useEffect(() => {
    if (settings && settings.customMobileOTP  ) {
      setCustomMobileOTP(true);
    } else {
      setCustomMobileOTP(false);
    }                                                                             
  }, [settings]);

  const handleSubmit = (e) => {
    if (settings.AllowCriticalEditsAdmin) {
      const twilioConfig = {
        ...data,
        enabled: twilioEnabled
      };
      dispatch(editSmsConfig(twilioConfig));
      dispatch(editSettings({...settings, customMobileOTP: customMobileOTP}));
    } else {
      alert(t('demo_mode'));
    }
  }

  return (
    <form className={classes.form}>
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <Grid item xs={12}>
            <Typography component="h1" variant="h5" className={classes.title} style={{ textAlign: isRTL === 'rtl' ? 'right' : 'left' }}>
              Configuración de Twilio SMS
            </Typography>
          </Grid>
         <div className={classes.container1}>
            <Grid container spacing={2} style={{direction:isRTL ==='rtl'?'rtl':'ltr'}} >
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <FormControlLabel
                        style={{ flexDirection: isRTL === 'rtl' ? 'row' : 'row-reverse', paddingTop:10, paddingBottom:15, marginLeft:5 }}
                        label={ <Typography className={classes.typography}>Habilitar Twilio SMS</Typography>}
                        control={
                            <Switch
                                checked={twilioEnabled}
                                onChange={(e)=> setTwilioEnabled(e.target.checked)}
                                name="twilioEnabled"
                                color="primary"
                            />
                        }
                    />
                    <TextField
                        InputLabelProps={{ style: { fontFamily: FONT_FAMILY } }}
                        className={isRTL ==="rtl"? classes.rootRtl:classes.textField}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="accountSid"
                        label="Account SID"
                        name="accountSid"
                        autoComplete="accountSid"
                        disabled={!twilioEnabled}
                        onChange={(e)=> setData({...data, accountSid: e.target.value})}
                        value={settings.AllowCriticalEditsAdmin ? (data && data.accountSid? data.accountSid: "") :"Hidden for Demo"}
                    />
                    <TextField
                        InputLabelProps={{ style: { fontFamily: FONT_FAMILY } }}
                        className={isRTL ==="rtl"? classes.rootRtl:classes.textField}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        type="password"
                        id="authToken"
                        label="Auth Token"
                        name="authToken"
                        autoComplete="authToken"
                        disabled={!twilioEnabled}
                        onChange={(e)=> setData({...data, authToken: e.target.value})}
                        value={settings.AllowCriticalEditsAdmin ?  (data && data.authToken? data.authToken: "") :"Hidden for Demo"}
                    />
                    <TextField
                        InputLabelProps={{ style: { fontFamily: FONT_FAMILY } }}
                        className={isRTL ==="rtl"? classes.rootRtl:classes.textField}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="fromNumber"
                        label="Número de Twilio (ej: +1234567890)"
                        name="fromNumber"
                        autoComplete="fromNumber"
                        disabled={!twilioEnabled}
                        onChange={(e)=> setData({...data, fromNumber: e.target.value})}
                        value={settings.AllowCriticalEditsAdmin ?  (data && data.fromNumber? data.fromNumber: "") :"Hidden for Demo"}
                    />
                    <FormControlLabel
                        style={{ flexDirection: isRTL === 'rtl' ? 'row' : 'row-reverse', paddingTop:10, paddingBottom:15, marginLeft:5 }}
                        label={ <Typography className={classes.typography}>{t('customMobileOTP')}</Typography>}
                        control={
                            <Switch
                                checked={customMobileOTP}
                                onChange={(e)=> setCustomMobileOTP(e.target.checked)}
                                name="customMobileOTP"
                                color="primary"
                            />
                        }
                    />
                    <Button
                        size="lg"
                        onClick={handleSubmit}
                        variant="contained" 
                        color="secondaryButton"
                        className={classes.buttonStyle}
                        disabled={!twilioEnabled}
                    >
                      <Typography style={{fontFamily:FONT_FAMILY, wordBreak:"break-word",whiteSpace: 'normal',fontSize: '14px', textOverflow:"ellipsis"}}>Guardar Configuración</Typography>
                    </Button>
                </Grid>
            </Grid>
        </div>
      </Grid>
    </form>
  );

}

export default SmsSettings;