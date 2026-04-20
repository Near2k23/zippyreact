import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import LanguageSelector from './languageSelector.jsx';

const Navbar = ({ logoSrc, logoSrcDark, darkText = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useSelector(state => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (auth.profile && auth.profile.uid) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, [auth.profile]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [mobileOpen]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  const navLinks = [
    {
      path: '/',
      label: t('home')
    },
    {
      path: '/about-us',
      label: t('about_us')
    },
    {
      path: '/contact-us',
      label: t('contact_us')
    }
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[1000] w-full transition-all duration-300 ease-in-out ${
        isScrolled 
          ? 'bg-white/85 backdrop-blur-[20px] border-b shadow-[0_10px_35px_rgba(249,115,22,0.10)]' 
          : 'bg-transparent border-b border-transparent'
      }`}>
        <div className="max-w-[1200px] mx-auto flex justify-between items-center px-8 py-5 w-full box-border overflow-visible">
          <div className="flex-shrink-0">
            <img 
              src={isScrolled ? (logoSrcDark || require("../../assets/img/logo.png")) : (logoSrc || require("../../assets/img/logo-white.png"))}
              alt="WayGo"
              className="h-8 cursor-pointer transition-all duration-300"
              onClick={() => navigate('/')}
            />
          </div>

          <nav className="hidden lg:flex items-center gap-[2.2rem] overflow-visible">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`text-[0.95rem] font-medium transition-all duration-300 relative py-2 ${
                  isActive(link.path) 
                    ? (darkText || isScrolled) ? 'text-[#1F2937]' : 'text-white' 
                    : (darkText || isScrolled) ? 'text-[#374151] hover:text-[var(--primary-color)]' : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <div className={`absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-0 h-0.5 rounded-sm bg-[var(--primary-color)] animate-expandBar`}></div>
                )}
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <LanguageSelector />

            <button
              onClick={() => navigate(loggedIn ? '/bookings' : '/login')}
              className={`px-7 py-3 rounded-[25px] font-semibold text-[0.9rem] cursor-pointer transition-all duration-300 bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-[0_3px_12px_var(--shadow-medium)] hover:bg-[var(--button-primary-hover)] hover:translate-y-[-1px] hover:shadow-[0_6px_20px_var(--shadow-dark)]`}
            >
              {loggedIn ? t('myaccount') : t('login_signup')}
            </button>
          </div>

          <button
            onClick={handleDrawerToggle}
            className={`lg:hidden flex items-center justify-center p-3 rounded-[14px] z-[1001] transition-all duration-300 ${
              isScrolled 
                ? 'bg-[var(--card-bg)] shadow-md border border-[var(--card-border)] hover:bg-[var(--bg-secondary)] hover:translate-y-[-2px] hover:shadow-lg'
                : 'bg-white/20 backdrop-blur-sm border border-white/30 shadow-[0_3px_12px_rgba(255,255,255,0.1)] hover:bg-white/30 hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(255,255,255,0.2)]'
            }`}
          >
            <div className={`w-6 h-5 relative transition-all duration-300 ${mobileOpen ? 'open' : ''}`}>
              <span className={`absolute top-0.5 left-0 w-6 h-0.5 rounded transition-all duration-300 ${
                mobileOpen ? 'rotate-45 translate-y-[9px]' : ''
              } bg-gray-800`}></span>
              <span className={`absolute top-1/2 left-0 w-4 h-0.5 rounded transition-all duration-300 ${
                mobileOpen ? 'opacity-0 translate-x-2' : ''
              } bg-gray-800`} style={{ right: '0', transform: 'translateY(-50%)' }}></span>
              <span className={`absolute bottom-0.5 left-0 w-6 h-0.5 rounded transition-all duration-300 ${
                mobileOpen ? '-rotate-45 -translate-y-[9px]' : ''
              } bg-gray-800`}></span>
            </div>
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-[4px] z-[1002] lg:hidden"
          onClick={handleDrawerToggle}
        ></div>
      )}

      <nav className={`fixed top-0 right-0 w-[300px] max-w-[90vw] h-screen h-[100dvh] bg-white border-l border-gray-200 z-[1003] transition-all duration-400 ease-out lg:hidden flex flex-col ${
        mobileOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="flex flex-col h-full w-full">
          <div className="flex-shrink-0 p-5 flex items-center justify-between border-b border-gray-200">
            <img 
              src={logoSrcDark || require("../../assets/img/logo.png")}
              alt="WayGo"
              className="h-6"
            />
            <LanguageSelector />
          </div>

          <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(100vh - 200px)', minHeight: '0' }}>
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMobileOpen(false);
                }}
                className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-gray-50 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">{link.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-white mobile-nav-footer" style={{ position: 'sticky', bottom: '0', zIndex: '10' }}>
            <button
              onClick={() => {
                navigate(loggedIn ? '/bookings' : '/login');
                setMobileOpen(false);
              }}
              className={`w-full px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_6px_20px_var(--shadow-dark)] min-h-[48px] box-border bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-[0_3px_12px_var(--shadow-medium)] hover:bg-[var(--button-primary-hover)]`}
            >
              {loggedIn ? t('myaccount') : t('login_signup')}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
