import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Title from '../Title.jsx';
import Description from '../Description.jsx';
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const settings = useSelector(state => state.settingsdata.settings);
  const { t, i18n } = useTranslation();
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleAppDownload = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Función para obtener el icono correcto según el idioma
  const getDownloadIcon = (type) => {
    const currentLanguage = i18n.language;
    const isSpanish = currentLanguage === 'es' || currentLanguage.startsWith('es');
    
    if (type === 'google') {
      return isSpanish 
        ? require("../../../assets/img/download_google_ESP.png")
        : require("../../../assets/img/download_google.png");
    } else if (type === 'apple') {
      return isSpanish 
        ? require("../../../assets/img/download_apple_ESP.png")
        : require("../../../assets/img/download_apple.png");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden pt-16 sm:pt-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 sm:w-60 sm:h-60 bg-blue-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 sm:w-72 sm:h-72 bg-indigo-100 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 sm:w-24 sm:h-24 bg-yellow-100 rounded-full opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          <div className={`text-center lg:text-left transition-all duration-1000 ease-out transform ${
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'
          }`}>
            <Title variant="hero" isVisible={isVisible} className="mb-6">
              {t("hero_title_home")}
            </Title>
            
            <Description variant="hero" className="mb-12 max-w-2xl mx-auto lg:mx-0">
              {t("hero_description_home")}
            </Description>
            
            <div className="flex flex-row gap-3 justify-center lg:justify-start">
              {settings?.PlayStoreLink && (
                <button
                  onClick={() => handleAppDownload(settings.PlayStoreLink)}
                  className="inline-flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1"
                >
                  <img 
                    src={getDownloadIcon('google')} 
                    alt="Download on Google Play" 
                    className="h-14 w-auto object-contain"
                  />
                </button>
              )}
              
              {settings?.AppleStoreLink && (
                <button
                  onClick={() => handleAppDownload(settings.AppleStoreLink)}
                  className="inline-flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1"
                >
                  <img 
                    src={getDownloadIcon('apple')} 
                    alt="Download on App Store" 
                    className="h-14 w-auto object-contain"
                  />
                </button>
              )}
            </div>
          </div>
          
          <div className={`flex items-center justify-center transition-all duration-1000 ease-out delay-300 transform ${
            isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-12 opacity-0 scale-95'
          } mt-4 lg:mt-20`}>
            <div className="relative">
              <div className="relative transform rotate-6 hover:rotate-0 transition-all duration-500 ease-out hover:scale-105">
                <div className="absolute inset-0 rounded-3xl blur-xl scale-110" style={{background: 'var(--mockup-gradient-1)'}}></div>
                <img 
                  src={require("../../../assets/img/app1.png")} 
                  alt="Waygo App Mockup 1" 
                  className="relative w-36 sm:w-40 lg:w-56 h-auto drop-shadow-2xl"
                />
              </div>
              
              <div className="absolute -top-12 -right-12 sm:-top-16 sm:-right-16 lg:-top-20 lg:-right-20 transform -rotate-6 hover:rotate-0 transition-all duration-500 ease-out delay-200 hover:scale-105">
                <div className="absolute inset-0 rounded-3xl blur-xl scale-110" style={{background: 'var(--mockup-gradient-2)'}}></div>
                <img 
                  src={require("../../../assets/img/app2.png")} 
                  alt="Waygo App Mockup 2" 
                  className="relative w-36 sm:w-40 lg:w-56 h-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
};

export default HeroSection;
