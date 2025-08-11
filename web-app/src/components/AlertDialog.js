import React from 'react';
import { useTranslation } from "react-i18next";
import { FONT_FAMILY } from 'common/sharedFunctions';

export default function AlertDialog(props) {
  const { t } = useTranslation();
  const { open, onClose, children, type = 'info' } = props;
  
  const detectType = () => {
    if (type !== 'info') return type;
    
    const message = children?.toString().toLowerCase() || '';
    if (message.includes('éxito') || message.includes('success') || message.includes('creada exitosamente')) {
      return 'success';
    }
    if (message.includes('error') || message.includes('incorrecto') || message.includes('inválido')) {
      return 'error';
    }
    return 'info';
  };
  
  const currentType = detectType();
  
  const getIcon = () => {
    switch (currentType) {
      case 'success':
        return (
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4" style={{
              background: 'var(--gradient-primary)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full opacity-60" style={{background: 'var(--primary-light)'}}></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full opacity-60" style={{background: 'var(--primary-light)'}}></div>
            <div className="absolute top-1 -left-2 w-1.5 h-1.5 rounded-full opacity-60" style={{background: 'var(--primary-light)'}}></div>
            <div className="absolute -top-1 right-1 w-1 h-1 rounded-full opacity-60" style={{background: 'var(--primary-light)'}}></div>
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full opacity-60" style={{background: 'var(--primary-light)'}}></div>
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4" style={{
            background: 'var(--error-color)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4" style={{
            background: 'var(--primary-color)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (currentType) {
      case 'success':
        return t('success') || '¡Éxito!';
      case 'error':
        return t('error') || 'Error';
      default:
        return t('information') || 'Información';
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity"
          style={{backgroundColor: 'var(--overlay-bg)'}}
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform shadow-xl rounded-2xl sm:my-16 sm:max-w-lg sm:w-full" style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-light)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}>
          <div className="text-center">
            {getIcon()}

            <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{
              color: 'var(--text-primary)',
              fontFamily: FONT_FAMILY
            }}>
              {getTitle()}
            </h3>

            <div className="text-sm sm:text-base mb-8 leading-relaxed" style={{
              color: 'var(--text-secondary)',
              fontFamily: FONT_FAMILY
            }}>
              {children}
            </div>

            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="px-6 py-3 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
                style={{
                  background: 'var(--button-primary-bg)',
                  fontFamily: FONT_FAMILY,
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--button-primary-hover)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--button-primary-bg)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                }}
              >
                {t('close') || 'Cerrar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
