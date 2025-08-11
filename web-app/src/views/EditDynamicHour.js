import React, { useState, useEffect } from "react";
import AlertDialog from "../components/AlertDialog";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useSelector, useDispatch } from "react-redux";
import { Typography, TextField, Button, Grid, Card } from "@mui/material";
import { api } from "common";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import CircularLoading from "components/CircularLoading";
import { colors } from "components/Theme/WebTheme";
import { MAIN_COLOR, SECONDORY_COLOR, FONT_FAMILY } from "../common/sharedFunctions";
import GoBackButton from "components/GoBackButton";
import dayjs from "dayjs";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const EditDynamicHour = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const isRTL = i18n.dir();
  const items = useSelector(state => state.dynamichourdata.items);
  const settings = useSelector((state) => state.settingsdata.settings);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loding, setLoding] = useState(false);
  const [commonAlert, setCommonAlert] = useState({ open: false, msg: "" });
  const { editDynamicHour } = api;
  const [data, setData] = useState();
  const [oldData, setOldData] = useState(null);
  const { state } = useLocation();

  const handleInputChange = (e) => {
    setData({ ...data, [e.target.id]: e.target.value });
  };

  const handleChangeType = (e) => {
    setData({ ...data, multiplier_type: e.target.value });
  };

  const handleCommonAlertClose = (e) => {
    e.preventDefault();
    setCommonAlert({ open: false, msg: "" });
  };

  const handelUpdate = () => {
    settings.AllowCriticalEditsAdmin ?
      new Promise((resolve, reject) => {
        setLoding(true);
        setTimeout(() => {
          if (!data.name) {
            setLoding(false);
            setCommonAlert({ open: true, msg: t('name') + ' ' + t('required') });
            reject();
          } else if (!data.multiplier_type) {
            setLoding(false);
            setCommonAlert({ open: true, msg: t('type') + ' ' + t('required') });
            reject();
          } else if (!data.multiplier_value && data.multiplier_value !== 0) {
            setLoding(false);
            setCommonAlert({ open: true, msg: t('value') + ' ' + t('required') });
            reject();
          } else if (!data.start_time || !data.end_time) {
            setLoding(false);
            setCommonAlert({ open: true, msg: t('start_time') + '/' + t('end_time') + ' ' + t('required') });
            reject();
          } else if (dayjs(data.start_time).valueOf() > dayjs(data.end_time).valueOf()) {
            setLoding(false);
            setCommonAlert({ open: true, msg: t('start_time') + ' > ' + t('end_time') });
            reject();
          } else {
            if (data !== oldData) {
              const payload = {
                ...data,
                multiplier_value: Number(data.multiplier_value),
                start_time: dayjs(data.start_time).valueOf(),
                end_time: dayjs(data.end_time).valueOf(),
                active: data.active ? true : false,
                createdAt: data.createdAt || new Date().getTime(),
              };
              if (id) {
                dispatch(editDynamicHour(payload, "Update"));
                navigate("/dynamic-hours", { state: { pageNo: state?.pageNo } });
                setLoding(false);
                resolve();
              } else {
                dispatch(editDynamicHour(payload, "Add"));
                navigate("/dynamic-hours");
                setLoding(false);
                resolve();
              }
            } else {
              setLoding(false);
              setCommonAlert({ open: true, msg: t("make_changes_to_update") });
            }
          }
        }, 600);
      })
      :
      new Promise((resolve) => {
        setTimeout(() => {
          resolve();
          setCommonAlert({ open: true, msg: t("demo_mode") });
        }, 600);
      });
  };

  useEffect(() => {
    if (id) {
      if (items) {
        const found = items.find(x => x.id === id.toString());
        if (!found) navigate("/404");
        setData(found);
        setOldData(found);
      }
    } else if (!id) {
      setData({
        name: "",
        multiplier_type: "percentage",
        multiplier_value: 0,
        start_time: dayjs().valueOf(),
        end_time: dayjs().add(2, 'hour').valueOf(),
        active: true,
        createdAt: new Date().getTime()
      });
    } else {
      navigate("/404");
    }
  }, [items, id, navigate]);

  return loding ? (
    <CircularLoading />
  ) : (
    <div>
      <Card
        style={{
          borderRadius: "19px",
          backgroundColor: colors.WHITE,
          minHeight: 100,
          maxWidth: "75vw",
          marginTop: 20,
          marginBottom: 20,
          padding: 25,
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`,
        }}
      >
        <Typography variant="h5" style={{ marginTop: -15, textAlign: isRTL === "rtl" ? "right" : "left", fontFamily: FONT_FAMILY }}>
          {id ? t("update") : t("add")} {t('dynamic_hours')}
        </Typography>
        <GoBackButton isRTL={isRTL} onClick={() => { navigate("/dynamic-hours", { state: { pageNo: state?.pageNo } }) }} />
        <Grid container spacing={2} sx={{ gridTemplateColumns: "50%", direction: isRTL === 'rtl' ? 'rtl' : 'ltr' }}>

          <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
            <TextField label={t("name")} id="name" value={data?.name || ""} fullWidth onChange={handleInputChange} />
          </Grid>

          <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
            <FormControl fullWidth>
              <InputLabel id="multiplier_type">{t('type')}</InputLabel>
              <Select labelId="multiplier_type" id="multiplier_type" value={data?.multiplier_type || ''} label={t("type")} onChange={handleChangeType}>
                <MenuItem value={"percentage"}>{t('percentage')}</MenuItem>
                <MenuItem value={"flat"}>{t('flat')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
            <TextField label={t("value")} id="multiplier_value" value={data?.multiplier_value ?? 0} type="number" fullWidth onChange={handleInputChange} />
          </Grid>

          <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
            <FormControl fullWidth>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker label={t("start_time")} value={dayjs(data?.start_time)} onChange={(newValue) => setData({ ...data, start_time: newValue?.valueOf() })} />
              </LocalizationProvider>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
            <FormControl fullWidth>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker label={t("end_time")} value={dayjs(data?.end_time)} onChange={(newValue) => setData({ ...data, end_time: newValue?.valueOf() })} />
              </LocalizationProvider>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
            <TextField label={t("active")} id="active" value={data?.active ? t('yes') : t('no')} fullWidth disabled />
          </Grid>

          <Grid item xs={12} sm={12} md={12} lg={6} xl={6} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Button style={{ borderRadius: "19px", backgroundColor: MAIN_COLOR, minHeight: 50, minWidth: "100%", textAlign: "center", boxShadow: `0px 2px 5px ${SECONDORY_COLOR}` }} onClick={handelUpdate} variant="contained">
              <Typography style={{ color: colors.WHITE, textAlign: "center", fontSize: 16, fontFamily: FONT_FAMILY }}>
                {id ? t("update") : t("add")}
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Card>
      <AlertDialog open={commonAlert.open} onClose={handleCommonAlertClose}>
        {commonAlert.msg}
      </AlertDialog>
    </div>
  );
};

export default EditDynamicHour;
