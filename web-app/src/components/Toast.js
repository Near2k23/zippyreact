import React, { useState, useEffect, useCallback } from 'react';
import { FONT_FAMILY } from 'common/sharedFunctions';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';

const Toast = ({ 
  open, 
  title,
  message, 
  type = 'info', 
  duration = 4000, 
  onClose, 
  position = 'top-right' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsExiting(false);
      
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [open, duration, handleClose]);

  const getIcon = () => {
    const iconStyle = {
      fontSize: '24px',
      color: 'white'
    };

    switch (type) {
      case 'success':
        return <CheckCircleIcon style={iconStyle} />;
      case 'error':
        return <ErrorIcon style={iconStyle} />;
      case 'warning':
        return <WarningIcon style={iconStyle} />;
      default:
        return <InfoIcon style={iconStyle} />;
    }
  };

  const getToastStyles = () => {
    const baseStyles = {
      position: 'fixed',
      zIndex: 9999,
      maxWidth: '400px',
      minWidth: '350px',
      background: 'var(--bg-primary)',
      border: '1px solid var(--border-light)',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      fontFamily: FONT_FAMILY,
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '16px',
      transition: 'all 0.3s ease-in-out',
      transform: isExiting ? 'translateX(100%)' : 'translateX(0)',
      opacity: isExiting ? 0 : 1,
      top: '80px',
      right: '20px',
    };

    return baseStyles;
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          leftBar: 'var(--success-color)',
          iconBg: 'var(--success-color)',
        };
      case 'error':
        return {
          leftBar: 'var(--error-color)',
          iconBg: 'var(--error-color)',
        };
      case 'warning':
        return {
          leftBar: 'var(--warning-color)',
          iconBg: 'var(--warning-color)',
        };
      default:
        return {
          leftBar: 'var(--primary-color)',
          iconBg: 'var(--primary-color)',
        };
    }
  };

  if (!isVisible) return null;

  const typeStyles = getTypeStyles();

  return (
    <div style={getToastStyles()} className="relative">
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ background: typeStyles.leftBar }}
      ></div>
      
      <div 
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: typeStyles.iconBg }}
      >
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h4>
        )}
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>
      </div>
      
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded hover:bg-gray-100 transition-colors duration-200"
        style={{ color: 'var(--text-muted)' }}
      >
        <CloseIcon style={{ fontSize: '18px' }} />
      </button>
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 4000, position = 'top-right', title = null) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration, position: 'top-right', title, open: true };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  };

  const hideToast = (id) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, open: false } : toast
    ));
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          open={toast.open}
          title={toast.title}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          position={toast.position}
          onClose={() => {
            hideToast(toast.id);
            setTimeout(() => removeToast(toast.id), 300);
          }}
        />
      ))}
    </>
  );

  return {
    showToast,
    hideToast,
    removeToast,
    ToastContainer
  };
};

export default Toast;
