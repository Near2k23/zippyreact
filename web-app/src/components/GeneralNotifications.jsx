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
  notificationType = 'withdraws'
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const withdrawdata = useSelector(state => state.withdrawdata);
  const complaindata = useSelector(state => state.complaindata);
  const settings = useSelector(state => state.settingsdata.settings);

  useEffect(() => {
    let allNotifications = [];

    // Agregar retiros pendientes
    if (withdrawdata.withdraws) {
      const pendingWithdraws = withdrawdata.withdraws.filter(w => {
        const status = w.status || (w.processed ? 'approved' : 'pending');
        return status === 'pending';
      }).map(w => ({ ...w, type: 'withdraws' }));
      allNotifications = [...allNotifications, ...pendingWithdraws];
      console.log('Retiros pendientes:', pendingWithdraws.length);
    }

    // Agregar quejas pendientes
    if (complaindata.list) {
      console.log('Quejas totales:', complaindata.list.length);
      const pendingComplaints = complaindata.list.filter(c => {
        const status = c.status || (c.check ? 'resolved' : 'pending');
        console.log('Queja:', c.subject, 'Status:', status);
        return status === 'pending';
      }).map(c => ({ ...c, type: 'complaints' }));
      allNotifications = [...allNotifications, ...pendingComplaints];
      console.log('Quejas pendientes:', pendingComplaints.length);
    } else {
      console.log('No hay quejas cargadas en complaindata.list');
    }

    // Ordenar por fecha (más recientes primero)
    allNotifications.sort((a, b) => {
      const dateA = a.date || a.createdAt || a.complainDate || 0;
      const dateB = b.date || b.createdAt || b.complainDate || 0;
      return dateB - dateA;
    });

    console.log('Notificaciones totales:', allNotifications.length);
    setNotifications(allNotifications);
  }, [withdrawdata.withdraws, complaindata.list, notificationType]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    handleClose();
    if (onNotificationClick) {
      // Agregar el tipo de notificación al objeto
      const notificationWithType = {
        ...notification,
        type: notificationType
      };
      onNotificationClick(notificationWithType);
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

  // Función removida - ahora usamos directamente t('notifications')

  const getNotificationIcon = () => {
    switch (notificationType) {
      case 'withdraws':
        return '💵';
      case 'complaints':
        return '📋';
      default:
        return '🔔';
    }
  };

  const getItemIcon = (notification) => {
    switch (notification.type || notificationType) {
      case 'withdraws':
        return '💵';
      case 'complaints':
        return '📝';
      default:
        return '📌';
    }
  };

  const getItemTitle = (notification) => {
    switch (notification.type || notificationType) {
      case 'withdraws':
        return t('withdrawal_request') || 'Solicitud de Retiro';
      case 'complaints':
        return t('complaint_report') || 'Reporte de Queja';
      default:
        return t('notification_item') || 'Notificación';
    }
  };

  const getNotificationMainContent = (notification) => {
    switch (notification.type || notificationType) {
      case 'withdraws':
        return (
          <Typography
            variant="inherit"
            sx={{
              color: 'error.main',
              fontWeight: 700
            }}
          >
            {formatAmount(notification.amount)}
          </Typography>
        );
      case 'complaints':
        return (
          <Typography variant="inherit" sx={{ color: 'text.primary' }}>
            {notification.subject || t('complaint') || 'Complaint'}
          </Typography>
        );
      default:
        return (
          <Typography variant="inherit" color="text.primary">
            {getItemTitle(notification)}
          </Typography>
        );
    }
  };

  const getNotificationSecondaryText = (notification) => {
    switch (notification.type || notificationType) {
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
          color: 'text.primary',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <Badge 
          badgeContent={notifications.length} 
          color="error"
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#f44336',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.75rem'
            }
          }}
        >
          <NotificationsIcon sx={{ color: 'text.primary' }} />
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
            width: 400,
            maxHeight: 500,
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
            {t('notifications') || 'Notifications'}
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
              <List sx={{ 
                p: 0, 
                maxHeight: 400, 
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: '3px',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.5)',
                  },
                },
              }}>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      button
                      onClick={() => handleNotificationClick(notification)}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        p: 2,
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      {/* Columna izquierda - Ícono circular */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: '#E3F2FD',
                        mr: 2,
                        flexShrink: 0
                      }}>
                        <span style={{ fontSize: '20px' }}>{getItemIcon(notification)}</span>
                      </Box>

                        {/* Columna derecha - Información */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          {/* Título - arriba como estaba */}
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            color: 'text.primary',
                            mb: 0.5
                          }}>
                            {getItemTitle(notification)}
                          </Typography>
                          
                          {/* Asunto/Monto principal - en el medio con mayor tamaño */}
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            color: 'text.primary',
                            mb: 1,
                            fontSize: '1.1rem'
                          }}>
                            {getNotificationMainContent(notification)}
                          </Typography>
                          
                          {/* Nombre del usuario y tiempo - en la parte inferior */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="body2" sx={{
                              fontWeight: 500,
                              color: 'text.secondary'
                            }}>
                              {notification.firstName && notification.lastName 
                                ? `${notification.firstName} ${notification.lastName}`
                                : notification.name || notification.driver_name || t('user') || 'Usuario'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              •
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatTimeAgo(notification.date || notification.createdAt || notification.complainDate)}
                            </Typography>
                          </Box>
                        </Box>
                    </ListItem>
                    {index < notifications.length - 1 && (
                      <Divider sx={{ mx: 2 }} />
                    )}
                  </React.Fragment>
                ))}
              </List>

            </>
          )}
        </Box>
      </Popover>
    </>
  );
}
