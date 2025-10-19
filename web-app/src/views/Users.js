import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Riders from './Riders';
import Drivers from './Drivers';
import FleetAdmins from './FleetAdmins';
import CreateAdmin from './CreateAdmin';
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { makeStyles} from '@mui/styles';
import {MAIN_COLOR,SECONDORY_COLOR, FONT_FAMILY} from "../common/sharedFunctions"
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Typography } from '@mui/material';

const useStyles = makeStyles({
  tabs: {
    "& .MuiTabs-indicator": {
      backgroundColor: SECONDORY_COLOR,
      height: 3,
    },
    "& .MuiTab-root.Mui-selected": {
      color: MAIN_COLOR
    },
    "@media (max-width: 768px)": {
      "& .MuiTabs-flexContainer": {
        flexDirection: "column",
        alignItems: "stretch"
      },
      "& .MuiTab-root": {
        minHeight: "48px",
        fontSize: "14px",
        padding: "8px 16px"
      }
    }
  },
  typography:{
    fontFamily:FONT_FAMILY
  },
  container: {
    width: '100%',
    "@media (max-width: 768px)": {
      padding: '8px'
    }
  },
  tabPanel: {
    "@media (max-width: 768px)": {
      padding: '16px 8px !important'
    }
  }
})

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const classes = useStyles();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }} className={classes.tabPanel}>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function Users() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [value, setValue] = React.useState(0);
  const { t } = useTranslation();
  const auth = useSelector(state => state.auth);
  const [role, setRole] = React.useState(null);
  const classes = useStyles();

  React.useEffect(() => {
    if(auth.profile && auth.profile.usertype){
      setRole(auth.profile.usertype);
    }
  }, [auth.profile]);

  const handleChange = (event, newValue) => {
    navigate(`/users/${newValue}`)
  };

  React.useEffect(()=>{
    if(id && typeof(Number(id)) === "number" && Number(id)>=0 && Number(id) <=3){
      setValue(Number(id));
    }else{
      navigate("/404");
    }
  },[id,navigate])

  return (
    <Box className={classes.container}>
      {/* Responsive Tabs Container */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        backgroundColor: 'white',
        borderRadius: '8px 8px 0 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '16px'
      }}>
        <Tabs 
          value={value} 
          onChange={handleChange} 
          aria-label="basic tabs example"  
          className={classes.tabs} 
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '@media (max-width: 768px)': {
              '& .MuiTabs-scrollButtons': {
                display: 'flex'
              },
              '& .MuiTabs-scrollButtons.Mui-disabled': {
                opacity: 0.3
              }
            }
          }}
        >
          <Tab 
            label={
              <Typography className={classes.typography} sx={{ 
                fontSize: { xs: '14px', sm: '16px' },
                fontWeight: '500'
              }}>
                {t('riders')}
              </Typography>
            } 
            {...a11yProps(0)} 
          />
          <Tab  
            label={
              <Typography className={classes.typography} sx={{ 
                fontSize: { xs: '14px', sm: '16px' },
                fontWeight: '500'
              }}>
                {t('drivers')}
              </Typography>
            } 
            {...a11yProps(1)} 
          />
          {role === 'fleetadmin' ? null : (
            <Tab  
              label={
                <Typography className={classes.typography} sx={{ 
                  fontSize: { xs: '14px', sm: '16px' },
                  fontWeight: '500'
                }}>
                  {t('fleetadmins')}
                </Typography>
              } 
              {...a11yProps(2)} 
            />
          )}
          {role === 'fleetadmin' ? null : (
            <Tab 
              label={
                <Typography className={classes.typography} sx={{ 
                  fontSize: { xs: '14px', sm: '16px' },
                  fontWeight: '500'
                }}>
                  {t('alladmin')}
                </Typography>
              } 
              {...a11yProps(3)} 
            />
          )}
        </Tabs>
      </Box>

      {/* Responsive Tab Panels */}
      <Box sx={{ 
        backgroundColor: 'white',
        borderRadius: '0 0 8px 8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <TabPanel value={value} index={0}>
          <Riders/>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Drivers/>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <FleetAdmins/>
        </TabPanel>
        <TabPanel value={value} index={3}>
          <CreateAdmin/>
        </TabPanel>
      </Box>
    </Box>
  );
}