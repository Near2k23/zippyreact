import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import { FONT_FAMILY } from "../../common/sharedFunctions.js";

const Footer = () => {
  const navigate = useNavigate();
  const settings = useSelector(state => state.settingsdata.settings);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleSocialClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <footer className="bg-gray-900 text-white" style={{direction: isRTL === 'rtl' ? 'rtl' : 'ltr'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4" style={{fontFamily: FONT_FAMILY}}>
              {settings?.CompanyName || 'Waygo'}
            </h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation('/')}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  style={{fontFamily: FONT_FAMILY}}
                >
                  {t('home')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/bookings')}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  style={{fontFamily: FONT_FAMILY}}
                >
                  {t('myaccount')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/about-us')}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  style={{fontFamily: FONT_FAMILY}}
                >
                  {t('about_us')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/contact-us')}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  style={{fontFamily: FONT_FAMILY}}
                >
                  {t('contact_us')}
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4" style={{fontFamily: FONT_FAMILY}}>
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation('/privacy-policy')}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  style={{fontFamily: FONT_FAMILY}}
                >
                  {t('privacy_policy')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/term-condition')}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  style={{fontFamily: FONT_FAMILY}}
                >
                  {t('term_condition')}
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4" style={{fontFamily: FONT_FAMILY}}>
              Social
            </h3>
            <div className="flex space-x-4">
              {settings?.FacebookHandle && (
                <button
                  onClick={() => handleSocialClick(settings.FacebookHandle)}
                  className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
              )}
              
              {settings?.InstagramHandle && (
                <button
                  onClick={() => handleSocialClick(settings.InstagramHandle)}
                  className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-colors duration-200"
                >
                  <Instagram sx={{ fontSize: 20, color: 'white' }} />
                </button>
              )}
              
              {settings?.TwitterHandle && (
                <button
                  onClick={() => handleSocialClick(settings.TwitterHandle)}
                  className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4" style={{fontFamily: FONT_FAMILY}}>
              Download App
            </h3>
            <div className="space-y-2">
              {settings?.PlayStoreLink && (
                <a
                  href={settings.PlayStoreLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-300 hover:text-white transition-colors duration-200"
                  style={{fontFamily: FONT_FAMILY}}
                >
                  {t('android')}
                </a>
              )}
              {settings?.AppleStoreLink && (
                <a
                  href={settings.AppleStoreLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-300 hover:text-white transition-colors duration-200"
                  style={{fontFamily: FONT_FAMILY}}
                >
                  iOS
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <img 
                src={require("../../assets/img/logo-white.png")}
                alt={settings?.CompanyName || 'Waygo'}
                className="h-8"
              />
              <span className="text-gray-400" style={{fontFamily: FONT_FAMILY}}>
                © {1900 + new Date().getYear()} {settings?.CompanyName || 'Waygo'}. All rights reserved.
              </span>
            </div>
            
            <div className="flex space-x-6">
              <button
                onClick={() => handleNavigation('/term-condition')}
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                style={{fontFamily: FONT_FAMILY}}
              >
                {t('term_condition')}
              </button>
              <button
                onClick={() => handleNavigation('/privacy-policy')}
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                style={{fontFamily: FONT_FAMILY}}
              >
                {t('privacy_policy')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 