import React, { useState, useEffect } from 'react';
import { 
  IconButton, 
  Badge, 
  Popover, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Divider,
  Box,
  Button
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import moment from 'moment/min/moment-with-locales';

export default function GeneralNotifications({ 
  onNotificationClick,
  notificationType = 'withdraws',
  maxItems = 5,
  showViewAll = true
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const withdrawdata = useSelector(state => state.withdrawdata);
  const settings = useSelector(state => state.settingsdata.settings);

  useEffect(() => {
    if (notificationType === 'withdraws' && withdrawdata.withdraws) {
      const pending = withdrawdata.withdraws.filter(w => {
        const status = w.status || (w.processed ? 'approved' : 'pending');
        return status === 'pending';
      });
      setNotifications(pending);
    }
    // Aquí se pueden agregar más tipos de notificaciones en el futuro
    // else if (notificationType === 'complaints' && complaindata.complains) { ... }
    // else if (notificationType === 'bookings' && bookingdata.bookings) { ... }
  }, [withdrawdata.withdraws, notificationType]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    handleClose();
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const handleViewAll = () => {
    handleClose();
    // Navegar según el tipo de notificación
    switch (notificationType) {
      case 'withdraws':
        navigate('/withdraws');
        break;
      case 'complaints':
        navigate('/complain');
        break;
      // Agregar más casos según sea necesario
      default:
        navigate('/dashboard');
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return '0';
    const formatted = parseFloat(amount).toFixed(settings.decimal || 2);
    return settings.swipe_symbol 
      ? `${formatted} ${settings.symbol || '$'}` 
      : `${settings.symbol || '$'} ${formatted}`;
  };

  const formatTimeAgo = (date) => {
    if (!date) return '';
    return moment(date).fromNow();
  };

  const getNotificationTitle = () => {
    switch (notificationType) {
      case 'withdraws':
        return t('pending_withdrawals') || 'Pending Withdrawals';
      case 'complaints':
        return t('pending_complaints') || 'Pending Complaints';
      default:
        return t('notifications') || 'Notifications';
    }
  };

  const getNotificationIcon = () => {
    switch (notificationType) {
      case 'withdraws':
        return '💰';
      case 'complaints':
        return '📋';
      default:
        return '🔔';
    }
  };

  const getNotificationSecondaryText = (notification) => {
    switch (notificationType) {
      case 'withdraws':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'success.main',
                fontWeight: 600
              }}
            >
              {formatAmount(notification.amount)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              •
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatTimeAgo(notification.date || notification.createdAt)}
            </Typography>
          </Box>
        );
      case 'complaints':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {notification.subject || t('complaint') || 'Complaint'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              •
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatTimeAgo(notification.complainDate || notification.createdAt)}
            </Typography>
          </Box>
        );
      default:
        return (
          <Typography variant="body2" color="text.secondary">
            {formatTimeAgo(notification.date || notification.createdAt)}
          </Typography>
        );
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton 
        onClick={handleClick}
        size="small"
        aria-label={`${notifications.length} notifications`}
        sx={{ 
          color: 'inherit',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <Badge 
          badgeContent={notifications.length} 
          color="error"
          max={99}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
            mt: 1,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            borderRadius: 2
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: 'text.primary',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <span style={{ fontSize: '20px' }}>{getNotificationIcon()}</span>
            {getNotificationTitle()}
            <Badge 
              badgeContent={notifications.length} 
              color="error" 
              sx={{ ml: 1 }}
            />
          </Typography>
          
          <Divider sx={{ mb: 1 }} />

          {notifications.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 3,
              color: 'text.secondary'
            }}>
              <Typography variant="body2">
                {t('no_notifications') || 'No notifications'}
              </Typography>
            </Box>
          ) : (
            <>
              <List sx={{ p: 0, maxHeight: 250, overflow: 'auto' }}>
                {notifications.slice(0, maxItems).map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      button
                      onClick={() => handleNotificationClick(notification)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                            {notification.name || notification.driver_name || t('item') || 'Item'}
                          </Typography>
                        }
                        secondary={getNotificationSecondaryText(notification)}
                      />
                    </ListItem>
                    {index < Math.min(notifications.length, maxItems) - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
                  </React.Fragment>
                ))}
              </List>

              {showViewAll && notifications.length > maxItems && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Button
                    fullWidth
                    variant="text"
                    onClick={handleViewAll}
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: 500,
                      color: 'primary.main'
                    }}
                  >
                    {t('view_all') || 'View All'} ({notifications.length})
                  </Button>
                </>
              )}
            </>
          )}
        </Box>
      </Popover>
    </>
  );
}
