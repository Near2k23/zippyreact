import React, {useState, useEffect} from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CarIcon from '@mui/icons-material/DirectionsCar';
import ExitIcon from '@mui/icons-material/ExitToApp';
import OfferIcon from '@mui/icons-material/LocalOffer';
import NotifyIcon from '@mui/icons-material/NotificationsActive';
import { api } from 'common';
import { useTranslation } from "react-i18next";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import ViewListIcon from '@mui/icons-material/ViewList';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MoneyIcon from '@mui/icons-material/Money';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import {calcEst, showEst, optionsRequired} from '../common/sharedFunctions';
import SosIcon from '@mui/icons-material/Sos';
import PublicIcon from '@mui/icons-material/Public';
import { FONT_FAMILY } from "../common/sharedFunctions"
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import GeneralNotifications from './GeneralNotifications';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbPage
} from './ui/breadcrumb';



const drawerWidth = 260;

const LIGHT_BG = '#F7F7F7';
const TEXT_PRIMARY = '#111111';
const TEXT_SECONDARY = '#555555';
const BORDER_COLOR = '#E5E7EB';
const SCROLL_THUMB = '#D1D5DB';
const SCROLL_THUMB_HOVER = '#9CA3AF';
const SCROLL_TRACK = LIGHT_BG;
const ITEM_HOVER_BG = '#EFEFEF';
const ITEM_ACTIVE_BG = '#EAEAEA';

export default function ResponsiveDrawer(props) {
  const { t, i18n  } = useTranslation();
  const isRTL = i18n.dir();
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const {
    signOff
  } = api;
  const auth = useSelector(state => state.auth);
  const settings = useSelector(state => state.settingsdata.settings);
  const dispatch = useDispatch();

  const LogOut = () => {
    dispatch(signOff());
  };

  const [role, setRole] = useState(null);
  const location = useLocation();
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const isProfileMenuOpen = Boolean(profileMenuAnchor);

  const handleOpenProfileMenu = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setProfileMenuAnchor(null);
  };

  const handleNotificationClick = (notification) => {
    switch (notification.type || 'withdraws') {
      case 'withdraws':
        navigate('/withdraws');
        break;
      case 'complaints':
        navigate('/complain');
        break;
      default:
        navigate('/dashboard');
    }
  };

  useEffect(() => {
    if(auth.profile && auth.profile.usertype){
      setRole(auth.profile.usertype);
    }
  }, [auth.profile]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const handleDrawer = () => {
    setMobileOpen(false);
  };

  const routeKeyMap = {
    '': 'home',
    'dashboard': 'dashboard_text',
    'bookings': 'booking_history',
    'addbookings': 'addbookinglable',
    'users': 'user',
    'cartypes': 'car_type',
    'cars': 'cars',
    'withdraws': 'withdraws_web',
    'addtowallet': 'add_to_wallet',
    'allreports': 'report',
    'promos': 'promo',
    'taxes': 'taxes',
    'dynamic-hours': 'dynamic_hours',
    'notifications': 'push_notifications',
    'sos': 'sos',
    'complain': 'complain',
    'userwallet': 'my_wallet_tile',
    'settings': 'settings_title',
    'paymentsettings': 'payment_settings',
    'profile': 'profile'
  };

  const currentPath = (location && location.pathname) || '/';
  const pathSegments = currentPath.split('/').filter(Boolean);
  const firstSegment = pathSegments[0] || '';
  const currentKey = routeKeyMap[firstSegment] || (firstSegment ? firstSegment.replace(/-/g, '_') : 'home');
  const currentLabel = t(currentKey);

  const drawer = (
    <div  style={{backgroundColor:LIGHT_BG, height:'100%'}}>
      <div style={{ display: 'flex', backgroundColor:LIGHT_BG, justifyContent:'center' }}>
        <Link to="/" onClick={handleDrawer} style={{ display:'inline-flex' }}>
          <img
            style={{ marginTop: 16, marginBottom: 12, height: 30, width: 'auto', objectFit:'contain' }}
            src={require("../assets/img/logo.png")}
            alt="Logo"
          />
        </Link>
      </div>
      <div style={{ backgroundColor:LIGHT_BG}}>
        {role ?
        <List disablePadding={true} dense={false} style={{ padding: 8 }}>
          {[
            {name : t('home'), url:'/', icon: <HomeIcon/>, access: ['admin','fleetadmin','driver','customer']},
            {name : t('dashboard_text'), url:'/dashboard', icon: <DashboardIcon/>, access: ['admin','fleetadmin']},
            {name : t('booking_history'), url:'/bookings', icon: <ViewListIcon/>, access: ['admin','fleetadmin','driver','customer']},
            {name : t('addbookinglable'), url:'/addbookings', icon: <ContactPhoneIcon/>, access: calcEst && !showEst && !optionsRequired ? ['customer'] : ['admin','fleetadmin','customer']},

            {name : t('user'), url:'/users/0', icon: <EmojiPeopleIcon />, access: ['admin','fleetadmin']},

            {name : t('car_type'), url:'/cartypes', icon: <CarIcon/>, access: ['admin']},
            {name : t('zones'), url:'/zones', icon: <PublicIcon/>, access: ['admin']},
            {name : t('cars'), url:'/cars', icon: <CarIcon/>, access: ['admin','fleetadmin','driver']},
            
            {name : t('withdraws_web'), url:'/withdraws', icon: <MoneyIcon />, access: ['admin']},
            {name : t('add_to_wallet'), url:'/addtowallet', icon: <AccountBalanceWalletIcon />, access: ['admin']},
          
            {name : t('report'), url:'/allreports', icon: <AssessmentIcon />, access: ['admin','fleetadmin']},
            {name : t('promo'), url:'/promos', icon: <OfferIcon />, access: ['admin']},
            {name : t('taxes'), url:'/taxes', icon: <ReceiptLongIcon />, access: ['admin']},
            {name : t('dynamic_hours'), url:'/dynamic-hours', icon: <OfferIcon />, access: ['admin']},
            {name : t('push_notifications'), url:'/notifications', icon: <NotifyIcon />, access: ['admin']},
            {name : t('sos'), url:'/sos', icon: <SosIcon />, access: ['admin']},
            {name : t('complain'), url:'/complain', icon: <AnnouncementOutlinedIcon/>, access: ['admin']},
            {name : t('my_wallet_tile'), url:'/userwallet', icon: <AccountBalanceWalletIcon />, access: ['driver','customer','fleetadmin']},
            {name : t('settings_title'), url:'/settings', icon: <PhoneIphoneIcon />, access: ['admin']},
            {name : t('payment_settings'), url:'/paymentsettings', icon: <PhoneIphoneIcon />, access: ['admin']},
            {name : t('profile'), url:'/profile', icon: <AccountCircleIcon />, access: ['admin','fleetadmin','driver','customer']},
            {name : t('logout'), url:'logout', icon: <ExitIcon />, access: ['admin','fleetadmin','driver','customer']}
          ].map((item, index) => (
            item.access.includes(role)?
              (() => {
                const isActive = item.url !== 'logout' && location && location.pathname === item.url;
                return (
                  <div style={{ display: 'flex' }} key={"key" + index}>
                    <ListItem
                      disableGutters={true}
                      disablePadding={true}
                      style={{ paddingLeft: 4 }}
                      alignItems='center'
                      dense={false}
                      onClick={handleDrawer}
                    >
                      <ListItemButton
                        disableGutters={true}
                        dense={false}
                        component={item.url==='logout'? 'button' : Link}
                        to={item.url==='logout'? undefined : item.url}
                        onClick={item.url==='logout'? LogOut : undefined}
                        sx={{
                          mx: 0.5,
                          my: 0.5,
                          px: 1.25,
                          py: 1,
                          borderRadius: 1,
                          backgroundColor: isActive ? ITEM_ACTIVE_BG : 'transparent',
                          '&:hover': { backgroundColor: ITEM_HOVER_BG },
                        }}
                      >
                        <ListItemIcon style={{ color: isActive ? TEXT_PRIMARY : TEXT_SECONDARY, minWidth: 36 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          inset={false}
                          disableTypography={false}
                          primary={
                            <Typography style={{ color: isActive ? TEXT_PRIMARY : TEXT_SECONDARY, textAlign: isRTL === 'rtl' ? 'right' : 'left', fontFamily: FONT_FAMILY, fontSize: 14.5 }}>
                              {item.name}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  </div>
                );
              })()
            :null
          ))}
        </List>
        : null }

      </div>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex',direction:isRTL === 'rtl'? 'rtl':'ltr'}}>
      <CssBaseline />
      <style>
        {`
          ::-webkit-scrollbar {
            width: 8px;
          }

          ::-webkit-scrollbar-thumb {
            background-color: ${SCROLL_THUMB};
            border-radius: 6px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background-color: ${SCROLL_THUMB_HOVER};
          }

          ::-webkit-scrollbar-track {
            background-color:${SCROLL_TRACK};
          }
        `}
      </style>
      <AppBar
        position="fixed"
        style={isRTL=== 'rtl'? {marginRight:drawerWidth, backgroundColor:LIGHT_BG, boxShadow:'none', borderBottom: `1px solid ${BORDER_COLOR}`}:{marginLeft:drawerWidth, backgroundColor:LIGHT_BG, boxShadow:'none', borderBottom: `1px solid ${BORDER_COLOR}`}}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ minHeight: 56, display:'flex', alignItems:'center', gap: 1 }}>
          <IconButton
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2,  display: { sm: 'none' }, }}
          >
            <MenuIcon style={{color:TEXT_PRIMARY}} />
          </IconButton>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Breadcrumb aria-label="breadcrumb">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">{t('home')}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {currentPath !== '/' ? currentLabel : t('home')}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {auth && auth.profile ? (
              <>
                {role === 'admin' && (
                  <GeneralNotifications 
                    onNotificationClick={handleNotificationClick}
                  />
                )}
                <IconButton onClick={handleOpenProfileMenu} size="small" sx={{ p: 0.5 }} aria-label="user menu">
                  <Avatar
                    src={auth.profile.profile_image ? auth.profile.profile_image : require('../assets/img/profilePic.png')}
                    alt={auth.profile.firstName || 'user'}
                    sx={{ width: 34, height: 34, border: `1px solid ${BORDER_COLOR}` }}
                  />
                </IconButton>
                <Menu
                  anchorEl={profileMenuAnchor}
                  open={isProfileMenuOpen}
                  onClose={handleCloseProfileMenu}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      border: `1px solid ${BORDER_COLOR}`,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      borderRadius: 2,
                      backgroundColor: LIGHT_BG,
                    }
                  }}
                >
                  <MenuItem component={Link} to="/profile" onClick={handleCloseProfileMenu} sx={{ fontFamily: FONT_FAMILY, color: TEXT_PRIMARY }}>
                    Editar perfil
                  </MenuItem>
                  <MenuItem onClick={() => { handleCloseProfileMenu(); LogOut(); }} sx={{ fontFamily: FONT_FAMILY, color: TEXT_PRIMARY }}>
                    Cerrar sesión
                  </MenuItem>
                </Menu>
              </>
            ) : null}
          </div>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          anchor={isRTL === 'rtl' ? 'right' : 'left'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: LIGHT_BG, borderRight: `1px solid ${BORDER_COLOR}`, padding: '12px 8px' },direction:isRTL === 'rtl'? 'rtl':'ltr'
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          anchor={isRTL === 'rtl' ? 'right' : 'left'}
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: LIGHT_BG, borderRight: `1px solid ${BORDER_COLOR}`, padding: '12px 8px' },direction:isRTL === 'rtl'? 'rtl':'ltr'
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 1, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar/>
        {props.children}
      </Box>
    </Box>
  );
}
